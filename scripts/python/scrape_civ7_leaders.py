#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import re
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from urllib.parse import unquote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

UA = "Civ7RandomDrafterBot/1.0 (personal project; respectful rate; contact: you@example.com)"

EN_BASE = "https://civilization.fandom.com"
FR_BASE = "https://civilization.fandom.com/fr"

EN_LIST_PAGE = "Leaders_(Civ7)"
FR_LIST_PAGE = "Dirigeants_(Civ7)"

EN_TABLE_HEADERS = {"Leader", "Unique ability", "Attributes"}
FR_TABLE_HEADERS = {"Dirigeant", "Attribut", "Compétence exclusive"}

EN_ATTRS = {"Cultural", "Diplomatic", "Economic", "Expansionist", "Militaristic", "Scientific"}
FR_ATTRS = {"Culturel", "Diplomatique", "Économique", "Economique", "Expansionniste", "Militariste", "Scientifique"}


@dataclass
class Ability:
    name: str
    effects: List[str]


@dataclass
class LeaderEntry:
    name: str
    page_title: str
    url: str
    attributes: List[str]
    unique_ability: Ability


def now_iso_utc() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_page_title_from_url(url: str) -> Optional[str]:
    """
    Extract MediaWiki page title from a fandom URL like:
      https://civilization.fandom.com/wiki/Ada_Lovelace_(Civ7)
      https://civilization.fandom.com/fr/wiki/Auguste_(Civ7)
    """
    path = urlparse(url).path
    # path may be /wiki/Title or /fr/wiki/Title
    m = re.search(r"/wiki/(.+)$", path)
    if not m:
        return None
    return unquote(m.group(1))


def mw_parse_html(base: str, page: str, session: requests.Session) -> str:
    """
    Use MediaWiki Action API (api.php) to get parsed HTML of the page content.
    """
    api = base.rstrip("/") + "/api.php"
    params = {
        "action": "parse",
        "page": page,
        "prop": "text",
        "format": "json",
        "formatversion": 2,
    }
    r = session.get(api, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(f"MediaWiki API error for {base} page={page}: {data['error']}")
    return data["parse"]["text"]


def find_table_by_headers(soup: BeautifulSoup, required_headers: set) -> Optional[BeautifulSoup]:
    """
    Find the first table whose header row contains all required headers.
    """
    for table in soup.find_all("table"):
        headers = [normalize_ws(th.get_text(" ", strip=True)) for th in table.find_all("th")]
        if required_headers.issubset(set(headers)):
            return table
    return None


def table_header_index_map(table) -> Dict[str, int]:
    """
    Build a map header_text -> column index based on the first row containing <th>.
    """
    header_tr = None
    for tr in table.find_all("tr"):
        if tr.find("th"):
            header_tr = tr
            break
    if not header_tr:
        return {}

    headers = [normalize_ws(cell.get_text(" ", strip=True)) for cell in header_tr.find_all(["th", "td"], recursive=False)]
    return {h: i for i, h in enumerate(headers) if h}


def pick_leader_link(cell, base: str) -> Tuple[str, str]:
    """
    Return (leader_name, absolute_url) from a cell containing the leader link + image.
    """
    # Usually the first meaningful wiki link is the leader page
    a = cell.find("a", href=True)
    while a and "href" in a.attrs:
        href = a["href"]
        if "/wiki/" in href:  # good enough
            url = urljoin(base + "/", href)
            name = normalize_ws(a.get_text(" ", strip=True))
            if name:
                return name, url
        a = a.find_next("a", href=True)

    # fallback: cell text as name (rare)
    name = normalize_ws(cell.get_text(" ", strip=True))
    return name, base


def extract_attributes(cell_texts: List[str], lang: str) -> List[str]:
    allowed = EN_ATTRS if lang == "en" else FR_ATTRS
    attrs = []
    for t in cell_texts:
        tt = normalize_ws(t)
        if tt in allowed:
            attrs.append(tt)
    # de-dup while keeping order
    seen = set()
    out = []
    for a in attrs:
        if a not in seen:
            seen.add(a)
            out.append(a)
    return out


def parse_ability_cell(cell) -> Ability:
    """
    Extract ability name + effects from the 'Unique ability' / 'Compétence exclusive' cell.
    Heuristics:
      - If there is a <b>/<strong>, use it as name
      - Else use first non-empty line as name
      - Effects: list items if present, else remaining text after name
    """
    # ability name
    bold = cell.find(["b", "strong"])
    if bold:
        ability_name = normalize_ws(bold.get_text(" ", strip=True))
    else:
        lines = [l for l in (cell.get_text("\n", strip=True).split("\n")) if normalize_ws(l)]
        ability_name = normalize_ws(lines[0]) if lines else ""

    # effects
    lis = cell.find_all("li")
    effects: List[str] = []
    if lis:
        for li in lis:
            txt = normalize_ws(li.get_text(" ", strip=True))
            if txt:
                effects.append(txt)
    else:
        full = normalize_ws(cell.get_text(" ", strip=True))
        # remove ability_name prefix if present
        if ability_name and full.lower().startswith(ability_name.lower()):
            rest = full[len(ability_name):].lstrip(" :-–—")
        else:
            rest = full
        if rest and rest != ability_name:
            effects = [rest]

    # last cleanup
    effects = [e for e in (normalize_ws(x) for x in effects) if e]
    return Ability(name=ability_name, effects=effects)


def parse_list_page(base: str, page: str, required_headers: set, lang: str, session: requests.Session) -> List[LeaderEntry]:
    html = mw_parse_html(base, page, session)
    soup = BeautifulSoup(html, "html.parser")
    table = find_table_by_headers(soup, required_headers)
    if not table:
        raise RuntimeError(f"Cannot find leaders table on {base}/wiki/{page} with headers {required_headers}")

    idx = table_header_index_map(table)

    # Resolve column indexes
    if lang == "en":
        leader_col = idx["Leader"]
        ability_col = idx["Unique ability"]
        attr_col = idx["Attributes"]
    else:
        leader_col = idx["Dirigeant"]
        ability_col = idx["Compétence exclusive"]
        attr_col = idx["Attribut"]

    leaders: List[LeaderEntry] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["td", "th"], recursive=False)
        if not cells or len(cells) <= max(leader_col, ability_col, attr_col):
            continue
        # skip header row
        if tr.find("th") and normalize_ws(tr.get_text(" ", strip=True)) in required_headers:
            continue

        leader_cell = cells[leader_col]
        ability_cell = cells[ability_col]
        attr_cell = cells[attr_col]

        name, url = pick_leader_link(leader_cell, base)
        if not name or "/wiki/" not in url:
            continue

        raw_title = extract_page_title_from_url(url) or ""
        page_title, canon_url = canonicalize_title(base, raw_title, session)
        if canon_url:
            url = canon_url

        # attributes: collect link texts then filter
        attr_texts = [a.get_text(" ", strip=True) for a in attr_cell.find_all("a")]
        attributes = extract_attributes(attr_texts, lang=lang)

        ability = parse_ability_cell(ability_cell)

        leaders.append(
            LeaderEntry(
                name=name,
                page_title=page_title,
                url=url,
                attributes=attributes,
                unique_ability=ability,
            )
        )

    return leaders

def get_en_title_from_fr_langlinks(fr_page_title: str, session: requests.Session, sleep_s: float) -> Optional[str]:
    """
    Use MediaWiki API 'langlinks' to map a FR page title to its EN page title,
    without scraping the HTML page (avoids 403 / anti-bot).
    """
    # Try FR API first, then fallback to root API if needed
    candidate_apis = [
        FR_BASE.rstrip("/") + "/api.php",
        EN_BASE.rstrip("/") + "/api.php",
    ]

    params = {
        "action": "query",
        "prop": "langlinks",
        "titles": fr_page_title,
        "lllang": "en",
        "llprop": "url|title",
        "format": "json",
        "formatversion": 2,
    }

    try:
        for api in candidate_apis:
            r = session.get(api, params=params, timeout=30)
            # If one endpoint is blocked or missing, try the other
            if r.status_code >= 400:
                continue

            data = r.json()
            pages = (data.get("query") or {}).get("pages") or []
            if not pages:
                continue

            page = pages[0]
            langlinks = page.get("langlinks") or []
            if not langlinks:
                continue

            ll = langlinks[0]
            # Prefer url -> exact title extraction
            if "url" in ll and ll["url"]:
                en_title = extract_page_title_from_url(ll["url"])
                if en_title:
                    return en_title

            # Fallback: title field (spaces -> underscores)
            if "title" in ll and ll["title"]:
                return ll["title"].replace(" ", "_")

        return None
    finally:
        if sleep_s > 0:
            time.sleep(sleep_s)


def make_id_from_page_title(page_title: str) -> str:
    # e.g. Ada_Lovelace_(Civ7) -> ada_lovelace_civ7
    s = page_title.lower()
    s = re.sub(r"[%()]+", "_", s)
    s = re.sub(r"[^a-z0-9_]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="leaders.civ7.json", help="Output JSON path")
    ap.add_argument("--sleep", type=float, default=0.3, help="Sleep seconds between FR page fetches (politeness)")
    args = ap.parse_args()

    with requests.Session() as session:
        session.headers.update(
            {
                "User-Agent": UA,
                "Accept-Language": "en,fr;q=0.9",
            }
        )

        en = parse_list_page(EN_BASE, EN_LIST_PAGE, EN_TABLE_HEADERS, lang="en", session=session)
        fr = parse_list_page(FR_BASE, FR_LIST_PAGE, FR_TABLE_HEADERS, lang="fr", session=session)

        en_by_title: Dict[str, LeaderEntry] = {x.page_title: x for x in en if x.page_title}
        fr_by_title: Dict[str, LeaderEntry] = {x.page_title: x for x in fr if x.page_title}

        # Map FR -> EN by crawling English link on each FR leader page
        fr_to_en_title: Dict[str, str] = {}
        for fr_title, fr_entry in fr_by_title.items():
            # First try direct title match (souvent identique entre /wiki et /fr/wiki)
            if fr_title in en_by_title:
                fr_to_en_title[fr_title] = fr_title
                continue

            en_title = get_en_title_from_fr_langlinks(fr_title, session=session, sleep_s=args.sleep)
            if en_title:
                en_title, _ = canonicalize_title(EN_BASE, en_title, session)
                fr_to_en_title[fr_title] = en_title

        used_en_titles = set()
        leaders_out = []

        # First: iterate FR leaders and merge with EN when possible
        for fr_title, fr_entry in fr_by_title.items():
            en_title = fr_to_en_title.get(fr_title)
            en_entry = en_by_title.get(en_title) if en_title else None
            if en_title:
                used_en_titles.add(en_title)

            merged_id = make_id_from_page_title(en_entry.page_title if en_entry else fr_entry.page_title)

            leaders_out.append(
                {
                    "id": merged_id,
                    "en": None
                    if not en_entry
                    else {
                        "name": en_entry.name,
                        "page_title": en_entry.page_title,
                        "url": en_entry.url,
                        "attributes": en_entry.attributes,
                        "unique_ability": {
                            "name": en_entry.unique_ability.name,
                            "effects": en_entry.unique_ability.effects,
                        },
                    },
                    "fr": {
                        "name": fr_entry.name,
                        "page_title": fr_entry.page_title,
                        "url": fr_entry.url,
                        "attributes": fr_entry.attributes,
                        "unique_ability": {
                            "name": fr_entry.unique_ability.name,
                            "effects": fr_entry.unique_ability.effects,
                        },
                    },
                }
            )

        # Then: add EN-only leaders not present in FR mapping
        for en_title, en_entry in en_by_title.items():
            if en_title in used_en_titles:
                continue
            merged_id = make_id_from_page_title(en_entry.page_title)
            leaders_out.append(
                {
                    "id": merged_id,
                    "en": {
                        "name": en_entry.name,
                        "page_title": en_entry.page_title,
                        "url": en_entry.url,
                        "attributes": en_entry.attributes,
                        "unique_ability": {
                            "name": en_entry.unique_ability.name,
                            "effects": en_entry.unique_ability.effects,
                        },
                    },
                    "fr": None,
                }
            )

        payload = {
            "meta": {
                "pulled_at": now_iso_utc(),
                "sources": {
                    "en_list_page": f"{EN_BASE}/wiki/{EN_LIST_PAGE}",
                    "fr_list_page": f"{FR_BASE}/wiki/{FR_LIST_PAGE}",
                },
            },
            "leaders": leaders_out,
        }

        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"✅ Wrote {args.out} ({len(leaders_out)} leaders merged)")

def canonicalize_title(base: str, title: str, session: requests.Session) -> Tuple[str, Optional[str]]:
    """
    Resolve redirects and return canonical page title (underscored) + fullurl if available.
    """
    api = base.rstrip("/") + "/api.php"
    params = {
        "action": "query",
        "titles": title,
        "redirects": 1,
        "prop": "info",
        "inprop": "url",
        "format": "json",
        "formatversion": 2,
    }
    r = session.get(api, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()

    pages = (data.get("query") or {}).get("pages") or []
    if not pages:
        return title, None

    page = pages[0]
    if page.get("missing"):
        return title, None

    canon_title = page["title"].replace(" ", "_")
    return canon_title, page.get("fullurl")



if __name__ == "__main__":
    main()

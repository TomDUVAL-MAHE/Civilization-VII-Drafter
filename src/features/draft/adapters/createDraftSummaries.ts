interface DraftSummaryInput {
  players: number;
  leadersPerPlayer: number;
  canGetDoublonsLeaders: boolean;
  bannedLeaderCount: number;
}

interface CivSummaryInput {
  selectedAgesLabel: string;
  civsPerAge: number;
  canGetDoublonsCivs: boolean;
  bannedCivCount: number;
}

export const createLeaderDraftSummary = ({
  players,
  leadersPerPlayer,
  canGetDoublonsLeaders,
  bannedLeaderCount,
}: DraftSummaryInput) => ({
  players,
  leadersPerPlayer,
  duplicates: canGetDoublonsLeaders ? 'On' : 'Off',
  bannedCount: bannedLeaderCount,
});

export const createCivDraftSummary = ({
  selectedAgesLabel,
  civsPerAge,
  canGetDoublonsCivs,
  bannedCivCount,
}: CivSummaryInput) => ({
  ages: selectedAgesLabel,
  civsPerAge,
  duplicates: canGetDoublonsCivs ? 'On' : 'Off',
  bannedCount: bannedCivCount,
});

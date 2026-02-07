'use client';

import { useState } from 'react';
import styles from './DraftView.module.scss';

interface TagInputProps {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  options?: string[];
  placeholder?: string;
  helper?: string;
  name: string;
}

export default function TagInput({
  label,
  values,
  onAdd,
  onRemove,
  options = [],
  placeholder,
  helper,
  name,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = options
    .filter((option) => option.toLowerCase().includes(inputValue.trim().toLowerCase()))
    .filter((option) => !values.includes(option))
    .slice(0, 6);

  const handleAdd = (nextValue?: string) => {
    const trimmed = (nextValue ?? inputValue).trim();
    if (!trimmed || values.includes(trimmed)) {
      return;
    }
    onAdd(trimmed);
    setInputValue('');
  };

  const handleRemoveLast = () => {
    if (values.length === 0) {
      return;
    }
    onRemove(values[values.length - 1]);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      <div
        className={styles.tagField}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget as HTMLElement | null;
          if (!event.currentTarget.contains(nextTarget)) {
            setIsFocused(false);
          }
        }}
      >
        <div className={styles.tagList} aria-live="polite">
          {values.map((value) => (
            <span key={value} className={styles.tagChip}>
              {value}
              <button
                type="button"
                className={styles.chipButton}
                aria-label={`Remove ${value}`}
                onClick={() => onRemove(value)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className={styles.tagInputField}
            id={name}
            name={name}
            value={inputValue}
            placeholder={placeholder}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
              if (event.key === 'Backspace' && inputValue.length === 0) {
                event.preventDefault();
                handleRemoveLast();
              }
            }}
          />
        </div>
        {isFocused && suggestions.length > 0 ? (
          <div className={styles.suggestionList} role="listbox">
            {suggestions.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.suggestionItem}
                onClick={() => handleAdd(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {helper ? <p className={styles.helper}>{helper}</p> : null}
    </div>
  );
}

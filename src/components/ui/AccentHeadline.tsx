import React from 'react';

interface AccentHeadlineProps {
  text: string;
  accentWord?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  accentClassName?: string;
}

/**
 * Renders editorial display headlines while emphasizing a designated keyword in Golden Ochre (#CE8936)
 * or Warm Champagne Gold (#E0C188) on dark plum surfaces.
 */
export function AccentHeadline({
  text,
  accentWord,
  as: Tag = 'h2',
  className,
  accentClassName = 'text-[#CE8936]',
}: AccentHeadlineProps) {
  if (!accentWord || !text.includes(accentWord)) {
    return <Tag className={className}>{text}</Tag>;
  }

  const idx = text.indexOf(accentWord);
  const before = text.slice(0, idx);
  const after = text.slice(idx + accentWord.length);

  return (
    <Tag className={className}>
      {before}
      <span className={accentClassName}>{accentWord}</span>
      {after}
    </Tag>
  );
}

import React from 'react';

interface AccentHeadlineProps {
  text: string;
  accentWord?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/**
 * Renders editorial display headlines while emphasizing a designated keyword in Royal Blue (#4062BB),
 * echoing "Find a place to call home." and "Building Dreams, Creating Value."
 */
export function AccentHeadline({
  text,
  accentWord,
  as: Tag = 'h2',
  className,
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
      <span className="text-[#4062BB]">{accentWord}</span>
      {after}
    </Tag>
  );
}

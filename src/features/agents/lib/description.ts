export interface ParsedDescription {
  /** What the agent does: the text before "Como usar:". */
  summary: string;
  /** How to use it, if the description has a "Como usar:" part. */
  usage?: string;
}

/**
 * Agent descriptions follow the convention "<what it does>. Como usar: <examples>".
 * The long text is kept as is (the backend uses it to pick the agent); this only splits it for display.
 */
export function parseDescription(description: string): ParsedDescription {
  const text = description.trim();
  const match = text.match(/^([\s\S]*?)\s*Como usar:\s*([\s\S]*)$/i);
  if (!match) return { summary: text };
  return { summary: match[1].trim(), usage: match[2].trim() };
}

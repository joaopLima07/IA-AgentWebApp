export const DEFAULT_CONVERSATION_TITLE = "Nova conversa";
const MAX_TITLE_LENGTH = 60;

/** First sentence of the message, trimmed to a short title (the backend caps titles at 100 characters). */
export function titleFromMessage(content: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  const sentence = text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? text;
  if (sentence.length <= MAX_TITLE_LENGTH) return sentence;
  const cut = sentence.slice(0, MAX_TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

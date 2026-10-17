import { isToday, isYesterday, format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Conversation } from "@/types";

export function conversationDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) return "Últimos 7 dias";
  if (daysAgo < 30) return "Últimos 30 dias";
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

const GROUP_ORDER = ["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias"];

export function groupConversationsByDate(conversations: Conversation[]): [string, Conversation[]][] {
  const groups = new Map<string, Conversation[]>();
  for (const conversation of conversations) {
    const key = conversationDateGroup(conversation.updatedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(conversation);
  }
  const entries = Array.from(groups.entries());
  entries.sort(([a], [b]) => {
    const ai = GROUP_ORDER.indexOf(a);
    const bi = GROUP_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a < b ? 1 : -1;
  });
  return entries;
}

export function relativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
}

export function formatDate(dateStr: string, pattern = "d MMM yyyy"): string {
  return format(new Date(dateStr), pattern, { locale: ptBR });
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "d MMM yyyy 'às' HH:mm", { locale: ptBR });
}

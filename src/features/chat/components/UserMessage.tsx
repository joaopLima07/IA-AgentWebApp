import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Message } from "@/types";

export function UserMessage({ message }: { message: Message }) {
  const { user } = useAuth();

  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm sm:max-w-[70%]">
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className="bg-secondary text-[11px]">{initials(user?.name ?? "Você")}</AvatarFallback>
      </Avatar>
    </div>
  );
}

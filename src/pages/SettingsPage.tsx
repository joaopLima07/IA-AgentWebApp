import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { initials } from "@/lib/format";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const email = user?.email ?? "";

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-3xl xl:max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Configurações" description="Gerencie seu perfil." />

        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Informações da sua conta pessoal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">{initials(name || "Você")}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" onClick={() => toast.info("O envio de avatar não está disponível nesta pré-visualização.")}>
                  Alterar avatar
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo de 2MB.</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" type="email" value={email} disabled readOnly />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border pt-5">
            <Button onClick={() => toast.success("Configurações salvas")}>Salvar alterações</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

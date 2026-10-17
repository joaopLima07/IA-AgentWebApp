import { useState } from "react";
import { toast } from "sonner";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const email = user?.email ?? "";
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useLocalStorage("app-preferences", {
    notifications: true,
    sound: false,
    aiStreaming: true,
  });

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Configurações" description="Gerencie seu perfil, aparência e preferências." />

        <Tabs defaultValue="profile">
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
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
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Escolha a aparência do AI Nexus neste dispositivo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { value: "light", label: "Claro", icon: Sun },
                      { value: "dark", label: "Escuro", icon: Moon },
                      { value: "system", label: "Sistema", icon: Laptop },
                    ] as { value: ThemeMode; label: string; icon: typeof Sun }[]
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm font-medium transition-colors hover:border-primary/40",
                        theme === value && "border-primary bg-primary/5"
                      )}
                    >
                      {theme === value && (
                        <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-2.5" />
                        </span>
                      )}
                      <Icon className="size-5 text-muted-foreground" />
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>Controle como a plataforma se comporta enquanto você trabalha.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Notificações</p>
                    <p className="text-sm text-muted-foreground">Receba atualizações sobre conversas e documentos.</p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                    aria-label="Ativar ou desativar notificações"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border py-3">
                  <div>
                    <p className="text-sm font-medium">Som</p>
                    <p className="text-sm text-muted-foreground">Reproduzir um som quando um agente terminar de responder.</p>
                  </div>
                  <Switch
                    checked={preferences.sound}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, sound: checked })}
                    aria-label="Ativar ou desativar som"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border py-3">
                  <div>
                    <p className="text-sm font-medium">Streaming de IA</p>
                    <p className="text-sm text-muted-foreground">Transmitir respostas token por token em vez de uma só vez.</p>
                  </div>
                  <Switch
                    checked={preferences.aiStreaming}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, aiStreaming: checked })}
                    aria-label="Ativar ou desativar streaming de IA"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

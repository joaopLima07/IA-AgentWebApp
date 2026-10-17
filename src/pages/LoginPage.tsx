import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { loginSchema } from "@/features/auth/types/schemas";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(result.data.email, result.data.password);
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Não foi possível entrar", {
        description: error instanceof ApiRequestError ? error.message : "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="gap-1.5 pb-2">
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Entre no workspace da sua organização.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Criar uma
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

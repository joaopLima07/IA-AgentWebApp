import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/authService";
import { resetCodeSchema, resetPasswordSchema } from "@/features/auth/types/schemas";
import { ApiRequestError } from "@/types/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const navigate = useNavigate();
  // Set once the e-mailed code has been verified; its presence is what moves us to the password step.
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const fail = (title: string, error: unknown) =>
    toast.error(title, { description: error instanceof ApiRequestError ? error.message : "Tente novamente." });

  const handleCode = async (e: FormEvent) => {
    e.preventDefault();
    const result = resetCodeSchema.safeParse({ token: token.trim() });
    if (!result.success) {
      setErrors({ token: result.error.issues[0]?.message ?? "Código inválido" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      setResetToken(await authService.verifyResetCode(email, result.data.token));
    } catch (error) {
      fail("Código inválido ou expirado", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    const result = resetPasswordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, resetToken, result.data.newPassword);
      toast.success("Senha redefinida. Entre com a nova senha.");
      navigate("/login", { replace: true });
    } catch (error) {
      fail("Não foi possível redefinir a senha", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="gap-1.5 pb-2">
        <CardTitle className="text-xl">{resetToken ? "Nova senha" : "Digite o código"}</CardTitle>
        <CardDescription>
          {resetToken ? (
            "Código confirmado. Escolha sua nova senha."
          ) : (
            <>
              Enviamos um código para <span className="font-medium text-foreground">{email}</span>. Ele expira em 10
              minutos.
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetToken ? (
          <form onSubmit={handlePassword} className="space-y-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="pl-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-invalid={!!errors.newPassword}
                />
              </div>
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={!!errors.confirmPassword}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Redefinir senha
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCode} className="space-y-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="token">Código</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="token"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="pl-9 tracking-widest"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!errors.token}
                />
              </div>
              {errors.token && <p className="text-xs text-destructive">{errors.token}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Continuar
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

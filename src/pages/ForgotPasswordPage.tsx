import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/authService";
import { ApiRequestError } from "@/types/api";
import { forgotPasswordSchema } from "@/features/auth/types/schemas";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Digite um e-mail válido");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(result.data.email);
      toast.success("Se existir uma conta com esse e-mail, enviamos um código de redefinição. Confira sua caixa de entrada e o spam.");
      navigate(`/reset-password?email=${encodeURIComponent(result.data.email)}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="gap-1.5 pb-2">
        <CardTitle className="text-xl">Redefinir sua senha</CardTitle>
        <CardDescription>Enviaremos um e-mail com um código para redefinir sua senha.</CardDescription>
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
                aria-invalid={!!error}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Enviar código
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

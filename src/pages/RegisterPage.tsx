import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { registerSchema } from "@/features/auth/types/schemas";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await register(result.data.name, result.data.email, result.data.password, result.data.phone);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Não foi possível criar sua conta", {
        description: error instanceof ApiRequestError ? error.message : "Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="gap-1.5 pb-2">
        <CardTitle className="text-xl">Crie sua conta</CardTitle>
        <CardDescription>Configure o workspace de agentes de IA da sua organização.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                autoComplete="name"
                className="pl-9"
                value={form.name}
                onChange={setField("name")}
                aria-invalid={!!errors.name}
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail corporativo</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="pl-9"
                value={form.email}
                onChange={setField("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+5511999999999"
                className="pl-9"
                value={form.phone}
                onChange={setField("phone")}
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="pl-9"
                value={form.password}
                onChange={setField("password")}
                aria-invalid={!!errors.password}
              />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
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
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

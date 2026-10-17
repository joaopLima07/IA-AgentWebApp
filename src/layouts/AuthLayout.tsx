import { Outlet } from "react-router-dom";
import { BarChart3, ShieldCheck, Zap } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const features = [
  {
    icon: Zap,
    title: "Implante agentes em minutos",
    description: "Lance agentes de IA prontos para produção sem escrever uma linha de código de infraestrutura.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança de nível empresarial",
    description: "SSO, logs de auditoria e acesso baseado em função integrados desde o primeiro dia.",
  },
  {
    icon: BarChart3,
    title: "Visibilidade total",
    description: "Acompanhe conversas, tokens e tempos de resposta em tempo real.",
  },
];

export function AuthLayout() {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[oklch(0.16_0.01_80)] p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, oklch(0.6 0.15 80 / 0.35), transparent 55%), radial-gradient(circle at 85% 90%, oklch(0.78 0.14 85 / 0.22), transparent 50%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex items-center gap-2">
          <img src={logoIcon} alt="" className="size-8 rounded-md" />
          <span className="text-base font-semibold tracking-tight">AI Nexus</span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Seus agentes de IA, impulsionando seu negócio.
            </h1>
            <p className="text-sm text-white/60">
              Um workspace para criar, implantar e monitorar todos os agentes de IA da sua organização.
            </p>
          </div>
          <div className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-white/50">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} AI Nexus. Plataforma empresarial de agentes de IA.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-secondary/30 px-4 py-10">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <img src={logoIcon} alt="" className="size-8 rounded-md" />
          <span className="text-base font-semibold tracking-tight">AI Nexus</span>
        </div>
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
        <footer className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
          © {new Date().getFullYear()} AI Nexus. Plataforma empresarial de agentes de IA.
        </footer>
      </div>
    </div>
  );
}

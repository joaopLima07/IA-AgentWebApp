import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  legend?: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, description, legend, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
        </div>
        {legend}
      </CardHeader>
      <CardContent className="pl-1 pr-3">{children}</CardContent>
    </Card>
  );
}

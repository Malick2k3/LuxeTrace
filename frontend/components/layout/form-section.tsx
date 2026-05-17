import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface FormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  children
}: FormSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-white/70 bg-white/30">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

import { LucideIcon } from "lucide-react";

export interface IStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    variant?: "default" | "warning" | "danger" | "success";
    delay?: number;
  }
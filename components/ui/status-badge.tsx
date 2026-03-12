"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "idle" | "pending" | "success" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === "idle") return null;

  const config = {
    pending: {
      icon: Loader2,
      text: "Pending",
      bg: "bg-blue-500/10",
      textCol: "text-blue-400",
      border: "border-blue-500/20",
      animate: true,
    },
    success: {
      icon: CheckCircle2,
      text: "Success",
      bg: "bg-emerald-500/10",
      textCol: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    failed: {
      icon: AlertCircle,
      text: "Failed",
      bg: "bg-red-500/10",
      textCol: "text-red-400",
      border: "border-red-500/20",
    },
  }[status];

  const Icon = config!.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold",
        config!.bg,
        config!.textCol,
        config!.border,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config!.animate && "animate-spin")} />
      {config!.text}
    </motion.div>
  );
}

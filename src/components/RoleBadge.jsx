import React from "react";
import {
  Crown,
  ShieldCheck,
  BriefcaseBusiness,
  User,
  Eye,
} from "lucide-react";

export default function RoleBadge({ role, size = "medium" }) {
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-2 text-sm",
    large: "px-4 py-2 text-base",
  };

  const roleConfig = {
    owner: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      icon: Crown,
      label: "Owner",
    },

    admin: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      icon: ShieldCheck,
      label: "Admin",
    },

    manager: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: BriefcaseBusiness,
      label: "Manager",
    },

    member: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: User,
      label: "Member",
    },

    viewer: {
      bg: "bg-gray-500/10",
      text: "text-gray-400",
      border: "border-gray-500/20",
      icon: Eye,
      label: "Viewer",
    },

    // Backward compatibility
    user: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: User,
      label: "Member",
    },
  };

  const config = roleConfig[role] || roleConfig.viewer;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-lg border
        font-medium
        ${config.bg}
        ${config.text}
        ${config.border}
        ${sizeClasses[size]}
      `}
    >
      <Icon size={size === "small" ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  );
}
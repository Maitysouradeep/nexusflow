import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const roles = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage members and workspace settings",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Manage projects and tasks",
  },
  {
    value: "member",
    label: "Member",
    description: "Work on assigned tasks",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "View workspace content",
  },
];

function RoleSelector({
  currentRole,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selectedRole =
    roles.find((role) => role.value === currentRole) || roles[2];

  const handleSelect = (role) => {
    setOpen(false);

    if (role.value === currentRole) {
      return;
    }

    onChange(role.value);
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        className="flex min-w-[140px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div>
          <p className="text-sm font-medium text-white">
            {selectedRole.label}
          </p>

          <p className="text-[11px] text-slate-500">
            {selectedRole.description}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#111827] p-1 shadow-2xl">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => handleSelect(role)}
              className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {role.label}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {role.description}
                </p>
              </div>

              {role.value === currentRole && (
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-violet-400"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoleSelector;
import React from "react";
import {
  KeyRound,
  Code2,
  BookOpen,
  ShieldCheck,
  Webhook,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: KeyRound,
    title: "API Keys",
    description:
      "Create and manage secure API credentials for your applications.",
  },
  {
    icon: Code2,
    title: "REST API",
    description:
      "Access projects, tasks, workspaces, and other NexusFlow resources programmatically.",
  },
  {
    icon: BookOpen,
    title: "Developer Docs",
    description:
      "Clear documentation, examples, and integration guides for developers.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description:
      "Authentication and workspace-level permissions designed for safe integrations.",
  },
];

export default function API() {
  const { user, userRole, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar userRole={userRole} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          userRole={userRole}
          onLogout={logout}
          pageTitle="API"
          pageSubtitle="Developer tools and integrations"
        />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm sm:px-10 lg:px-14">
              
              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl" />

              <div className="relative max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Developer Platform
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  NexusFlow API
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                  Connect your applications directly with NexusFlow.
                  Build integrations, automate workflows, and access your
                  workspace programmatically.
                </p>

                <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                  <Code2 className="h-4 w-4" />
                  API coming soon
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="mt-8">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Developer capabilities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Everything you will need to build on top of NexusFlow.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Coming soon
                        </span>
                      </div>

                      <h3 className="mt-5 text-base font-semibold text-slate-900">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Webhooks CTA */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:p-7">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Webhook className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Available now
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      Need integrations today?
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                      NexusFlow Webhooks are already available. Receive
                      real-time workspace events in your external applications.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/webhooks";
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Explore Webhooks
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Footer note */}
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400">
                NexusFlow API is currently under development.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
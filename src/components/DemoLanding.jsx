import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";

export default function DemoLanding() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dark = isDarkMode;

  return (
    <div
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        dark ? "bg-[#060B14] text-white" : "bg-[#F7F9FC] text-[#101828]"
      }`}
    >
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-64 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[130px] animate-orb ${
            dark ? "bg-blue-600/10" : "bg-blue-400/15"
          }`}
        />

        <div
          className={`absolute top-[40%] -left-72 w-[500px] h-[500px] rounded-full blur-[130px] animate-orb-reverse ${
            dark ? "bg-purple-600/10" : "bg-purple-400/10"
          }`}
        />

        <div
          className={`absolute top-[65%] -right-72 w-[500px] h-[500px] rounded-full blur-[130px] animate-orb ${
            dark ? "bg-cyan-500/10" : "bg-cyan-400/10"
          }`}
        />
      </div>

      {/* Navbar */}
      <nav
        className={`relative z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
          dark
            ? "border-white/[0.06] bg-[#060B14]/80"
            : "border-gray-200 bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[76px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-lg font-bold text-white">N</span>
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">NexusFlow</div>

              <div
                className={`text-[10px] uppercase tracking-[0.18em] ${
                  dark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Workspace
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div
            className={`hidden md:flex items-center gap-8 text-sm ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <a
              href="#features"
              className={`transition ${
                dark ? "hover:text-white" : "hover:text-gray-900"
              }`}
            >
              Features
            </a>

            <a
              href="#workflow"
              className={`transition ${
                dark ? "hover:text-white" : "hover:text-gray-900"
              }`}
            >
              How it works
            </a>

            <a
              href="#webhooks"
              className={`transition ${
                dark ? "hover:text-white" : "hover:text-gray-900"
              }`}
            >
              Webhooks
            </a>

            <Link
              to="/subscription"
              className={`transition ${
                dark ? "hover:text-white" : "hover:text-gray-900"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme */}
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                dark
                  ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  : "border-gray-200 bg-white hover:bg-gray-100"
              }`}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-gray-700" />
              )}
            </button>

            <Link
              to="/login"
              className={`px-4 py-2.5 text-sm font-medium transition ${
                dark
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                dark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {dark ? (
                <Sun size={17} className="text-yellow-400" />
              ) : (
                <Moon size={17} />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                dark ? "border-white/10" : "border-gray-200"
              }`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t px-6 py-5 ${
              dark
                ? "border-white/[0.06] bg-[#080E18]"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-4">
              <a href="#features">Features</a>
              <a href="#workflow">How it works</a>
              <a href="#webhooks">Webhooks</a>

              <Link to="/subscription">Pricing</Link>

              <div
                className={`border-t pt-4 ${
                  dark ? "border-white/10" : "border-gray-200"
                }`}
              >
                <Link
                  to="/login"
                  className="block text-center py-3 rounded-xl border border-gray-300"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="block text-center py-3 mt-3 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main className="relative z-10">
        <section className="relative pt-20 md:pt-28 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Announcement */}
            <div className="flex justify-center mb-8 animate-fade-up">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs md:text-sm ${
                  dark
                    ? "border-blue-500/20 bg-blue-500/[0.08] text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-600"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                Everything your team needs, connected.
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Hero text */}
            <div className="max-w-4xl mx-auto text-center">
              <h1
                className={`text-5xl md:text-7xl lg:text-[82px] leading-[0.96] font-bold tracking-[-0.05em] animate-fade-up ${
                  dark ? "text-white" : "text-gray-950"
                }`}
              >
                Work smarter.
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Flow together.
                </span>
              </h1>

              <p
                className={`max-w-2xl mx-auto mt-7 text-lg md:text-xl leading-8 animate-fade-up-delay ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                NexusFlow brings projects, tasks, teams, analytics and real-time
                webhooks into one powerful workspace.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9 animate-fade-up-delay-2">
                <Link
                  to="/register"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
                >
                  Start for free
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>

                <Link
                  to="/login"
                  className={`group w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border font-semibold transition-all hover:-translate-y-1 ${
                    dark
                      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-gray-200"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Play size={16} />
                  Explore dashboard
                </Link>
              </div>

              <div
                className={`flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 text-xs ${
                  dark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" />
                  Free to get started
                </span>

                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" />
                  No credit card required
                </span>

                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" />
                  Built for modern teams
                </span>
              </div>
            </div>

            {/* Live dashboard */}
            <div className="relative max-w-6xl mx-auto mt-20 animate-dashboard">
              <div
                className={`absolute inset-0 blur-[100px] rounded-full ${
                  dark ? "bg-blue-600/10" : "bg-blue-400/15"
                }`}
              />

              <div
                className={`relative rounded-2xl border shadow-2xl overflow-hidden ${
                  dark
                    ? "border-white/10 bg-[#0B111D] shadow-black/50"
                    : "border-gray-200 bg-white shadow-gray-300/40"
                }`}
              >
                {/* Browser header */}
                <div
                  className={`h-11 border-b flex items-center px-4 gap-2 ${
                    dark
                      ? "border-white/[0.07] bg-[#0A101A]"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />

                  <div
                    className={`ml-4 flex-1 max-w-md mx-auto h-6 rounded-md border ${
                      dark
                        ? "bg-white/[0.04] border-white/[0.05]"
                        : "bg-white border-gray-200"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-[180px_1fr] min-h-[430px]">
                  {/* Preview sidebar */}
                  <div
                    className={`hidden sm:block border-r p-5 ${
                      dark
                        ? "border-white/[0.07] bg-[#090F19]"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        N
                      </div>

                      <span className="text-sm font-semibold">NexusFlow</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        ["Overview", LayoutDashboard],
                        ["Projects", FolderKanban],
                        ["Tasks", Zap],
                        ["Analytics", BarChart3],
                        ["Team", Users],
                        ["API", Code2],
                      ].map(([name, Icon], index) => (
                        <div
                          key={name}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs ${
                            index === 0
                              ? "bg-blue-500/10 text-blue-500"
                              : dark
                                ? "text-gray-500"
                                : "text-gray-400"
                          }`}
                        >
                          <Icon size={14} />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview main */}
                  <div
                    className={`p-5 md:p-8 ${
                      dark ? "bg-[#0B111D]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-7">
                      <div>
                        <div
                          className={`h-3 w-24 rounded mb-2 ${
                            dark ? "bg-white/10" : "bg-gray-200"
                          }`}
                        />

                        <div
                          className={`h-2 w-40 rounded ${
                            dark ? "bg-white/[0.05]" : "bg-gray-100"
                          }`}
                        />
                      </div>

                      <div className="h-8 w-24 rounded-lg bg-blue-500/20 animate-pulse" />
                    </div>

                    {/* KPI */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {[
                        ["Projects", "24"],
                        ["Tasks", "186"],
                        ["Completed", "142"],
                        ["Members", "18"],
                      ].map(([label, value], index) => (
                        <div
                          key={label}
                          className={`p-4 rounded-xl border ${
                            dark
                              ? "border-white/[0.07] bg-white/[0.02]"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div
                            className={`text-[10px] mb-2 ${
                              dark ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {label}
                          </div>

                          <div className="text-xl font-bold">{value}</div>

                          <div className="mt-2 h-1 rounded-full bg-blue-500/20 overflow-hidden">
                            <div
                              className="h-1 rounded-full bg-blue-500 animate-progress"
                              style={{
                                width: `${45 + index * 12}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div
                        className={`lg:col-span-2 h-48 rounded-xl border p-5 ${
                          dark
                            ? "border-white/[0.07] bg-white/[0.02]"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div
                          className={`h-3 w-28 rounded mb-5 ${
                            dark ? "bg-white/10" : "bg-gray-200"
                          }`}
                        />

                        <div className="flex items-end gap-2 h-28">
                          {[
                            40, 60, 45, 75, 55, 90, 70, 95, 78, 100, 86, 92,
                          ].map((height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t bg-gradient-to-t from-blue-600/20 to-blue-500/70 animate-chart-bar"
                              style={{
                                height: `${height}%`,
                                animationDelay: `${index * 80}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div
                        className={`h-48 rounded-xl border p-5 ${
                          dark
                            ? "border-white/[0.07] bg-white/[0.02]"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div
                          className={`h-3 w-24 rounded mb-5 ${
                            dark ? "bg-white/10" : "bg-gray-200"
                          }`}
                        />

                        <div className="flex justify-center items-center h-28">
                          <div className="relative w-24 h-24 rounded-full border-[12px] border-blue-500/70 border-r-purple-500/70 border-b-gray-300/30 animate-spin-slow">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg font-bold">76%</div>

                                <div className="text-[9px] text-gray-500">
                                  Complete
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live activity */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Workspace activity is updating live
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div
                className={`hidden md:flex absolute -right-6 top-20 w-52 p-4 rounded-2xl border shadow-2xl animate-float ${
                  dark
                    ? "border-white/10 bg-[#101722]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Check size={17} />
                </div>

                <div className="ml-3">
                  <p className="text-xs font-semibold">Task completed</p>

                  <p className="text-[10px] text-gray-500 mt-1">Just now</p>
                </div>
              </div>

              {/* Floating team notification */}
              <div
                className={`hidden md:flex absolute -left-8 bottom-20 w-56 p-4 rounded-2xl border shadow-2xl animate-float-reverse ${
                  dark
                    ? "border-white/10 bg-[#101722]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Users size={17} />
                </div>

                <div className="ml-3">
                  <p className="text-xs font-semibold">New team member</p>

                  <p className="text-[10px] text-gray-500 mt-1">
                    Rahul joined the workspace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product showcase */}
                  {/* Product showcase */}
                  <section className="px-6 py-24 md:py-32">
                    <div className="max-w-7xl mx-auto">
                      {/* Section heading */}
                      <div className="max-w-3xl mx-auto text-center mb-14">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 mb-4">
                          <Sparkles size={15} />
                          SEE NEXUSFLOW IN ACTION
                        </div>

                        <h2
                          className={`text-4xl md:text-5xl font-bold tracking-tight ${
                            dark ? "text-white" : "text-gray-950"
                          }`}
                        >
                          From projects to tasks,
                          <br />
                          <span className="text-blue-500">
                            everything stays connected.
                          </span>
                        </h2>

                        <p
                          className={`max-w-2xl mx-auto mt-5 text-lg leading-7 ${
                            dark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Plan your projects, break work into tasks, assign your
                          team and track progress without jumping between
                          different tools.
                        </p>
                      </div>

                      {/* Product previews */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* PROJECTS PREVIEW */}
                        <div
                          className={`group relative rounded-3xl border p-6 md:p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                            dark
                              ? "border-white/[0.08] bg-[#0A111C] hover:border-blue-500/30"
                              : "border-gray-200 bg-white hover:border-blue-200 shadow-sm hover:shadow-xl"
                          }`}
                        >
                          {/* Glow */}
                          <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-500/10 blur-[80px] rounded-full" />

                          {/* Header */}
                          <div className="relative flex items-center justify-between mb-7">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                  <FolderKanban size={18} />
                                </div>

                                <span
                                  className={`text-lg font-bold ${
                                    dark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  Projects
                                </span>
                              </div>

                              <p
                                className={`text-sm ${
                                  dark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                Keep every project moving forward.
                              </p>
                            </div>

                            <div
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                dark
                                  ? "bg-white/[0.05] text-gray-400"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              6 Projects
                            </div>
                          </div>

                          {/* Project cards */}
                          <div className="relative space-y-3">
                            <ProjectPreviewCard
                              dark={dark}
                              name="Website Redesign"
                              description="Marketing website"
                              progress={78}
                              tasks="18 / 23 tasks"
                              status="In Progress"
                              members={["RS", "AM", "SK"]}
                              delay="0s"
                            />

                            <ProjectPreviewCard
                              dark={dark}
                              name="Mobile Application"
                              description="iOS & Android"
                              progress={52}
                              tasks="11 / 21 tasks"
                              status="In Progress"
                              members={["RS", "AK"]}
                              delay="0.15s"
                            />

                            <ProjectPreviewCard
                              dark={dark}
                              name="Marketing Campaign"
                              description="Q4 launch campaign"
                              progress={91}
                              tasks="20 / 22 tasks"
                              status="Almost done"
                              members={["AM", "SK", "PK"]}
                              delay="0.3s"
                            />
                          </div>

                          {/* Bottom */}
                          <div
                            className={`relative mt-5 pt-5 border-t flex items-center justify-between ${
                              dark ? "border-white/[0.06]" : "border-gray-100"
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                dark ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              Updated just now
                            </span>

                            <span className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                              View projects
                              <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>

                        {/* TASKS PREVIEW */}
                        <div
                          className={`group relative rounded-3xl border p-6 md:p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                            dark
                              ? "border-white/[0.08] bg-[#0A111C] hover:border-purple-500/30"
                              : "border-gray-200 bg-white hover:border-purple-200 shadow-sm hover:shadow-xl"
                          }`}
                        >
                          {/* Glow */}
                          <div className="absolute -top-24 -left-24 w-56 h-56 bg-purple-500/10 blur-[80px] rounded-full" />

                          {/* Header */}
                          <div className="relative flex items-center justify-between mb-7">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                  <Zap size={18} />
                                </div>

                                <span
                                  className={`text-lg font-bold ${
                                    dark ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  Tasks
                                </span>
                              </div>

                              <p
                                className={`text-sm ${
                                  dark ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                Turn projects into actionable work.
                              </p>
                            </div>

                            <div
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                dark
                                  ? "bg-white/[0.05] text-gray-400"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              24 Tasks
                            </div>
                          </div>

                          {/* Kanban */}
                          <div className="relative grid grid-cols-3 gap-3">
                            {/* TODO */}
                            <TaskColumn
                              dark={dark}
                              title="To Do"
                              count="4"
                              color="gray"
                              tasks={[
                                {
                                  title: "Update landing page",
                                  priority: "High",
                                  user: "RS",
                                },
                                {
                                  title: "Add API documentation",
                                  priority: "Medium",
                                  user: "AM",
                                },
                              ]}
                            />

                            {/* IN PROGRESS */}
                            <TaskColumn
                              dark={dark}
                              title="In Progress"
                              count="3"
                              color="blue"
                              tasks={[
                                {
                                  title: "Dashboard redesign",
                                  priority: "High",
                                  user: "SK",
                                },
                                {
                                  title: "Analytics charts",
                                  priority: "Medium",
                                  user: "RS",
                                },
                              ]}
                            />

                            {/* DONE */}
                            <TaskColumn
                              dark={dark}
                              title="Done"
                              count="8"
                              color="green"
                              tasks={[
                                {
                                  title: "Firebase auth",
                                  priority: "Low",
                                  user: "AM",
                                },
                                {
                                  title: "Team invitations",
                                  priority: "Medium",
                                  user: "PK",
                                },
                              ]}
                            />
                          </div>

                          {/* Bottom */}
                          <div
                            className={`relative mt-5 pt-5 border-t flex items-center justify-between ${
                              dark ? "border-white/[0.06]" : "border-gray-100"
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                dark ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              15 completed this week
                            </span>

                            <span className="text-xs font-semibold text-purple-500 flex items-center gap-1">
                              View tasks
                              <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Connected workflow strip */}
                      <div
                        className={`mt-6 rounded-2xl border p-5 flex flex-col md:flex-row items-center justify-between gap-5 ${
                          dark
                            ? "border-white/[0.07] bg-white/[0.02]"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {["RS", "AM", "SK", "PK"].map((initials, index) => (
                              <div
                                key={initials}
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                                  dark
                                    ? "border-[#0A111C] bg-gray-800 text-gray-300"
                                    : "border-white bg-gray-100 text-gray-600"
                                }`}
                              >
                                {initials}
                              </div>
                            ))}
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Your whole team stays in sync.
                            </p>

                            <p
                              className={`text-xs mt-1 ${
                                dark ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              Projects → Tasks → Team → Activity → Analytics
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          Workspace synced
                        </div>
                      </div>
                    </div>
                  </section>


        {/* Stats */}
        <section
          className={`border-y transition-colors ${
            dark
              ? "border-white/[0.06] bg-white/[0.015]"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                ["10+", "Workspace tools"],
                ["100%", "Cloud based"],
                ["Real-time", "Workspace data"],
                ["Secure", "Firebase powered"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl md:text-3xl font-bold">{value}</div>

                  <div
                    className={`text-xs mt-1 ${
                      dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <div className="text-sm font-semibold text-blue-500 mb-3">
                EVERYTHING IN ONE PLACE
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Built around the way
                <br />
                your team works.
              </h2>

              <p
                className={`mt-5 text-lg leading-7 ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Stop jumping between different tools. NexusFlow gives your team
                one connected workspace for planning, execution and insight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FeatureCard
                dark={dark}
                icon={LayoutDashboard}
                title="Workspace overview"
                description="Get a clear picture of projects, tasks, team activity and workspace health."
              />

              <FeatureCard
                dark={dark}
                icon={FolderKanban}
                title="Project management"
                description="Create projects, track progress and keep everything organized."
              />

              <FeatureCard
                dark={dark}
                icon={Zap}
                title="Task management"
                description="Create, assign, prioritize and track tasks with powerful workflows."
              />

              <FeatureCard
                dark={dark}
                icon={BarChart3}
                title="Analytics"
                description="Turn workspace activity into useful insights."
              />

              <FeatureCard
                dark={dark}
                icon={Users}
                title="Team collaboration"
                description="Invite teammates, manage roles and keep everyone aligned."
              />

              <FeatureCard
                dark={dark}
                icon={Webhook}
                title="Real-time webhooks"
                description="Send workspace events to the tools and applications you already use."
              />
            </div>
          </div>
        </section>

        {/* Webhooks */}
        <section
          id="webhooks"
          className={`px-6 py-24 md:py-32 ${
            dark
              ? "bg-[#080E18] border-y border-white/[0.06]"
              : "bg-white border-y border-gray-200"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 mb-4">
                  <Webhook size={16} />
                  REAL-TIME INTEGRATIONS
                </div>

                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  When work changes,
                  <br />
                  <span className="text-blue-500">your tools know.</span>
                </h2>

                <p
                  className={`max-w-xl mt-5 text-lg leading-7 ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  NexusFlow webhooks send real-time workspace events to your
                  external applications, so your workflow keeps moving beyond
                  the dashboard.
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {[
                    "task.created",
                    "task.updated",
                    "task.deleted",
                    "project.created",
                    "member.invited",
                  ].map((event) => (
                    <span
                      key={event}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono ${
                        dark
                          ? "border-white/[0.08] bg-white/[0.03] text-gray-400"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      {event}
                    </span>
                  ))}
                </div>

                <Link
                  to="/webhooks"
                  className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                >
                  Explore Webhooks
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Live webhook flow */}
              <div
                className={`relative rounded-3xl border p-6 md:p-8 overflow-hidden ${
                  dark
                    ? "border-white/[0.08] bg-[#0A111C]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-blue-500/10 blur-[90px]" />
                <div className="absolute -left-20 -bottom-24 w-56 h-56 rounded-full bg-purple-500/10 blur-[90px]" />

                <div className="relative flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Webhook size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">NexusFlow Webhook</p>
                      <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                        Event delivery
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    LIVE
                  </span>
                </div>

                <div className="relative space-y-3">
                  {[
                    ["task.created", "Delivered", "blue"],
                    ["task.updated", "Delivered", "purple"],
                    ["project.created", "Delivered", "green"],
                  ].map(([event, status, tone], index) => (
                    <div
                      key={event}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        dark
                          ? "border-white/[0.07] bg-white/[0.025]"
                          : "border-gray-200 bg-white"
                      }`}
                      style={{
                        animation: `fadeUp 0.6s ${index * 0.18}s ease-out both`,
                      }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tone === "blue"
                            ? "bg-blue-500/10 text-blue-500"
                            : tone === "purple"
                              ? "bg-purple-500/10 text-purple-500"
                              : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        <Zap size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <code className="block text-[11px] font-medium truncate">
                          {event}
                        </code>
                        <span className={`text-[9px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
                          POST → your endpoint
                        </span>
                      </div>

                      <span className="shrink-0 text-[9px] font-semibold text-emerald-500">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative flex items-center gap-3 mt-6">
                  <div className="h-px flex-1 bg-gray-300 dark:bg-white/10" />
                  <ArrowRight size={15} className="text-blue-500" />
                  <div className={`px-3 py-2 rounded-lg text-[10px] font-semibold ${dark ? "bg-white/[0.05] text-gray-300" : "bg-white border border-gray-200 text-gray-600"}`}>
                    Your application
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section
          id="workflow"
          className={`px-6 py-24 border-y ${
            dark
              ? "bg-white/[0.02] border-white/[0.06]"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-sm font-semibold text-purple-500 mb-3">
                SIMPLE WORKFLOW
              </div>

              <h2 className="text-4xl md:text-5xl font-bold">
                From idea to execution.
              </h2>

              <p
                className={`mt-5 text-lg ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Everything your team needs to turn work into progress.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <WorkflowStep
                dark={dark}
                number="01"
                title="Plan"
                description="Create projects, define priorities and organize the work."
              />

              <WorkflowStep
                dark={dark}
                number="02"
                title="Collaborate"
                description="Assign tasks, communicate and keep everyone aligned."
              />

              <WorkflowStep
                dark={dark}
                number="03"
                title="Measure"
                description="Use analytics and activity to understand progress."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />

              <div className="relative">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-7 animate-float">
                  <Sparkles size={25} className="text-white" />
                </div>

                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Ready to bring your
                  <br />
                  <span className="text-blue-500">workflow together?</span>
                </h2>

                <p
                  className={`max-w-xl mx-auto text-lg mt-5 ${
                    dark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Create your workspace and start organizing your team's work
                  with NexusFlow.
                </p>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
                >
                  Create your workspace
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t px-6 ${
          dark ? "border-white/[0.06]" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              N
            </div>

            <span className="text-sm font-semibold">NexusFlow</span>
          </div>

          <div
            className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}
          >
            © {new Date().getFullYear()} NexusFlow. All rights reserved.
          </div>

          <div className="flex items-center gap-5 text-xs">
            <Link
              to="/login"
              className={
                dark
                  ? "text-gray-500 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              Login
            </Link>

            <Link
              to="/register"
              className={
                dark
                  ? "text-gray-500 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              Register
            </Link>

            <Link
              to="/subscription"
              className={
                dark
                  ? "text-gray-500 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
      @keyframes progressGrow {
  from {
    width: 0;
  }
}

@keyframes taskFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}
        @keyframes orb {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(35px) scale(1.08);
          }
        }

        @keyframes orbReverse {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-35px) scale(1.08);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboard {
          from {
            opacity: 0;
            transform: translateY(35px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes floatReverse {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(9px);
          }
        }

        @keyframes progress {
          from {
            width: 0;
          }
        }

        @keyframes chartBar {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }

        .animate-orb {
          animation: orb 8s ease-in-out infinite;
        }

        .animate-orb-reverse {
          animation: orbReverse 10s ease-in-out infinite;
        }

        .animate-fade-up {
          animation: fadeUp 0.7s ease-out both;
        }

        .animate-fade-up-delay {
          animation: fadeUp 0.7s 0.12s ease-out both;
        }

        .animate-fade-up-delay-2 {
          animation: fadeUp 0.7s 0.24s ease-out both;
        }

        .animate-dashboard {
          animation: dashboard 1s 0.25s ease-out both;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: floatReverse 4.5s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 1.4s ease-out both;
        }

        .animate-chart-bar {
          animation: chartBar 0.8s ease-out both;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, dark }) {
  return (
    <div
      className={`group relative p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
        dark
          ? "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.045] hover:border-white/[0.12]"
          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-gray-200/40"
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition">
        <Icon size={21} />
      </div>

      <h3 className="text-lg font-semibold mt-6">{title}</h3>

      <p
        className={`text-sm leading-6 mt-2 ${
          dark ? "text-gray-500" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function WorkflowStep({ number, title, description, dark }) {
  return (
    <div>
      <div className="text-sm font-mono text-blue-500 mb-5">{number}</div>

      <h3 className="text-2xl font-bold">{title}</h3>

      <p
        className={`leading-7 mt-3 ${dark ? "text-gray-500" : "text-gray-500"}`}
      >
        {description}
      </p>
    </div>
  );
}

function ProjectPreviewCard({
  dark,
  name,
  description,
  progress,
  tasks,
  status,
  members,
  delay,
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
        dark
          ? "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.045]"
          : "border-gray-100 bg-gray-50 hover:bg-white"
      }`}
      style={{
        animation: `fadeUp 0.6s ${delay} ease-out both`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold truncate">{name}</h4>

          <p
            className={`text-[11px] mt-1 ${
              dark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {description}
          </p>
        </div>

        <span className="shrink-0 px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-[9px] font-semibold">
          {status}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-[10px] ${
              dark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Progress
          </span>

          <span className="text-[10px] font-semibold">{progress}%</span>
        </div>

        <div
          className={`h-1.5 rounded-full overflow-hidden ${
            dark ? "bg-white/[0.06]" : "bg-gray-200"
          }`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{
              width: `${progress}%`,
              animation: "progressGrow 1.2s ease-out both",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span
          className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}
        >
          {tasks}
        </span>

        <div className="flex -space-x-1.5">
          {members.map((member) => (
            <div
              key={member}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${
                dark
                  ? "border-[#111923] bg-gray-700 text-gray-300"
                  : "border-gray-50 bg-gray-200 text-gray-600"
              }`}
            >
              {member}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskColumn({ dark, title, count, color, tasks }) {
  const colors = {
    gray: dark ? "text-gray-400 bg-gray-500/10" : "text-gray-500 bg-gray-100",

    blue: "text-blue-500 bg-blue-500/10",

    green: "text-emerald-500 bg-emerald-500/10",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold ${
              dark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${colors[color]}`}
          >
            {count}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task.title}
            className={`p-3 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 ${
              dark
                ? "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05]"
                : "border-gray-100 bg-gray-50 hover:bg-white"
            }`}
            style={{
              animation: `taskFloat 4s ${index * 0.6}s ease-in-out infinite`,
            }}
          >
            <p className="text-[10px] font-semibold leading-4">{task.title}</p>

            <div className="flex items-center justify-between mt-3">
              <span
                className={`text-[8px] font-semibold ${
                  task.priority === "High"
                    ? "text-red-400"
                    : task.priority === "Medium"
                      ? "text-yellow-500"
                      : "text-emerald-500"
                }`}
              >
                {task.priority}
              </span>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold ${
                  dark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {task.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

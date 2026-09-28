import React, { useEffect, useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Monitor,
  Shield,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useDarkMode } from "../context/DarkModeContext";

export default function Settings() {
  const { user, userRole, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const { theme, setTheme } = useDarkMode();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        setUserData(data);

        setEmailNotifications(data.settings?.emailNotifications ?? true);

        setPushNotifications(data.settings?.pushNotifications ?? false);
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const updateNotificationSetting = async (type, value) => {
    if (!user) return;

    try {
      setSavingNotifications(true);
      setSavedMessage("");

      await updateDoc(doc(db, "users", user.uid), {
        [`settings.${type}`]: value,
      });

      setSavedMessage("Settings saved");

      setTimeout(() => {
        setSavedMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating notification setting:", error);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleEmailNotificationChange = (event) => {
    const value = event.target.checked;

    setEmailNotifications(value);

    updateNotificationSetting("emailNotifications", value);
  };

  const handlePushNotificationChange = (event) => {
    const value = event.target.checked;

    setPushNotifications(value);

    updateNotificationSetting("pushNotifications", value);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-[#070B14] dark:text-white">
        <Sidebar userRole={userRole} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={userData} userRole={userRole} onLogout={handleLogout} />

          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />

              <p className="text-sm text-gray-500">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-[#070B14] dark:text-white">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={userData} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto nexus-scroll">
          <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-8">
            {/* Page heading */}
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>Account</span>
                <span>/</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Settings
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Settings
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Manage your workspace preferences and account settings.
              </p>
            </div>

            {/* Saved message */}
            {savedMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />

                <span>{savedMessage}</span>

                {savingNotifications && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                )}
              </div>
            )}

            {/* Notifications */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1422]">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Bell className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Choose how you want to receive updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {/* Email */}
                <div className="flex items-center justify-between gap-5 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.04]">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Email notifications
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Receive important updates about your account.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleEmailNotificationChange({
                        target: {
                          checked: !emailNotifications,
                        },
                      })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      emailNotifications ? "bg-blue-500" : "bg-gray-700"
                    }`}
                    aria-label="Toggle email notifications"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        emailNotifications ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Push */}
                <div className="flex items-center justify-between gap-5 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        Push notifications
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Receive notifications directly on your device.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handlePushNotificationChange({
                        target: {
                          checked: !pushNotifications,
                        },
                      })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      pushNotifications ? "bg-blue-500" : "bg-gray-700"
                    }`}
                    aria-label="Toggle push notifications"
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        pushNotifications ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Appearance */}
            {/* Appearance */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1422]">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    {theme === "light" ? (
                      <Sun className="h-5 w-5" />
                    ) : theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Appearance
                    </h2>

                   <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Customize how NexusFlow looks for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-200">Theme</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose how NexusFlow should appear.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      theme === "light"
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        theme === "light"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400"
                      }`}
                    >
                      <Sun className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Light</p>

                      <p className="mt-1 text-xs text-gray-500">
                        Bright interface
                      </p>
                    </div>

                    {theme === "light" && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-blue-400" />
                    )}
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      theme === "dark"
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        theme === "dark"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-white/[0.05] text-gray-400"
                      }`}
                    >
                      <Moon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-200">Dark</p>

                      <p className="mt-1 text-xs text-gray-500">
                        Dark interface
                      </p>
                    </div>

                    {theme === "dark" && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-blue-400" />
                    )}
                  </button>

                  {/* System */}
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      theme === "system"
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        theme === "system"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-white/[0.05] text-gray-400"
                      }`}
                    >
                      <Monitor className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        System
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Follow device
                      </p>
                    </div>

                    {theme === "system" && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-blue-400" />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Account */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1422]">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Shield className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Account
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Information about your NexusFlow account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8">
                <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.02] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Email
                  </p>

                  <p className="mt-2 truncate text-sm font-medium text-gray-200">
                    {userData?.email || user?.email || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Role
                  </p>

                  <p className="mt-2 text-sm font-medium capitalize text-gray-200">
                    {userRole || "member"}
                  </p>
                </div>
              </div>
            </section>

            {/* Danger zone */}
            <section className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.04]">
              <div className="border-b border-red-500/10 px-6 py-5 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <Trash2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-red-300">
                      Danger Zone
                    </h2>

                    <p className="mt-1 text-sm text-red-400/70">
                      Irreversible account actions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Delete account
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Permanently delete your account and associated data.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </button>
              </div>
            </section>

            {/* Footer spacing */}
            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}

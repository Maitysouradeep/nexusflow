import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function UserProfile() {
  const { user, userRole, logout } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        setProfileData(data);

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);

      setMessage({
        type: "error",
        text: "Unable to load your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setMessage({
      type: "",
      text: "",
    });

    setFormData({
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
    });

    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: profileData?.firstName || "",
      lastName: profileData?.lastName || "",
    });

    setEditing(false);

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleSave = async () => {
    if (!user) return;

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName || !lastName) {
      setMessage({
        type: "error",
        text: "First name and last name are required.",
      });

      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        updatedAt: serverTimestamp(),
      });

      const updatedProfile = {
        ...profileData,
        firstName,
        lastName,
      };

      setProfileData(updatedProfile);

      setFormData({
        firstName,
        lastName,
      });

      setEditing(false);

      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      });

      setTimeout(() => {
        setMessage({
          type: "",
          text: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);

      setMessage({
        type: "error",
        text: "Unable to update your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    const first = profileData?.firstName?.charAt(0) || "";
    const last = profileData?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  const getFullName = () => {
    const first = profileData?.firstName || "";
    const last = profileData?.lastName || "";

    return `${first} ${last}`.trim() || "User";
  };

  const formatRole = (role) => {
    if (!role) return "Member";

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#070B14]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#070B14] text-white">
      <Sidebar userRole={userRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={profileData}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto nexus-scroll">
          <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-8">
            {/* Page heading */}
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>Account</span>
                <span>/</span>
                <span className="text-gray-300">Profile</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Manage your personal information and account details.
              </p>
            </div>

            {/* Profile header */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0D1422] shadow-2xl">
              <div className="relative h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_40%)]" />
              </div>

              <div className="relative px-6 pb-6 sm:px-8">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    {/* Avatar */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[#0D1422] bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white shadow-xl">
                      {getInitials()}
                    </div>

                    <div className="pb-1">
                      <h2 className="text-2xl font-bold text-white">
                        {getFullName()}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        {profileData?.email || user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:self-end">
                    <Shield className="h-4 w-4 text-purple-400" />

                    <span className="text-sm font-medium text-gray-300">
                      {formatRole(userRole)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Message */}
            {message.text && (
              <div
                className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}

                <span>{message.text}</span>
              </div>
            )}

            {/* Profile information */}
            <section className="rounded-2xl border border-white/10 bg-[#0D1422] shadow-xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Personal information
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Update the information associated with your account.
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </button>
                )}
              </div>

              <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
                {/* First name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    First name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      disabled={!editing || saving}
                      className="w-full rounded-xl border border-white/10 bg-[#080D17] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="First name"
                    />
                  </div>
                </div>

                {/* Last name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Last name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      disabled={!editing || saving}
                      className="w-full rounded-xl border border-white/10 bg-[#080D17] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                      type="email"
                      value={profileData?.email || user?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-gray-400 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-600">
                    Your email address is managed through your authentication
                    account.
                  </p>
                </div>
              </div>

              {/* Account information */}
              <div className="border-t border-white/10 px-6 py-6 sm:px-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Account information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Role */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />

                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Role
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-200">
                      {formatRole(userRole)}
                    </p>
                  </div>

                  {/* Account status */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-400" />

                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Account status
                      </span>
                    </div>

                    <p className="text-sm font-medium text-emerald-400">
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {editing && (
                <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

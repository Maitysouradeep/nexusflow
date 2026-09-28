import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  Mail,
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleBadge from "./RoleBadge";
import { hasPermission, PERMISSIONS } from "../utils/permissions";
import RoleSelector from "./team/RoleSelector";
import { logActivity } from "../utils/activityLogger";
import { dispatchWebhookEvent } from "../utils/webhookDispatcher";

export default function Team() {
  const { user, userRole, workspaceId, logout } = useAuth();

  const canManageTasks = ["owner", "admin", "manager"].includes(userRole);
  const canManageRoles = ["owner", "admin"].includes(userRole);
  const canInviteMembers = ["owner", "admin", "manager"].includes(userRole);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [pendingInvitations, setPendingInvitations] = useState([]);

  const [incomingInvitations, setIncomingInvitations] = useState([]);
  const [acceptingInvitation, setAcceptingInvitation] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchMembers = async () => {
    if (!workspaceId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const membersQuery = query(
        collection(db, "users"),
        where("workspaceId", "==", workspaceId),
      );

      const snapshot = await getDocs(membersQuery);

      const fetchedMembers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMembers(fetchedMembers);
    } catch (err) {
      console.error("Error fetching team members:", err);

      setError("Unable to load your team members.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!workspaceId) {
      setPendingInvitations([]);
      return;
    }

    try {
      const invitationsQuery = query(
        collection(db, "invitations"),
        where("workspaceId", "==", workspaceId),
        where("status", "==", "pending"),
      );

      const snapshot = await getDocs(invitationsQuery);

      const invitations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingInvitations(invitations);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  const fetchIncomingInvitations = async () => {
    if (!user?.email) {
      setIncomingInvitations([]);
      return;
    }

    try {
      const invitationsQuery = query(
        collection(db, "invitations"),
        where("email", "==", user.email.toLowerCase()),
        where("status", "==", "pending"),
      );

      const snapshot = await getDocs(invitationsQuery);

      const invitations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIncomingInvitations(invitations);
    } catch (err) {
      console.error("Error fetching incoming invitations:", err);
    }
  };

  const handleAcceptInvitation = async (invitation) => {
    if (!user?.uid) {
      return;
    }

    try {
      setAcceptingInvitation(invitation.id);

      // 1. Get current user document
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error("Your user profile could not be found.");
      }

      // 2. Update user with workspace + role
      await updateDoc(userRef, {
        workspaceId: invitation.workspaceId,
        role: invitation.role,
        invitationId: invitation.id,
        updatedAt: serverTimestamp(),
      });

      // 3. Mark invitation as accepted
      const invitationRef = doc(db, "invitations", invitation.id);

      await updateDoc(invitationRef, {
        status: "accepted",
        acceptedBy: user.uid,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const memberName =
        `${user?.displayName || ""}`.trim() ||
        user?.email ||
        "Workspace member";

      await logActivity({
        workspaceId: invitation.workspaceId,
        userId: user.uid,
        userName: memberName,
        userEmail: user.email,
        action: "invitation_accepted",
        details: {
          invitationId: invitation.id,
          memberName,
          memberEmail: user.email || "",
          role: invitation.role,
        },
      });

      // 4. Refresh page data
      setIncomingInvitations((current) =>
        current.filter((item) => item.id !== invitation.id),
      );

      // 5. Refresh the page so AuthContext loads
      // the new workspace/role.
      window.location.reload();
    } catch (err) {
      console.error("Error accepting invitation:", err);

      alert(err.message || "Unable to accept invitation. Please try again.");
    } finally {
      setAcceptingInvitation(null);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (!user || !canManageRoles) {
      return;
    }

    if (memberId === user.uid) {
      alert("You cannot change your own role.");
      return;
    }

    const member = members.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    const oldRole = member.role;

    if (oldRole === newRole) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", memberId), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      const actorName =
        `${user?.displayName || ""}`.trim() ||
        user?.email ||
        "Workspace member";

      const memberName =
        `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
        member.email ||
        "Unknown member";

      await logActivity({
        workspaceId,
        userId: user.uid,
        userName: actorName,
        userEmail: user.email,
        action: "role_changed",
        details: {
          memberId,
          memberName,
          memberEmail: member.email || "",
          fromRole: oldRole,
          toRole: newRole,
        },
      });

      setMembers((previousMembers) =>
        previousMembers.map((item) =>
          item.id === memberId
            ? {
                ...item,
                role: newRole,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error updating member role:", error);
      alert("Unable to update the member role.");
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();

    setInviteError("");
    setInviteSuccess("");

    if (!canInvite) {
      setInviteError("You do not have permission to invite members.");
      return;
    }

    if (!workspaceId) {
      setInviteError("No workspace is associated with your account.");
      return;
    }

    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    if (normalizedEmail === user?.email?.toLowerCase()) {
      setInviteError("You cannot invite yourself.");
      return;
    }

    try {
      setInviteLoading(true);

      // Check whether this person is already a workspace member
      const existingMemberQuery = query(
        collection(db, "users"),
        where("workspaceId", "==", workspaceId),
        where("email", "==", normalizedEmail),
      );

      const existingMemberSnapshot = await getDocs(existingMemberQuery);

      if (!existingMemberSnapshot.empty) {
        setInviteError("This user is already a member of your workspace.");
        return;
      }

      // Check for an existing pending invitation
      const existingInvitationQuery = query(
        collection(db, "invitations"),
        where("workspaceId", "==", workspaceId),
        where("email", "==", normalizedEmail),
        where("status", "==", "pending"),
      );

      const existingInvitationSnapshot = await getDocs(existingInvitationQuery);

      if (!existingInvitationSnapshot.empty) {
        setInviteError("A pending invitation already exists for this email.");
        return;
      }

      // Create invitation
      const invitationRef = await addDoc(collection(db, "invitations"), {
        email: normalizedEmail,
        workspaceId,
        invitedBy: user.uid,
        invitedByEmail: user.email,
        role: inviteRole,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await dispatchWebhookEvent({
        workspaceId,
        event: "member.invited",
        data: {
          invitationId: invitationRef.id,
          email: normalizedEmail,
          role: inviteRole,
          invitedBy: user.uid,
          invitedByEmail: user.email,
        },
      });

      const actorName =
        `${user?.displayName || ""}`.trim() ||
        user?.email ||
        "Workspace member";

      await logActivity({
        workspaceId,
        userId: user.uid,
        userName: actorName,
        userEmail: user.email,
        action: "member_invited",
        details: {
          invitationId: invitationRef.id,
          invitedEmail: normalizedEmail,
          invitedRole: inviteRole,
        },
      });

      setInviteSuccess(`Invitation sent to ${normalizedEmail}.`);

      setInviteEmail("");
      setInviteRole("member");

      // Refresh pending invitations
      await fetchInvitations();

      // Keep modal open briefly so user sees success
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Error sending invitation:", err);

      setInviteError(
        err.message || "Unable to send invitation. Please try again.",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const canInvite = hasPermission(userRole, PERMISSIONS.INVITE_MEMBERS);

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
    fetchIncomingInvitations();
  }, [workspaceId, user?.email]);

  const filteredMembers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return members;
    }

    return members.filter((member) => {
      const fullName =
        `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();

      const email = member.email?.toLowerCase() || "";

      return fullName.includes(value) || email.includes(value);
    });
  }, [members, search]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      if (typeof value.toDate === "function") {
        return value.toDate().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex">
      <Sidebar userRole={userRole} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header user={user} userRole={userRole} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto nexus-scroll">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
              <span>Workspace</span>
              <span>›</span>
              <span className="text-gray-400">Team</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Team</h1>

                <p className="mt-2 text-gray-400">
                  Manage the people in your workspace.
                </p>
              </div>

              {canInviteMembers && (
                <button
                  type="button"
                  onClick={() => {
                    setInviteError("");
                    setInviteSuccess("");
                    setShowInviteModal(true);
                  }}
                  disabled={!canInvite}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <UserPlus size={17} />
                  Invite member
                </button>
              )}
            </div>

            {/* Incoming Invitations */}
            {incomingInvitations.length > 0 && (
              <div className="mb-6 space-y-3">
                {incomingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail size={18} className="text-purple-400" />

                          <h2 className="font-semibold text-white">
                            Workspace invitation
                          </h2>
                        </div>

                        <p className="mt-2 text-sm text-gray-400">
                          You have been invited to join a workspace as a{" "}
                          <span className="text-purple-400 font-medium">
                            {invitation.role}
                          </span>
                          .
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          Invited by {invitation.invitedByEmail}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAcceptInvitation(invitation)}
                        disabled={acceptingInvitation === invitation.id}
                        className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold hover:scale-[1.01] transition disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {acceptingInvitation === invitation.id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            Accept invitation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                icon={<Users size={19} />}
                label="Team members"
                value={members.length}
              />

              <StatCard
                icon={<ShieldCheck size={19} />}
                label="Workspace"
                value={members.length > 0 ? "Active" : "—"}
              />

              <StatCard
                icon={<Mail size={19} />}
                label="Invitations"
                value={pendingInvitations.length}
              />
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-xl">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search team members..."
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-red-300">{error}</p>

                <button
                  onClick={fetchMembers}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-300 hover:text-red-200"
                >
                  <RefreshCw size={15} />
                  Retry
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0D1320] min-h-[320px] flex flex-col items-center justify-center">
                <Loader2 size={30} className="animate-spin text-blue-400" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading team members...
                </p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <EmptyState hasSearch={Boolean(search)} />
            ) : (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0D1320] overflow-visible">
                {/* Desktop header */}
                <div className="hidden md:grid grid-cols-[minmax(260px,2fr)_1fr_1fr_100px] gap-4 px-6 py-4 border-b border-white/[0.06] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <span>Member</span>
                  <span>Role</span>
                  <span>Joined</span>
                  <span></span>
                </div>

                {filteredMembers.map((member, index) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    formatDate={formatDate}
                    isLast={index === filteredMembers.length - 1}
                    canManageRoles={canManageRoles}
                    handleRoleChange={handleRoleChange}
                    user={user}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!inviteLoading) {
                setShowInviteModal(false);
                setInviteError("");
                setInviteSuccess("");
              }
            }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0D1320] shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <h2 className="text-xl font-semibold">Invite member</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add someone to your workspace.
                </p>
              </div>

              <button
                type="button"
                disabled={inviteLoading}
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError("");
                  setInviteSuccess("");
                }}
                className="text-gray-500 hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteMember} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                    disabled={inviteLoading}
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  disabled={inviteLoading}
                  className="w-full h-12 rounded-xl border border-white/10 bg-[#151C2B] px-4 text-sm text-white outline-none focus:border-blue-500/60"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {/* Error */}
              {inviteError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{inviteError}</p>
                </div>
              )}

              {/* Success */}
              {inviteSuccess && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <p className="text-sm text-emerald-300">{inviteSuccess}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={inviteLoading}
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError("");
                    setInviteSuccess("");
                  }}
                  className="h-11 px-5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Send invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------
   STAT CARD
--------------------------------------------- */

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0D1320] p-5">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
          {icon}
        </div>

        <span className="text-2xl font-bold">{value}</span>
      </div>

      <p className="mt-4 text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* ---------------------------------------------
   MEMBER ROW
--------------------------------------------- */

function MemberRow({
  member,
  formatDate,
  isLast,
  canManageRoles,
  handleRoleChange,
  user,
}) {
  const firstName = member.firstName || "";

  const lastName = member.lastName || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || member.email || "Unknown user";

  const initial =
    firstName?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U";

  return (
    <div
      className={`
        px-6 py-5
        ${!isLast ? "border-b border-white/[0.06]" : ""}
        hover:bg-white/[0.02]
        transition
      `}
    >
      <div className="md:grid md:grid-cols-[minmax(260px,2fr)_1fr_1fr_100px] md:items-center md:gap-4">
        {/* Member */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-100 truncate">{fullName}</p>

            <p className="text-sm text-gray-500 truncate">{member.email}</p>
          </div>
        </div>

        {/* Mobile information */}
        <div className="mt-4 md:hidden flex flex-wrap items-center gap-3">
          <RoleBadge role={member.role} size="small" />

          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <CalendarDays size={13} />
            {formatDate(member.createdAt)}
          </span>
        </div>

        {/* Role */}
        {/* Role */}
        <div className="hidden md:block">
          {member.role === "owner" || !canManageRoles ? (
            <RoleBadge role={member.role} size="small" />
          ) : (
            <RoleSelector
              currentRole={member.role}
              onChange={(newRole) => handleRoleChange(member.id, newRole)}
              disabled={member.id === user?.uid}
            />
          )}
        </div>

        {/* Joined */}
        <div className="hidden md:block">
          <span className="text-sm text-gray-400">
            {formatDate(member.createdAt)}
          </span>
        </div>

        {/* Action */}
        <div className="hidden md:flex justify-end">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-200 transition"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   EMPTY STATE
--------------------------------------------- */

function EmptyState({ hasSearch }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0D1320] min-h-[320px] flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
        <Users size={25} />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        {hasSearch ? "No members found" : "No team members yet"}
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
        {hasSearch
          ? "Try a different name or email address."
          : "Invite people to your workspace to start collaborating."}
      </p>
    </div>
  );
}

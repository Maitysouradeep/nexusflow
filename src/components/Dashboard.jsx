import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from './Sidebar';
import Header from './Header';
import RoleBadge from './RoleBadge';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Activity,
  Clock3,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user, userRole, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(
        doc(db, 'users', user.uid)
      );

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error(
        'Error fetching user data:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <span className="font-black text-white">
              N
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const firstName = userData?.firstName || 'there';

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-[#070B14] text-gray-900 dark:text-white">

      {/* SIDEBAR */}
      <Sidebar userRole={userRole} />

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">

        <Header
          user={userData}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto nexus-scroll">

          <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-7">

            {/* TOP SECTION */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-2">
                  <span>Overview</span>
                  <ChevronRight size={14} />
                  <span>Dashboard</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Welcome back, {firstName}
                </h1>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Here's what's happening with your workspace.
                </p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition"
              >
                <Plus size={17} />
                Quick action
              </button>

            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

              <StatCard
                title="Projects"
                value="0"
                description="No projects yet"
                icon={<FolderKanban size={20} />}
                href="/projects"
              />

              <StatCard
                title="Tasks"
                value="0"
                description="Ready to be organized"
                icon={<CheckSquare size={20} />}
                href="/tasks"
              />

              <StatCard
                title="Team members"
                value="1"
                description="You're the first member"
                icon={<Users size={20} />}
                href="/profile"
              />

              <StatCard
                title="Growth"
                value="—"
                description="Analytics coming soon"
                icon={<TrendingUp size={20} />}
                href="/analytics"
              />

            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* ACTIVITY */}
              <div className="xl:col-span-2 bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl shadow-sm">

                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      Recent activity
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Your latest workspace activity
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/activity')}
                    className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight size={15} />
                  </button>

                </div>

                <div className="p-6">

                  <div className="flex items-center gap-4 py-4">

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Activity size={19} />
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Account activity is ready
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Your workspace will display recent actions here.
                      </p>

                    </div>

                    <Clock3
                      size={16}
                      className="text-gray-400"
                    />

                  </div>

                  <div className="border-t border-gray-100 dark:border-white/[0.07] pt-4 mt-2">

                    <button
                      onClick={() => navigate('/activity')}
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                    >
                      Open activity log
                    </button>

                  </div>

                </div>
              </div>

              {/* PROFILE CARD */}
              <div className="bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl shadow-sm">

                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">

                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        Your profile
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        Account information
                      </p>
                    </div>

                    <ShieldCheck
                      size={19}
                      className="text-emerald-500"
                    />

                  </div>

                </div>

                <div className="p-6">

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">

                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(
                        userData?.firstName?.[0] ||
                        'U'
                      ).toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {userData?.firstName}{' '}
                        {userData?.lastName}
                      </p>

                      <p className="text-sm text-gray-500 truncate">
                        {userData?.email}
                      </p>

                    </div>

                  </div>

                  <div className="space-y-4">

                    <ProfileRow
                      label="Role"
                      value={
                        <RoleBadge
                          role={userRole}
                          size="medium"
                        />
                      }
                    />

                    <ProfileRow
                      label="Member since"
                      value={formatDate(
                        userData?.createdAt
                      )}
                    />

                  </div>

                  <button
                    onClick={() => navigate('/profile')}
                    className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  >
                    View profile
                  </button>

                </div>
              </div>

            </div>

            {/* QUICK START */}
            <div className="mt-5 rounded-2xl border border-blue-100 dark:border-blue-500/10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/[0.06] dark:to-purple-500/[0.06] p-6">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                    Getting started
                  </p>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your workspace is ready.
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Next we'll add projects, teams, tasks and
                    workspace management.
                  </p>

                </div>

                <button
                  onClick={() => navigate('/settings')}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/15 transition"
                >
                  Configure workspace
                  <ArrowUpRight size={16} />
                </button>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   STAT CARD
--------------------------------------------- */

function StatCard({
  title,
  value,
  description,
  icon,
  href,
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(href)}
      className="text-left bg-white dark:bg-[#0D1320] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start justify-between">

        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          {icon}
        </div>

        <ArrowUpRight
          size={17}
          className="text-gray-400"
        />

      </div>

      <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </button>
  );
}

/* ---------------------------------------------
   PROFILE ROW
--------------------------------------------- */

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 text-right">
        {value}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   DATE FORMATTER
--------------------------------------------- */

function formatDate(value) {
  if (!value) return '—';

  try {
    if (value?.toDate) {
      return value.toDate().toLocaleDateString();
    }

    return new Date(value).toLocaleDateString();
  } catch {
    return '—';
  }
}
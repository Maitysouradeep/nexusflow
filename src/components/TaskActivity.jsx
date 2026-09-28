import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Clock3 } from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function TaskActivity({ taskId }) {
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !taskId) return;

    const activityQuery = query(
      collection(db, "tasks", taskId, "activity"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      activityQuery,
      (snapshot) => {
        const activityData = snapshot.docs.map((activityDoc) => ({
          id: activityDoc.id,
          ...activityDoc.data(),
        }));

        setActivities(activityData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading task activity:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, taskId]);

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";

    return timestamp.toDate().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] p-4">
        <p className="text-sm text-gray-400">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock3 size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold">Activity</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />

              <div className="min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity.message}
                </p>

                <p className="mt-1 text-[11px] text-gray-400">
                  {activity.userName || "Unknown user"} ·{" "}
                  {formatTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
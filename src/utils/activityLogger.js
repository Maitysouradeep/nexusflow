import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * Create a workspace activity log.
 */
export const logActivity = async ({
  workspaceId,
  userId,
  userName,
  userEmail,
  action,
  details = {},
}) => {
  if (!workspaceId || !userId || !action) {
    console.warn("Activity log skipped: missing required information.");
    return null;
  }

  try {
    const activityRef = await addDoc(collection(db, "activityLogs"), {
      workspaceId,
      userId,
      userName: userName || "",
      userEmail: userEmail || "",
      action,
      details,
      createdAt: serverTimestamp(),
    });

    return activityRef.id;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
};

/**
 * Get activity logs for the current workspace.
 */
export const getWorkspaceActivityLogs = async (
  workspaceId,
  limitCount = 100,
) => {
  if (!workspaceId) {
    return [];
  }

  try {
    const activityQuery = query(
      collection(db, "activityLogs"),
      where("workspaceId", "==", workspaceId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    const snapshot = await getDocs(activityQuery);

    return snapshot.docs.map((activityDoc) => ({
      id: activityDoc.id,
      ...activityDoc.data(),
    }));
  } catch (error) {
    console.error("Error fetching workspace activity:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    return [];
  }
};
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Loader2, MessageCircle, Send } from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function TaskComments({ taskId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  const loadComments = async () => {
    setLoading(true);

    try {
      const commentsRef = collection(
        db,
        "tasks",
        taskId,
        "comments"
      );

      const commentsQuery = query(
        commentsRef,
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(commentsQuery);

      const commentData = snapshot.docs.map((commentDoc) => ({
        id: commentDoc.id,
        ...commentDoc.data(),
      }));

      setComments(commentData);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = commentText.trim();

    if (!text || !user || saving) {
      return;
    }

    setSaving(true);

    try {
      const userName =
        user.displayName?.trim() ||
        user.email?.split("@")[0] ||
        "User";

      const commentData = {
        text,
        userId: user.uid,
        userName,
        userEmail: user.email || "",
        createdAt: serverTimestamp(),
      };

      const commentsRef = collection(
        db,
        "tasks",
        taskId,
        "comments"
      );

      const commentRef = await addDoc(
        commentsRef,
        commentData
      );

      setComments((previous) => [
        ...previous,
        {
          id: commentRef.id,
          ...commentData,
          createdAt: {
            toDate: () => new Date(),
          },
        },
      ]);

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);

      alert("Unable to add the comment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Just now";
    }

    return timestamp.toDate().toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="border-t border-gray-100 dark:border-white/[0.07] pt-6">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <MessageCircle
          size={18}
          className="text-blue-500"
        />

        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments
        </h3>

        <span className="text-xs text-gray-400">
          {comments.length}
        </span>
      </div>

      {/* COMMENTS */}
      <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1">

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              size={20}
              className="animate-spin text-blue-500"
            />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-8 text-center">
            <MessageCircle
              size={22}
              className="mx-auto text-gray-400"
            />

            <p className="mt-2 text-sm text-gray-500">
              No comments yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Start the conversation about this task.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3"
            >
              {/* AVATAR */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {comment.userName
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              {/* COMMENT */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {comment.userName}
                  </p>

                  <span className="text-[11px] text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400 break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD COMMENT */}
      <form
        onSubmit={handleSubmit}
        className="mt-5 flex items-end gap-3"
      >
        <textarea
          value={commentText}
          onChange={(event) =>
            setCommentText(event.target.value)
          }
          placeholder="Write a comment..."
          rows={2}
          disabled={saving}
          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-4 py-3 text-sm outline-none resize-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={saving || !commentText.trim()}
          className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Send size={17} />
          )}
        </button>
      </form>
    </div>
  );
}
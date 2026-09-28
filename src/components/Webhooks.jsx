import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import {
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import Header from "./Header";
import Sidebar from "./Sidebar";

import CreateWebhookModal from "./webhooks/CreateWebhookModal";
import WebhookEndpointCard from "./webhooks/WebhookEndpointCard";

const AVAILABLE_EVENTS = [
  "project.created",
  "project.updated",
  "project.deleted",
  "task.created",
  "task.updated",
  "task.deleted",
  "member.invited",
];

export default function Webhooks() {
  const { user, userRole, workspaceId, logout } = useAuth();

  const [webhooks, setWebhooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [testingWebhookId, setTestingWebhookId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    url: "",
    events: [],
  });

  const [createdSecret, setCreatedSecret] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    fetchWebhooks();
    fetchDeliveries();
  }, [workspaceId]);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);

      const webhooksQuery = query(
        collection(db, "webhooks"),
        where("workspaceId", "==", workspaceId),
      );

      const snapshot = await getDocs(webhooksQuery);

      const data = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

      setWebhooks(data);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const deliveriesQuery = query(
        collection(db, "webhookDeliveries"),
        where("workspaceId", "==", workspaceId),
      );

      const snapshot = await getDocs(deliveriesQuery);

      const data = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching webhook deliveries:", error);
    }
  };

  const generateSecret = () => {
    const bytes = new Uint8Array(24);

    crypto.getRandomValues(bytes);

    return `whsec_${Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const handleCreateWebhook = async (event) => {
    event.preventDefault();

    if (!workspaceId || !user) {
      return;
    }

    if (!form.name.trim() || !form.url.trim()) {
      return;
    }

    if (form.events.length === 0) {
      return;
    }

    try {
      setCreating(true);

      const secret = generateSecret();

      const webhookData = {
        workspaceId,
        name: form.name.trim(),
        url: form.url.trim(),
        status: "active",
        events: form.events,
        secret,
        createdBy: user.uid,
        createdByName: user.displayName || "Workspace member",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "webhooks"), webhookData);

      setCreatedSecret(secret);

      setForm({
        name: "",
        url: "",
        events: [],
      });

      await fetchWebhooks();
    } catch (error) {
      console.error("Error creating webhook:", error);
    } finally {
      setCreating(false);
    }
  };

  const toggleEvent = (eventName) => {
    setForm((current) => {
      const exists = current.events.includes(eventName);

      return {
        ...current,
        events: exists
          ? current.events.filter((event) => event !== eventName)
          : [...current.events, eventName],
      };
    });
  };

  const handleCopySecret = async () => {
    if (!createdSecret) return;

    try {
      await navigator.clipboard.writeText(createdSecret);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy secret:", error);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreatedSecret("");
    setCopied(false);

    setForm({
      name: "",
      url: "",
      events: [],
    });
  };

  const handleTestWebhook = async (endpoint) => {
    if (!endpoint?.url) {
      return;
    }

    try {
      setTestingWebhookId(endpoint.id);

      const deliveryId = `test_${Date.now()}`;

      const payload = {
        targetUrl: endpoint.url,
        type: "test.delivery",
        message: "Hello from NexusFlow",
        webhookId: endpoint.id,
        webhookName: endpoint.name,
        workspaceId,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:5000/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NexusFlow-Event": "test.delivery",
          "X-NexusFlow-Delivery": deliveryId,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Webhook test failed (${response.status})`,
        );
      }

      // Save delivery history
      await addDoc(collection(db, "webhookDeliveries"), {
        workspaceId,
        webhookId: endpoint.id,
        webhookName: endpoint.name,

        event: result.delivery?.event || "test.delivery",

        status: result.delivery?.status || "failed",

        responseStatus: result.delivery?.responseStatus ?? null,

        responseTime: result.delivery?.responseTime ?? null,

        deliveryId: result.delivery?.deliveryId || deliveryId,

        createdAt: serverTimestamp(),
      });

      // Update webhook counters
      const updatedWebhooks = webhooks.map((webhook) => {
        if (webhook.id !== endpoint.id) {
          return webhook;
        }

        return {
          ...webhook,
          deliveries: Number(webhook.deliveries || 0) + 1,
          failed:
            result.delivery?.status === "failed"
              ? Number(webhook.failed || 0) + 1
              : Number(webhook.failed || 0),
        };
      });

      setWebhooks(updatedWebhooks);

      await fetchDeliveries();
    } catch (error) {
      console.error("Webhook test failed:", error);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const activeWebhooks = webhooks.filter(
    (webhook) => webhook.status === "active",
  ).length;

  const totalDeliveries = deliveries.length;

  const failedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "failed",
  ).length;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={{
            firstName: user?.displayName || "Webhooks",
          }}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>

                <p className="text-sm text-gray-500 mt-1">
                  Connect NexusFlow events to your applications
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <Plus size={17} />
                Create webhook
              </button>
            </div>

            {/* INTRO */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Webhook size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Event-driven integrations
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                      Send real-time workspace events from NexusFlow to your
                      external applications and services.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-2">
                  <Activity size={14} />
                  Workspace integrations
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Endpoints"
                value={webhooks.length}
                meta="Configured"
                icon={Webhook}
                iconStyle="bg-blue-50 text-blue-600"
              />

              <StatCard
                label="Active"
                value={activeWebhooks}
                meta="Receiving events"
                icon={CheckCircle2}
                iconStyle="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                label="Deliveries"
                value={totalDeliveries}
                meta="Total attempts"
                icon={Activity}
                iconStyle="bg-purple-50 text-purple-600"
              />

              <StatCard
                label="Failed"
                value={failedDeliveries}
                meta="Need attention"
                icon={XCircle}
                iconStyle="bg-red-50 text-red-600"
              />
            </div>

            {/* ENDPOINTS */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Webhook endpoints
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage where your workspace events are delivered
                  </p>
                </div>

                <span className="text-xs font-semibold text-gray-400">
                  {webhooks.length} endpoint
                  {webhooks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="px-6 py-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />

                  <p className="text-sm text-gray-500 mt-4">
                    Loading webhook endpoints...
                  </p>
                </div>
              ) : webhooks.length === 0 ? (
                <EmptyWebhooks onCreate={() => setShowCreateModal(true)} />
              ) : (
                <div className="divide-y divide-gray-100">
                  {webhooks.map((webhook) => {
                    const webhookDeliveries = deliveries.filter(
                      (delivery) => delivery.webhookId === webhook.id,
                    );

                    const failed = webhookDeliveries.filter(
                      (delivery) => delivery.status === "failed",
                    ).length;

                    return (
                      <WebhookEndpointCard
                        key={webhook.id}
                        endpoint={{
                          ...webhook,
                          deliveries: webhookDeliveries.length,
                          failed,
                        }}
                        onTest={handleTestWebhook}
                        testing={testingWebhookId === webhook.id}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* DELIVERY PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Recent deliveries
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Monitor webhook delivery activity
                    </p>
                  </div>

                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View all
                  </button>
                </div>

                <div className="mt-6">
                  {deliveries.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                        <Activity size={18} />
                      </div>

                      <p className="text-sm font-semibold text-gray-700 mt-3">
                        No deliveries yet
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Delivery activity will appear here once webhook events
                        are dispatched.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {deliveries.slice(0, 5).map((delivery) => {
                        const success = delivery.status === "success";

                        const createdAt = delivery.createdAt?.toDate
                          ? delivery.createdAt.toDate().toLocaleString()
                          : "Recently";

                        return (
                          <div
                            key={delivery.id}
                            className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  success
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {success ? (
                                  <CheckCircle2 size={17} />
                                ) : (
                                  <XCircle size={17} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {delivery.event || "webhook.delivery"}
                                </p>

                                <p className="text-xs text-gray-400 mt-0.5">
                                  {delivery.webhookName || "Webhook"} ·{" "}
                                  {createdAt}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`text-xs font-semibold ${
                                  success ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {success ? "Delivered" : "Failed"}
                              </span>

                              <span className="text-xs text-gray-400">
                                {delivery.responseStatus || "—"}
                              </span>

                              <span className="text-xs text-gray-400">
                                {delivery.responseTime
                                  ? `${delivery.responseTime}ms`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK INFO */}
              <div className="bg-gradient-to-br from-[#111827] to-[#1e1b4b] rounded-2xl p-6 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <Webhook size={19} />
                </div>

                <h2 className="text-lg font-bold">Build connected workflows</h2>

                <p className="text-sm text-gray-300 mt-2 leading-6">
                  Use webhook events to connect NexusFlow with your backend,
                  automation tools, analytics systems, and internal services.
                </p>

                <div className="mt-6 space-y-3">
                  <InfoItem text="Real-time event delivery" />
                  <InfoItem text="Secure endpoint secrets" />
                  <InfoItem text="Delivery monitoring" />
                  <InfoItem text="Automatic retries" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CREATE WEBHOOK MODAL */}
      {showCreateModal && (
        <CreateWebhookModal
          form={form}
          creating={creating}
          createdSecret={createdSecret}
          copied={copied}
          onChange={setForm}
          onToggleEvent={toggleEvent}
          onSubmit={handleCreateWebhook}
          onClose={closeCreateModal}
          onCopySecret={handleCopySecret}
          availableEvents={AVAILABLE_EVENTS}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------
   STAT CARD
-------------------------------------------------- */

function StatCard({ label, value, meta, icon: Icon, iconStyle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyle}`}
        >
          <Icon size={19} />
        </div>

        <ArrowUpRight size={16} className="text-gray-300" />
      </div>

      <p className="text-sm font-medium text-gray-500 mt-5">{label}</p>

      <div className="flex items-end gap-2 mt-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>

        <span className="text-xs text-gray-400 mb-1">{meta}</span>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   EMPTY STATE
-------------------------------------------------- */

function EmptyWebhooks({ onCreate }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <Webhook size={24} />
      </div>

      <h3 className="text-base font-bold text-gray-900 mt-4">
        No webhook endpoints yet
      </h3>

      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        Create your first endpoint to start connecting NexusFlow workspace
        events with external applications.
      </p>

      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
      >
        <Plus size={17} />
        Create your first webhook
      </button>
    </div>
  );
}

/* --------------------------------------------------
   INFO ITEM
-------------------------------------------------- */

function InfoItem({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <CheckCircle2 size={15} className="text-emerald-400" />
      {text}
    </div>
  );
}

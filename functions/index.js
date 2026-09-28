const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  FieldValue,
} = require("firebase-admin/firestore");
const crypto = require("crypto");

initializeApp();

const db = getFirestore();

setGlobalOptions({
  maxInstances: 10,
  region: "asia-south1",
});

exports.testWebhook = onCall(async (request) => {
  // 1. Require authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to test a webhook."
    );
  }

  const userId = request.auth.uid;
  const { webhookId } = request.data || {};

  if (!webhookId) {
    throw new HttpsError(
      "invalid-argument",
      "webhookId is required."
    );
  }

  // 2. Load current user
  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new HttpsError(
      "permission-denied",
      "User profile not found."
    );
  }

  const userData = userSnap.data();

  const workspaceId = userData.workspaceId;
  const role = userData.role;

  if (!workspaceId) {
    throw new HttpsError(
      "permission-denied",
      "You are not associated with a workspace."
    );
  }

  // 3. Only workspace admins can test webhooks
  if (!["owner", "admin", "manager"].includes(role)) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to test webhooks."
    );
  }

  // 4. Load webhook
  const webhookRef = db.collection("webhooks").doc(webhookId);
  const webhookSnap = await webhookRef.get();

  if (!webhookSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Webhook endpoint not found."
    );
  }

  const webhook = webhookSnap.data();

  // 5. Make sure webhook belongs to user's workspace
  if (webhook.workspaceId !== workspaceId) {
    throw new HttpsError(
      "permission-denied",
      "This webhook does not belong to your workspace."
    );
  }

  if (webhook.status !== "active") {
    throw new HttpsError(
      "failed-precondition",
      "This webhook is not active."
    );
  }

  if (!webhook.url) {
    throw new HttpsError(
      "failed-precondition",
      "Webhook URL is missing."
    );
  }

  const deliveryRef = db.collection("webhookDeliveries").doc();
  const deliveryId = deliveryRef.id;

  // 6. Test payload
  const payload = {
    id: deliveryId,
    type: "test.delivery",
    createdAt: new Date().toISOString(),
    data: {
      message: "This is a test webhook from NexusFlow.",
      webhookId,
      workspaceId,
    },
  };

  const rawBody = JSON.stringify(payload);

  // 7. Sign payload using webhook secret
  const signature = webhook.secret
    ? crypto
        .createHmac("sha256", webhook.secret)
        .update(rawBody)
        .digest("hex")
    : "";

  const startTime = Date.now();

  let responseStatus = null;
  let responseBody = "";
  let success = false;
  let errorMessage = null;

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NexusFlow-Webhooks/1.0",
        "X-NexusFlow-Event": "test.delivery",
        "X-NexusFlow-Delivery": deliveryId,
        "X-NexusFlow-Signature": `sha256=${signature}`,
      },
      body: rawBody,
    });

    responseStatus = response.status;
    responseBody = await response.text();

    success = response.ok;

    if (!success) {
      errorMessage = `Webhook returned HTTP ${response.status}`;
    }
  } catch (error) {
    errorMessage = error.message || "Failed to deliver webhook.";
  }

  const responseTime = Date.now() - startTime;

  // 8. Store delivery history
  await deliveryRef.set({
    workspaceId,
    webhookId,
    webhookName: webhook.name || "Unnamed webhook",

    event: "test.delivery",

    status: success ? "success" : "failed",

    responseStatus,
    responseTime,

    responseBody: responseBody.slice(0, 5000),

    error: errorMessage,

    attempt: 1,

    createdAt: FieldValue.serverTimestamp(),
  });

  // 9. Update webhook statistics
  const updateData = {
    updatedAt: FieldValue.serverTimestamp(),
    lastDeliveryAt: FieldValue.serverTimestamp(),
    lastDeliveryStatus: success ? "success" : "failed",
    deliveries: FieldValue.increment(1),
  };

  if (!success) {
    updateData.failed = FieldValue.increment(1);
  }

  await webhookRef.update(updateData);

  // 10. Return result to frontend
  return {
    success,
    deliveryId,
    responseStatus,
    responseTime,
    error: errorMessage,
  };
});
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const LOCAL_WEBHOOK_SERVER =
  "http://localhost:5000/test-webhook";

export async function dispatchWebhookEvent({
  workspaceId,
  event,
  data,
}) {
  if (!workspaceId || !event) {
    return [];
  }

  try {
    // Find active webhooks subscribed to this event
    const webhooksQuery = query(
      collection(db, "webhooks"),
      where("workspaceId", "==", workspaceId),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(webhooksQuery);

    const matchingWebhooks = snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data(),
      }))
      .filter((webhook) =>
        webhook.events?.includes(event)
      );

    if (matchingWebhooks.length === 0) {
      return [];
    }

    const results = [];

    for (const webhook of matchingWebhooks) {
      const deliveryId = `evt_${Date.now()}_${webhook.id}`;

      const payload = {
        targetUrl: webhook.url,

        type: event,

        data,

        webhookId: webhook.id,

        webhookName: webhook.name,

        workspaceId,

        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(
          LOCAL_WEBHOOK_SERVER,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-NexusFlow-Event": event,
              "X-NexusFlow-Delivery": deliveryId,
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        const delivery = result.delivery;

        await addDoc(
          collection(db, "webhookDeliveries"),
          {
            workspaceId,

            webhookId: webhook.id,

            webhookName: webhook.name,

            event,

            status:
              delivery?.status ||
              (result.success
                ? "success"
                : "failed"),

            responseStatus:
              delivery?.responseStatus ??
              null,

            responseTime:
              delivery?.responseTime ??
              null,

            deliveryId:
              delivery?.deliveryId ||
              deliveryId,

            createdAt:
              serverTimestamp(),
          }
        );

        results.push({
          webhookId: webhook.id,
          success: result.success,
          status:
            delivery?.status ||
            "failed",
        });
      } catch (error) {
        console.error(
          `Webhook delivery failed for ${webhook.name}:`,
          error
        );

        await addDoc(
          collection(db, "webhookDeliveries"),
          {
            workspaceId,

            webhookId: webhook.id,

            webhookName: webhook.name,

            event,

            status: "failed",

            responseStatus: null,

            responseTime: null,

            deliveryId,

            error:
              error.message ||
              "Webhook delivery failed.",

            createdAt:
              serverTimestamp(),
          }
        );

        results.push({
          webhookId: webhook.id,
          success: false,
          status: "failed",
        });
      }
    }

    return results;
  } catch (error) {
    console.error(
      "Error dispatching webhook event:",
      error
    );

    return [];
  }
}
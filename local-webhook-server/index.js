const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/test-webhook", async (req, res) => {
  console.log("\n==============================");
  console.log("🚀 WEBHOOK RECEIVED");
  console.log("==============================");

  const { targetUrl, ...payload } = req.body;

  console.log("Target URL:");
  console.log(targetUrl);

  console.log("\nHeaders:");
  console.log(req.headers);

  console.log("\nPayload:");
  console.log(payload);

  if (!targetUrl) {
    console.log("\n❌ No target URL provided");
    console.log("==============================\n");

    return res.status(400).json({
      success: false,
      message: "Target webhook URL is required.",
    });
  }

  try {
    const deliveryId = req.headers["x-nexusflow-delivery"];

    const startTime = Date.now();

    const externalResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NexusFlow-Webhooks/1.0",
        "X-NexusFlow-Event":
          req.headers["x-nexusflow-event"] || "test.delivery",
        "X-NexusFlow-Delivery": deliveryId || `local_${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    const responseTime = Date.now() - startTime;

    const responseBody = await externalResponse.text();

    console.log("\n📡 EXTERNAL WEBHOOK RESPONSE");
    console.log("==============================");
    console.log("Status:", externalResponse.status);
    console.log("Response time:", `${responseTime}ms`);
    console.log("Response body:", responseBody.slice(0, 1000));

    console.log("\n==============================");
    console.log("✅ WEBHOOK FORWARDED");
    console.log("==============================\n");

    return res.status(200).json({
      success: externalResponse.ok,
      message: externalResponse.ok
        ? "Webhook forwarded successfully."
        : "External webhook returned an error.",
      responseStatus: externalResponse.status,
      responseTime,
      delivery: {
        event: payload.type,
        status: externalResponse.ok ? "success" : "failed",
        responseStatus: externalResponse.status,
        responseTime,
        webhookId: payload.webhookId,
        webhookName: payload.webhookName,
        workspaceId: payload.workspaceId,
        deliveryId,
      },
    });
  } catch (error) {
    console.error("\n❌ WEBHOOK FORWARD FAILED");
    console.error(error.message);

    console.log("==============================\n");

    return res.status(502).json({
      success: false,
      message: "Failed to forward webhook.",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    service: "NexusFlow Local Webhook Server",
    status: "running",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local webhook server running on http://localhost:${PORT}`);
});

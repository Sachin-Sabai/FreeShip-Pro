import prisma from "../db.server";

export const loader = async ({ request }) => {
  return Response.json({ success: true }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
};

export const action = async ({ request }) => {
  if (request.method !== "POST" && request.method !== "OPTIONS") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (request.method === "OPTIONS") {
    return Response.json({}, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  try {
    const data = await request.json();
    const { shop, action: trackAction, value } = data;

    if (!shop || !trackAction) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create the DailyMetric record for this shop today
    let metric = await prisma.dailyMetric.findFirst({
      where: {
        shopId: shop,
        date: today
      }
    });

    if (!metric) {
      metric = await prisma.dailyMetric.create({
        data: {
          shopId: shop,
          date: today,
          views: 0,
          clicks: 0,
          ordersInfluenced: 0,
          revenueGenerated: 0
        }
      });
    }

    // Update metrics based on the action
    const updateData = {};
    if (trackAction === "view") {
      updateData.views = { increment: 1 };
    } else if (trackAction === "click") {
      updateData.clicks = { increment: 1 };
    } else if (trackAction === "order") {
      updateData.ordersInfluenced = { increment: 1 };
      updateData.revenueGenerated = { increment: value || 0 };
    }

    await prisma.dailyMetric.update({
      where: { id: metric.id },
      data: updateData
    });

    return Response.json({ success: true }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (topic !== "SHOP_REDACT") {
    return new Response("Unhandled webhook topic", { status: 404 });
  }

  // Delete the shop data if it exists
  try {
    const existingShop = await prisma.shop.findUnique({ where: { id: shop } });
    if (existingShop) {
      // Deleting the shop will cascade delete related records if foreign keys are configured,
      // or we can manually delete them here if needed.
      await prisma.shop.delete({ where: { id: shop } });
    }
  } catch (error) {
    console.error("Failed to delete shop data on redact webhook:", error);
  }

  return new Response(null, { status: 200 });
};

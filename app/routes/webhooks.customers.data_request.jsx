import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (topic !== "CUSTOMERS_DATA_REQUEST") {
    return new Response("Unhandled webhook topic", { status: 404 });
  }

  // FreeShip Pro does not store customer PII.
  // Returning 200 OK satisfies Shopify's compliance check.
  
  return new Response(null, { status: 200 });
};

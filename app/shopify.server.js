import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
  BillingReplacementBehavior
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const PLAN_STARTER = "STARTER";
export const PLAN_PRO = "PRO";
export const PLAN_PREMIUM = "PREMIUM";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [PLAN_STARTER]: {
      replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
      lineItems: [{
        amount: 49.00,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      }],
    },
    [PLAN_PRO]: {
      replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
      lineItems: [{
        amount: 69.00,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      }],
    },
    [PLAN_PREMIUM]: {
      replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
      lineItems: [{
        amount: 99.00,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      }],
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

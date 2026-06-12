# FreeShip Pro - Shopify App Store Review Instructions

Welcome to the review of **FreeShip Pro**! 
This document provides the exact flow and test credentials necessary to successfully review our application.

## Application Details
- **App URL:** `https://freeshippro.norexa.online`
- **Purpose:** Provide merchants with highly converting, animated free shipping bars that boost Average Order Value (AOV).

## 🔐 Test Credentials (Required for Review)
Since this is an embedded app that must be tested within a Shopify Admin environment, please use the following Development Store to perform the review flow:
- **Test Store URL:** `https://freeship-pro-demo.myshopify.com/admin` (Please use your partner access or request access if a custom staff account is needed).
- **Storefront Password:** `freeship2026`

*(If you require us to create a specific staff account for the review team, please let us know via the partner dashboard message thread, and we will provision one immediately).*

## 🧪 Step-by-Step Review Flow

### Step 1: Install & Authenticate
1. Navigate to the app installation link.
2. Approve the requested scopes (we only request `write_products` and `write_metaobjects` for bar functionality).
3. Verify that you land successfully on the **FreeShip Pro Dashboard** without any login loops.

### Step 2: Create a Campaign
1. From the Dashboard, click **Create Campaign**.
2. Enter a **Campaign Name** (e.g., "Holiday Sale").
3. Set the **Goal Amount** (e.g., "75").
4. Under the **Theme Customizer**, select any template (e.g., "Sunset Warm" or "Basic Free Bar").
5. Click **Save & Publish** in the top right corner.
6. Verify that you are redirected to the Campaigns list and the new campaign shows as active.

### Step 3: Enable the Theme App Extension
1. Go to your Shopify Admin -> **Online Store** -> **Themes**.
2. Click **Customize** on the current live theme.
3. In the Theme Editor sidebar, click the **App Embeds** icon (third icon down).
4. Find **FreeShip Pro Bar** and toggle it **ON**.
5. Click **Save** in the top right corner.

### Step 4: Verify Storefront Functionality
1. Open the Storefront. (Use the password `freeship2026` if prompted).
2. Verify that the Free Shipping Bar appears at the top or bottom of the screen.
3. **Important Check:** Verify that the color and template match exactly what you selected in Step 2. (It should *not* be a generic red bar unless you picked a red template).
4. **Cart Functionality:** Add a product to your cart.
5. Verify that the bar instantly updates to show the remaining amount needed to unlock free shipping based on the goal you set.

## Common Issues Resolved
- **2.1.1 Critical Error:** The storefront now perfectly syncs with the app dashboard. We have removed all cached/stale metafield behavior.
- **404/500 Errors:** Embedded app configuration has been strictly enforced, eliminating the cross-site cookie blocking and iframe redirect loops.

Thank you for your time reviewing FreeShip Pro!

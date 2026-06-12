import { ALL_TEMPLATES } from "./templates";

export async function syncCampaignToMetafield(admin, campaign) {
  // Find template CSS
  const templateConfig = ALL_TEMPLATES.find(t => t.value === campaign.templateId) || ALL_TEMPLATES[0];
  
  // Build the JSON payload for the storefront
  const settingsJson = {
    goalAmount: campaign.goalAmount,
    backgroundColor: templateConfig.style.background || "#000000",
    textColor: templateConfig.style.color || "#FFFFFF",
    progressBarColor: templateConfig.style.progress || "#22C55E",
    successMessage: "Congratulations! You've unlocked FREE shipping",
    progressMessage: templateConfig.previewText || "Only $10.00 away from free shipping!",
    position: JSON.parse(campaign.config || '{}').placement || "top",
    animation: JSON.parse(campaign.config || '{}').animation || "none"
  };

  // Get Shop ID
  const shopRes = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopRes.json();
  const shopId = shopData.data.shop.id;

  const response = await admin.graphql(
    `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            key: "settings",
            namespace: "freeship",
            ownerId: shopId,
            type: "json",
            value: JSON.stringify(settingsJson)
          },
        ],
      },
    }
  );

  const resJson = await response.json();
  if (resJson.data?.metafieldsSet?.userErrors?.length > 0) {
    console.error("Metafield Set Errors:", resJson.data.metafieldsSet.userErrors);
  }
  return resJson;
}

export async function clearCampaignMetafield(admin) {
  const shopRes = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopRes.json();
  const shopId = shopData.data.shop.id;

  const response = await admin.graphql(
    `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
        }
        userErrors {
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            key: "settings",
            namespace: "freeship",
            ownerId: shopId,
            type: "json",
            value: "{}"
          },
        ],
      },
    }
  );

  return await response.json();
}

import { useState, useCallback } from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Button, TextField, Select, Grid, Divider, Box } from "@shopify/polaris";
import { useSubmit, useNavigation, redirect, useSearchParams, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { 
  getTemplatesForPlan, TemplatePreview, FREE_TEMPLATES 
} from "../utils/templates";
import { syncCampaignToMetafield } from "../utils/metafields.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = await prisma.shop.findUnique({ where: { id: session.shop } });
  return { activePlan: shop?.plan || "FREE" };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const name = formData.get("name") || "Untitled Campaign";
  const goalAmount = parseFloat(formData.get("goalAmount")) || 100;
  const targetCountry = formData.get("targetCountry") || "all";
  const targetDevice = formData.get("targetDevice") || "all";
  const templateId = formData.get("templateId") || "basic";
  const animation = formData.get("animation") || "none";
  const placement = formData.get("placement") || "top";

  const shop = await prisma.shop.findUnique({ where: { id: session.shop } });
  const activePlan = shop?.plan || "FREE";

  if (activePlan === "FREE" || activePlan === "STARTER") {
    // Enforce 1 active campaign limit by deactivating others
    await prisma.campaign.updateMany({
      where: { shopId: session.shop },
      data: { isActive: false }
    });
  }

  const campaign = await prisma.campaign.create({
    data: {
      shopId: session.shop,
      name,
      isActive: true,
      goalAmount,
      targetCountries: JSON.stringify([targetCountry]),
      targetDevices: targetDevice,
      templateId,
      config: JSON.stringify({ animation, placement })
    }
  });

  await syncCampaignToMetafield(admin, campaign);

  return redirect("/app/campaigns");
};

export default function NewCampaign() {
  const { activePlan } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isSaving = navigation.state === "submitting";

  const availableTemplates = getTemplatesForPlan(activePlan);
  // Default to the first available template or what is passed in search params
  const initialTemplate = searchParams.get("template") || availableTemplates[0]?.value || "basic";

  const [name, setName] = useState("");
  const [goalAmount, setGoalAmount] = useState("100");
  const [template, setTemplate] = useState(initialTemplate);
  const [animation, setAnimation] = useState("none");
  const [targetCountry, setTargetCountry] = useState("all");
  const [targetDevice, setTargetDevice] = useState("all");
  const [placement, setPlacement] = useState("top");
  const [showUpsells, setShowUpsells] = useState(false);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("goalAmount", goalAmount);
    formData.append("templateId", template);
    formData.append("animation", animation);
    formData.append("targetCountry", targetCountry);
    formData.append("targetDevice", targetDevice);
    formData.append("placement", placement);
    
    submit(formData, { method: "post" });
  };

  return (
    <div className="fs-animate-in">
      <style>{`
        /* Smooth, elegant fill with fade out to loop cleanly */
        @keyframes fs-fill-luxury {
          0% { width: 0%; opacity: 0; }
          10% { opacity: 1; }
          40% { width: 65%; }
          85% { width: 65%; opacity: 1; }
          100% { width: 65%; opacity: 0; }
        }
        
        /* Steady glide with a breathing neon glow */
        @keyframes fs-fill-neon {
          0% { width: 0%; box-shadow: 0 0 0px #39ff14; opacity: 0; }
          15% { opacity: 1; box-shadow: 0 0 8px #39ff14; }
          45% { width: 65%; box-shadow: 0 0 16px #39ff14; }
          85% { width: 65%; box-shadow: 0 0 8px #39ff14; opacity: 1; }
          100% { width: 65%; opacity: 0; }
        }

        /* Fast, snappy impact for urgency */
        @keyframes fs-fill-urgency {
          0% { width: 0%; opacity: 0; }
          5% { opacity: 1; }
          25% { width: 65%; }
          85% { width: 65%; opacity: 1; }
          100% { width: 65%; opacity: 0; }
        }

        /* Relaxed, fluid wave filling */
        @keyframes fs-fill-summer {
          0% { width: 0%; opacity: 0; }
          15% { opacity: 1; }
          50% { width: 65%; }
          85% { width: 65%; opacity: 1; }
          100% { width: 65%; opacity: 0; }
        }

        /* Seamless sliding stripes */
        @keyframes fs-stripes-move {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
      `}</style>
      <Page 
        title="Create Campaign"
        backAction={{ content: 'Campaigns', url: '/app/campaigns' }}
        primaryAction={{ 
          content: 'Save & Publish', 
          onAction: handleSave,
          loading: isSaving 
        }}
      >
        <Layout>
          {/* Main Settings Column */}
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Campaign Details</Text>
                  <TextField label="Campaign Name" value={name} onChange={setName} autoComplete="off" placeholder="e.g. Summer Sale 2026" />
                  <TextField label="Goal Amount ($)" type="number" value={goalAmount} onChange={setGoalAmount} autoComplete="off" />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">Targeting Engine</Text>
                    <Badge tone="magic">Requires PRO Plan</Badge>
                  </InlineStack>
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                      <Select 
                        label="Country Targeting"
                        options={[{label: 'All Countries', value: 'all'}, {label: 'United States', value: 'us'}, {label: 'Europe', value: 'eu'}]}
                        value={targetCountry}
                        onChange={setTargetCountry}
                      />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                      <Select 
                        label="Device Targeting"
                        options={[{label: 'All Devices', value: 'all'}, {label: 'Mobile Only', value: 'mobile'}, {label: 'Desktop Only', value: 'desktop'}]}
                        value={targetDevice}
                        onChange={setTargetDevice}
                      />
                    </Grid.Cell>
                  </Grid>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Theme Customizer</Text>
                  <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <Select 
                        label="Design Template"
                        options={availableTemplates.map(t => ({ label: t.name, value: t.value }))}
                        value={template}
                        onChange={setTemplate}
                      />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                      <Select 
                        label="Animation Effect"
                        options={[
                          {label: 'None', value: 'none'}, 
                          {label: 'Shine Effect', value: 'shine'},
                          {label: 'Confetti Unlock', value: 'confetti'},
                          {label: 'Rocket Progress', value: 'rocket'}
                        ]}
                        value={animation}
                        onChange={setAnimation}
                      />
                    </Grid.Cell>
                  </Grid>
                  
                  <Divider />
                  
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingSm">Smart Product Suggestions</Text>
                    <Badge tone="magic">Requires PRO Plan</Badge>
                  </InlineStack>
                  <Text as="p" tone="subdued">Automatically suggest products when customers are close to unlocking free shipping.</Text>
                  
                  {showUpsells ? (
                    <BlockStack gap="300">
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <Text as="p" variant="bodyMd">Upsell settings would go here.</Text>
                      </div>
                      <Button onClick={() => setShowUpsells(false)}>Hide Settings</Button>
                    </BlockStack>
                  ) : (
                    <button 
                      className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter fs-button-premium" 
                      type="button" 
                      style={{width: 'fit-content'}}
                      onClick={() => setShowUpsells(true)}
                    >
                      <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Configure Upsells</span>
                    </button>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Live Preview Sidebar */}
          <Layout.Section variant="oneThird">
            <div style={{ position: 'sticky', top: '20px' }}>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Live Preview</Text>
                  
                  {/* The Preview Bar */}
                  {(() => {
                    const activeTemplateObj = availableTemplates.find(t => t.value === template) || availableTemplates[0] || FREE_TEMPLATES[0];
                    return (
                      <TemplatePreview 
                        style={{ ...activeTemplateObj.style, animation: animation !== 'none' ? `fs-fill-${animation} 3s infinite` : activeTemplateObj.style.animation }} 
                        text={activeTemplateObj.previewText} 
                        goalAmount={goalAmount}
                      />
                    );
                  })()}
                  
                  <Divider />
                  
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">Storefront Placement</Text>
                    <Select 
                      labelHidden
                      label="Placement"
                      options={[{label: 'Top of page (Sticky)', value: 'top'}, {label: 'Bottom of page', value: 'bottom'}]}
                      value={placement}
                      onChange={setPlacement}
                    />
                  </BlockStack>
                </BlockStack>
              </Card>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

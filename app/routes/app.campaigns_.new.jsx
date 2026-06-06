import { useState, useCallback } from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Button, TextField, Select, Grid, Divider, Box } from "@shopify/polaris";
import { useSubmit, useNavigation, redirect, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const name = formData.get("name") || "Untitled Campaign";
  const goalAmount = parseFloat(formData.get("goalAmount")) || 100;
  const targetCountry = formData.get("targetCountry") || "all";
  const targetDevice = formData.get("targetDevice") || "all";
  const templateId = formData.get("templateId") || "minimal";
  const animation = formData.get("animation") || "none";
  const placement = formData.get("placement") || "top";

  await prisma.campaign.create({
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

  return redirect("/app/campaigns");
};

export default function NewCampaign() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isSaving = navigation.state === "submitting";

  const [name, setName] = useState("");
  const [goalAmount, setGoalAmount] = useState("100");
  const [template, setTemplate] = useState(searchParams.get("template") || "minimal");
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
                    <Badge tone="magic">PRO</Badge>
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
                        options={[
                          {label: 'Minimal Clean', value: 'minimal'}, 
                          {label: 'Galaxy Purple', value: 'luxury'},
                          {label: 'Neon Pulse', value: 'neon'}
                        ]}
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
                    <Badge tone="magic">PRO</Badge>
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
                  <div style={{
                    background: template === 'luxury' ? 'var(--fs-gradient)' : template === 'neon' ? '#111' : 'var(--fs-primary)',
                    color: template === 'neon' ? '#39ff14' : '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: template === 'neon' ? '0 0 15px #39ff14' : 'var(--fs-shadow-glow)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Text as="p" fontWeight="bold">
                      You are ${(goalAmount * 0.45).toFixed(2)} away from FREE shipping!
                    </Text>
                    <div style={{ marginTop: '12px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '55%', height: '100%', background: template === 'neon' ? '#39ff14' : '#fff', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  
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

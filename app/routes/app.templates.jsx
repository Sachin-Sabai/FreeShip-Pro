import { useState } from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Button, Grid, Box, Modal, Banner } from "@shopify/polaris";
import { useSubmit, useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { 
  FREE_TEMPLATES, STARTER_TEMPLATES, PRO_TEMPLATES, PREMIUM_TEMPLATES, 
  TemplatePreview 
} from "../utils/templates";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = await prisma.shop.findUnique({ where: { id: session.shop } });
  return { activePlan: shop?.plan || "FREE" };
};

export default function Templates() {
  const { activePlan } = useLoaderData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [previewModal, setPreviewModal] = useState({ open: false, template: null });

  const renderTemplateGroup = (templates, planName, price, planDetails, isFree) => {
    const isActivePlan = activePlan === planName;
    return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <InlineStack gap="300" align="center">
              <Text as="h2" variant="headingLg">{planName} Templates</Text>
              {isActivePlan && <Badge tone="success">Active Plan</Badge>}
            </InlineStack>
            <InlineStack gap="200" align="center">
              <Text variant="bodyMd" fontWeight="bold" tone="subdued">{isFree ? 'Free' : `$${price}/mo`}</Text>
              <Badge tone={planName === 'PREMIUM' ? 'success' : planName === 'PRO' ? 'magic' : planName === 'FREE' ? 'new' : 'info'}>{planName} PLAN</Badge>
            </InlineStack>
          </InlineStack>
          <Text as="p" tone="subdued">{planDetails}</Text>
        </BlockStack>
      </Card>
      
      <Grid>
        {templates.map(tpl => (
          <Grid.Cell key={tpl.id} columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
            <div className="fs-template-card" style={{ background: 'white', border: isActivePlan ? '2px solid var(--p-color-border-success)' : '1px solid #e5e7eb', boxShadow: 'var(--fs-shadow-soft)', borderRadius: '12px', overflow: 'hidden' }}>
              <div className="fs-template-preview" style={{ padding: '32px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <TemplatePreview style={tpl.style} text={tpl.previewText} />
                </div>
              </div>
              <Box padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingMd" fontWeight="bold">{tpl.name}</Text>
                    <Badge tone="success">Score: {tpl.score}</Badge>
                  </InlineStack>
                  
                  <InlineStack gap="100">
                    <Badge>{tpl.category}</Badge>
                    {tpl.tags.map(tag => (
                      <Badge tone="info" key={tag}>{tag}</Badge>
                    ))}
                  </InlineStack>
                  
                  <Box paddingBlockStart="200">
                    <InlineStack gap="200" align="space-between">
                      <Button onClick={() => setPreviewModal({ open: true, template: tpl })}>Live Preview</Button>
                      
                      {isFree || isActivePlan ? (
                        <Button variant="primary" onClick={() => navigate(`/app/campaigns/new?template=${tpl.value}`)}>
                          Apply Template
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={() => navigate("/app/pricing")}>
                          Apply Template
                        </Button>
                      )}
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Box>
            </div>
          </Grid.Cell>
        ))}
      </Grid>
    </BlockStack>
  )};

  return (
    <div className="fs-animate-in">
      {/* Injecting CSS Animations for the higher plans */}
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

      <Page title="Template Gallery" subtitle="Professionally designed templates to maximize your conversion rate.">
        <Box paddingBlockEnd="400">
          <Banner title={`Your Active Plan: ${activePlan}`} tone="success">
            <p>You can apply any template from your currently active plan or the free tier.</p>
          </Banner>
        </Box>
        <Layout>
          <Layout.Section>
            <BlockStack gap="600">
              {renderTemplateGroup(
                FREE_TEMPLATES,
                "FREE",
                "0",
                "Get started with a basic free shipping bar at no cost. No credit card required. Perfect for trying out the app.",
                true
              )}

              {renderTemplateGroup(
                STARTER_TEMPLATES, 
                "STARTER", 
                "49",
                "Clean and minimalistic designs. Limit: 1 Active Campaign. Basic targeting included. Perfect for testing."
              )}
              
              {renderTemplateGroup(
                PRO_TEMPLATES, 
                "PRO", 
                "69",
                "High-converting animated designs. Unlimited Campaigns. Includes Geo-targeting, Device targeting, and Advanced Analytics."
              )}

              {renderTemplateGroup(
                PREMIUM_TEMPLATES, 
                "PREMIUM", 
                "99",
                "Top-tier animated loading bars for maximum urgency and conversion. Unlocks A/B Testing, Priority Support, and Custom CSS."
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>

      <Modal
        open={previewModal.open}
        onClose={() => setPreviewModal({ open: false, template: null })}
        title={previewModal.template ? `Live Preview: ${previewModal.template.name}` : "Live Preview"}
        large
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">This is how the bar will appear on your storefront header.</Text>
            
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
              {/* Fake Store Header */}
              <div style={{ width: '100%', background: '#fff' }}>
                {previewModal.template && (
                  <div style={{ width: '100%' }}>
                    <TemplatePreview style={{ ...previewModal.template.style, borderRadius: '0' }} text={previewModal.template.previewText} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>MY STORE</div>
                  <div style={{ display: 'flex', gap: '24px', color: '#4b5563' }}>
                    <span>Home</span>
                    <span>Catalog</span>
                    <span>Contact</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Search</span>
                    <span>Cart (2)</span>
                  </div>
                </div>
                
                {/* Fake Store Content */}
                <div style={{ padding: '60px 32px', background: '#f9fafb', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80%', height: '200px', background: '#e5e7eb', borderRadius: '12px', marginBottom: '32px' }}></div>
                  <div style={{ display: 'flex', gap: '24px', width: '80%' }}>
                    <div style={{ flex: 1, height: '150px', background: '#e5e7eb', borderRadius: '12px' }}></div>
                    <div style={{ flex: 1, height: '150px', background: '#e5e7eb', borderRadius: '12px' }}></div>
                    <div style={{ flex: 1, height: '150px', background: '#e5e7eb', borderRadius: '12px' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              {previewModal.template && (
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (previewModal.template.tags.includes("Free")) {
                      navigate(`/app/campaigns/new?template=${previewModal.template.value}`);
                    } else {
                      navigate("/app/pricing");
                    }
                  }}
                >
                  {previewModal.template.tags.includes("Free") ? "Use This Template" : "Upgrade to Use Template"}
                </Button>
              )}
            </div>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}

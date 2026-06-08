import { useState } from "react";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Button, Grid, Box, Modal } from "@shopify/polaris";
import { useSubmit } from "react-router";

const FREE_TEMPLATES = [
  {
    id: 0, name: "Basic Free Bar", value: "basic", category: "Basic", score: "78", tags: ["Free", "Simple"],
    style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', progress: '#22c55e', font: 'system-ui' },
    previewText: "Only $10.00 away from free shipping!"
  },
  { 
    id: 6, name: "Cosmetics Pearl", value: "pearl", category: "Beauty", score: "84", tags: ["Free", "Soft"],
    style: { background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', color: '#4a4a4a', border: '1px solid #f3e5f5', progress: '#ec4899', font: 'Georgia, serif' },
    previewText: "You are $10.00 away from FREE shipping"
  },
];

const STARTER_TEMPLATES = [
  { 
    id: 7, name: "Ocean Breeze", value: "ocean", category: "Modern", score: "92", tags: ["Gradient", "Smooth"],
    style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#ffffff', border: 'none', progress: 'linear-gradient(90deg, #a5b4fc, #818cf8)', font: 'system-ui' },
    previewText: "🚚 You are $10.00 away from FREE shipping!"
  },
  { 
    id: 8, name: "Sunset Warm", value: "sunset", category: "Vibrant", score: "93", tags: ["Bold", "Eye-Catching"],
    style: { background: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)', color: '#ffffff', border: 'none', progress: 'linear-gradient(90deg, #fcd34d, #fbbf24)', font: 'system-ui', fontWeight: 'bold' },
    previewText: "🔥 Only $10.00 left for FREE shipping!"
  },
];

const PRO_TEMPLATES = [
  { 
    id: 2, name: "Midnight Luxury", value: "luxury", category: "Luxury", score: "98", tags: ["Premium", "Glass"],
    style: { background: 'linear-gradient(270deg, #0f2027, #203a43, #2c5364)', color: '#ffd700', border: 'none', progress: '#ffd700', font: 'system-ui', animation: 'fs-fill-luxury 4.5s cubic-bezier(0.22, 1, 0.36, 1) infinite' },
    previewText: "You are $10.00 away from FREE shipping"
  },
  { 
    id: 3, name: "Neon Pulse", value: "neon", category: "Neon", score: "91", tags: ["Animated", "Gen Z"],
    style: { background: '#000000', color: '#39ff14', border: '1px solid #39ff14', progress: '#39ff14', font: 'monospace', animation: 'fs-fill-neon 3s ease-out infinite' },
    previewText: "ONLY $10.00 AWAY FROM FREE SHIPPING"
  }
];

const PREMIUM_TEMPLATES = [
  { 
    id: 4, name: "Black Friday Urgency", value: "bfcm", category: "Sale", score: "99", tags: ["Urgency", "Timer"],
    style: { background: '#dc2626', color: '#ffffff', border: 'none', progress: 'linear-gradient(45deg, rgba(0,0,0,0.15) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15) 75%, transparent 75%, transparent) 0 0 / 20px 20px #fbbf24', font: 'system-ui', fontWeight: 'bold', animation: 'fs-fill-urgency 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite, fs-stripes-move 0.8s linear infinite' },
    previewText: "HURRY! Only $10.00 away from FREE shipping!"
  },
  { 
    id: 5, name: "Classic Progress", value: "classic", category: "Classic", score: "96", tags: ["Familiar", "Animated"],
    style: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', progress: 'linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent) 0 0 / 20px 20px #10b981', font: 'system-ui', animation: 'fs-fill-summer 3.5s ease-in-out infinite, fs-stripes-move 1s linear infinite' },
    previewText: "You are $10.00 away from FREE shipping"
  }
];

const TemplatePreview = ({ style, text }) => {
  const { animation, ...outerStyle } = style;
  return (
    <div style={{ padding: '16px 24px', borderRadius: '6px', ...outerStyle }}>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '8px', fontWeight: style.fontWeight || 'normal', fontFamily: style.font }}>
        {text}
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(128,128,128,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: '65%', height: '100%', background: style.progress, borderRadius: '10px', animation: animation || 'none' }}></div>
      </div>
    </div>
  );
};

export default function Templates() {
  const submit = useSubmit();
  const [previewModal, setPreviewModal] = useState({ open: false, template: null });

  const renderTemplateGroup = (templates, planName, price, planDetails, isFree) => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Text as="h2" variant="headingLg">{planName} Templates</Text>
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
            <div className="fs-template-card" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: 'var(--fs-shadow-soft)', borderRadius: '12px', overflow: 'hidden' }}>
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
                      
                      {isFree ? (
                        <Button variant="primary" url={`/app/campaigns/new?template=${tpl.value}`}>
                          Apply Template
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={() => {
                          const formData = new FormData();
                          formData.append("plan", planName);
                          submit(formData, { method: "post", action: "/app/pricing" });
                        }}>
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
  );

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
                <Button variant="primary" url={`/app/campaigns/new?template=${previewModal.template.value}`}>
                  Use This Template
                </Button>
              )}
            </div>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}

import { useLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";
import { authenticate } from "../shopify.server";
import { PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM } from "../shopify.server";
import prisma from "../db.server";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Button, Badge, Divider, Box } from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shopDomain = session.shop;

  let shop = await prisma.shop.findUnique({ where: { id: shopDomain } });
  if (!shop) {
    shop = await prisma.shop.create({ data: { id: shopDomain, plan: "FREE" } }); 
  }

  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  // Get current billing plan
  let currentPlan = "FREE";
  try {
    const billingCheck = await billing.check({
      plans: [PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM],
      isTest: true,
    });
    const activeSubs = billingCheck.appSubscriptions;
    if (activeSubs.length > 0) {
      currentPlan = activeSubs[0].name;
    }
  } catch (e) { /* fallback to FREE */ }

  if (shop && shop.plan !== currentPlan) {
    await prisma.shop.upsert({
      where: { id: shopDomain },
      update: { plan: currentPlan },
      create: { id: shopDomain, plan: currentPlan }
    });
    shop.plan = currentPlan;
  }

  // Fetch real metrics
  const metrics = await prisma.dailyMetric.findMany({
    where: { shopId: shopDomain },
    orderBy: { date: 'desc' },
    take: 30
  });

  const totals = metrics.reduce((acc, m) => {
    acc.revenue += m.revenueGenerated || 0;
    acc.orders += m.ordersInfluenced || 0;
    acc.views += m.views || 0;
    return acc;
  }, { revenue: 0, orders: 0, views: 0 });
  
  const activeCampaigns = await prisma.campaign.count({
    where: { shopId: shopDomain, isActive: true }
  });

  const totalCampaigns = await prisma.campaign.count({
    where: { shopId: shopDomain }
  });

  const conversionRate = totals.views > 0 
    ? ((totals.orders / totals.views) * 100).toFixed(1) 
    : "0.0";

  return { shop, totals, activeCampaigns, totalCampaigns, currentPlan, conversionRate, chargeApproved: !!chargeId };
};

export default function Dashboard() {
  const { totals, activeCampaigns, totalCampaigns, currentPlan, conversionRate, chargeApproved } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    if (chargeApproved && typeof shopify !== 'undefined') {
      shopify.toast.show("Subscription approved! Welcome to " + currentPlan);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("charge_id");
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [chargeApproved, currentPlan]);

  const planColors = {
    FREE: { bg: '#f0fdf4', color: '#16a34a', badge: 'new' },
    STARTER: { bg: '#eff6ff', color: '#2563eb', badge: 'info' },
    PRO: { bg: '#faf5ff', color: '#9333ea', badge: 'magic' },
    PREMIUM: { bg: '#fffbeb', color: '#d97706', badge: 'success' },
  };
  const pc = planColors[currentPlan] || planColors.FREE;

  const kpis = [
    {
      label: "Revenue Impact",
      value: `$${totals.revenue.toFixed(2)}`,
      desc: "Last 30 Days",
      icon: "💰",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      label: "Orders Influenced",
      value: totals.orders.toString(),
      desc: "From Free Shipping Bar",
      icon: "📦",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      desc: "Bar → Purchase",
      icon: "📈",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      label: "Active Campaigns",
      value: activeCampaigns.toString(),
      desc: `of ${totalCampaigns} total`,
      icon: "🚀",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
  ];

  const quickActions = [
    { title: "Create Campaign", desc: "Launch a new free shipping bar", icon: "➕", action: () => navigate('/app/campaigns/new') },
    { title: "Browse Templates", desc: "Pick from premium designs", icon: "🎨", action: () => navigate('/app/templates') },
    { title: "View Analytics", desc: "Track your performance", icon: "📊", action: () => navigate('/app/analytics') },
    { title: "Upgrade Plan", desc: "Unlock advanced features", icon: "⚡", action: () => navigate('/app/pricing') },
  ];

  return (
    <div className="fs-animate-in">
      <Page 
        title="Dashboard"
        subtitle="Welcome back! Here's how your free shipping bars are performing."
        primaryAction={{ content: '+ Create Campaign', onAction: () => navigate('/app/campaigns/new') }}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="600">

              {/* Current Plan Banner */}
              <div style={{
                background: pc.bg,
                border: `1px solid ${pc.color}22`,
                borderRadius: '16px',
                padding: '20px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: pc.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: '800'
                  }}>
                    {currentPlan[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                      {currentPlan} Plan
                      <Badge tone={pc.badge} size="small">{currentPlan === 'FREE' ? 'Active' : 'Active'}</Badge>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      {currentPlan === 'FREE' ? 'Upgrade to unlock gradient bars, animations & targeting' : 
                       currentPlan === 'PREMIUM' ? 'You have access to all features' :
                       'Upgrade for more advanced features'}
                    </div>
                  </div>
                </div>
                {currentPlan !== 'PREMIUM' && (
                  <button
                    onClick={() => navigate('/app/pricing')}
                    style={{
                      background: pc.color, color: '#fff', border: 'none',
                      padding: '10px 24px', borderRadius: '10px',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: `0 4px 12px ${pc.color}40`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Upgrade Plan →
                  </button>
                )}
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {kpis.map((kpi, i) => (
                  <div key={i} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Gradient accent line */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                      background: kpi.gradient, borderRadius: '16px 16px 0 0'
                    }} />
                    <div style={{ fontSize: '28px', marginBottom: '12px' }}>{kpi.icon}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      {kpi.label}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', marginBottom: '4px' }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {kpi.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd" fontWeight="bold">Quick Actions</Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {quickActions.map((qa, i) => (
                      <button key={i} onClick={qa.action} style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '20px 16px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>{qa.icon}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{qa.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{qa.desc}</div>
                      </button>
                    ))}
                  </div>
                </BlockStack>
              </Card>

              {/* Getting Started / Activity */}
              {activeCampaigns === 0 ? (
                <Card>
                  <BlockStack gap="500">
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                      <Text as="h2" variant="headingLg" fontWeight="bold">Get Started in 3 Steps</Text>
                      <div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
                        Launch your first free shipping bar and start increasing your average order value today.
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {[
                        { step: '1', title: 'Pick a Template', desc: 'Choose from our gallery of conversion-optimized designs', icon: '🎨', action: () => navigate('/app/templates') },
                        { step: '2', title: 'Set Your Goal', desc: 'Configure the free shipping threshold for your store', icon: '🎯', action: () => navigate('/app/campaigns/new') },
                        { step: '3', title: 'Go Live', desc: 'Publish and watch your AOV increase in real-time', icon: '🚀', action: null },
                      ].map((s, i) => (
                        <div key={i} 
                          onClick={s.action}
                          style={{
                            background: '#f8fafc', borderRadius: '14px', padding: '28px 20px',
                            textAlign: 'center', border: '1px solid #e2e8f0',
                            cursor: s.action ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => { if(s.action) { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.1)'; }}}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', fontWeight: '800', marginBottom: '14px'
                          }}>{s.step}</div>
                          <div style={{ fontSize: '26px', marginBottom: '10px' }}>{s.icon}</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{s.title}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Button variant="primary" size="large" onClick={() => navigate('/app/campaigns/new')}>
                        Create Your First Campaign
                      </Button>
                    </div>
                  </BlockStack>
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Activity Card */}
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd" fontWeight="bold">Campaign Status</Text>
                        <Badge tone="success">{activeCampaigns} Active</Badge>
                      </InlineStack>
                      <Divider />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Active Campaigns</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Currently running on your store</div>
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>{activeCampaigns}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Total Campaigns</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>All campaigns created</div>
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>{totalCampaigns}</div>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/app/campaigns')}>Manage Campaigns →</Button>
                    </BlockStack>
                  </Card>

                  {/* Tips Card */}
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd" fontWeight="bold">💡 Performance Tips</Text>
                      <Divider />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { tip: "Set your goal 15-20% above your current AOV for best results", icon: "🎯" },
                          { tip: "Use urgency templates during sales for up to 35% more conversions", icon: "🔥" },
                          { tip: "Enable geo-targeting to show different thresholds per country", icon: "🌍" },
                          { tip: "Test different bar designs with A/B testing on Premium plan", icon: "📊" },
                        ].map((t, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{t.icon}</span>
                            <span style={{ fontSize: '13px', color: '#713f12', lineHeight: '1.5' }}>{t.tip}</span>
                          </div>
                        ))}
                      </div>
                    </BlockStack>
                  </Card>
                </div>
              )}

            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Button, EmptyState } from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  let shop = await prisma.shop.findUnique({ where: { id: shopDomain } });
  if (!shop) {
    shop = await prisma.shop.create({ data: { id: shopDomain, plan: "PRO" } }); 
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
    return acc;
  }, { revenue: 0, orders: 0 });
  
  const activeCampaigns = await prisma.campaign.count({
    where: { shopId: shopDomain, isActive: true }
  });

  return { shop, totals, activeCampaigns };
};

export default function Dashboard() {
  const { totals, activeCampaigns } = useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="fs-animate-in">
      <Page 
        title="Dashboard"
        subtitle="Overview of your store performance"
        primaryAction={{ content: 'Create Campaign', onAction: () => navigate('/app/campaigns/new') }}
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              {/* KPIs */}
              <div className="fs-kpi-row">
                <div className="fs-kpi-item">
                  <div className="fs-kpi-label">Revenue Impact</div>
                  <div className="fs-kpi-val">${totals.revenue.toFixed(2)}</div>
                  <div className="fs-kpi-desc">From Free Shipping Bar</div>
                </div>
                <div className="fs-kpi-item">
                  <div className="fs-kpi-label">Orders Influenced</div>
                  <div className="fs-kpi-val">{totals.orders}</div>
                  <div className="fs-kpi-desc">Last 30 Days</div>
                </div>
                <div className="fs-kpi-item">
                  <div className="fs-kpi-label">AOV Increase</div>
                  <div className="fs-kpi-val">$0.00</div>
                  <div className="fs-kpi-desc">Average Order Value</div>
                </div>
                <div className="fs-kpi-item">
                  <div className="fs-kpi-label">Active Campaigns</div>
                  <div className="fs-kpi-val">{activeCampaigns}</div>
                  <div className="fs-kpi-desc">Currently Running</div>
                </div>
              </div>

              {/* Empty State or Activity */}
              <Card>
                {activeCampaigns === 0 ? (
                  <EmptyState
                    heading="Increase your Average Order Value today"
                    action={{ content: 'Create First Campaign', onAction: () => navigate('/app/campaigns/new') }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Build a high-converting free shipping bar using our premium SaaS templates and targeting rules.</p>
                  </EmptyState>
                ) : (
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">Recent Activity</Text>
                    <Text as="p" tone="subdued">Your campaigns are actively running and optimizing conversions.</Text>
                    <Button onClick={() => navigate('/app/campaigns')}>Manage Campaigns</Button>
                  </BlockStack>
                )}
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

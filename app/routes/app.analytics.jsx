import { Page, Layout, Card, Text, BlockStack, InlineStack, DataTable } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useLoaderData } from "react-router";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const metrics = await prisma.dailyMetric.findMany({
    where: { shopId: session.shop },
    orderBy: { date: 'desc' },
    take: 30
  });
  return { metrics };
};

export default function Analytics() {
  const { metrics } = useLoaderData();

  const rows = metrics.map((m) => [
    new Date(m.date).toLocaleDateString(),
    m.views.toString(),
    m.clicks.toString(),
    m.ordersInfluenced.toString(),
    `$${m.revenueGenerated.toFixed(2)}`
  ]);

  return (
    <div className="fs-animate-in">
      <Page title="Analytics">
        <Layout>
          <Layout.Section>
            <Card padding="0">
              {metrics.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <BlockStack gap="400" inlineAlign="center">
                    <Text as="h3" variant="headingMd">No Data Yet</Text>
                    <Text as="p" tone="subdued">Analytics will appear here once your campaigns start running.</Text>
                  </BlockStack>
                </div>
              ) : (
                <DataTable
                  columnContentTypes={[
                    'text',
                    'numeric',
                    'numeric',
                    'numeric',
                    'numeric',
                  ]}
                  headings={[
                    'Date',
                    'Views',
                    'Clicks',
                    'Orders Influenced',
                    'Revenue Impact',
                  ]}
                  rows={rows}
                />
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

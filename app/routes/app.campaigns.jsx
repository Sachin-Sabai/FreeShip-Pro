import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, Button, IndexTable, useIndexResourceState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useLoaderData, useNavigate, useSubmit } from "react-router";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  if (formData.get("_action") === "delete") {
    const ids = JSON.parse(formData.get("ids") || "[]");
    if (ids.length > 0) {
      await prisma.campaign.deleteMany({
        where: {
          id: { in: ids },
          shopId: session.shop
        }
      });
    }
  }
  return { success: true };
};

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const campaigns = await prisma.campaign.findMany({
    where: { shopId: session.shop },
    orderBy: { createdAt: 'desc' }
  });
  return { campaigns };
};

export default function Campaigns() {
  const { campaigns } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();

  const resourceName = {
    singular: 'campaign',
    plural: 'campaigns',
  };

  const {selectedResources, allResourcesSelected, handleSelectionChange, clearSelection} =
    useIndexResourceState(campaigns);

  const handleDelete = () => {
    const formData = new FormData();
    formData.append("_action", "delete");
    formData.append("ids", JSON.stringify(selectedResources));
    submit(formData, { method: "post" });
    clearSelection();
  };

  const promotedBulkActions = [
    {
      content: 'Delete',
      onAction: handleDelete,
      destructive: true,
    },
  ];

  const rowMarkup = campaigns.map(
    ({id, name, goalAmount, templateId, isActive, createdAt}, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={isActive ? "success" : "new"}>
            {isActive ? "Active" : "Draft"}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>${goalAmount}</IndexTable.Cell>
        <IndexTable.Cell>{templateId}</IndexTable.Cell>
        <IndexTable.Cell>{new Date(createdAt).toLocaleDateString()}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <div className="fs-animate-in">
      <Page 
        title="Campaigns" 
        subtitle="Manage your smart free shipping bars and targeting rules."
        primaryAction={{ 
          content: "Create Campaign", 
          onAction: () => navigate('/app/campaigns/new') 
        }}
      >
        <Layout>
          <Layout.Section>
            <Card padding="0">
              {campaigns.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <BlockStack gap="400" inlineAlign="center">
                    <Text as="h3" variant="headingMd">No campaigns found</Text>
                    <Text as="p" tone="subdued">Build your first highly converting shipping bar.</Text>
                    <button className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium fs-button-premium" type="button" onClick={() => navigate('/app/campaigns/new')}>
                      <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Create Campaign</span>
                    </button>
                  </BlockStack>
                </div>
              ) : (
                <IndexTable
                  resourceName={resourceName}
                  itemCount={campaigns.length}
                  selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  promotedBulkActions={promotedBulkActions}
                  headings={[
                    {title: 'Name'},
                    {title: 'Status'},
                    {title: 'Goal'},
                    {title: 'Template'},
                    {title: 'Created'},
                  ]}
                >
                  {rowMarkup}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

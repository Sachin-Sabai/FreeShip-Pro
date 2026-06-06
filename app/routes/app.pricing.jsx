import { authenticate } from "../shopify.server";
import { PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM } from "../shopify.server";
import { useLoaderData, useNavigation, useSubmit } from "react-router";
import prisma from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const action = async ({ request }) => {
  console.log("ACTION HIT");
  const { session, admin, redirect } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = formData.get("plan");

  if (!planName) {
    return { error: "No plan selected" };
  }

  const shopifyPlan = planName === "STARTER" ? PLAN_STARTER : planName === "PRO" ? PLAN_PRO : PLAN_PREMIUM;
  const planPrices = { STARTER: 49.00, PRO: 69.00, PREMIUM: 99.00 };
  const amount = planPrices[planName];

  console.log("SHOP:", session.shop);
  console.log("PLAN:", shopifyPlan);
  console.log("AMOUNT:", amount);

  const returnUrl = `https://admin.shopify.com/store/${session.shop.replace(".myshopify.com", "")}/apps/freeship-pro/app/pricing`;

  const BILLING_MUTATION = `#graphql
    mutation AppSubscriptionCreate(
      $name: String!
      $returnUrl: URL!
      $test: Boolean
      $replacementBehavior: AppSubscriptionReplacementBehavior
      $lineItems: [AppSubscriptionLineItemInput!]!
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        test: $test
        replacementBehavior: $replacementBehavior
        lineItems: $lineItems
      ) {
        appSubscription {
          id
          name
          status
          test
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    name: shopifyPlan,
    returnUrl: returnUrl,
    test: true,
    replacementBehavior: "APPLY_IMMEDIATELY",
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            interval: "EVERY_30_DAYS",
            price: {
              amount: amount,
              currencyCode: "USD",
            },
          },
        },
      },
    ],
  };

  try {
    console.log("GRAPHQL VARIABLES", JSON.stringify(variables, null, 2));
    const response = await admin.graphql(BILLING_MUTATION, { variables });
    const responseJson = await response.json();
    const result = responseJson.data?.appSubscriptionCreate;

    if (result?.confirmationUrl) {
      console.log("GRAPHQL RESPONSE", JSON.stringify(responseJson, null, 2));
      console.log("CONFIRMATION URL", result.confirmationUrl);
      console.log("REDIRECT RESPONSE SENT");
      return redirect(result.confirmationUrl, { target: "_parent" });
    } else {
      console.log("GRAPHQL RESPONSE", JSON.stringify(responseJson, null, 2));
      console.error("BILLING USER ERRORS:", JSON.stringify(result?.userErrors || [], null, 2));
      return { error: "No confirmation URL received", userErrors: result?.userErrors || [] };
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("BILLING EXCEPTION:", error.message);
    return { error: error.message };
  }
};

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  
  try {
    const billingCheck = await billing.check({
      plans: [PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM],
      isTest: true,
    });

    const activeSubscriptions = billingCheck.appSubscriptions;
    const currentPlanName = activeSubscriptions.length > 0 ? activeSubscriptions[0].name : "STARTER";
    
    const shop = await prisma.shop.findUnique({ where: { id: session.shop } });
    if (!shop || shop.plan !== currentPlanName) {
      await prisma.shop.upsert({
        where: { id: session.shop },
        update: { plan: currentPlanName },
        create: { id: session.shop, plan: currentPlanName }
      });
    }

    return { currentPlan: currentPlanName };
  } catch (error) {
    return { currentPlan: "STARTER" };
  }
};

export default function Pricing() {
  const { currentPlan } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting";
  const submittingPlan = navigation.formData?.get("plan");

  const plans = [
    {
      name: "STARTER",
      price: "$49",
      description: "Clean and minimalistic designs for growing stores.",
      features: [
        "Minimal & Clean Designs",
        "1 Active Campaign limit",
        "Basic Targeting rules",
        "Standard Analytics"
      ]
    },
    {
      name: "PRO",
      price: "$69",
      description: "High-converting features to boost sales.",
      features: [
        "High-Converting Animated Designs",
        "Unlimited Campaigns",
        "Geo & Device Targeting",
        "Advanced Analytics",
        "Priority Support"
      ]
    },
    {
      name: "PREMIUM",
      price: "$99",
      description: "Advanced targeting for high volume merchants.",
      features: [
        "Top-Tier Striped Loading Bars",
        "Advanced A/B Testing",
        "Maximum Urgency Indicators",
        "Custom CSS Support",
        "Dedicated Account Manager"
      ]
    }
  ];

  return (
    <div style={{ padding: '60px 20px', background: 'radial-gradient(ellipse at top, #f8fafc, #ffffff)', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-1px' }}>Simple, transparent pricing</h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>Upgrade your plan to unlock premium animated features and drastically increase your average order value.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.name;
            
            let baseBg, baseColor, baseBorderColor, baseDescColor, iconColor;
            if (plan.name === "STARTER") {
              baseBg = '#f8fafc';
              baseColor = '#0f172a';
              baseBorderColor = '#cbd5e1';
              baseDescColor = '#64748b';
              iconColor = '#64748b';
            } else if (plan.name === "PRO") {
              baseBg = '#fdf4ff';
              baseColor = '#4a044e';
              baseBorderColor = '#f5d0fe';
              baseDescColor = '#86198f';
              iconColor = '#d946ef';
            } else {
              baseBg = '#fffbeb';
              baseColor = '#713f12';
              baseBorderColor = '#fde047';
              baseDescColor = '#b45309';
              iconColor = '#f59e0b';
            }

            const bg = isCurrent ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' : baseBg;
            const color = isCurrent ? '#ffffff' : baseColor;
            const descColor = isCurrent ? '#94a3b8' : baseDescColor;
            const borderColor = isCurrent ? 'transparent' : baseBorderColor;
            const shadow = isCurrent ? '0 25px 50px -12px rgba(99, 102, 241, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
            const transform = isCurrent ? 'scale(1.05)' : 'scale(1)';
            const zIndex = isCurrent ? 10 : 1;
            const currentIconColor = isCurrent ? '#34d399' : iconColor;

            return (
              <div key={plan.name} style={{
                background: bg,
                color: color,
                borderRadius: '24px',
                padding: '48px 40px',
                border: `1px solid ${borderColor}`,
                boxShadow: shadow,
                transform: transform,
                zIndex: zIndex,
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #10b981, #3b82f6)', color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    Active Plan
                  </div>
                )}

                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>{plan.name}</h3>
                <p style={{ fontSize: '15px', color: descColor, minHeight: '44px', marginBottom: '28px', lineHeight: '1.5' }}>{plan.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                  <span style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1', letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ fontSize: '16px', color: descColor, fontWeight: '500' }}>/month</span>
                </div>

                <div style={{ marginBottom: '40px' }}>
                  {isCurrent ? (
                    <button disabled style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: '700', fontSize: '15px', border: '1px solid transparent', cursor: 'not-allowed' }}>
                      Current Plan
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        console.log("BUTTON CLICKED", plan.name);
                        submit({ plan: plan.name }, { method: "post" });
                      }}
                      disabled={isSubmitting}
                      style={{ 
                        width: '100%', padding: '16px', borderRadius: '14px', 
                        background: '#0f172a', 
                        color: '#ffffff', 
                        fontWeight: '700', fontSize: '15px',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        opacity: isSubmitting ? ((isSubmitting && submittingPlan === plan.name) ? 0.7 : 0.5) : 1
                      }}
                      onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      {isSubmitting && submittingPlan === plan.name ? 'Updating...' : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
                      <div style={{ color: currentIconColor, flexShrink: 0, marginTop: '2px' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '15px', color: isCurrent ? '#e2e8f0' : baseColor, fontWeight: '500', lineHeight: '1.4' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

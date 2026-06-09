import { authenticate } from "../shopify.server";
import { PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM } from "../shopify.server";
import { useLoaderData, useNavigation, useSubmit, useActionData } from "react-router";
import { useEffect, useRef } from "react";
import prisma from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/* global process */


export const action = async ({ request }) => {
  const { session, admin, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = formData.get("plan");

  if (!planName) {
    return { error: "No plan selected" };
  }

  // FREE plan: no billing needed, just update the DB and cancel any existing subscription
  if (planName === "FREE") {
    try {
      const subscriptionsResponse = await admin.graphql(`#graphql
        query {
          currentAppInstallation {
            activeSubscriptions {
              id
              name
              status
            }
          }
        }
      `);
      const subscriptionsJson = await subscriptionsResponse.json();
      const activeSubs = subscriptionsJson.data?.currentAppInstallation?.activeSubscriptions || [];

      for (const sub of activeSubs) {
        await admin.graphql(`#graphql
          mutation AppSubscriptionCancel($id: ID!) {
            appSubscriptionCancel(id: $id) {
              userErrors { field message }
            }
          }
        `, { variables: { id: sub.id } });
      }

      await prisma.shop.upsert({
        where: { id: session.shop },
        update: { plan: "FREE" },
        create: { id: session.shop, plan: "FREE" }
      });

      return { success: "Free plan activated successfully!" };
    } catch (error) {
      return { error: error.message };
    }
  }

  const shopifyPlan = planName === "STARTER" ? PLAN_STARTER : planName === "PRO" ? PLAN_PRO : PLAN_PREMIUM;

  // FEATURE FLAG: Bypass billing only if in development AND the BYPASS_BILLING flag is set
  const bypassBilling = process.env.NODE_ENV === "development" && process.env.BYPASS_BILLING === "true";

  if (bypassBilling) {
    try {
      await prisma.shop.upsert({
        where: { id: session.shop },
        update: { plan: planName },
        create: { id: session.shop, plan: planName }
      });
      return { success: `${planName} plan activated successfully (Dev Bypass)!` };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Use the official Shopify App Bridge billing API
  // We MUST NOT catch the redirect Response thrown by billing.request()!
  try {
    const shopName = session.shop.replace('.myshopify.com', '');
    const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/${process.env.SHOPIFY_API_KEY}/app/pricing`;
    
    // billing.request throws a Response object to redirect the user to the approval screen.
    await billing.request({
      plan: shopifyPlan,
      isTest: true,
      returnUrl: returnUrl,
    });
    
    return null;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Billing Request Error:", error);
    return { error: error.message || String(error) };
  }
};

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  
  try {
    const billingCheck = await billing.check({
      plans: [PLAN_STARTER, PLAN_PRO, PLAN_PREMIUM],
      isTest: true,
    });

    const activeSubscriptions = billingCheck.appSubscriptions;
    let currentPlanName = "FREE";

    if (activeSubscriptions.length > 0) {
      currentPlanName = activeSubscriptions[0].name;
    }
    
    const bypassBilling = process.env.NODE_ENV === "development" && process.env.BYPASS_BILLING === "true";
    const shop = await prisma.shop.findUnique({ where: { id: session.shop } });

    if (!shop || (!bypassBilling && shop.plan !== currentPlanName)) {
      // If no bypass, or shop is new: Sync local DB with Shopify's actual billing state
      await prisma.shop.upsert({
        where: { id: session.shop },
        update: { plan: currentPlanName },
        create: { id: session.shop, plan: currentPlanName }
      });
    } else if (bypassBilling && shop) {
      // If bypassing: Trust the local DB plan over Shopify's empty billing state
      currentPlanName = shop.plan;
    }

    return { currentPlan: currentPlanName, chargeApproved: !!chargeId };
  } catch (error) {
    return { currentPlan: "FREE", chargeApproved: false };
  }
};

export default function Pricing() {
  const { currentPlan, chargeApproved } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const billingFormRef = useRef(null);
  
  // Show toast if returning from billing approval
  useEffect(() => {
    if (chargeApproved && typeof shopify !== 'undefined') {
      shopify.toast.show("Plan successfully updated!");
      // Clean up the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("charge_id");
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [chargeApproved]);

  // Handle action results
  useEffect(() => {
    if (actionData?.confirmationUrl && billingFormRef.current) {
      billingFormRef.current.submit();
    } else if (actionData?.success) {
      if (typeof shopify !== 'undefined') {
        shopify.toast.show(actionData.success);
      }
      window.location.reload();
    } else if (actionData?.error) {
      if (typeof shopify !== 'undefined') {
        shopify.toast.show(actionData.error, { isError: true });
      }
    }
  }, [actionData]);

  // If we have a confirmation URL, show a redirecting page with hidden auto-submit form
  if (actionData?.confirmationUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '16px', color: '#64748b' }}>Redirecting to Shopify billing...</p>
        <form
          ref={billingFormRef}
          method="GET"
          action={actionData.confirmationUrl}
          target="_top"
          style={{ display: 'none' }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  const isSubmitting = navigation.state === "submitting";
  const submittingPlan = navigation.formData?.get("plan");

  const plans = [
    {
      name: "FREE",
      price: "$0",
      description: "Get started with a basic free shipping bar at no cost.",
      features: [
        "Basic Free Shipping Bar",
        "1 Active Campaign",
        "Standard Placement",
        "No Credit Card Required"
      ]
    },
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.5px' }}>Pricing and Plans</h1>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>Upgrade your plan to unlock premium animated features and drastically increase your average order value.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.name;
            
            let baseBg, baseColor, baseBorderColor, baseDescColor, iconColor;
            if (plan.name === "FREE") {
              baseBg = '#f0fdf4';
              baseColor = '#166534';
              baseBorderColor = '#86efac';
              baseDescColor = '#15803d';
              iconColor = '#22c55e';
            } else if (plan.name === "STARTER") {
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
                borderRadius: '16px',
                padding: '24px 24px',
                border: `1px solid ${borderColor}`,
                boxShadow: shadow,
                transform: transform,
                zIndex: zIndex,
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: 'linear-gradient(90deg, #10b981, #3b82f6)', color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    Active Plan
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', marginTop: isCurrent ? '12px' : '0', letterSpacing: '-0.5px' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: descColor, minHeight: '38px', marginBottom: '16px', lineHeight: '1.4' }}>{plan.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1', letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: descColor, fontWeight: '500' }}>/month</span>
                </div>

                <div style={{ marginBottom: '24px' }}>
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
                        width: '100%', padding: '12px', borderRadius: '10px', 
                        background: '#0f172a', 
                        color: '#ffffff', 
                        fontWeight: '700', fontSize: '14px',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        opacity: isSubmitting ? ((isSubmitting && submittingPlan === plan.name) ? 0.7 : 0.5) : 1
                      }}
                      onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onFocus={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                      onBlur={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      {isSubmitting && submittingPlan === plan.name ? 'Updating...' : 
                        isCurrent ? null : 
                        plan.name === 'FREE' ? 'Activate Free Plan' : `Upgrade to ${plan.name}`
                      }
                    </button>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ color: currentIconColor, flexShrink: 0, marginTop: '2px' }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '13px', color: isCurrent ? '#e2e8f0' : baseColor, fontWeight: '500', lineHeight: '1.4' }}>{feature}</span>
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

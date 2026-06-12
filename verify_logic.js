const templates = [
  { 
    id: 0, name: "Basic Free Bar", value: "basic",
    style: { background: '#f0fdf4', color: '#166534', progress: '#22c55e' },
    previewText: "Only $10.00 away from free shipping!"
  },
  { 
    id: 7, name: "Ocean Breeze", value: "ocean",
    style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#ffffff', progress: 'linear-gradient(90deg, #a5b4fc, #818cf8)' },
    previewText: "🚚 You are $10.00 away from FREE shipping!"
  }
];

function simulateMetafieldSync(campaign) {
  const templateConfig = templates.find(t => t.value === campaign.templateId) || templates[0];
  
  const settingsJson = {
    goalAmount: campaign.goalAmount,
    backgroundColor: templateConfig.style.background || "#000000",
    textColor: templateConfig.style.color || "#FFFFFF",
    progressBarColor: templateConfig.style.progress || "#22C55E",
    successMessage: "Congratulations! You've unlocked FREE shipping",
    progressMessage: templateConfig.previewText || "Only $10.00 away from free shipping!",
    position: "top",
    animation: "none"
  };
  return JSON.stringify(settingsJson, null, 2);
}

function simulateCartProgress(cartTotalDollars, goal, progressMsg, successMsg) {
  const remainingDollars = goal - cartTotalDollars;
  let htmlOutput = '';
  let progressWidth = '';

  if (remainingDollars > 0) {
    const formattedAmount = remainingDollars.toFixed(2);
    htmlOutput = progressMsg.replace(/\$10\.00/g, `<strong>$${formattedAmount}</strong>`);
    const percentage = Math.min((cartTotalDollars / goal) * 100, 100);
    progressWidth = `${percentage}%`;
  } else {
    htmlOutput = successMsg;
    progressWidth = '100%';
  }
  
  return { html: htmlOutput, width: progressWidth };
}

console.log("=== 1. METAFIELD PAYLOAD & CAMPAIGN VERIFICATION ===");
const campaignA = { goalAmount: 50, templateId: "basic" };
console.log("Campaign A (Green Basic) Payload:");
const payloadA = simulateMetafieldSync(campaignA);
console.log(payloadA);

const campaignB = { goalAmount: 100, templateId: "ocean" };
console.log("\nCampaign B (Ocean Breeze) Payload:");
const payloadB = simulateMetafieldSync(campaignB);
console.log(payloadB);

console.log("\n=== 3. CART PROGRESS VERIFICATION ===");
const testCases = [20, 35, 50, 60];
const progressMsg = JSON.parse(payloadA).progressMessage;
const successMsg = JSON.parse(payloadA).successMessage;

testCases.forEach(amount => {
  const res = simulateCartProgress(amount, 50, progressMsg, successMsg);
  console.log(`Cart: $${amount} | Goal: $50 => HTML: ${res.html} | Bar Width: ${res.width}`);
});

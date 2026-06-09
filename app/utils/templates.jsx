export const FREE_TEMPLATES = [
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

export const STARTER_TEMPLATES = [
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

export const PRO_TEMPLATES = [
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

export const PREMIUM_TEMPLATES = [
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

export const ALL_TEMPLATES = [
  ...FREE_TEMPLATES,
  ...STARTER_TEMPLATES,
  ...PRO_TEMPLATES,
  ...PREMIUM_TEMPLATES
];

export const getTemplatesForPlan = (planName) => {
  switch (planName) {
    case "PREMIUM": return PREMIUM_TEMPLATES;
    case "PRO": return PRO_TEMPLATES;
    case "STARTER": return STARTER_TEMPLATES;
    default: return FREE_TEMPLATES;
  }
};

export const TemplatePreview = ({ style, text, goalAmount = 10 }) => {
  const { animation, ...outerStyle } = style;
  return (
    <div style={{ padding: '16px 24px', borderRadius: '6px', ...outerStyle }}>
      <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '8px', fontWeight: style.fontWeight || 'normal', fontFamily: style.font }}>
        {text.replace('$10.00', `$${Number(goalAmount).toFixed(2)}`)}
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(128,128,128,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: '65%', height: '100%', background: style.progress, borderRadius: '10px', animation: animation || 'none' }}></div>
      </div>
    </div>
  );
};

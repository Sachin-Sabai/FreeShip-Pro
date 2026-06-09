import { redirect, Form, useLoaderData } from "react-router";
import { login, authenticate } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    await authenticate.admin(request);
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // If it's a client-side navigation inside the embedded app,
  // App Bridge will attach a Bearer token. Redirect to dashboard.
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    throw redirect("/app");
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #1e1b4b, #0f172a)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 48px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          color: white;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .form-input {
          width: 100%;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-size: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          margin-bottom: 8px;
        }
        .form-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .form-input:focus {
          outline: none;
          border-color: #818cf8;
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2);
          background: rgba(0, 0, 0, 0.3);
        }
        .btn-primary {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-weight: 700;
          font-size: 16px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="glass-card">
        <div style={{ 
          width: '72px', height: '72px', 
          background: 'linear-gradient(135deg, #38bdf8, #818cf8)', 
          borderRadius: '20px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', margin: '0 auto 24px',
          boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
        }}>📦</div>
        
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>
          FreeShip Pro
        </h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px', lineHeight: '1.6', padding: '0 20px' }}>
          Boost your Average Order Value with beautiful, high-converting animated free shipping bars.
        </p>

        {showForm && (
          <Form method="post" action="/auth/login" style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '10px' }}>
              Shopify Store URL
            </label>
            <input 
              className="form-input" 
              type="text" 
              name="shop" 
              placeholder="e.g. your-store.myshopify.com" 
              required
            />
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', textAlign: 'center', marginTop: '8px' }}>
              Enter your .myshopify.com domain to login or install
            </p>
            <button className="btn-primary" type="submit">
              Log In to FreeShip Pro
            </button>
          </Form>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '36px', textAlign: 'left', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#818cf8', marginBottom: '10px', fontSize: '20px' }}>✨</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>Animated Designs</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Premium loading states & gradient bars</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#34d399', marginBottom: '10px', fontSize: '20px' }}>🌍</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>Geo-Targeting</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Country-specific goals and rules</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f472b6', marginBottom: '10px', fontSize: '20px' }}>📈</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>Boost AOV</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Proven to increase your average sales</div>
          </div>
        </div>
      </div>
    </div>
  );
}

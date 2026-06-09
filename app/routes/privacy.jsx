

export const meta = () => {
  return [
    { title: "Privacy Policy | FreeShip Pro" },
    { name: "description", content: "Privacy Policy for FreeShip Pro Shopify App" },
  ];
};

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 10px 0', color: '#111' }}>Privacy Policy</h1>
        <p style={{ color: '#666', margin: 0 }}>Last updated: {currentDate}</p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <p>
            FreeShip Pro ("we", "us", or "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy describes how personal information is collected, used, and shared when you install or use the FreeShip Pro app in connection with your Shopify-supported store.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            1. Personal Information the App Collects
          </h2>
          <p>
            When you install the App, we are automatically able to access certain types of information from your Shopify account:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li><strong>Store Information:</strong> Shop domain, email address, and store currency to provide the core functionality of the shipping bar.</li>
            <li><strong>Theme Information:</strong> We request access to modify your theme in order to inject the FreeShip Pro bar onto your storefront.</li>
            <li><strong>Customer Information:</strong> We DO NOT collect, store, or process any Personally Identifiable Information (PII) from your customers. We only track anonymous aggregate data (such as impressions or clicks) strictly for your campaign analytics.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            2. How Do We Use Your Personal Information?
          </h2>
          <p>We use the personal information we collect from you and your customers in order to provide the Service and to operate the App. Additionally, we use this personal information to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Communicate with you regarding app updates, support, or billing.</li>
            <li>Optimize or improve the App.</li>
            <li>Provide you with information or advertising relating to our products or services.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            3. Sharing Your Personal Information
          </h2>
          <p>
            We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties. This does not include trusted third parties who assist us in operating our application, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
          </p>
          <p>
            Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            4. Data Retention
          </h2>
          <p>
            When you uninstall the App, we will retain your Store Information for a period of 30 days to facilitate a seamless reinstallation if you choose to return. After 30 days, or upon your explicit request via Shopify's data redaction endpoints, your data will be permanently deleted from our servers.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            5. Your Rights
          </h2>
          <p>
            If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
          </p>
          <p>
            Additionally, if you are a European resident we note that we are processing your information in order to fulfill contracts we might have with you, or otherwise to pursue our legitimate business interests listed above.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            6. Changes
          </h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#222', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            7. Contact Us
          </h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>support@freeshippro.com</strong>.
          </p>
        </section>
      </main>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} FreeShip Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

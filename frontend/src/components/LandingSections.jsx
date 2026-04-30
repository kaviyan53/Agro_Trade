import React, { useEffect } from 'react';

export default function LandingSections() {
  useEffect(() => {
    // 3. FAQ Accordion
    const faqItems = document.querySelectorAll('.landing-scope .faq-item');
    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          // Close other items
          faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
              const icon = otherItem.querySelector('.faq-icon');
              if (icon) icon.textContent = '+';
            }
          });

          // Toggle current item
          item.classList.toggle('active');
          const icon = item.querySelector('.faq-icon');
          if (icon) {
            if (item.classList.contains('active')) {
              icon.textContent = '×';
              icon.style.transform = 'rotate(90deg)';
            } else {
              icon.textContent = '+';
              icon.style.transform = 'rotate(0deg)';
            }
          }
        });
      }
    });

    // 4. Contact Form Submit
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    if (contactForm && successMessage) {
      const submitHandler = (e) => {
        e.preventDefault();
        contactForm.style.opacity = '0';
        setTimeout(() => {
          contactForm.style.display = 'none';
          successMessage.classList.add('show');
          contactForm.reset();
        }, 300);
      };
      contactForm.addEventListener('submit', submitHandler);
      return () => contactForm.removeEventListener('submit', submitHandler);
    }
  }, []);

  return (
    <div className="landing-scope">
      <style>{`
        /* Scoped styles to preserve HomePage layout without modifying global namespace */
        .landing-scope {
            --primary: #2a7a4b;
            --primary-dark: #1f5f3a;
            --primary-light: #eaffee;
            --text-dark: #111827;
            --text-body: #4b5563;
            --text-muted: #6b7280;
            --bg-white: #ffffff;
            --bg-gray: #f9fafb;
            --border: #e5e7eb;
            --footer-bg: #0d1f14;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --font-head: 'Sora', sans-serif;
            --font-body: 'DM Sans', sans-serif;
            --transition: all 0.3s ease;
            font-family: var(--font-body);
            color: var(--text-body);
            line-height: 1.6;
        }

        .landing-scope h1, .landing-scope h2, .landing-scope h3, .landing-scope h4, .landing-scope h5, .landing-scope h6 {
            font-family: var(--font-head);
            color: var(--text-dark);
            line-height: 1.2;
        }

        .landing-scope a {
            text-decoration: none;
            color: inherit;
        }

        .landing-scope ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .landing-scope img {
            max-width: 100%;
            display: block;
        }

        .landing-scope .s-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 5%;
        }

        /* Buttons */
        .landing-scope .s-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: var(--transition);
            border: 2px solid transparent;
            text-decoration: none;
        }

        .landing-scope .s-btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .landing-scope .s-btn-primary:hover {
            background-color: var(--primary-dark);
            box-shadow: var(--shadow-md);
            color: white;
        }

        .landing-scope .s-btn-ghost {
            background-color: transparent;
            color: var(--primary);
            border-color: var(--primary);
        }

        .landing-scope .s-btn-ghost:hover {
            background-color: var(--primary-light);
            color: var(--primary);
        }

        .landing-scope .s-badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: var(--primary-light);
            color: var(--primary-dark);
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        /* Sections General */
        .landing-scope .s-section {
            padding: 100px 0;
            background-color: var(--bg-white);
        }

        .landing-scope .s-bg-gray {
            background-color: var(--bg-gray);
        }

        .landing-scope .s-section-header {
            text-align: center;
            margin-bottom: 60px;
            max-width: 800px;
            margin-inline: auto;
        }

        .landing-scope .s-section-header h2 {
            font-size: 2.5rem;
            margin-bottom: 16px;
        }

        .landing-scope .s-section-header p {
            font-size: 1.125rem;
            color: var(--text-muted);
        }

        /* Extra from Product */
        .landing-scope .stats-row {
            display: flex;
            justify-content: center;
            gap: 48px;
            margin-block: 80px;
            flex-wrap: wrap;
        }
        .landing-scope .stat-item { text-align: center; }
        .landing-scope .stat-val { font-family: var(--font-head); font-size: 2rem; font-weight: 700; color: var(--text-dark); }
        .landing-scope .stat-label { font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

        .landing-scope .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
        }
        .landing-scope .step-card {
            background: var(--bg-white);
            padding: 40px;
            border-radius: 16px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
            transition: var(--transition);
            text-align: left;
        }
        .landing-scope .step-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .landing-scope .step-num {
            display: inline-flex; align-items: center; justify-content: center;
            width: 48px; height: 48px; background-color: var(--primary-light);
            color: var(--primary); font-family: var(--font-head); font-weight: 700;
            font-size: 1.5rem; border-radius: 50%; margin-bottom: 24px;
        }

        /* Features */
        .landing-scope .features-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 32px; margin-bottom: 80px;
        }
        .landing-scope .feature-card {
            background: var(--bg-white); padding: 32px; border-radius: 12px;
            box-shadow: var(--shadow-sm); border: 1px solid var(--border);
            transition: var(--transition); position: relative; overflow: hidden;
        }
        .landing-scope .feature-card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
            background-color: var(--primary); transform: scaleX(0);
            transform-origin: left; transition: transform 0.3s ease;
        }
        .landing-scope .feature-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .landing-scope .feature-card:hover::before { transform: scaleX(1); }
        .landing-scope .feature-icon { font-size: 2.5rem; margin-bottom: 24px; }
        .landing-scope .feature-card h3 { margin-bottom: 12px; }

        .landing-scope .testimonials-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;
        }
        .landing-scope .testimonial-card {
            background: var(--bg-gray); padding: 32px; border-radius: 12px;
            border: 1px solid var(--border); transition: var(--transition);
        }
        .landing-scope .testimonial-card:hover {
            background: var(--bg-white); box-shadow: var(--shadow-md); transform: translateY(-3px);
        }
        .landing-scope .stars { color: #fbbf24; letter-spacing: 2px; margin-bottom: 16px; }
        .landing-scope .testimonial-text { font-style: italic; margin-bottom: 24px; }
        .landing-scope .testimonial-author { font-weight: 600; color: var(--text-dark); font-size: 0.875rem; }

        /* Pricing */
        .landing-scope .pricing-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px; align-items: center;
        }
        .landing-scope .pricing-card {
            background: var(--bg-white); border: 1px solid var(--border);
            border-radius: 16px; padding: 40px; text-align: center;
            transition: var(--transition); position: relative;
        }
        .landing-scope .pricing-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-5px); }
        .landing-scope .pricing-card.highlight {
            border: 2px solid var(--primary); padding: 50px 40px;
            box-shadow: var(--shadow-md); transform: scale(1.05);
        }
        .landing-scope .pricing-card.highlight:hover { transform: scale(1.05) translateY(-5px); }
        .landing-scope .popular-badge {
            position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
            background-color: var(--primary); color: white; padding: 4px 16px;
            border-radius: 20px; font-size: 0.75rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1px;
        }
        .landing-scope .plan-name { font-family: var(--font-head); font-size: 1.25rem; color: var(--text-dark); margin-bottom: 16px; font-weight: 600; }
        .landing-scope .plan-price { font-family: var(--font-head); font-size: 3rem; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
        .landing-scope .plan-period { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 32px; }
        .landing-scope .plan-features { text-align: left; margin-bottom: 40px; }
        .landing-scope .plan-features li { margin-bottom: 16px; position: relative; padding-left: 28px; }
        .landing-scope .plan-features li::before {
            content: '✓'; position: absolute; left: 0; top: 0; color: var(--primary); font-weight: 700;
        }
        .landing-scope .pricing-card .s-btn { width: 100%; }

        /* Docs */
        .landing-scope .docs-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px; margin-bottom: 80px;
        }
        .landing-scope .doc-card {
            background: var(--bg-white); border: 1px solid var(--border);
            border-radius: 12px; padding: 24px; transition: var(--transition);
        }
        .landing-scope .doc-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary-light); transform: translateY(-3px); }
        .landing-scope .doc-tag {
            display: inline-block; padding: 4px 12px; border-radius: 12px;
            font-size: 0.75rem; font-weight: 600; margin-bottom: 16px;
        }
        .landing-scope .tag-green { background: #eaffee; color: #166534; }
        .landing-scope .tag-blue { background: #eff6ff; color: #1e40af; }
        .landing-scope .tag-amber { background: #fffbeb; color: #b45309; }
        .landing-scope .doc-icon { font-size: 1.5rem; margin-bottom: 12px; }

        .landing-scope .faq-wrapper { max-width: 800px; margin: 0 auto; }
        .landing-scope .faq-item { border-bottom: 1px solid var(--border); padding: 24px 0; }
        .landing-scope .faq-question {
            width: 100%; background: none; border: none; display: flex;
            justify-content: space-between; align-items: center; font-family: var(--font-head);
            font-size: 1.125rem; font-weight: 600; color: var(--text-dark); cursor: pointer; text-align: left;
        }
        .landing-scope .faq-icon { transition: transform 0.3s ease; font-size: 1.25rem; }
        .landing-scope .faq-answer {
            max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
            color: var(--text-muted); margin-top: 0; opacity: 0;
        }
        .landing-scope .faq-item.active .faq-icon { transform: rotate(45deg); }
        .landing-scope .faq-item.active .faq-answer { max-height: 200px; margin-top: 16px; opacity: 1; }

        /* Support */
        .landing-scope .support-container { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .landing-scope .contact-card { background: var(--bg-gray); padding: 40px; border-radius: 16px; border: 1px solid var(--border); }
        .landing-scope .form-group { margin-bottom: 24px; }
        .landing-scope .form-label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-dark); }
        .landing-scope .form-control {
            width: 100%; padding: 12px 16px; border: 1px solid var(--border);
            border-radius: 8px; font-family: var(--font-body); font-size: 1rem; transition: border-color 0.3s ease;
        }
        .landing-scope .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .landing-scope textarea.form-control { resize: vertical; min-height: 120px; }
        .landing-scope .success-message {
            display: none; text-align: center; padding: 40px 20px; background: #eaffee; border-radius: 12px; color: #166534;
        }
        .landing-scope .success-message.show { display: block; }
        .landing-scope .support-options { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .landing-scope .support-option-card {
            display: flex; align-items: flex-start; gap: 16px; background: var(--bg-white);
            padding: 24px; border-radius: 12px; border: 1px solid var(--border); transition: var(--transition);
        }
        .landing-scope .support-option-card:hover { box-shadow: var(--shadow-sm); border-color: var(--primary); }
        .landing-scope .support-icon { font-size: 1.5rem; }
        .landing-scope .webinar-banner {
            background: linear-gradient(135deg, #111827, #0d1f14); color: white; padding: 32px;
            border-radius: 16px; position: relative; overflow: hidden;
        }
        .landing-scope .live-badge {
            background-color: #ef4444; color: white; padding: 4px 12px;
            border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; margin-bottom: 16px;
        }
        .landing-scope .webinar-banner h3 { color: white; margin-bottom: 12px; }
        .landing-scope .webinar-banner p { color: #9ca3af; margin-bottom: 24px; }

        /* Footer */
        .landing-scope footer { background-color: var(--footer-bg); color: white; padding: 80px 0 32px; }
        .landing-scope .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .landing-scope .footer-brand .logo { color: white; margin-bottom: 16px; display: block; font-family: var(--font-head); font-weight: 700; font-size: 1.5rem; }
        .landing-scope .footer-tagline { color: #9ca3af; margin-bottom: 24px; }
        .landing-scope .subscribe-form { display: flex; gap: 8px; }
        .landing-scope .subscribe-input {
            padding: 10px 16px; border-radius: 8px; border: none;
            background: rgba(255, 255, 255, 0.1); color: white; width: 100%;
        }
        .landing-scope .subscribe-input::placeholder { color: #6b7280; }
        .landing-scope .subscribe-btn {
            background: var(--primary); color: white; border: none; padding: 10px 20px;
            border-radius: 8px; cursor: pointer; font-weight: 600; transition: var(--transition);
        }
        .landing-scope .subscribe-btn:hover { background: var(--primary-dark); }
        .landing-scope .footer-col h4 { color: white; margin-bottom: 24px; font-size: 1.125rem; }
        .landing-scope .footer-links li { margin-bottom: 12px; }
        .landing-scope .footer-links a { color: #9ca3af; transition: var(--transition); }
        .landing-scope .footer-links a:hover { color: white; }
        .landing-scope .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 32px;
            display: flex; justify-content: space-between; align-items: center; color: #9ca3af; font-size: 0.875rem;
        }
        .landing-scope .social-links { display: flex; gap: 16px; }
        .landing-scope .social-links a { color: #9ca3af; transition: var(--transition); }
        .landing-scope .social-links a:hover { color: white; }

        @media (max-width: 1024px) {
            .landing-scope .pricing-card.highlight { transform: scale(1); }
            .landing-scope .pricing-card.highlight:hover { transform: translateY(-5px); }
            .landing-scope .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
            .landing-scope .support-container { grid-template-columns: 1fr; }
            .landing-scope .support-options { grid-template-columns: 1fr; }
            .landing-scope .footer-grid { grid-template-columns: 1fr; gap: 40px; }
            .landing-scope .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
        }

        /* Mobile-first responsive overrides: keeps landing cards readable from 320px up. */
        .landing-scope .s-container {
            width: min(100%, 1200px);
            padding-inline: clamp(1rem, 5vw, 3rem);
        }
        .landing-scope .s-section {
            padding-block: clamp(3.5rem, 10vw, 6.25rem);
        }
        .landing-scope .s-section-header {
            margin-bottom: clamp(2rem, 7vw, 3.75rem);
        }
        .landing-scope .s-section-header h2 {
            font-size: clamp(1.8rem, 7vw, 2.5rem);
        }
        .landing-scope .s-section-header p,
        .landing-scope .testimonial-text,
        .landing-scope .webinar-banner p {
            max-width: 70ch;
        }
        .landing-scope .stats-row {
            gap: clamp(1.25rem, 6vw, 3rem);
            margin-block: clamp(2.5rem, 8vw, 5rem);
        }
        .landing-scope .stat-val,
        .landing-scope .plan-price {
            font-size: clamp(1.75rem, 8vw, 3rem);
        }
        .landing-scope .steps-grid,
        .landing-scope .features-grid,
        .landing-scope .testimonials-grid,
        .landing-scope .pricing-grid,
        .landing-scope .docs-grid,
        .landing-scope .support-options {
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
            gap: clamp(1rem, 4vw, 2rem);
        }
        .landing-scope .step-card,
        .landing-scope .feature-card,
        .landing-scope .testimonial-card,
        .landing-scope .pricing-card,
        .landing-scope .contact-card,
        .landing-scope .webinar-banner {
            padding: clamp(1.25rem, 5vw, 2.5rem);
        }
        .landing-scope .support-container,
        .landing-scope .footer-grid {
            grid-template-columns: 1fr;
            gap: clamp(1.5rem, 6vw, 3.75rem);
        }
        .landing-scope .subscribe-form,
        .landing-scope .footer-bottom {
            flex-direction: column;
            align-items: stretch;
        }
        .landing-scope .s-btn,
        .landing-scope .subscribe-btn,
        .landing-scope .form-control {
            min-height: 44px;
        }
        .landing-scope .pricing-card.highlight,
        .landing-scope .pricing-card.highlight:hover {
            transform: none;
        }

        @media (min-width: 768px) {
            .landing-scope .support-container {
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            }
            .landing-scope .footer-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .landing-scope .subscribe-form,
            .landing-scope .footer-bottom {
                flex-direction: row;
                align-items: center;
            }
        }

        @media (min-width: 1024px) {
            .landing-scope .footer-grid {
                grid-template-columns: 2fr 1fr 1fr 1fr;
            }
            .landing-scope .pricing-card.highlight {
                transform: scale(1.03);
            }
            .landing-scope .pricing-card.highlight:hover {
                transform: scale(1.03) translateY(-5px);
            }
        }
      `}</style>

      {/* From Product Section (Stats & Steps only) */}
      <div className="s-section">
        <div className="s-container relative">
          <div className="stats-row">
            <div className="stat-item">
                <div className="stat-val">500+</div>
                <div className="stat-label">Commercial farms</div>
            </div>
            <div className="stat-item">
                <div className="stat-val">98%</div>
                <div className="stat-label">Yield accuracy</div>
            </div>
            <div className="stat-item">
                <div className="stat-val">30%</div>
                <div className="stat-label">Water saved</div>
            </div>
            <div className="stat-item">
                <div className="stat-val">24/7</div>
                <div className="stat-label">AI monitoring</div>
            </div>
          </div>
          <div className="s-section-header mt-16 pt-10 border-t border-[#e5e7eb]">
              <h2>Start Your Smart Farm in 3 Steps</h2>
          </div>
          <div className="steps-grid">
              <div className="step-card">
                  <div className="step-num">1</div>
                  <h3>Connect Your Land</h3>
                  <p>Upload your plot boundaries or use our satellite picker to instantly map your active farming area.</p>
              </div>
              <div className="step-card">
                  <div className="step-num">2</div>
                  <h3>AI Analysis</h3>
                  <p>Our engines process historical yield data and live satellite feeds to build a custom growth model for you.</p>
              </div>
              <div className="step-card">
                  <div className="step-num">3</div>
                  <h3>Optimize & Grow</h3>
                  <p>Chat with our AI Assistant to plan exact fertilizer routines and pinpoint optimal harvest dates.</p>
              </div>
          </div>
        </div>
      </div>

      <section id="features" className="s-section s-bg-gray">
          <div className="s-container">
              <div className="s-section-header">
                  <span className="s-badge">Features</span>
                  <h2>Everything You Need to Scale</h2>
                  <p>Our integrated platform combines satellite data, ground sensors, and generative AI to give you a 360° view of your operations.</p>
              </div>

              <div className="features-grid">
                  <div className="feature-card">
                      <div className="feature-icon">🌤</div>
                      <h3>Hyper-Local Weather</h3>
                      <p>Predictive micro-climate insights accurate within 10-meter radius, saving crops from unexpected changes.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">🌿</div>
                      <h3>Crop Health Monitoring</h3>
                      <p>AI detects nutrient deficiencies and early-stage diseases before they become visible to the human eye.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">📈</div>
                      <h3>AI Predictions</h3>
                      <p>Generative AI simulates harvest timelines and potential yields based on 10-year historical weather data.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">🗺</div>
                      <h3>Precision Map View</h3>
                      <p>Interactive digital twin of your physical farm with detailed soil moisture and nutrient data overlay.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">🔔</div>
                      <h3>Smart Alerts</h3>
                      <p>Instant SMS and push notifications for high-risk pest outbreaks, sudden frost warnings, and heavy rains.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">📋</div>
                      <h3>Compliance & Reporting</h3>
                      <p>Auto-generates rigorous sustainability and audit reports for government subsidies and bank loans.</p>
                  </div>
              </div>

              <div className="testimonials-grid">
                  <div className="testimonial-card">
                      <div className="stars">★★★★★</div>
                      <p className="testimonial-text">"OpenFarm transformed our family vineyard. We reduced water usage by 30% while increasing yield by nearly a quarter."</p>
                      <p className="testimonial-author">— Marcus Thornton, Owner, Thornton Heritage Vineyards</p>
                  </div>
                  <div className="testimonial-card">
                      <div className="stars">★★★★★</div>
                      <p className="testimonial-text">"The weather alerts saved my paddy crop from an unexpected frost. The system notified me 4 hours in advance with exact protection steps."</p>
                      <p className="testimonial-author">— Priya Nair, Farm Manager, Green Valley Estates</p>
                  </div>
                  <div className="testimonial-card">
                      <div className="stars">★★★★★</div>
                      <p className="testimonial-text">"As a first-generation tech user I was worried it would be complicated. The interface is so clean and the chatbot explains everything simply."</p>
                      <p className="testimonial-author">— Ramesh Kumar, Sugarcane Farmer, Coimbatore</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="pricing" className="s-section">
          <div className="s-container">
              <div className="s-section-header">
                  <h2>Simple, Transparent Pricing</h2>
                  <p>Start free, scale as your farm grows. No hidden fees. Cancel anytime.</p>
              </div>

              <div className="pricing-grid">
                  <div className="pricing-card">
                      <h3 className="plan-name">STARTER</h3>
                      <div className="plan-price">Free</div>
                      <div className="plan-period">forever</div>
                      <ul className="plan-features">
                          <li>Up to 3 fields</li>
                          <li>Basic weather data</li>
                          <li>AI crop advisory</li>
                          <li>Email alerts</li>
                          <li>Community support</li>
                      </ul>
                      <a href="#register" className="s-btn s-btn-ghost">Get Started Free</a>
                  </div>

                  <div className="pricing-card highlight">
                      <div className="popular-badge">Most Popular</div>
                      <h3 className="plan-name">PRO</h3>
                      <div className="plan-price">₹999</div>
                      <div className="plan-period">per month</div>
                      <ul className="plan-features">
                          <li>Unlimited fields</li>
                          <li>Real-time weather + forecast</li>
                          <li>Advanced AI predictions</li>
                          <li>SMS & push alerts</li>
                          <li>Analytics & reports</li>
                          <li>Priority support</li>
                          <li>Export data (CSV/PDF)</li>
                      </ul>
                      <a href="#register" className="s-btn s-btn-primary">Start 14-Day Free Trial</a>
                  </div>

                  <div className="pricing-card">
                      <h3 className="plan-name">ENTERPRISE</h3>
                      <div className="plan-price">Custom</div>
                      <div className="plan-period">contact us</div>
                      <ul className="plan-features">
                          <li>Everything in Pro</li>
                          <li>Multi-farm management</li>
                          <li>API integration</li>
                          <li>Custom AI models</li>
                          <li>Dedicated account manager</li>
                          <li>SLA guarantee</li>
                          <li>On-premise option</li>
                      </ul>
                      <a href="#contact" className="s-btn s-btn-ghost">Contact Sales</a>
                  </div>
              </div>
          </div>
      </section>

      <section id="docs" className="s-section s-bg-gray">
          <div className="s-container">
              <div className="s-section-header">
                  <h2>Everything You Need to Build & Grow</h2>
              </div>

              <div className="docs-grid">
                  <div className="doc-card">
                      <div className="doc-icon">📖</div>
                      <span className="doc-tag tag-green">Beginner</span>
                      <h3>Getting Started Guide</h3>
                      <p>Set up your farm profile and run your first AI prediction in 5 minutes</p>
                  </div>
                  <div className="doc-card">
                      <div className="doc-icon">🔌</div>
                      <span className="doc-tag tag-blue">Developer</span>
                      <h3>API Reference</h3>
                      <p>Full REST API docs for weather, fields, predictions, alerts, analytics</p>
                  </div>
                  <div className="doc-card">
                      <div className="doc-icon">🤖</div>
                      <span className="doc-tag tag-amber">Technical</span>
                      <h3>AI Advisory Engine</h3>
                      <p>How our decision logic works from soil inputs to crop health scores</p>
                  </div>
                  <div className="doc-card">
                      <div className="doc-icon">🎥</div>
                      <span className="doc-tag tag-green">Visual</span>
                      <h3>Video Tutorials</h3>
                      <p>Step-by-step screencasts for every module</p>
                  </div>
                  <div className="doc-card">
                      <div className="doc-icon">📊</div>
                      <span className="doc-tag tag-blue">Reports</span>
                      <h3>Analytics & Reports</h3>
                      <p>Interpret health scores and export seasonal compliance documents</p>
                  </div>
                  <div className="doc-card">
                      <div className="doc-icon">🔐</div>
                      <span className="doc-tag tag-amber">Security</span>
                      <h3>Security & Privacy</h3>
                      <p>AES-256 encryption, GDPR compliant, data never sold to third parties</p>
                  </div>
              </div>

              <div className="faq-wrapper">
                  <div className="faq-item">
                      <button className="faq-question">
                          Q1: How often is the weather data updated?
                          <span className="faq-icon">+</span>
                      </button>
                      <div className="faq-answer">
                          <p>Every 10 minutes from OpenWeatherMap. Forecasts updated every 3 hours.</p>
                      </div>
                  </div>
                  <div className="faq-item">
                      <button className="faq-question">
                          Q2: Do I need any hardware or sensors?
                          <span className="faq-icon">+</span>
                      </button>
                      <div className="faq-answer">
                          <p>No hardware needed. Enter crop type, soil condition, and location — we do the rest.</p>
                      </div>
                  </div>
                  <div className="faq-item">
                      <button className="faq-question">
                          Q3: How does the AI predict crop health?
                          <span className="faq-icon">+</span>
                      </button>
                      <div className="faq-answer">
                          <p>Combines field inputs with live weather and crop-specific thresholds to generate a health score and actionable advice.</p>
                      </div>
                  </div>
                  <div className="faq-item">
                      <button className="faq-question">
                          Q4: Is my farm data secure?
                          <span className="faq-icon">+</span>
                      </button>
                      <div className="faq-answer">
                          <p>AES-256 encryption, HTTPS transmission, data never sold to third parties.</p>
                      </div>
                  </div>
                  <div className="faq-item">
                      <button className="faq-question">
                          Q5: Can I export my reports?
                          <span className="faq-icon">+</span>
                      </button>
                      <div className="faq-answer">
                          <p>Yes. Export prediction history and analytics as CSV or PDF from Analytics page.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section id="support" className="s-section">
          <div className="s-container">
              <div className="s-section-header">
                  <h2>How Can We Help You Grow?</h2>
              </div>

              <div className="support-container">
                  <div className="contact-card">
                      <form id="contactForm">
                          <div className="form-group">
                              <label className="form-label" htmlFor="fullName">Full Name</label>
                              <input type="text" id="fullName" className="form-control" required />
                          </div>
                          <div className="form-group">
                              <label className="form-label" htmlFor="email">Email Address</label>
                              <input type="email" id="email" className="form-control" required />
                          </div>
                          <div className="form-group">
                              <label className="form-label" htmlFor="message">Message</label>
                              <textarea id="message" className="form-control" required></textarea>
                          </div>
                          <button type="submit" className="s-btn s-btn-primary" style={{ width: '100%' }}>Send Support Request →</button>
                      </form>
                      <div id="successMessage" className="success-message">
                          <h3>✅ Message Sent Successfully!</h3>
                          <p>Our support team will get back to you within 24 hours.</p>
                      </div>
                  </div>

                  <div className="support-info">
                      <div className="support-options">
                          <div className="support-option-card">
                              <div className="support-icon">💬</div>
                              <div>
                                  <h4 style={{ marginBottom: '4px' }}>Live Chat</h4>
                                  <p style={{ fontSize: '0.875rem' }}>Chat with agriculture experts. Mon–Sat 9AM–6PM IST</p>
                              </div>
                          </div>
                          <div className="support-option-card">
                              <div className="support-icon">📧</div>
                              <div>
                                  <h4 style={{ marginBottom: '4px' }}>Email Support</h4>
                                  <p style={{ fontSize: '0.875rem' }}>Response within 24 hours at support@agrotrade.ai</p>
                              </div>
                          </div>
                          <div className="support-option-card">
                              <div className="support-icon">📹</div>
                              <div>
                                  <h4 style={{ marginBottom: '4px' }}>Video Tutorials</h4>
                                  <p style={{ fontSize: '0.875rem' }}>Step-by-step guides on every platform feature</p>
                              </div>
                          </div>
                          <div className="support-option-card">
                              <div className="support-icon">👥</div>
                              <div>
                                  <h4 style={{ marginBottom: '4px' }}>Community Forum</h4>
                                  <p style={{ fontSize: '0.875rem' }}>Join 4,000+ farmers sharing tips and field data</p>
                              </div>
                          </div>
                      </div>

                      <div className="webinar-banner">
                          <span className="live-badge">Live Training</span>
                          <h3>Join our weekly Agronomy Webinar</h3>
                          <p>Every Tuesday at 10:00 AM. Latest trends in precision planting and soil health management.</p>
                          <a href="#register-session" className="s-btn s-btn-primary" style={{ background: 'white', color: '#111' }}>Register for Session</a>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <footer>
          <div className="s-container">
              <div className="footer-grid">
                  <div className="footer-brand">
                      <a href="#" className="logo" style={{color: 'white', textDecoration: 'none'}}>Vijay Agro Trade</a>
                      <p className="footer-tagline">Empowering farmers with AI-driven precision agriculture for a sustainable future.</p>
                      <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
                          <input type="email" placeholder="Enter your email" className="subscribe-input" required />
                          <button type="submit" className="subscribe-btn">Join</button>
                      </form>
                  </div>
                  <div className="footer-col">
                      <h4>Product</h4>
                      <ul className="footer-links">
                          <li><a href="#">Analytics</a></li>
                          <li><a href="#">Mobile App</a></li>
                          <li><a href="#">Sensors</a></li>
                          <li><a href="#">API Integration</a></li>
                      </ul>
                  </div>
                  <div className="footer-col">
                      <h4>Company</h4>
                      <ul className="footer-links">
                          <li><a href="#">About Us</a></li>
                          <li><a href="#">Careers</a></li>
                          <li><a href="#">Sustainability</a></li>
                          <li><a href="#">Press Kit</a></li>
                      </ul>
                  </div>
                  <div className="footer-col">
                      <h4>Legal</h4>
                      <ul className="footer-links">
                          <li><a href="#">Privacy Policy</a></li>
                          <li><a href="#">Terms of Service</a></li>
                          <li><a href="#">Cookie Policy</a></li>
                      </ul>
                  </div>
              </div>
              <div className="footer-bottom">
                  <p>&copy; 2026 Vijay Agro Trade. All rights reserved.</p>
                  <div className="social-links">
                      <a href="#">Twitter</a>
                      <a href="#">LinkedIn</a>
                      <a href="#">Instagram</a>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
}

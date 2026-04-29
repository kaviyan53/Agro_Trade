import React from 'react';
import './Product.css';

export default function Product() {
  return (
    <section id="product" className="product-section">
      <div className="product-container">
        <span className="product-badge">⚡ AI-Powered Agriculture 2.0</span>
        <h1 className="product-hero-title">
          Intelligence for the <span className="product-text-green">Next Generation</span> of Farming.
        </h1>
        <p className="product-hero-desc">
          Maximize yields and minimize waste with the world's most advanced AI Farmer Assistant. 
          Real-time monitoring, predictive health insights, and autonomous climate alerts.
        </p>
        
        <div className="product-hero-btns">
          <a href="#demo" className="product-btn product-btn-primary">Try the Chatbot →</a>
          <a href="#dashboard" className="product-btn product-btn-ghost">View Dashboard</a>
        </div>

        <div className="product-stats-row">
          <div className="product-stat-item">
            <div className="product-stat-val">500+</div>
            <div className="product-stat-label">Commercial farms</div>
          </div>
          <div className="product-stat-item">
            <div className="product-stat-val">98%</div>
            <div className="product-stat-label">Yield accuracy</div>
          </div>
          <div className="product-stat-item">
            <div className="product-stat-val">30%</div>
            <div className="product-stat-label">Water saved</div>
          </div>
          <div className="product-stat-item">
            <div className="product-stat-val">24/7</div>
            <div className="product-stat-label">AI monitoring</div>
          </div>
        </div>

        <div className="product-partners">
          <div className="product-partner-logos">
            <span>AGRI-GLOBAL</span>
            <span>·</span>
            <span>SOIL TRUST</span>
            <span>·</span>
            <span>ECOVANE</span>
            <span>·</span>
            <span>HARVEST CO</span>
            <span>·</span>
            <span>CROP DATA</span>
          </div>
        </div>

        <div className="product-section-header">
          <h2>Start Your Smart Farm in 3 Steps</h2>
        </div>

        <div className="product-steps-grid">
          <div className="product-step-card">
            <div className="product-step-num">1</div>
            <h3>Connect Your Land</h3>
            <p>Upload your plot boundaries or use our satellite picker to instantly map your active farming area.</p>
          </div>
          <div className="product-step-card">
            <div className="product-step-num">2</div>
            <h3>AI Analysis</h3>
            <p>Our engines process historical yield data and live satellite feeds to build a custom growth model for you.</p>
          </div>
          <div className="product-step-card">
            <div className="product-step-num">3</div>
            <h3>Optimize & Grow</h3>
            <p>Chat with our AI Assistant to plan exact fertilizer routines and pinpoint optimal harvest dates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

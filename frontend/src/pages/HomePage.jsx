import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import LandingSections from '../components/LandingSections';
import logo from '../components/image.jpg';

// Leaf Icon SVG
const LeafIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM11.66 6.084a.75.75 0 01.37.105l4.5 2.625a.75.75 0 010 1.298l-4.5 2.625a.75.75 0 01-1.03-.84l.872-3.15-2.617-2.228a.75.75 0 01.408-1.306l3.208-.285.889-2.839z"
      clipRule="evenodd"
    />
    <path d="M12 1.5c-1.93 0-3.722.584-5.207 1.58A10.457 10.457 0 003.08 8.286c-.525 1.5-.83 3.105-.83 4.764 0 5.678 4.604 10.283 10.283 10.283s10.283-4.605 10.283-10.283S18.211 2.75 12.533 2.75v8.52a.75.75 0 01-1.5 0V2.328A10.609 10.609 0 0012 1.5z" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const DropletIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M7.16 19.527A7.5 7.5 0 1118 12c0 4.142-3.358 7.5-7.5 7.5-1.157 0-2.25-.262-3.238-.727z" />
  </svg>
);

const ThermometerIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const WarningIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div style={{ fontFamily: '"Manrope", sans-serif' }} className="min-h-screen bg-white text-[#111827] overflow-x-hidden selection:bg-[#1a7a3c]/30 selection:text-[#1a7a3c]">
      {/* Import Manrope font dynamically just in case */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
      `}</style>
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200">
            <img src={logo} alt="Logo" className="h-[50px] object-contain" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 font-[600] text-sm text-[#6b7280]">
            {['Product', 'Features', 'Pricing', 'Docs', 'Support'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`}
                className="hover:text-[#1a7a3c] transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
             <Link to="/login" className="text-sm font-[600] text-[#111827] hover:text-[#1a7a3c] transition-colors duration-200 px-4 py-2">
              Log In
            </Link>
            <Link to="/register" className="text-sm font-[700] text-white bg-[#1a7a3c] hover:bg-[#14602f] hover:scale-105 shadow-md transition-all duration-300 px-5 py-2.5 rounded-lg">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#111827] hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-[#e5e7eb] shadow-lg transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0 h-auto py-4 px-6' : 'opacity-0 -translate-y-4 h-0 py-0 overflow-hidden'}`}>
          <div className="flex flex-col gap-4">
            {['Product', 'Features', 'Pricing', 'Docs', 'Support'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`}
                className="font-[600] text-base text-[#111827] hover:text-[#1a7a3c] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="h-px bg-[#e5e7eb] w-full my-2"></div>
            <Link to="/login" className="w-full text-center font-[600] text-[#111827] hover:bg-gray-50 border border-[#e5e7eb] rounded-lg py-3 transition-colors block">
              Log In
            </Link>
            <Link to="/register" className="w-full text-center font-[700] text-white bg-[#1a7a3c] hover:bg-[#14602f] rounded-lg py-3 shadow-md transition-colors block">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 w-[800px] h-[800px] rounded-full bg-[#f0fdf4] blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4 w-[600px] h-[600px] rounded-full bg-[#f0fdf4] blur-3xl opacity-60"></div>

        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className={`flex flex-col items-start gap-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0fdf4] border border-[#1a7a3c]/20 text-[#1a7a3c] text-sm font-[700]">
              <LeafIcon className="w-4 h-4" />
              <span>AI-Powered Agriculture 2.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-[1.1] font-[800] tracking-tight text-[#111827]">
              Intelligence for the <br className="hidden lg:block" />
              <span className="text-[#1a7a3c] relative inline-block">
                Next Generation 
                {/* SVG Underline */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#1a7a3c]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <br className="hidden lg:block" /> of Farming.
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-[#4b5563] font-[500] max-w-lg leading-relaxed mb-4">
              Maximize yields and minimize waste with the world's most advanced AI Farmer Assistant. Real-time monitoring, predictive health insights, and autonomous climate alerts.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <button 
                onClick={() => {
                  window.dispatchEvent(new Event('open-chatbot'));
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 text-base md:text-lg font-[600] text-white bg-[#2e7d32] hover:bg-[#1b5e20] shadow-md transition-all duration-300 px-8 py-4 rounded-lg"
              >
                Try the Chatbot 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
              </button>
              <Link 
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-3 text-base md:text-lg font-[600] text-[#2e7d32] bg-white border-2 border-[#e5e7eb] hover:bg-gray-50 shadow-sm transition-all duration-300 px-8 py-4 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                View Dashboard
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-10 w-full max-w-md">
              <div className="flex -space-x-3">
                <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-md bg-gray-100 z-30 transform hover:scale-110 transition-transform duration-200" src="https://i.pravatar.cc/100?img=11" alt="Farmer 1" />
                <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-md bg-gray-100 z-20 transform hover:scale-110 transition-transform duration-200" src="https://i.pravatar.cc/100?img=5" alt="Farmer 2" />
                <img className="w-14 h-14 rounded-full border-4 border-white object-cover shadow-md bg-gray-100 z-10 transform hover:scale-110 transition-transform duration-200" src="https://i.pravatar.cc/100?img=3" alt="Farmer 3" />
              </div>
              <span className="text-base font-[500] text-[#6b7280]">
                <strong className="text-[#111827] text-lg font-[800]">500+</strong> commercial farms growing smarter
              </span>
            </div>

          </div>

          {/* Right Column - Dashboard Card Graphic */}
          <div className={`relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center lg:justify-end transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            
            {/* Main Interactive Card */}
            <div className="relative w-full max-w-[500px] bg-white rounded-3xl p-6 shadow-2xl shadow-[#1a7a3c]/10 border border-[#e5e7eb] z-10 transition-transform hover:-translate-y-2 duration-500">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-[800] text-xl text-[#111827]">Field Metrics (#A-42)</h3>
                <span className="px-3 py-1 bg-[#f0fdf4] text-[#1a7a3c] text-xs font-[700] rounded-full">Live Synced</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-2xl p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <DropletIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-[600] text-[#6b7280]">Moisture</span>
                  </div>
                  <div className="text-3xl font-[800] text-[#111827]">68.4<span className="text-xl text-[#6b7280] font-[600]">%</span></div>
                  <div className="text-xs text-[#1a7a3c] font-[700] mt-1 pr-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                    2.1% this week
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <ThermometerIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-[600] text-[#6b7280]">Avg Temp</span>
                  </div>
                  <div className="text-3xl font-[800] text-[#111827]">24.2<span className="text-xl text-[#6b7280] font-[600]">°C</span></div>
                  <div className="text-xs text-[#1a7a3c] font-[700] mt-1 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>
                    Optimum Range
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-[600] text-[#6b7280]">Yield Projection</span>
                  <span className="text-sm font-[700] text-[#1a7a3c] hover:underline cursor-pointer">Detailed Report</span>
                </div>
                <div className="h-[120px] bg-gray-50 rounded-xl w-full border border-gray-100 overflow-hidden relative">
                  {/* SVG Chart Graphic */}
                  <svg className="absolute bottom-0 w-full h-full preserve-3d" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <path d="M0 30 H400 M0 60 H400 M0 90 H400" stroke="#f3f4f6" strokeWidth="1" fill="none" />
                    <path d="M0 120 L0 80 Q 50 60, 100 70 T 200 40 T 300 30 T 400 10 L400 120 Z" fill="url(#grad1)" className="opacity-40" />
                    <path d="M0 80 Q 50 60, 100 70 T 200 40 T 300 30 T 400 10" stroke="#1a7a3c" strokeWidth="3" fill="none" strokeLinecap="round" className={`transition-all duration-[2000ms] ease-out ${isLoaded ? 'dash-animate' : ''}`} strokeDasharray="1000" strokeDashoffset={isLoaded ? "0" : "1000"} />
                    <circle cx="100" cy="70" r="4" fill="#fff" stroke="#1a7a3c" strokeWidth="2" className={`transition-all duration-300 delay-[600ms] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    <circle cx="200" cy="40" r="4" fill="#fff" stroke="#1a7a3c" strokeWidth="2" className={`transition-all duration-300 delay-[900ms] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    <circle cx="300" cy="30" r="4" fill="#fff" stroke="#1a7a3c" strokeWidth="2" className={`transition-all duration-300 delay-[1200ms] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    <circle cx="400" cy="10" r="4" fill="#fff" stroke="#1a7a3c" strokeWidth="2" className={`transition-all duration-300 delay-[1500ms] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#1a7a3c', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#1a7a3c', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium px-2 mt-2 uppercase tracking-wide">
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Float Alert Popup */}
            <div className={`absolute top-4 -right-4 lg:-right-12 bg-white rounded-xl shadow-xl shadow-red-900/10 border border-red-100 p-4 flex items-start gap-3 w-72 z-20 transition-all duration-700 delay-700 ease-out ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
              <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
                 <WarningIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-[800] text-[#111827]">Frost Warning</h4>
                <p className="text-xs text-[#6b7280] font-[600] mt-0.5">Tonight @ 2:00 AM. Cover sensitive crops in sector 4.</p>
                <button className="text-xs font-[700] text-red-600 mt-2 hover:underline">Automate Response</button>
              </div>
            </div>

            {/* Back decorative element */}
            <div className="absolute -z-10 bg-[#f0fdf4] border border-[#1a7a3c]/10 rounded-3xl w-[90%] h-[90%] top-[10%] right-[-5%] rotate-3 transition-transform hover:rotate-6 duration-500"></div>

          </div>

        </div>
      </main>

      {/* Partners Section */}
      <section className="border-y border-[#e5e7eb] bg-gray-50 py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-sm font-[700] text-[#6b7280] tracking-widest uppercase mb-8">Integrated with Industry Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Agritech Co.', 'FarmOS', 'CropData', 'SoilSense', 'YieldMax'].map((partner, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xl font-[800] text-[#111827]">
                <LeafIcon className="w-5 h-5 text-[#1a7a3c] grayscale-0" />
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Render the extracted Landing Sections (Features, Pricing, Docs, Support, Footer) */}
      <LandingSections />

      {/* Render the Global Chatbot inside the landing page */}
      <Chatbot />
      
    </div>
  );
}

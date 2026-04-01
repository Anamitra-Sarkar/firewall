import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import ParticleCanvas from '../components/ParticleCanvas';

const features = [
  {
    icon: '⚡',
    title: 'Real-Time Detection',
    description: 'AI-powered threat analysis blocking malicious domains the moment they appear.',
  },
  {
    icon: '🔒',
    title: 'Zero Trust Architecture',
    description: 'Device trust scores and behavioral biometrics enforce strict access control.',
  },
  {
    icon: '🛡️',
    title: 'Privacy First',
    description: 'Only domain names are stored. Never page content, never passwords.',
  },
  {
    icon: '🤝',
    title: 'Federated Learning',
    description: 'Collaborative threat intelligence — no raw data ever leaves your device.',
  },
  {
    icon: '⚙️',
    title: 'Custom Firewall Rules',
    description: 'Define your own security policies with an intuitive drag-and-drop interface.',
  },
  {
    icon: '🌐',
    title: 'Dark Web Monitoring',
    description: 'Live threat feeds updated in real-time so you\'re always one step ahead.',
  },
];

const steps = [
  { step: '01', title: 'Install Extension', description: 'One-click Chrome extension — no setup, no config.' },
  { step: '02', title: 'Create Account',    description: 'Free account setup. No credit card required.' },
  { step: '03', title: 'Get Protected',     description: 'Real-time threat blocking kicks in immediately.' },
  { step: '04', title: 'Dashboard Insights', description: 'See every blocked threat, trend and analytics.' },
];

export default function Landing() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleDownload = async () => {
    try {
      const res  = await fetch('/api/v1/extension/download');
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = 'ai-ngfw-extension-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setShowInstructions(true);
    } catch (e) {
      console.error(e);
      alert('Failed to download. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ position: 'relative' }}>

      {/* Particle background */}
      <ParticleCanvas />

      {/* Page content above canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="AI-NGFW logo">
                <rect width="28" height="28" rx="7" fill="#06b6d4"/>
                <path d="M7 21 L14 7 L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M9.5 16.5 L18.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-bold tracking-tight text-slate-900">AI-NGFW</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features"    className="hover:text-slate-900 transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors duration-200">How It Works</a>
              <a href="#install"     className="hover:text-slate-900 transition-colors duration-200">Install</a>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                Sign In
              </Link>
              <button
                onClick={handleDownload}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                Add to Chrome
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Toggle menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {mobileMenuOpen
                    ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    : <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 px-6 py-4 space-y-3 animate-slide-down bg-white/95 backdrop-blur-md">
              {['#features','#how-it-works','#install'].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {['Features','How It Works','Install'][i]}
                </a>
              ))}
              <Link to="/login" className="block text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors">Sign In →</Link>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section id="hero" className="max-w-7xl mx-auto px-6 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-semibold text-cyan-700 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full inline-block"></span>
            AI-Powered Browser Security
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-up delay-100">
            Intelligence-Driven<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500">Firewall</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            Real-time threat detection and blocking.
            Privacy-first. No data sold. Ever.
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-fade-up delay-300">
            <button
              onClick={handleDownload}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Add to Chrome — It's Free
            </button>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              View Dashboard →
            </Link>
          </div>

          {/* Floating stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-up delay-400">
            {[['10M+','Threats Blocked'],['99.9%','Uptime'],['0','Data Sold']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-slate-900">{val}</p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3">What We Offer</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Powerful Security Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white/70 backdrop-blur-sm border border-slate-100 hover:border-cyan-200 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="bg-slate-50/70 backdrop-blur-sm py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3">Simple Setup</p>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {steps.map((s, i) => (
                <div key={i} className="relative text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-cyan-200 to-slate-200" />
                  )}
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTALL ── */}
        <section id="install" className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3">Get Started</p>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">One-Click Install</h2>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/60">
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mb-6"
              >
                ⬇ Download Extension
              </button>

              {showInstructions && (
                <div className="animate-scale-in space-y-3 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">Sideload Instructions</p>
                  {[
                    'Unzip the downloaded file',
                    'Open Chrome → chrome://extensions',
                    'Enable Developer Mode (top right)',
                    'Click Load unpacked → select unzipped folder',
                    '✓ Done! Extension appears in your toolbar',
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <span className="flex-shrink-0 w-5 h-5 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            {/* decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <h2 className="relative text-3xl md:text-4xl font-extrabold mb-4">Ready to Protect Your Browser?</h2>
            <p className="relative text-white/80 text-base mb-8 max-w-md mx-auto">
              Create your free account. No credit card. No data sold. Ever.
            </p>
            <div className="relative flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white text-cyan-600 font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free →
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300"
              >
                Sign In →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-100 bg-white/80 backdrop-blur-sm py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-10 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="7" fill="#06b6d4"/>
                    <path d="M7 21 L14 7 L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M9.5 16.5 L18.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-bold text-slate-900">AI-NGFW</span>
                </div>
                <p className="text-xs text-slate-400">Intelligence-driven security for the modern web.</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
                  <li><a href="#install"  className="hover:text-slate-900 transition-colors">Install</a></li>
                  <li><a href="#docs"     className="hover:text-slate-900 transition-colors">Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="https://github.com/Anamitra-Sarkar/firewall" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a></li>
                  <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a></li>
                  <li><a href="#"        className="hover:text-slate-900 transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
              © 2025 AI-NGFW. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

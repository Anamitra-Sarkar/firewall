import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function Landing() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [showSideloadInstructions, setShowSideloadInstructions] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleDownloadExtension = async () => {
    try {
      const response = await fetch('/api/v1/extension/download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-ngfw-extension-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show sideload instructions after download
      setShowSideloadInstructions(true);
    } catch (error) {
      console.error('Failed to download extension:', error);
      alert('Failed to download extension. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-cyan-400">AI-NGFW</div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-neutral-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-neutral-300 hover:text-white transition">How It Works</a>
            <a href="#install" className="text-neutral-300 hover:text-white transition">Install</a>
            <a href="#docs" className="text-neutral-300 hover:text-white transition">Docs</a>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/login"
              className="px-6 py-2 text-neutral-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <button
              onClick={handleDownloadExtension}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition"
            >
              Add to Chrome
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Intelligence-Driven  <span className="text-cyan-400">Firewall</span>
        </h1>
        <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
          Real-time threat detection and blocking. Privacy-first. No data sold. Ever.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleDownloadExtension}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            Add to Chrome — It's Free
          </button>
          <Link
            to="/login"
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition border border-neutral-700"
          >
            View Dashboard →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">Powerful Security Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Real-Time Detection',
              description: 'AI-powered threat analysis blocking malicious domains instantly'
            },
            {
              title: 'Zero Trust Architecture',
              description: 'Device trust scores and behavioral biometrics for access control'
            },
            {
              title: 'Privacy First',
              description: 'Only domain names stored, never page content or passwords'
            },
            {
              title: 'Federated Learning',
              description: 'Collaborative threat intelligence without sharing raw data'
            },
            {
              title: 'Custom Firewall Rules',
              description: 'Define your own security policies with an intuitive interface'
            },
            {
              title: 'Dark Web Monitoring',
              description: 'Threat intelligence from multiple feeds, updated in real-time'
            },
          ].map((feature, idx) => (
            <div key={idx} className="bg-neutral-800 p-8 rounded-lg border border-neutral-700 hover:border-cyan-600/50 transition">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">How It Works</h2>
        <div className="space-y-8 max-w-2xl mx-auto">
          {[
            { step: 1, title: 'Install Extension', description: 'One-click Chrome extension installation' },
            { step: 2, title: 'Create Account', description: 'Free account setup - no credit card required' },
            { step: 3, title: 'Get Protected', description: 'Real-time threat blocking as you browse' },
            { step: 4, title: 'Dashboard Insights', description: 'View all detected threats and analytics' },
          ].map((item) => (
            <div key={item.step} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Install Section */}
      <section id="install" className="bg-neutral-800/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Get Started</h2>
          <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8">Download & Install</h3>
            <button
              onClick={handleDownloadExtension}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-lg transition mb-8"
            >
              Download Extension
            </button>

            {showSideloadInstructions && (
              <div className="space-y-4 bg-neutral-800/50 p-6 rounded-lg border border-neutral-700">
                <p className="font-semibold text-cyan-400">Sideload Instructions:</p>
                {[
                  'Unzip the downloaded file',
                  'Open Chrome and go to chrome://extensions',
                  'Enable "Developer Mode" (top right)',
                  'Click "Load unpacked" and select the unzipped folder',
                  'Done! Extension will appear in your toolbar'
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="bg-cyan-600 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-neutral-300">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Protect Your Browser?</h2>
        <p className="text-xl text-neutral-400 mb-8">Create your free account. No credit card. No data sold. Ever.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/register"
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            Get Started Free →
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition border border-neutral-700"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-bold mb-4">AI-NGFW</h4>
              <p className="text-sm text-neutral-400">Intelligence-driven security for the modern web.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#docs" className="hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="/privacy" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
            <p>&copy; 2024 AI-NGFW. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

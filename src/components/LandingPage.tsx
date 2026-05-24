import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  ArrowRight, 
  Database, 
  Calculator, 
  Truck, 
  ChevronRight,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onLoginWithGoogle: () => void;
  onTryPlayground: () => void;
  isAuthenticating: boolean;
}

export default function LandingPage({
  onLoginWithGoogle,
  onTryPlayground,
  isAuthenticating
}: LandingPageProps) {
  return (
    <div id="landing-container" className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      
      {/* Dynamic Background Mesh Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/[0.07] dark:bg-blue-500/[0.08] rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-15%] w-[600px] h-[600px] bg-emerald-500/[0.07] dark:bg-emerald-500/[0.08] rounded-full blur-[120px]" />
      </div>

      {/* Top Header Logo Row */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 w-full h-20 flex items-center justify-between border-b border-slate-200/40 dark:border-white/5 bg-white/30 dark:bg-[#080c14]/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white dark:bg-[#0a0f1d] rounded-lg shadow-lg border border-slate-200/50 dark:border-white/10 flex items-center justify-center">
            <img 
              src="https://res.cloudinary.com/afmdjango/image/upload/v1779633801/taiwoadegite_logo_witron.png" 
              alt="FleetVest Logo" 
              referrerPolicy="no-referrer" 
              className="w-7 h-7 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase text-slate-850 dark:text-white tracking-wider leading-none">
              FleetVest
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              INSTITUTIONAL MODELING
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onTryPlayground}
            this-id="landing-header-sandbox-btn"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Playground Demo
          </button>
          <button
            onClick={onLoginWithGoogle}
            disabled={isAuthenticating}
            this-id="landing-header-login-btn"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 border-none rounded-lg text-xs font-bold tracking-wide transition shadow-sm cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Core Hero Content Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col items-center justify-center w-full">
        
        {/* Safe Badge Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-705 dark:text-cyan-305 text-[10px] font-bold tracking-wider uppercase border border-cyan-500/20 mb-6 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cloud Sandbox Active • Google Locked</span>
        </div>

        {/* Big Displays Display Typography */}
        <div className="text-center max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Advanced Transit Yield &{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              Portfolio Modeling Suite
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Configure, optimize, and simulate opex patterns for professional transport investments. Track long-term Operational ROI, holdings-period IRR, and MOIC payouts with cloud-synced accounts.
          </p>
        </div>

        {/* Visual Call To Action Block */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full max-w-md justify-center">
          <button
            id="google-login-hero-btn"
            onClick={onLoginWithGoogle}
            disabled={isAuthenticating}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {isAuthenticating ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.76-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
            )}
            <span>Access Cloud Suite</span>
          </button>

          <button
            id="playground-hero-btn"
            onClick={onTryPlayground}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-205 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Try Sandbox Local Demo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Grid Bento Showcasing Local Operational Reality */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-16 md:mt-24">
          
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-60" />
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-4">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
              Algorithmic Local Opex Solvers
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
              Factor in the ground opex and daily tickets: driver monthly wages, Daily state ticket levies, insurance premiums, and localized maintenance rates calculated precisely.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600 opacity-60" />
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl w-fit mb-4">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
              Dynamic Investor Equity Contracts
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
              Model co-invested capital. Distribute periodic dividend yields fairly according to fixed rent policies or equity contribution splits automatically.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-600 opacity-60" />
            <div className="p-3 bg-cyan-500/10 text-cyan-605 dark:text-cyan-400 rounded-xl w-fit mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans">
              Crytographically Isolated Storage
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
              Logging in with Google binds all custom presets, transit templates, images, and calculations to your private database partition under Firestore isolation parameters.
            </p>
          </div>

        </div>

      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 border-t border-slate-200/40 dark:border-white/5 bg-white/10 dark:bg-black/10 py-6 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 space-y-3 sm:space-y-0 text-center">
          <p>© 2026 FleetVest Inc. Advanced multi-year transit asset dividend simulations.</p>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>GDPR Compliant Google Authentication Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

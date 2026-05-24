/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingDown,
  Coins,
  ShieldCheck,
  Scale,
  Truck,
  Database,
  Calculator,
  HelpCircle,
  CloudLightning,
  LogOut,
  User,
  Lock,
  CheckCircle,
  XCircle,
  Info,
  X
} from 'lucide-react';
import { Vehicle } from './types';
import ThemeToggle from './components/ThemeToggle';
import DashboardTab from './components/DashboardTab';
import PortfolioTab from './components/PortfolioTab';
import FinancialsTab from './components/FinancialsTab';
import LandingPage from './components/LandingPage';

// Firebase imports
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './utils/firebase';

// Dynamic professional preset assets so the fleet starts populated with beautiful investment models in Naira (₦)
const DEFAULTS_FLEET: Vehicle[] = [
  {
    id: 'preset-danfo-01',
    name: 'Lagos Highway Danfo #12',
    type: 'Danfo (16-Seater Bus)',
    purchasePrice: 9500000,
    annualDepreciationRate: 18,
    expectedMaintenanceMonthly: 85000,
    fuelPriceRate: 120,
    insurancePremiumMonthly: 15000,
    annualDistanceMiles: 32000,
    monthlyRevenue: 1200000,
    inflationRate: 12,
    dividendPayoutRate: 50,
    imageOption: 'asis',
    originalImage: null,
    processedImage: null,
    createdAt: new Date().toISOString(),
    salvageValuePercent: 15,
    driverMonthlySalary: 150000,
    leviesAndTaxesMonthly: 180000,
    investorSharePercent: 30,
    rentalTenorYears: 5,
    fixedDailyRent: 18000,
    passOpexToRenter: true,
    fuelConsumptionDaily: 35,
    fuelPricePerLiter: 1100,
    activeDaysPerYear: 312,
  },
  {
    id: 'preset-korope-02',
    name: 'Ikorodu Korope Shuttler',
    type: 'Korope (6-Seater Bus)',
    purchasePrice: 4500000,
    annualDepreciationRate: 20,
    expectedMaintenanceMonthly: 40000,
    fuelPriceRate: 80,
    insurancePremiumMonthly: 8000,
    annualDistanceMiles: 28000,
    monthlyRevenue: 650000,
    inflationRate: 12,
    dividendPayoutRate: 50,
    imageOption: 'nobg',
    originalImage: null,
    processedImage: null,
    createdAt: new Date().toISOString(),
    salvageValuePercent: 12,
    driverMonthlySalary: 100005, // 100k roughly
    leviesAndTaxesMonthly: 90000, // Roughly 3k daily union dues
    investorSharePercent: 40,
    rentalTenorYears: 3,
    fixedDailyRent: 10000,
    passOpexToRenter: true,
    fuelConsumptionDaily: 20,
    fuelPricePerLiter: 1100,
    activeDaysPerYear: 312,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inputs' | 'financials'>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [isDark, setIsDark] = useState(false);

  // Stateful toast engine for immediate physical feedback on actions
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  // Authentication & Sync State variables
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [explorePlayground, setExplorePlayground] = useState(false);

  // 1. Listen to active Firebase auth state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    // Read stored theme preference
    const savedTheme = localStorage.getItem('transport_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    return () => unsubscribe();
  }, []);

  // 2. Synchronize vehicles in real-time depending on Guest or Google-Authenticated cloud state
  useEffect(() => {
    if (!user) {
      // Local Guest storage load
      const rawSaved = localStorage.getItem('transport_fleet_portfolio');
      if (rawSaved) {
        try {
          setVehicles(JSON.parse(rawSaved));
        } catch (err) {
          console.warn('Unable to load localStorage assets.', err);
          setVehicles(DEFAULTS_FLEET);
        }
      } else {
        setVehicles(DEFAULTS_FLEET);
      }
      return;
    }

    // Google Synced Cloud Store logic with auto-onboarding progress backup
    const path = `users/${user.uid}/vehicles`;
    const unsubSnap = onSnapshot(
      collection(db, 'users', user.uid, 'vehicles'),
      async (snapshot) => {
        const cloudList: Vehicle[] = [];
        snapshot.forEach((doc) => {
          cloudList.push(doc.data() as Vehicle);
        });
        cloudList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // If newly registered cloud collection is empty, sync their local progress onto firestore automatically so progress isn't wiped out!
        if (cloudList.length === 0) {
          const rawSaved = localStorage.getItem('transport_fleet_portfolio');
          let toCopy = DEFAULTS_FLEET;
          if (rawSaved) {
            try { toCopy = JSON.parse(rawSaved); } catch (e) {}
          }
          setVehicles(toCopy);

          toCopy.forEach(async (v) => {
            const cloudV = { ...v, userId: user.uid };
            try {
              await setDoc(doc(db, 'users', user.uid, 'vehicles', v.id), cloudV);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `${path}/${v.id}`);
            }
          });
        } else {
          setVehicles(cloudList);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubSnap; // Hand off clean subscription callback
  }, [user]);

  // Sync state changes to storage for Guest Mode
  const syncVehicles = (newFleet: Vehicle[]) => {
    setVehicles(newFleet);
    localStorage.setItem('transport_fleet_portfolio', JSON.stringify(newFleet));
  };

  const handleAddVehicle = async (newVehicle: Vehicle) => {
    if (user) {
      const cloudV = { ...newVehicle, userId: user.uid };
      const docPath = `users/${user.uid}/vehicles/${newVehicle.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'vehicles', newVehicle.id), cloudV);
        showToast(`Asset "${newVehicle.name}" synced to your encrypted Cloud!`, 'success');
      } catch (err) {
        showToast(`Failed to upload asset. Error logged.`, 'error');
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    } else {
      const updated = [newVehicle, ...vehicles];
      syncVehicles(updated);
      showToast(`Asset "${newVehicle.name}" added to local Sandbox!`, 'success');
    }
    setActiveTab('dashboard'); // route back to dashboard automatically for positive feedback
  };

  const handleDeleteVehicle = async (id: string) => {
    const assetObj = vehicles.find((v) => v.id === id);
    const nameLabel = assetObj ? assetObj.name : 'Asset';
    if (user) {
      const docPath = `users/${user.uid}/vehicles/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'vehicles', id));
        showToast(`Asset "${nameLabel}" deleted from Cloud.`, 'info');
      } catch (err) {
        showToast(`Failed to delete asset. Error logged.`, 'error');
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      const updated = vehicles.filter((v) => v.id !== id);
      syncVehicles(updated);
      showToast(`Asset "${nameLabel}" deleted from Sandbox.`, 'info');
    }
    if (selectedVehicleId === id) {
      setSelectedVehicleId('all');
    }
  };

  const handleUpdateVehicle = async (updated: Vehicle) => {
    if (user) {
      const cloudV = { ...updated, userId: user.uid };
      const docPath = `users/${user.uid}/vehicles/${updated.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'vehicles', updated.id), cloudV);
        showToast(`Asset "${updated.name}" updated in Cloud.`, 'success');
      } catch (err) {
        showToast(`Failed to edit asset. Error logged.`, 'error');
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      }
    } else {
      const nextFleet = vehicles.map((v) => (v.id === updated.id ? updated : v));
      syncVehicles(nextFleet);
      showToast(`Asset "${updated.name}" updated in Sandbox.`, 'success');
    }
  };

  const handleLoginWithGoogle = async () => {
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setExplorePlayground(false); // straight to workspace
      showToast('Authenticated! Logged into your isolated Firebase session.', 'success');
    } catch (err) {
      console.error('Google authorization failed:', err);
      showToast('Google login canceled or failed.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setExplorePlayground(false);
      setSelectedVehicleId('all');
      showToast('Signed out of cloud. Guest Sandbox restored.', 'info');
    } catch (err) {
      console.error('Signout failed:', err);
    }
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('transport_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('transport_theme', 'light');
    }
  };

  // Render full page auth loader for smooth state changes
  if (loadingAuth) {
    return (
      <div id="auth-loader" className="min-h-screen bg-slate-50 dark:bg-[#080c14] flex flex-col justify-center items-center space-y-4">
        <div className="p-3 bg-white dark:bg-[#0a0f1d] rounded-2xl shadow-2xl border border-slate-200/50 dark:border-white/10 animate-bounce">
          <img 
            src="https://res.cloudinary.com/afmdjango/image/upload/v1779633801/taiwoadegite_logo_witron.png" 
            alt="FleetVest Logo" 
            referrerPolicy="no-referrer"
            className="w-12 h-12 object-contain" 
          />
        </div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          Verifying Encrypted Keys...
        </p>
      </div>
    );
  }

  // Render beautiful informational landing page unless logged in or explicit playground bypass chosen
  if (!user && !explorePlayground) {
    return (
      <LandingPage
        onLoginWithGoogle={handleLoginWithGoogle}
        onTryPlayground={() => setExplorePlayground(true)}
        isAuthenticating={isAuthenticating}
      />
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#080c14] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* Dynamic Sandbox Guest Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500/10 dark:to-amber-600/10 dark:border-b dark:border-amber-500/20 text-white dark:text-amber-300 py-2.5 px-4 text-center text-xs font-bold font-sans tracking-wide relative z-50 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>⚠️ Guest Sandbox • All vehicle models are temporarily persisted in local storage.</span>
          <button
            onClick={handleLoginWithGoogle}
            className="sm:ml-2 bg-white text-slate-900 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 px-3 py-1 text-[10px] font-black tracking-wider uppercase border-none rounded hover:bg-slate-100 transition shadow cursor-pointer"
          >
            Backup to Cloud
          </button>
        </div>
      )}

      {/* Background lights/glow blurs for Frosted Glass theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-cyan-500/8 dark:bg-blue-500/10 rounded-full blur-[100px] sm:blur-[140px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER CONTROLS BAR */}
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#080c14]/70 backdrop-blur-2xl border-b border-slate-250/20 dark:border-white/5 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            
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
                <h1 className="text-sm font-black uppercase text-slate-850 dark:text-white tracking-wider flex items-center gap-1.5 leading-none">
                  FleetVest
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none flex items-center gap-1">
                  {user ? (
                    <>
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>Cloud Isolated ({user.email?.toLowerCase()})</span>
                    </>
                  ) : (
                    <span>Transportation Yield & Portfolio Modeling</span>
                  )}
                </p>
              </div>
            </div>

            {/* Nav Links for 3 pages */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                id="nav-dash"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-705 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-650 dark:text-cyan-400" />
                Summary Dashboard
              </button>

              <button
                id="nav-financials"
                onClick={() => setActiveTab('financials')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'financials'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-750 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
                Detailed Financials
              </button>

              <button
                id="nav-inputs"
                onClick={() => setActiveTab('inputs')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'inputs'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-705 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Acquire Assets Form
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Profile Avatar / Logout trigger */}
              {user ? (
                <div className="flex items-center gap-2 border-l border-slate-200/55 dark:border-white/5 pl-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User Avatar" 
                      onClick={handleLogout}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full cursor-pointer hover:opacity-80 transition object-cover border border-slate-200/50 dark:border-white/10"
                      title="Click to sign out"
                    />
                  ) : (
                    <div 
                      onClick={handleLogout}
                      className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-550 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 transition"
                      title="Click to sign out"
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer bg-transparent border-none"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginWithGoogle}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border-none rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Cloud Sign In
                </button>
              )}

              {/* Dark/Light mode toggle */}
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>
        </header>

        {/* MOBILE NAV BAR */}
        <div className="md:hidden sticky top-[64px] z-40 bg-white/45 dark:bg-[#05070a]/45 backdrop-blur-xl border-b border-slate-250/50 dark:border-white/5 flex items-center justify-around py-2 shadow-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'dashboard' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-405'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5 text-cyan-500" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'financials' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-405'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5 text-emerald-500" />
            Detailed Financials
          </button>
          <button
            onClick={() => setActiveTab('inputs')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'inputs' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-405'
            }`}
          >
            <PlusCircle className="w-4 h-4 mb-0.5 text-cyan-500" />
            Acquire Asset
          </button>
        </div>

        {/* CORE FRAME CONTAINER: Centered with max-width limits to avoid ultra-wide stretching */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full z-10">
          
          {/* TAB SWITCHBOARD VIEW WITH FADE INTRANSITIONS */}
          <div className="animate-fade-in duration-300">
            {activeTab === 'dashboard' && (
              <DashboardTab
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicleId={setSelectedVehicleId}
                onUpdateVehicle={handleUpdateVehicle}
                onNavigateToInputs={() => setActiveTab('inputs')}
              />
            )}

            {activeTab === 'inputs' && (
              <PortfolioTab
                vehicles={vehicles}
                onAddVehicle={handleAddVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            )}

            {activeTab === 'financials' && (
              <FinancialsTab
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicleId={setSelectedVehicleId}
                onUpdateVehicle={handleUpdateVehicle}
              />
            )}
          </div>
        </main>

        {/* FOOTER BAR */}
        <footer className="border-t border-slate-200/50 dark:border-white/5 bg-white/45 dark:bg-[#05070a]/45 backdrop-blur-xl mt-16 font-sans">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 space-y-3 md:space-y-0">
            <p>© 2026 FleetVest. All investment models are compounding forecast projections.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-500" />
                Inflation-Adjusted TCO Analysis
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                Complies with GAAP and IAS Standards
              </span>
            </div>
          </div>
        </footer>

        {/* Sleek Floating Toast Component for Direct Operational Feedback */}
        {toast && (
          <div 
            id="toast-notification"
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4.5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border font-sans transition-all duration-300 max-w-sm ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/5'
                : toast.type === 'error'
                ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-500/30 shadow-rose-500/5'
                : 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-500/30 shadow-blue-500/5'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
            
            <p className="text-xs font-bold leading-snug">{toast.message}</p>
            
            <button 
              onClick={() => setToast(null)}
              className="ml-auto hover:opacity-75 transition text-slate-400 dark:text-slate-500 focus:outline-none bg-transparent border-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

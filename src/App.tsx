import { useCallback, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { BootSequence, GridBackground } from './components/Hud';
import { Navbar } from './components/Navbar';
import { AtlasPage } from './pages/AtlasPage';
import { ClassifierPage, ConnectomePage, MethodsPage } from './pages/OtherPages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [pathname]);
  return null;
}

const BOOT_KEY = 'neuroatlas-booted';

function readBooted(): boolean {
  try {
    return sessionStorage.getItem(BOOT_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [booting, setBooting] = useState(() => !readBooted());
  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* storage unavailable; boot just replays next time */
    }
    setBooting(false);
  }, []);

  return (
    <HashRouter>
      <ScrollToTop />
      <AnimatePresence>{booting && <BootSequence key="boot" onComplete={finishBoot} />}</AnimatePresence>
      <GridBackground />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        <Routes>
          <Route path="/" element={<AtlasPage />} />
          <Route path="/classifier" element={<ClassifierPage />} />
          <Route path="/connectome" element={<ConnectomePage />} />
          <Route path="/methods" element={<MethodsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-cyber/20 py-6 text-center font-mono text-[10px] tracking-widest text-cyber/40">
        WIC TEAM 2 // NEURO.ATLAS // EDUCATIONAL USE ONLY, NOT MEDICAL ADVICE
      </footer>
    </HashRouter>
  );
}

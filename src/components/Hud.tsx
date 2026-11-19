import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

/** Panel with glowing corner brackets, matching the portfolio's SciFiPanel. */
export function SciFiPanel({
  children,
  className = '',
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const lift = hover
    ? 'hover:-translate-y-0.5 hover:bg-panel/50 hover:border-cyber/70 hover:shadow-[0_0_28px_rgba(0,243,255,0.3)]'
    : '';
  const corner = 'absolute w-5 h-5 border-cyber transition-transform duration-300 group-hover:scale-125';
  return (
    <div
      className={`group relative bg-panel/40 border border-cyber/35 shadow-[0_0_15px_rgba(0,243,255,0.12)] backdrop-blur-sm transition-all duration-300 ${lift} ${className}`}
    >
      <span className={`${corner} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${corner} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyber/5 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function SectionHeading({ children, icon: Icon, sub }: { children: ReactNode; icon: LucideIcon; sub?: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-cyber bg-cyber/10 shadow-[0_0_10px_rgba(0,243,255,0.3)]">
        <span className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-cyber" />
        <span className="absolute -right-1 -bottom-1 h-2 w-2 border-r border-b border-cyber" />
        <Icon className="h-6 w-6 text-cyber" />
      </div>
      <div className="min-w-0">
        <h1 className="glow-text text-2xl font-bold tracking-widest text-white uppercase md:text-3xl">{children}</h1>
        {sub && <p className="mt-1 font-mono text-xs tracking-widest text-cyber/60">{sub}</p>}
      </div>
      <div className="ml-4 hidden flex-1 items-center gap-2 sm:flex">
        <div className="h-px flex-1 bg-gradient-to-r from-cyber to-transparent" />
        <div className="h-2 w-2 rounded-full bg-cyber shadow-[0_0_8px_#00f3ff]" />
      </div>
    </div>
  );
}

/** Small mono label used throughout the HUD. */
export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-[10px] tracking-[0.2em] text-cyber/60 uppercase ${className}`}>{children}</span>;
}

/** Cyan grid that drifts with the mouse, plus a breathing glow. */
export function GridBackground() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) =>
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-20 transition-transform duration-700 ease-out"
        style={{
          backgroundColor: '#03101c',
          backgroundImage:
            'linear-gradient(rgba(0,243,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: `translate(${pos.x}px, ${pos.y}px) scale(1.05)`,
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(0,243,255,0.08) 0%, transparent 70%)' }}
      />
    </>
  );
}

const BOOT_LINES = [
  'INITIALIZING NEUROSCAN v0.1...',
  'CALIBRATING GRADIENT COILS...',
  'LOADING ATLAS: 15 REGIONS OF INTEREST...',
  'MOUNTING PATHOLOGY LAYERS [AD | PD | ALS | HD]...',
  'SCANNER READY.',
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= BOOT_LINES.length) {
      const t = setTimeout(onComplete, 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 240);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px) brightness(2)' }}
      transition={{ duration: 0.5, ease: 'easeIn' }}
      className="fixed inset-0 z-[9999] flex cursor-pointer flex-col justify-center bg-[#020b12] px-8 font-mono text-sm md:px-24 md:text-base"
      onClick={onComplete}
    >
      {BOOT_LINES.slice(0, count).map((line, i) => {
        const last = i === BOOT_LINES.length - 1;
        return (
          <div key={line} className={last ? 'mt-4 animate-pulse font-bold text-cyber' : 'text-soft/70'}>
            {last ? '' : '> '}
            {line}
          </div>
        );
      })}
      <div className="mt-2 h-5 w-3 animate-pulse bg-cyber" />
      <div className="mt-10 text-[10px] tracking-widest text-cyber/30">CLICK TO SKIP</div>
    </motion.div>
  );
}

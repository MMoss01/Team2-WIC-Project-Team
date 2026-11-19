import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Github } from 'lucide-react';

const LINKS = [
  { name: 'ATLAS', path: '/' },
  { name: 'MRI_CLASSIFIER', path: '/classifier' },
  { name: 'CONNECTOME', path: '/connectome' },
  { name: 'METHODS', path: '/methods' },
];

const REPO = 'https://github.com/MMoss01/Team2-WIC-Project-Team';

export function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `transition-all duration-300 hover:text-cyber hover:drop-shadow-[0_0_8px_#00f3ff] ${
      pathname === path ? 'text-cyber border-b border-cyber pb-1' : ''
    }`;

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-cyber/30 bg-ink/90 shadow-[0_0_20px_rgba(0,243,255,0.1)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="relative flex h-8 w-8 items-center justify-center border border-cyber bg-cyber/20">
            <Brain className="h-5 w-5 text-cyber" />
            <div className="absolute inset-0 animate-ping bg-cyber opacity-20" />
          </div>
          <span className="font-mono text-lg font-bold tracking-widest text-white" style={{ textShadow: '0 0 8px #00f3ff' }}>
            NEURO.ATLAS
          </span>
        </Link>

        <div className="hidden items-center gap-8 font-mono text-xs tracking-widest text-cyber/60 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.path} to={l.path} className={linkClass(l.path)}>
              [{l.name}]
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 text-cyber">
          <span className="mr-2 hidden items-center gap-2 font-mono text-[10px] tracking-widest text-cyber/60 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            WIC // TEAM_2
          </span>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="rounded border border-transparent p-2 transition-all hover:border-cyber/50 hover:bg-cyber/10"
          >
            <Github className="h-5 w-5" />
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="ml-1 flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-5 bg-cyber transition-all duration-300 ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-px w-5 bg-cyber transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-cyber transition-all duration-300 ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-cyber/20 bg-ink/95 px-6 py-4 font-mono text-xs tracking-widest text-cyber/70 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className={linkClass(l.path)}>
              [{l.name}]
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

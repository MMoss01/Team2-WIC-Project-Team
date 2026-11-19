import { useRef, useState, type MouseEvent } from 'react';
import { OUTLINE, REGIONS, REGION_BY_ID, SULCI, type Region, type RegionId, type Shape } from '../data/regions';
import { burden, heatColor, type Disease } from '../data/diseases';

const W = 600;
const H = 440;

interface Props {
  disease: Disease | null;
  stage: number;
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}

function ShapeEl({ shape, ...rest }: { shape: Shape } & React.SVGProps<SVGPathElement & SVGEllipseElement>) {
  if (shape.kind === 'path') return <path d={shape.d} {...rest} />;
  const { cx, cy, rx, ry, rotate } = shape;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined} {...rest} />;
}

/** Grayscale "tissue" tone, so the brain reads like a T1 scan before any overlay. */
function tissueFill(r: Region): string {
  if (r.deep) return 'rgba(140, 180, 195, 0.16)';
  if (r.group === 'Brainstem') return '#1d2c34';
  if (r.id === 'cerebellum') return '#1a2830';
  return '#203039';
}

export function ScanViewport({ disease, stage, selected, onSelect }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ px: number; py: number; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    setCursor({ px, py, x: Math.round((px / box.width) * W), y: Math.round((py / box.height) * H) });
  };

  const hoverRegion = hovered ? REGION_BY_ID[hovered] : null;
  const ordered = [...REGIONS.filter((r) => !r.deep), ...REGIONS.filter((r) => r.deep)];

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setCursor(null);
        setHovered(null);
      }}
      className="relative aspect-[600/440] w-full cursor-crosshair overflow-hidden border border-cyber/40 bg-[#00070b] shadow-[inset_0_0_60px_rgba(0,243,255,0.06),0_0_20px_rgba(0,243,255,0.12)]"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="group" aria-label="Schematic left-lateral brain scan">
        <defs>
          <filter id="heat-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="edge-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Ruler ticks */}
        <g stroke="#00f3ff" strokeOpacity="0.35">
          {Array.from({ length: 31 }, (_, i) => (
            <line key={`x${i}`} x1={i * 20} y1={H} x2={i * 20} y2={H - (i % 5 === 0 ? 10 : 5)} />
          ))}
          {Array.from({ length: 23 }, (_, i) => (
            <line key={`y${i}`} x1={0} y1={i * 20} x2={i % 5 === 0 ? 10 : 5} y2={i * 20} />
          ))}
        </g>

        {/* Skull-ish halo */}
        <path d={OUTLINE} fill="none" stroke="#9fdfee" strokeOpacity="0.18" strokeWidth="16" filter="url(#edge-glow)" />

        {ordered.map((r) => {
          const b = disease ? burden(disease, r.id, stage) : 0;
          const isSel = r.id === selected;
          const isHov = r.id === hovered;
          return (
            <ShapeEl
              key={r.id}
              shape={r.shape}
              role="button"
              tabIndex={0}
              aria-label={`${r.name}${b > 0 ? ', affected' : ''}`}
              aria-pressed={isSel}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(r.id);
                }
              }}
              fill={tissueFill(r)}
              stroke={isSel || isHov ? '#00f3ff' : r.deep ? 'rgba(160,220,235,0.55)' : 'rgba(160,220,235,0.35)'}
              strokeWidth={isSel ? 2.2 : isHov ? 1.6 : 0.9}
              strokeDasharray={r.deep ? '4 3' : undefined}
              className="outline-none transition-[stroke] duration-300 focus-visible:stroke-[#00f3ff]"
            />
          );
        })}

        <g fill="none" stroke="#9fdfee" strokeOpacity="0.16" strokeWidth="1.2" pointerEvents="none">
          {SULCI.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* PET-style heat overlay: translucent and additive, so anatomy shows through. */}
        <g pointerEvents="none" style={{ mixBlendMode: 'screen' }}>
          {ordered.map((r) => {
            const b = disease ? burden(disease, r.id, stage) : 0;
            return (
              <ShapeEl
                key={r.id}
                shape={r.shape}
                fill={heatColor(Math.max(b, 0.01))}
                fillOpacity={b > 0 ? 0.32 + 0.4 * b : 0}
                filter="url(#heat-glow)"
                className="transition-[fill,fill-opacity] duration-700"
              />
            );
          })}
        </g>

        {/* Selected-region marker */}
        {(() => {
          const r = REGION_BY_ID[selected];
          const [ax, ay] = r.anchor;
          return (
            <g pointerEvents="none">
              <circle cx={ax} cy={ay} r="5" fill="#00f3ff" />
              <circle cx={ax} cy={ay} r="5" fill="none" stroke="#00f3ff" strokeWidth="1.5">
                <animate attributeName="r" values="5;18" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <line x1={ax} y1={ay} x2={ax + 26} y2={ay - 26} stroke="#00f3ff" strokeWidth="1" />
              <text x={ax + 30} y={ay - 30} fill="#00f3ff" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700">
                {r.code}
              </text>
            </g>
          );
        })()}

        <rect width={W} height={H} fill="url(#vignette)" pointerEvents="none" />
      </svg>

      {/* Texture and scanline */}
      <div className="scan-lines pointer-events-none absolute inset-0" />
      <div className="scan-grain pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] animate-scan bg-gradient-to-b from-transparent via-cyber/15 to-transparent">
        <div className="absolute inset-x-0 bottom-1/2 h-px bg-cyber/60 shadow-[0_0_8px_#00f3ff]" />
      </div>

      {/* Crosshair */}
      {cursor && (
        <>
          <div className="pointer-events-none absolute inset-y-0 w-px bg-cyber/25" style={{ left: cursor.px }} />
          <div className="pointer-events-none absolute inset-x-0 h-px bg-cyber/25" style={{ top: cursor.py }} />
        </>
      )}

      {/* Hover tooltip */}
      {cursor && hoverRegion && (
        <div
          className="pointer-events-none absolute z-10 border border-cyber/60 bg-ink/90 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-cyber shadow-[0_0_12px_rgba(0,243,255,0.3)]"
          style={{
            left: Math.min(cursor.px + 14, (wrap.current?.clientWidth ?? 0) - 170),
            top: cursor.py + 14,
          }}
        >
          <span className="text-white">{hoverRegion.code}</span> // {hoverRegion.name}
        </div>
      )}

      {/* DICOM-style overlay text */}
      <div className="pointer-events-none absolute top-3 left-4 font-mono text-[10px] leading-relaxed tracking-wider text-cyber/70 sm:text-[11px]">
        <div className="text-white/90">NEURO.ATLAS // SAG_LAT_L</div>
        <div>SEQ: T1W SCHEMATIC</div>
        <div>ROI: {REGIONS.length}</div>
      </div>
      <div className="pointer-events-none absolute top-3 right-4 text-right font-mono text-[10px] leading-relaxed tracking-wider text-cyber/70 sm:text-[11px]">
        <div className="text-white/90">OVERLAY: {disease ? disease.code : 'NONE'}</div>
        <div>{disease ? `${disease.stages[stage].label.toUpperCase()}` : 'BASELINE'}</div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-5 font-mono text-[10px] tracking-wider text-cyber/60 sm:text-[11px]">
        {cursor ? `X ${String(cursor.x).padStart(3, '0')}  Y ${String(cursor.y).padStart(3, '0')}` : 'X ---  Y ---'}
      </div>
      <div className="pointer-events-none absolute right-4 bottom-3 font-mono text-[10px] tracking-wider text-cyber/60 sm:text-[11px]">
        A ← → P
      </div>
    </div>
  );
}

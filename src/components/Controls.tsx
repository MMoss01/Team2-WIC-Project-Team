import { useEffect } from 'react';
import { Pause, Play } from 'lucide-react';
import { DISEASES, heatColor, type Disease, type DiseaseId } from '../data/diseases';
import { Tag } from './Hud';

export function DiseaseSelector({ value, onChange }: { value: DiseaseId | null; onChange: (id: DiseaseId | null) => void }) {
  const options: { id: DiseaseId | null; code: string; name: string }[] = [
    { id: null, code: 'BASE', name: 'No overlay' },
    ...DISEASES.map((d) => ({ id: d.id, code: d.code, name: d.name })),
  ];
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Disease overlay">
      <Tag className="mr-1">Pathology layer</Tag>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.code}
            role="radio"
            aria-checked={on}
            title={o.name}
            onClick={() => onChange(o.id)}
            className={`border px-3 py-1.5 font-mono text-xs tracking-widest transition-all duration-200 ${
              on
                ? o.id
                  ? 'border-heat bg-heat/15 text-heat shadow-[0_0_12px_rgba(255,106,61,0.45)]'
                  : 'border-cyber bg-cyber/15 text-cyber shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'border-cyber/30 text-cyber/60 hover:border-cyber/70 hover:bg-cyber/10 hover:text-cyber'
            }`}
          >
            [{o.code}]
          </button>
        );
      })}
    </div>
  );
}

export function StageScrubber({
  disease,
  stage,
  onStage,
  playing,
  onPlaying,
}: {
  disease: Disease;
  stage: number;
  onStage: (s: number) => void;
  playing: boolean;
  onPlaying: (p: boolean) => void;
}) {
  const max = disease.stages.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (stage >= max) onPlaying(false);
      else onStage(stage + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [playing, stage, max, onStage, onPlaying]);

  const togglePlay = () => {
    if (!playing && stage >= max) onStage(0);
    onPlaying(!playing);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause progression' : 'Play progression'}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyber/60 text-cyber transition-all hover:bg-cyber/10 hover:shadow-[0_0_12px_rgba(0,243,255,0.4)]"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="flex-1">
          <input
            type="range"
            className="hud-range w-full"
            min={0}
            max={max}
            step={1}
            value={stage}
            onChange={(e) => {
              onPlaying(false);
              onStage(Number(e.target.value));
            }}
            aria-label="Disease stage"
            aria-valuetext={disease.stages[stage].label}
          />
          <div className="mt-1 flex justify-between">
            {disease.stages.map((s, i) => (
              <button
                key={s.label}
                onClick={() => {
                  onPlaying(false);
                  onStage(i);
                }}
                className={`font-mono text-[10px] tracking-wider transition-colors ${i <= stage ? 'text-heat' : 'text-cyber/40 hover:text-cyber'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="font-mono text-xs text-soft">
        <span className="text-cyber">&gt;</span> {disease.stages[stage].summary}
      </p>
    </div>
  );
}

export function HeatLegend() {
  const stops = Array.from({ length: 12 }, (_, i) => heatColor(i / 11));
  return (
    <div className="flex items-center gap-3">
      <Tag>Involved longer</Tag>
      <div className="h-2 w-32 border border-cyber/30" style={{ background: `linear-gradient(to left, ${stops.join(',')})` }} />
      <Tag>Newly involved</Tag>
    </div>
  );
}

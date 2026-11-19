import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { REGION_BY_ID, type RegionId } from '../data/regions';
import { burden, heatColor, type Disease } from '../data/diseases';

const MODEL_URL = `${import.meta.env.BASE_URL}models/brain.glb`;

/** Mesh names look like "hippocampus_lh"; strip the hemisphere suffix. */
function regionOf(name: string): RegionId | null {
  const id = name.replace(/_(lh|rh|mid)$/, '');
  return id in REGION_BY_ID ? (id as RegionId) : null;
}

const isCortexShell = (name: string) => {
  const r = regionOf(name);
  return name.startsWith('medialwall') || (r !== null && REGION_BY_ID[r].group === 'Cortex');
};

interface Props {
  disease: Disease | null;
  stage: number;
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}

interface SceneProps extends Props {
  xray: boolean;
  slice: number; // 0..1, fraction of brain height kept from the bottom
  hovered: RegionId | null;
  onHover: (id: RegionId | null, e?: ThreeEvent<PointerEvent>) => void;
  resetKey: number;
}

const TISSUE_CORTEX = new THREE.Color('#2c4652');
const TISSUE_DEEP = new THREE.Color('#6f98a6');
const CYAN = new THREE.Color('#00f3ff');
const BLACK = new THREE.Color('#000000');

function BrainModel({ disease, stage, selected, onSelect, xray, slice, hovered, onHover }: SceneProps) {
  const { scene } = useGLTF(MODEL_URL);
  const { gl } = useThree();

  // One material per mesh so each region can glow independently.
  const meshes = useMemo(() => {
    const list: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        m.material = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1 });
        m.geometry.computeVertexNormals();
        list.push(m);
      }
    });
    return list;
  }, [scene]);

  const bounds = useMemo(() => new THREE.Box3().setFromObject(scene), [scene]);
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const sliceY = THREE.MathUtils.lerp(bounds.min.y, bounds.max.y, slice);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useEffect(() => {
    clipPlane.constant = sliceY;
  }, [clipPlane, sliceY]);

  // Static styling: tissue tone, translucency, heat. Selection pulse is in useFrame.
  useEffect(() => {
    for (const m of meshes) {
      const mat = m.material as THREE.MeshStandardMaterial;
      const region = regionOf(m.name);
      const shell = isCortexShell(m.name);
      const b = disease && region ? burden(disease, region, stage) : 0;

      const base = shell ? TISSUE_CORTEX : TISSUE_DEEP;
      const heat = new THREE.Color(heatColor(Math.max(b, 0.01)));
      mat.color.copy(b > 0 ? base.clone().lerp(heat, 0.65) : base);
      mat.emissive.copy(b > 0 ? heat : BLACK);
      mat.emissiveIntensity = b > 0 ? 0.35 + 1.1 * b : 0;

      mat.transparent = shell && xray;
      mat.opacity = shell && xray ? (b > 0 ? 0.32 : 0.14) : 1;
      mat.depthWrite = !(shell && xray);
      mat.side = THREE.DoubleSide; // shows the cut face when slicing
      mat.clippingPlanes = slice < 0.999 ? [clipPlane] : [];
      mat.needsUpdate = true;
      m.renderOrder = shell ? 1 : 0;
    }
  }, [meshes, disease, stage, xray, slice, clipPlane]);

  useFrame(({ clock }) => {
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4);
    for (const m of meshes) {
      const region = regionOf(m.name);
      if (!region || (region !== selected && region !== hovered)) continue;
      const mat = m.material as THREE.MeshStandardMaterial;
      const b = disease ? burden(disease, region, stage) : 0;
      const heat = new THREE.Color(heatColor(Math.max(b, 0.01)));
      const glow = region === selected ? 0.35 + 0.45 * pulse : 0.35;
      mat.emissive.copy(b > 0 ? heat.clone().lerp(CYAN, 0.5) : CYAN);
      mat.emissiveIntensity = (b > 0 ? 0.35 + 1.1 * b : 0) * 0.6 + glow;
    }
  });

  // Reset hovered/selected glow when they move away (useFrame only brightens).
  const prev = useRef<{ s: RegionId; h: RegionId | null }>({ s: selected, h: hovered });
  useEffect(() => {
    const stale = [prev.current.s, prev.current.h].filter((r) => r && r !== selected && r !== hovered);
    for (const m of meshes) {
      const region = regionOf(m.name);
      if (!region || !stale.includes(region)) continue;
      const mat = m.material as THREE.MeshStandardMaterial;
      const b = disease ? burden(disease, region, stage) : 0;
      mat.emissive.copy(b > 0 ? new THREE.Color(heatColor(b)) : BLACK);
      mat.emissiveIntensity = b > 0 ? 0.35 + 1.1 * b : 0;
    }
    prev.current = { s: selected, h: hovered };
  }, [selected, hovered, meshes, disease, stage]);

  /**
   * Pick the region under the pointer. Skips hits on the clipped-away part,
   * and in x-ray mode looks through the cortex to deep structures behind it.
   */
  const pick = (e: ThreeEvent<PointerEvent | MouseEvent>): RegionId | null => {
    const hits = e.intersections.filter((h) => slice >= 0.999 || h.point.y <= sliceY);
    const named = hits.map((h) => ({ h, r: regionOf(h.object.name) }));
    if (xray) {
      const deep = named.find(({ h, r }) => r && !isCortexShell(h.object.name));
      if (deep) return deep.r;
    }
    const first = named.find(({ h }) => !h.object.name.startsWith('medialwall'));
    return first?.r ?? null;
  };

  return (
    <group
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover(pick(e), e);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        const r = pick(e);
        if (r) onSelect(r);
      }}
    >
      <primitive object={scene} />
      {slice < 0.999 && (
        <mesh position={[0, sliceY, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial color="#00f3ff" transparent opacity={0.035} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/** Puts the camera back on the default left-lateral view. */
function CameraRig({ resetKey }: { resetKey: number }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    camera.position.set(-3.05, 0.45, 0.7);
    camera.lookAt(0, 0, 0);
    (controls as unknown as { target?: THREE.Vector3; update?: () => void } | null)?.target?.set(0, 0, 0);
    (controls as unknown as { update?: () => void } | null)?.update?.();
  }, [resetKey, camera, controls]);
  return null;
}

export default function Brain3D({ disease, stage, selected, onSelect }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [xray, setXray] = useState(true);
  const [slice, setSlice] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovered, setHovered] = useState<RegionId | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const onHover = (id: RegionId | null, e?: ThreeEvent<PointerEvent>) => {
    setHovered(id);
    const box = wrap.current?.getBoundingClientRect();
    if (id && e && box) setTip({ x: e.nativeEvent.clientX - box.left, y: e.nativeEvent.clientY - box.top });
    else setTip(null);
  };

  const hoverRegion = hovered ? REGION_BY_ID[hovered] : null;
  const btn = (on: boolean) =>
    `border px-2.5 py-1 font-mono text-[10px] tracking-widest transition-all ${
      on ? 'border-cyber bg-cyber/15 text-cyber' : 'border-cyber/30 text-cyber/60 hover:border-cyber/70 hover:text-cyber'
    }`;

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={wrap}
        className={`relative aspect-[600/440] w-full overflow-hidden border border-cyber/40 bg-[#00070b] shadow-[inset_0_0_60px_rgba(0,243,255,0.06),0_0_20px_rgba(0,243,255,0.12)] ${
          hovered ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <Canvas
          camera={{ fov: 35, near: 0.05, far: 50, position: [-3.05, 0.45, 0.7] }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          onPointerMissed={() => setHovered(null)}
        >
          <color attach="background" args={['#00070b']} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[-3, 3, 2]} intensity={1.2} />
          <directionalLight position={[3, -1, -3]} intensity={0.9} color="#00f3ff" />
          <pointLight position={[0, 2.5, 0]} intensity={0.6} color="#8ab4f8" />
          <Suspense fallback={null}>
            <BrainModel
              disease={disease}
              stage={stage}
              selected={selected}
              onSelect={onSelect}
              xray={xray}
              slice={slice}
              hovered={hovered}
              onHover={onHover}
              resetKey={resetKey}
            />
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={1.3}
            maxDistance={5}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            onStart={() => setAutoRotate(false)}
          />
          <CameraRig resetKey={resetKey} />
          <EffectComposer>
            <Bloom intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur />
          </EffectComposer>
        </Canvas>

        {/* Texture overlays, matching the 2D scan */}
        <div className="scan-lines pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] animate-scan bg-gradient-to-b from-transparent via-cyber/10 to-transparent">
          <div className="absolute inset-x-0 bottom-1/2 h-px bg-cyber/50 shadow-[0_0_8px_#00f3ff]" />
        </div>

        {hoverRegion && tip && (
          <div
            className="pointer-events-none absolute z-10 border border-cyber/60 bg-ink/90 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-cyber shadow-[0_0_12px_rgba(0,243,255,0.3)]"
            style={{ left: Math.min(tip.x + 14, (wrap.current?.clientWidth ?? 0) - 170), top: tip.y + 14 }}
          >
            <span className="text-white">{hoverRegion.code}</span> // {hoverRegion.name}
          </div>
        )}

        <div className="pointer-events-none absolute top-3 left-4 font-mono text-[10px] leading-relaxed tracking-wider text-cyber/70 sm:text-[11px]">
          <div className="text-white/90">NEURO.ATLAS // 3D_VOLUME</div>
          <div>SRC: FSAVERAGE (FREESURFER)</div>
          <div>MODE: {xray ? 'X-RAY' : 'SURFACE'}</div>
        </div>
        <div className="pointer-events-none absolute top-3 right-4 text-right font-mono text-[10px] leading-relaxed tracking-wider text-cyber/70 sm:text-[11px]">
          <div className="text-white/90">OVERLAY: {disease ? disease.code : 'NONE'}</div>
          <div>{disease ? disease.stages[stage].label.toUpperCase() : 'BASELINE'}</div>
          <div>SLICE: {slice >= 0.999 ? 'OFF' : `${Math.round(slice * 100)}%`}</div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-wider text-cyber/50">
          DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className={btn(xray)} onClick={() => setXray(!xray)} aria-pressed={xray}>
          [X-RAY]
        </button>
        <button className={btn(autoRotate)} onClick={() => setAutoRotate(!autoRotate)} aria-pressed={autoRotate}>
          [AUTO_ROTATE]
        </button>
        <button
          className={btn(false)}
          onClick={() => {
            setResetKey((k) => k + 1);
            setSlice(1);
          }}
        >
          [RESET_VIEW]
        </button>
        <label className="ml-auto flex min-w-[180px] flex-1 items-center gap-3 font-mono text-[10px] tracking-widest text-cyber/60 sm:flex-none">
          AXIAL_SLICE
          <input
            type="range"
            className="hud-range flex-1"
            min={0.15}
            max={1}
            step={0.01}
            value={slice}
            onChange={(e) => setSlice(Number(e.target.value))}
            aria-label="Axial slice height"
          />
        </label>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);

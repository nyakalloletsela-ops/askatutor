import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Boxes, Pause, Play, RotateCw, ExternalLink, Search, Lock } from "lucide-react";
import {
  LAB_MODULES,
  LAB_SUBJECTS,
  LAB_LEVELS,
  phetUrl,
  type LabModule,
  type LabSubject,
  type LabLevel,
} from "@/lib/lab-modules";

type Props = {
  enforceLimit: boolean;
  viewedSlugs: string[];
  limit: number;
  onOpen: (slug: string) => void;
};

// ---- Scene builders ---------------------------------------------------------
// Each builder returns an update(dt, t) function. Bespoke scenes exist for the
// most iconic sims; the rest fall back to a procedural subject-themed scene so
// every PhET experiment has a 3D counterpart.

type Builder = (scene: THREE.Scene) => (dt: number, t: number) => void;

const SCENE_BUILDERS: Record<string, Builder> = {
  // Gravity & orbits — solar system
  "gravity-and-orbits": buildSolarSystem,
  "gravity-force-lab": buildSolarSystem,
  "projectile-motion": buildProjectile,
  "projectile-data-lab": buildProjectile,
  "pendulum-lab": buildPendulum,
  "normal-modes": buildPendulum,
  "masses-and-springs": buildSpring,
  "wave-on-a-string": buildWaveString,
  "waves-intro": buildWaveString,
  "fourier-making-waves": buildWaveString,
  "charges-and-fields": buildOrbitField,
  "magnets-and-electromagnets": buildOrbitField,
  "faradays-law": buildOrbitField,
  "molecule-shapes": buildMolecule,
  "molecule-polarity": buildMolecule,
  "build-an-atom": buildAtom,
  "build-a-nucleus": buildAtom,
  "isotopes-and-atomic-mass": buildAtom,
  "rutherford-scattering": buildAtom,
  "hydrogen-atom": buildAtom,
  "gas-properties": buildGasBox,
  "diffusion": buildGasBox,
  "states-of-matter-basics": buildGasBox,
  "natural-selection": buildEcosystem,
  "gene-expression-essentials": buildDNA,
  neuron: buildDNA,
  "membrane-channels": buildGasBox,
};

export function ThreeDLab({ enforceLimit, viewedSlugs, limit, onOpen }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<LabModule>(LAB_MODULES[0]);
  const [running, setRunning] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [filter, setFilter] = useState<LabSubject | "All">("All");
  const [levelFilter, setLevelFilter] = useState<LabLevel | "All">("All");
  const [query, setQuery] = useState("");
  const runningRef = useRef(running);
  runningRef.current = running;

  const visible = useMemo(
    () =>
      LAB_MODULES.filter((m) => filter === "All" || m.subject === filter)
        .filter((m) => levelFilter === "All" || (m.level ?? "Secondary") === levelFilter)
        .filter(
          (m) =>
            !query.trim() ||
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase()),
        ),
    [filter, levelFilter, query],
  );
  const grouped = useMemo(() => {
    const g: Record<string, LabModule[]> = {};
    for (const m of visible) (g[m.subject] ||= []).push(m);
    return g;
  }, [visible]);

  const usedCount = viewedSlugs.length;
  const quotaReached =
    enforceLimit && !viewedSlugs.includes(selected.slug) && usedCount >= limit;

  useEffect(() => {
    if (quotaReached) return;
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.PointLight(0xffffff, 1.4, 200);
    key.position.set(8, 12, 10);
    scene.add(key);

    // Orbit controls (manual)
    let isDown = false, lastX = 0, lastY = 0;
    let azimuth = 0, elevation = 0.35, radius = 22;
    const updateCam = () => {
      camera.position.x = radius * Math.cos(elevation) * Math.sin(azimuth);
      camera.position.y = radius * Math.sin(elevation) + 2;
      camera.position.z = radius * Math.cos(elevation) * Math.cos(azimuth);
      camera.lookAt(0, 0, 0);
    };
    const onDown = (e: PointerEvent) => { isDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { isDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      azimuth -= (e.clientX - lastX) * 0.005;
      elevation = Math.max(-1.2, Math.min(1.4, elevation + (e.clientY - lastY) * 0.005));
      lastX = e.clientX; lastY = e.clientY;
      updateCam();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(5, Math.min(60, radius + e.deltaY * 0.02));
      updateCam();
    };
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    dom.addEventListener("wheel", onWheel, { passive: false });
    updateCam();

    const builder = SCENE_BUILDERS[selected.slug] ?? buildBySubject(selected.subject);
    const update = builder(scene);

    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current) update(dt, now / 1000);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      dom.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [selected, resetKey, quotaReached]);

  const choose = (m: LabModule) => {
    setSelected(m);
    if (!viewedSlugs.includes(m.slug) && (!enforceLimit || usedCount < limit)) {
      onOpen(m.slug);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <Boxes className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">3D Virtual Lab</span>
        {enforceLimit && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {usedCount}/{limit} experiments used
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiments"
              className="h-9 w-[180px] pl-7 text-sm"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as LabSubject | "All")}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All subjects</SelectItem>
              {LAB_SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LabLevel | "All")}>
            <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All levels</SelectItem>
              {LAB_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={selected.id}
            onValueChange={(v) => {
              const m = LAB_MODULES.find((x) => x.id === v);
              if (m) choose(m);
            }}
          >
            <SelectTrigger className="h-9 w-[280px]"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              {Object.entries(grouped).map(([subject, mods]) => (
                <SelectGroup key={subject}>
                  <SelectLabel>{subject}</SelectLabel>
                  {mods.map((m) => {
                    const locked = enforceLimit && !viewedSlugs.includes(m.slug) && usedCount >= limit;
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {locked && <Lock className="mr-1 inline h-3 w-3" />}
                        {m.name}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={() => setRunning((r) => !r)} aria-label={running ? "Pause" : "Play"}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={() => setResetKey((k) => k + 1)} aria-label="Reset">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button asChild size="icon" variant="outline" aria-label="Open 2D version">
            <a href={phetUrl(selected.slug)} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
          </Button>
        </div>
      </div>
      <div className="border-b bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{selected.subject} · {selected.name}</span> — {selected.description}
        {!SCENE_BUILDERS[selected.slug] && (
          <span className="ml-2 italic">· generic 3D scene · open the 2D version for the full interactive lab</span>
        )}
      </div>
      {quotaReached ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/20 p-8 text-center">
          <Lock className="h-10 w-10 text-primary" />
          <h3 className="text-lg font-semibold">Free lab quota reached</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You've used your {limit} free experiments. Upgrade or book a tutor session to keep exploring.
          </p>
        </div>
      ) : (
        <div ref={mountRef} className="relative flex-1 bg-[#0a0a1a]" />
      )}
    </div>
  );
}

// ---- Scene builder implementations ------------------------------------------

function buildSolarSystem(scene: THREE.Scene) {
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffcc55 }));
  scene.add(sun);
  const planets = [
    { color: 0xb0b0b0, r: 3.5, size: 0.3, speed: 1.2 },
    { color: 0xeac085, r: 5, size: 0.5, speed: 0.85 },
    { color: 0x4a90e2, r: 6.5, size: 0.55, speed: 0.7 },
    { color: 0xd06a4b, r: 8, size: 0.4, speed: 0.55 },
    { color: 0xe6c79c, r: 10.5, size: 1.1, speed: 0.32 },
    { color: 0xe6d6a8, r: 13, size: 0.95, speed: 0.24 },
  ];
  const updates: ((dt: number) => void)[] = [];
  planets.forEach((p) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 24, 24), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.7 }));
    scene.add(mesh);
    const ring = new THREE.Mesh(new THREE.RingGeometry(p.r - 0.01, p.r + 0.01, 96), new THREE.MeshBasicMaterial({ color: 0x3a3a55, side: THREE.DoubleSide }));
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    let angle = Math.random() * Math.PI * 2;
    updates.push((dt) => {
      angle += dt * p.speed * 0.4;
      mesh.position.set(Math.cos(angle) * p.r, 0, Math.sin(angle) * p.r);
    });
  });
  addStars(scene);
  return (dt: number) => updates.forEach((fn) => fn(dt));
}

function buildPendulum(scene: THREE.Scene) {
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x888899 }));
  pivot.position.set(0, 6, 0);
  scene.add(pivot);
  const L = 6;
  const bob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.4 }));
  scene.add(bob);
  const rodGeo = new THREE.BufferGeometry().setFromPoints([pivot.position, new THREE.Vector3(0, 0, 0)]);
  const rod = new THREE.Line(rodGeo, new THREE.LineBasicMaterial({ color: 0xaaaacc }));
  scene.add(rod);
  scene.add(new THREE.GridHelper(20, 20, 0x2a2a44, 0x1a1a2e));
  let theta = 0.8, omega = 0;
  const g = 9.8;
  return (dt: number) => {
    omega += -(g / L) * Math.sin(theta) * dt;
    omega *= 0.999;
    theta += omega * dt;
    const x = L * Math.sin(theta);
    const y = pivot.position.y - L * Math.cos(theta);
    bob.position.set(x, y, 0);
    (rodGeo.attributes.position as THREE.BufferAttribute).setXYZ(1, x, y, 0);
    (rodGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
}

function buildSpring(scene: THREE.Scene) {
  scene.add(new THREE.GridHelper(20, 20, 0x2a2a44, 0x1a1a2e));
  const anchor = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 1), new THREE.MeshStandardMaterial({ color: 0x556 }));
  anchor.position.y = 6;
  scene.add(anchor);
  const mass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshStandardMaterial({ color: 0xe94560 }));
  scene.add(mass);
  const coilGeo = new THREE.BufferGeometry();
  const coilMat = new THREE.LineBasicMaterial({ color: 0xc9c9e0 });
  const coil = new THREE.Line(coilGeo, coilMat);
  scene.add(coil);
  let y = 0, v = 0;
  const k = 10, m = 1, dPhys = 0.4;
  return (dt: number) => {
    const a = (-k * (y + 1.5) - dPhys * v) / m;
    v += a * dt;
    y += v * dt;
    mass.position.y = y;
    const pts: THREE.Vector3[] = [];
    const turns = 20;
    for (let i = 0; i <= turns * 8; i++) {
      const t = i / (turns * 8);
      const yy = anchor.position.y - t * (anchor.position.y - (y + 0.7));
      const xx = Math.cos(t * turns * Math.PI * 2) * 0.4;
      const zz = Math.sin(t * turns * Math.PI * 2) * 0.4;
      pts.push(new THREE.Vector3(xx, yy, zz));
    }
    coilGeo.setFromPoints(pts);
  };
}

function buildProjectile(scene: THREE.Scene) {
  scene.add(new THREE.GridHelper(40, 40, 0x2a2a44, 0x1a1a2e));
  const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 2, 16), new THREE.MeshStandardMaterial({ color: 0x556 }));
  cannon.position.set(-10, 0.5, 0);
  cannon.rotation.z = Math.PI / 4;
  scene.add(cannon);
  const balls: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
  let t = 0;
  return (dt: number) => {
    t += dt;
    if (t > 1) {
      t = 0;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffcc55 }));
      ball.position.copy(cannon.position);
      scene.add(ball);
      balls.push({ mesh: ball, vel: new THREE.Vector3(8, 8, (Math.random() - 0.5) * 2) });
    }
    balls.forEach((b) => {
      b.vel.y -= 9.8 * dt;
      b.mesh.position.addScaledVector(b.vel, dt);
    });
    for (let i = balls.length - 1; i >= 0; i--) {
      if (balls[i].mesh.position.y < -0.5 || balls[i].mesh.position.x > 25) {
        scene.remove(balls[i].mesh);
        balls.splice(i, 1);
      }
    }
  };
}

function buildWaveString(scene: THREE.Scene) {
  scene.add(new THREE.GridHelper(20, 20, 0x2a2a44, 0x1a1a2e));
  const N = 200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (i / N) * 20 - 10;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x4ade80 }));
  scene.add(line);
  return (_dt: number, t: number) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const x = (i / N) * 20 - 10;
      const y = Math.sin(x * 1.2 + t * 3) * 1.5 + Math.sin(x * 2.4 + t * 1.5) * 0.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  };
}

function buildOrbitField(scene: THREE.Scene) {
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0xe94560, emissive: 0x551122 }));
  scene.add(core);
  const N = 60;
  const particles: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x4ade80 : 0x67e8f9, emissive: 0x113344 }));
    const r = 4 + Math.random() * 6;
    const a = Math.random() * Math.PI * 2;
    m.position.set(r * Math.cos(a), (Math.random() - 0.5) * 1.2, r * Math.sin(a));
    const speed = Math.sqrt(8 / r);
    particles.push({ mesh: m, vel: new THREE.Vector3(-Math.sin(a) * speed, 0, Math.cos(a) * speed) });
    scene.add(m);
  }
  return (dt: number) => {
    particles.forEach((p) => {
      const r = p.mesh.position.length();
      const acc = p.mesh.position.clone().multiplyScalar(-8 / (r * r * r));
      p.vel.addScaledVector(acc, dt);
      p.mesh.position.addScaledVector(p.vel, dt);
    });
  };
}

function buildMolecule(scene: THREE.Scene) {
  const center = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0xe94560, roughness: 0.3 }));
  scene.add(center);
  const positions = [
    new THREE.Vector3(2.4, 0.6, 0),
    new THREE.Vector3(-2.4, 0.6, 0),
    new THREE.Vector3(0, -2, 1.5),
    new THREE.Vector3(0, -2, -1.5),
  ];
  const group = new THREE.Group();
  group.add(center);
  positions.forEach((p, i) => {
    const atom = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x67e8f9 : 0xffffff, roughness: 0.4 }));
    atom.position.copy(p);
    group.add(atom);
    const len = p.length();
    const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, len, 16), new THREE.MeshStandardMaterial({ color: 0xaaaacc }));
    bond.position.copy(p.clone().multiplyScalar(0.5));
    bond.lookAt(p);
    bond.rotateX(Math.PI / 2);
    group.add(bond);
  });
  scene.add(group);
  return (dt: number) => { group.rotation.y += dt * 0.5; };
}

function buildAtom(scene: THREE.Scene) {
  const nucleus = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const proton = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xe94560 : 0x67e8f9 }));
    proton.position.set((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2);
    nucleus.add(proton);
  }
  scene.add(nucleus);
  const orbits = [
    { r: 3, n: 2, tilt: 0 },
    { r: 5, n: 6, tilt: Math.PI / 3 },
    { r: 7, n: 8, tilt: -Math.PI / 4 },
  ];
  const electrons: { mesh: THREE.Mesh; r: number; speed: number; phase: number; tilt: number }[] = [];
  orbits.forEach((o) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(o.r - 0.02, o.r + 0.02, 96), new THREE.MeshBasicMaterial({ color: 0x3a3a55, side: THREE.DoubleSide }));
    ring.rotation.x = Math.PI / 2 + o.tilt;
    scene.add(ring);
    for (let i = 0; i < o.n; i++) {
      const el = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x114422 }));
      scene.add(el);
      electrons.push({ mesh: el, r: o.r, speed: 1.5 / o.r, phase: (i / o.n) * Math.PI * 2, tilt: o.tilt });
    }
  });
  return (_dt: number, t: number) => {
    nucleus.rotation.y += 0.005;
    electrons.forEach((e) => {
      const a = e.phase + t * e.speed * 2;
      const x = Math.cos(a) * e.r;
      const z = Math.sin(a) * e.r;
      e.mesh.position.set(x, z * Math.sin(e.tilt), z * Math.cos(e.tilt));
    });
  };
}

function buildGasBox(scene: THREE.Scene) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(12, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x3a3a55, wireframe: true }),
  );
  scene.add(box);
  const N = 80;
  const particles: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x114455 }));
    m.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    const v = new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    particles.push({ mesh: m, vel: v });
    scene.add(m);
  }
  return (dt: number) => {
    particles.forEach((p) => {
      p.mesh.position.addScaledVector(p.vel, dt);
      (["x", "y", "z"] as const).forEach((ax, idx) => {
        const lim = idx === 0 ? 6 : 4;
        if (p.mesh.position[ax] > lim || p.mesh.position[ax] < -lim) {
          p.vel[ax] *= -1;
          p.mesh.position[ax] = Math.max(-lim, Math.min(lim, p.mesh.position[ax]));
        }
      });
    });
  };
}

function buildEcosystem(scene: THREE.Scene) {
  const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 48), new THREE.MeshStandardMaterial({ color: 0x244a2c, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const creatures: { mesh: THREE.Mesh; angle: number; r: number; speed: number }[] = [];
  for (let i = 0; i < 25; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 8), new THREE.MeshStandardMaterial({ color: i % 3 ? 0xa78bfa : 0xfde047 }));
    creatures.push({ mesh: c, angle: Math.random() * Math.PI * 2, r: 3 + Math.random() * 7, speed: 0.3 + Math.random() * 0.7 });
    scene.add(c);
  }
  return (dt: number) => {
    creatures.forEach((c) => {
      c.angle += dt * c.speed;
      c.mesh.position.set(Math.cos(c.angle) * c.r, 0.5, Math.sin(c.angle) * c.r);
      c.mesh.rotation.y = -c.angle;
    });
  };
}

function buildDNA(scene: THREE.Scene) {
  const group = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const t = i / 6;
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0xe94560 }));
    a.position.set(Math.cos(t) * 2, i * 0.4 - 12, Math.sin(t) * 2);
    group.add(a);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshStandardMaterial({ color: 0x67e8f9 }));
    b.position.set(Math.cos(t + Math.PI) * 2, i * 0.4 - 12, Math.sin(t + Math.PI) * 2);
    group.add(b);
  }
  scene.add(group);
  return (dt: number) => { group.rotation.y += dt * 0.4; };
}

function buildBySubject(subject: LabSubject): Builder {
  if (subject === "Chemistry") return buildMolecule;
  if (subject === "Biology") return buildDNA;
  if (subject === "Math") return buildWaveString;
  if (subject === "Earth Science") return buildSolarSystem;
  return buildOrbitField; // Physics fallback
}

function addStars(scene: THREE.Scene) {
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(1500 * 3);
  for (let i = 0; i < 1500; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 200;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })));
}

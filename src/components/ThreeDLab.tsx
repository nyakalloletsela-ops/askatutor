import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Boxes, Pause, Play, RotateCw } from "lucide-react";

type SimId = "solar" | "molecule" | "pendulum" | "orbit-field";

const SIMS: { id: SimId; name: string; subject: string; description: string }[] = [
  { id: "solar", name: "Solar System", subject: "Physics", description: "Sun, planets and orbital motion in 3D." },
  { id: "molecule", name: "Water Molecule (H₂O)", subject: "Chemistry", description: "Rotate and inspect a 3D ball-and-stick model." },
  { id: "pendulum", name: "3D Pendulum", subject: "Physics", description: "Real-time pendulum with adjustable gravity." },
  { id: "orbit-field", name: "Charged Particle Field", subject: "Physics", description: "Particles orbit a central charge in 3D space." },
];

export function ThreeDLab() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sim, setSim] = useState<SimId>("solar");
  const [running, setRunning] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const sun = new THREE.PointLight(0xffffff, 1.8, 200);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Drag-to-rotate camera (simple orbit)
    let isDown = false;
    let lastX = 0, lastY = 0;
    let azimuth = 0, elevation = 0.35, radius = 22;
    const updateCamera = () => {
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
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(5, Math.min(60, radius + e.deltaY * 0.02));
      updateCamera();
    };
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    dom.addEventListener("wheel", onWheel, { passive: false });
    updateCamera();

    // Build scene per sim
    const disposables: Array<() => void> = [];
    const update: Array<(dt: number, t: number) => void> = [];

    if (sim === "solar") {
      const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffcc55 }),
      );
      scene.add(sunMesh);
      const planets = [
        { color: 0xb0b0b0, r: 3.5, size: 0.3, speed: 1.2 },
        { color: 0xeac085, r: 5, size: 0.5, speed: 0.85 },
        { color: 0x4a90e2, r: 6.5, size: 0.55, speed: 0.7 },
        { color: 0xd06a4b, r: 8, size: 0.4, speed: 0.55 },
        { color: 0xe6c79c, r: 10.5, size: 1.1, speed: 0.32 },
        { color: 0xe6d6a8, r: 13, size: 0.95, speed: 0.24 },
      ];
      planets.forEach((p) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(p.size, 24, 24),
          new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.7 }),
        );
        scene.add(mesh);
        // Orbit ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(p.r - 0.01, p.r + 0.01, 96),
          new THREE.MeshBasicMaterial({ color: 0x3a3a55, side: THREE.DoubleSide }),
        );
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        let angle = Math.random() * Math.PI * 2;
        update.push((dt) => {
          angle += dt * p.speed * 0.4;
          mesh.position.set(Math.cos(angle) * p.r, 0, Math.sin(angle) * p.r);
        });
      });
      // Stars
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(1500 * 3);
      for (let i = 0; i < 1500; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 200;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 }));
      scene.add(stars);
    } else if (sim === "molecule") {
      // H2O
      const O = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0xe94560, roughness: 0.3 }));
      scene.add(O);
      const angle = (104.5 * Math.PI) / 180;
      const bondLen = 2.4;
      const h1Pos = new THREE.Vector3(Math.sin(angle / 2) * bondLen, -Math.cos(angle / 2) * bondLen, 0);
      const h2Pos = new THREE.Vector3(-Math.sin(angle / 2) * bondLen, -Math.cos(angle / 2) * bondLen, 0);
      [h1Pos, h2Pos].forEach((p) => {
        const H = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
        H.position.copy(p);
        scene.add(H);
        // bond
        const mid = new THREE.Vector3().addVectors(new THREE.Vector3(0, 0, 0), p).multiplyScalar(0.5);
        const len = p.length();
        const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, len, 16), new THREE.MeshStandardMaterial({ color: 0xaaaacc }));
        bond.position.copy(mid);
        bond.lookAt(p);
        bond.rotateX(Math.PI / 2);
        scene.add(bond);
      });
      const group = new THREE.Group();
      const all = scene.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
      update.push((dt) => {
        all.forEach((m) => { m.rotation.y += dt * 0.4; });
      });
      void group;
    } else if (sim === "pendulum") {
      // pivot
      const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x888899 }));
      pivot.position.set(0, 6, 0);
      scene.add(pivot);
      const L = 6;
      const bobGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const bobMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.4 });
      const bob = new THREE.Mesh(bobGeo, bobMat);
      scene.add(bob);
      const rodMat = new THREE.LineBasicMaterial({ color: 0xaaaacc });
      const rodGeo = new THREE.BufferGeometry().setFromPoints([pivot.position, new THREE.Vector3(0, 0, 0)]);
      const rod = new THREE.Line(rodGeo, rodMat);
      scene.add(rod);
      // grid floor
      const grid = new THREE.GridHelper(20, 20, 0x2a2a44, 0x1a1a2e);
      grid.position.y = -3;
      scene.add(grid);
      let theta = 0.8, omega = 0;
      const g = 9.8;
      update.push((dt) => {
        omega += -(g / L) * Math.sin(theta) * dt;
        omega *= 0.999;
        theta += omega * dt;
        const x = L * Math.sin(theta);
        const y = pivot.position.y - L * Math.cos(theta);
        bob.position.set(x, y, 0);
        (rodGeo.attributes.position as THREE.BufferAttribute).setXYZ(1, x, y, 0);
        (rodGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      });
    } else if (sim === "orbit-field") {
      const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0xe94560, emissive: 0x551122 }));
      scene.add(core);
      const N = 60;
      const particles: { mesh: THREE.Mesh; vel: THREE.Vector3 }[] = [];
      for (let i = 0; i < N; i++) {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 12, 12),
          new THREE.MeshStandardMaterial({ color: i % 2 ? 0x4ade80 : 0x67e8f9, emissive: 0x113344 }),
        );
        const r = 4 + Math.random() * 6;
        const a = Math.random() * Math.PI * 2;
        const e = (Math.random() - 0.5) * 0.6;
        m.position.set(r * Math.cos(a), e * 2, r * Math.sin(a));
        // tangential vel
        const speed = Math.sqrt(8 / r);
        const v = new THREE.Vector3(-Math.sin(a) * speed, 0, Math.cos(a) * speed);
        scene.add(m);
        particles.push({ mesh: m, vel: v });
      }
      update.push((dt) => {
        particles.forEach((p) => {
          const r = p.mesh.position.length();
          const acc = p.mesh.position.clone().multiplyScalar(-8 / (r * r * r));
          p.vel.addScaledVector(acc, dt);
          p.mesh.position.addScaledVector(p.vel, dt);
        });
      });
    }

    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current) {
        update.forEach((fn) => fn(dt, now / 1000));
      }
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
      disposables.forEach((d) => d());
    };
  }, [sim, resetKey]);

  const active = SIMS.find((s) => s.id === sim)!;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <Boxes className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">3D Virtual Lab</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select value={sim} onValueChange={(v) => setSim(v as SimId)}>
            <SelectTrigger className="h-9 w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SIMS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} · {s.subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={() => setRunning((r) => !r)} aria-label={running ? "Pause" : "Play"}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={() => setResetKey((k) => k + 1)} aria-label="Reset">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-b bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{active.name}</span> — {active.description} · Drag to rotate, scroll to zoom.
      </div>
      <div ref={mountRef} className="relative flex-1 bg-[#0a0a1a]" />
    </div>
  );
}

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, RotateCw, ExternalLink, Search } from "lucide-react";

type Subject = "Physics" | "Chemistry" | "Biology" | "Math" | "Earth Science";
type Level = "Primary" | "Secondary" | "Tertiary";

type Module = {
  id: string;
  name: string;
  subject: Subject;
  level?: Level;
  slug: string; // PhET sim slug
  description: string;
};

// Curated PhET HTML5 sims appropriate for high-school (JC/COSC).
const MODULES: Module[] = [
  // ── Physics ────────────────────────────────────────────────
  { id: "ckdc", name: "Circuit Construction Kit: DC", subject: "Physics", slug: "circuit-construction-kit-dc", description: "Build DC circuits with bulbs, batteries, switches." },
  { id: "ckac", name: "Circuit Construction Kit: AC", subject: "Physics", slug: "circuit-construction-kit-ac", description: "Add capacitors, inductors and AC sources." },
  { id: "ohms", name: "Ohm's Law", subject: "Physics", slug: "ohms-law", description: "Explore V = IR interactively." },
  { id: "resistance", name: "Resistance in a Wire", subject: "Physics", slug: "resistance-in-a-wire", description: "How length, area & resistivity affect R." },
  { id: "forces", name: "Forces and Motion: Basics", subject: "Physics", slug: "forces-and-motion-basics", description: "Pushes, friction & Newton's laws." },
  { id: "projectile", name: "Projectile Motion", subject: "Physics", slug: "projectile-motion", description: "Cannon-fire projectiles, study trajectories." },
  { id: "energy-skate", name: "Energy Skate Park", subject: "Physics", slug: "energy-skate-park-basics", description: "Kinetic, potential & thermal energy." },
  { id: "pendulum", name: "Pendulum Lab", subject: "Physics", slug: "pendulum-lab", description: "Period, length & gravity." },
  { id: "masses-springs", name: "Masses and Springs", subject: "Physics", slug: "masses-and-springs", description: "Hooke's law and SHM." },
  { id: "waves-string", name: "Wave on a String", subject: "Physics", slug: "wave-on-a-string", description: "Transverse waves, reflection, standing waves." },
  { id: "sound-waves", name: "Waves Intro", subject: "Physics", slug: "waves-intro", description: "Water, sound and light waves." },
  { id: "geometric-optics", name: "Geometric Optics: Basics", subject: "Physics", slug: "geometric-optics-basics", description: "Lenses, focal length, image formation." },
  { id: "bending-light", name: "Bending Light", subject: "Physics", slug: "bending-light", description: "Refraction, Snell's law, prisms." },
  { id: "color-vision", name: "Color Vision", subject: "Physics", slug: "color-vision", description: "RGB mixing and perception." },
  { id: "gravity-orbits", name: "Gravity and Orbits", subject: "Physics", slug: "gravity-and-orbits", description: "Sun, planet, moon system." },
  { id: "magnets-electromagnets", name: "Magnets and Electromagnets", subject: "Physics", slug: "magnets-and-electromagnets", description: "Bar magnets, field lines, solenoids." },
  { id: "faradays-law", name: "Faraday's Law", subject: "Physics", slug: "faradays-law", description: "Induced EMF from a moving magnet." },
  { id: "density", name: "Density", subject: "Physics", slug: "density", description: "Mass, volume, and floating/sinking." },
  { id: "buoyancy", name: "Buoyancy: Basics", subject: "Physics", slug: "buoyancy-basics", description: "Why objects float or sink." },

  // ── Chemistry ──────────────────────────────────────────────
  { id: "ph", name: "pH Scale", subject: "Chemistry", slug: "ph-scale", description: "Mix acids & bases; explore pH." },
  { id: "ph-basics", name: "pH Scale: Basics", subject: "Chemistry", slug: "ph-scale-basics", description: "Intro to acids and bases." },
  { id: "balancing", name: "Balancing Chemical Equations", subject: "Chemistry", slug: "balancing-chemical-equations", description: "Practice balancing reactions." },
  { id: "reactants", name: "Reactants, Products and Leftovers", subject: "Chemistry", slug: "reactants-products-and-leftovers", description: "Limiting reagents made visual." },
  { id: "build-atom", name: "Build an Atom", subject: "Chemistry", slug: "build-an-atom", description: "Protons, neutrons, electrons → isotopes/ions." },
  { id: "isotopes", name: "Isotopes and Atomic Mass", subject: "Chemistry", slug: "isotopes-and-atomic-mass", description: "Weighted average atomic mass." },
  { id: "states", name: "States of Matter: Basics", subject: "Chemistry", slug: "states-of-matter-basics", description: "Solid, liquid, gas at the particle level." },
  { id: "concentration", name: "Concentration", subject: "Chemistry", slug: "concentration", description: "Molarity, dilution, saturation." },
  { id: "molarity", name: "Molarity", subject: "Chemistry", slug: "molarity", description: "Moles, volume, and concentration." },
  { id: "molecule-shapes", name: "Molecule Shapes", subject: "Chemistry", slug: "molecule-shapes", description: "VSEPR geometry." },
  { id: "molecule-polarity", name: "Molecule Polarity", subject: "Chemistry", slug: "molecule-polarity", description: "Electronegativity and dipoles." },
  { id: "gas-properties", name: "Gas Properties", subject: "Chemistry", slug: "gas-properties", description: "PV=nRT explored with particles." },
  { id: "diffusion", name: "Diffusion", subject: "Chemistry", slug: "diffusion", description: "Particle mixing over time." },
  { id: "salts-solubility", name: "Salts & Solubility", subject: "Chemistry", slug: "soluble-salts", description: "Dissolution and Ksp." },

  // ── Biology ────────────────────────────────────────────────
  { id: "natural-selection", name: "Natural Selection", subject: "Biology", slug: "natural-selection", description: "Mutations, environment & survival." },
  { id: "gene-expression", name: "Gene Expression Essentials", subject: "Biology", slug: "gene-expression-essentials", description: "Transcription & translation." },
  { id: "neuron", name: "Neuron", subject: "Biology", slug: "neuron", description: "Action potentials & ion channels." },
  { id: "membrane-channels", name: "Membrane Channels", subject: "Biology", slug: "membrane-channels", description: "Diffusion across membranes." },

  // ── Math ───────────────────────────────────────────────────
  { id: "graphing-lines", name: "Graphing Lines", subject: "Math", slug: "graphing-lines", description: "Slope-intercept & point-slope forms." },
  { id: "graphing-quad", name: "Graphing Quadratics", subject: "Math", slug: "graphing-quadratics", description: "Parabolas: a, b, c parameters." },
  { id: "function-builder", name: "Function Builder", subject: "Math", slug: "function-builder", description: "Compose mathematical functions." },
  { id: "trig-tour", name: "Trig Tour", subject: "Math", slug: "trig-tour", description: "Unit circle sin/cos/tan." },
  { id: "fractions-intro", name: "Fractions: Intro", subject: "Math", slug: "fractions-intro", description: "Fractions, decimals & percents." },
  { id: "area-builder", name: "Area Builder", subject: "Math", slug: "area-builder", description: "Area & perimeter intuition." },
  { id: "vector-addition", name: "Vector Addition", subject: "Math", slug: "vector-addition", description: "Head-to-tail and components." },
  { id: "plinko", name: "Plinko Probability", subject: "Math", slug: "plinko-probability", description: "Binomial / normal distributions." },

  // ── Earth Science ─────────────────────────────────────────
  { id: "ghg", name: "The Greenhouse Effect", subject: "Earth Science", slug: "greenhouse-effect", description: "Atmospheric gases & temperature." },
  { id: "plate-tectonics", name: "Plate Tectonics", subject: "Earth Science", slug: "plate-tectonics", description: "Crust types and plate motion." },

  // ── Tertiary / University-level ───────────────────────────
  // Physics
  { id: "t-quantum-tunneling", name: "Quantum Tunneling and Wave Packets", subject: "Physics", level: "Tertiary", slug: "quantum-tunneling", description: "Tunneling, transmission & reflection coefficients." },
  { id: "t-quantum-bound", name: "Quantum Bound States", subject: "Physics", level: "Tertiary", slug: "bound-states", description: "Eigenstates in 1D potential wells." },
  { id: "t-hydrogen", name: "Models of the Hydrogen Atom", subject: "Physics", level: "Tertiary", slug: "hydrogen-atom", description: "Bohr, de Broglie, Schrödinger models." },
  { id: "t-stern-gerlach", name: "Stern-Gerlach Experiment", subject: "Physics", level: "Tertiary", slug: "stern-gerlach", description: "Spin quantization of silver atoms." },
  { id: "t-photoelectric", name: "Photoelectric Effect", subject: "Physics", level: "Tertiary", slug: "photoelectric", description: "Einstein's photon model; work function." },
  { id: "t-blackbody", name: "Blackbody Spectrum", subject: "Physics", level: "Tertiary", slug: "blackbody-spectrum", description: "Planck curve, Wien's & Stefan-Boltzmann laws." },
  { id: "t-rutherford", name: "Rutherford Scattering", subject: "Physics", level: "Tertiary", slug: "rutherford-scattering", description: "Alpha-particle scattering off nuclei." },
  { id: "t-alpha-decay", name: "Alpha Decay", subject: "Physics", level: "Tertiary", slug: "alpha-decay", description: "Nuclear tunneling & half-life." },
  { id: "t-beta-decay", name: "Beta Decay", subject: "Physics", level: "Tertiary", slug: "beta-decay", description: "Weak interaction & neutrino emission." },
  { id: "t-nuclear-fission", name: "Nuclear Fission", subject: "Physics", level: "Tertiary", slug: "nuclear-fission", description: "Chain reactions & critical mass." },
  { id: "t-fourier", name: "Fourier: Making Waves", subject: "Physics", level: "Tertiary", slug: "fourier-making-waves", description: "Fourier series & wave synthesis." },
  { id: "t-normal-modes", name: "Normal Modes", subject: "Physics", level: "Tertiary", slug: "normal-modes", description: "Coupled oscillators & eigenmodes." },
  { id: "t-charges-fields", name: "Charges and Fields", subject: "Physics", level: "Tertiary", slug: "charges-and-fields", description: "Electric fields, potentials & equipotentials." },
  { id: "t-capacitor-lab", name: "Capacitor Lab", subject: "Physics", level: "Tertiary", slug: "capacitor-lab-basics", description: "Capacitance, dielectrics & stored energy." },
  { id: "t-faraday-lab", name: "Faraday's Electromagnetic Lab", subject: "Physics", level: "Tertiary", slug: "faradays-electromagnetic-lab", description: "Generators, transformers & flux." },
  { id: "t-band-structure", name: "Band Structure", subject: "Physics", level: "Tertiary", slug: "band-structure", description: "Periodic potentials & energy bands." },
  { id: "t-semiconductors", name: "Semiconductors", subject: "Physics", level: "Tertiary", slug: "semiconductor", description: "n/p doping and junctions." },
  { id: "t-conductivity", name: "Conductivity", subject: "Physics", level: "Tertiary", slug: "conductivity", description: "Photoconductivity in metals/insulators." },
  { id: "t-davisson-germer", name: "Davisson-Germer: Electron Diffraction", subject: "Physics", level: "Tertiary", slug: "davisson-germer", description: "Matter-wave diffraction." },
  { id: "t-lasers", name: "Lasers", subject: "Physics", level: "Tertiary", slug: "lasers", description: "Stimulated emission & population inversion." },
  { id: "t-mri", name: "Simplified MRI", subject: "Physics", level: "Tertiary", slug: "mri", description: "Nuclear magnetic resonance basics." },
  { id: "t-gravity-lab", name: "Gravity Force Lab", subject: "Physics", level: "Tertiary", slug: "gravity-force-lab", description: "Newton's law of universal gravitation." },

  // Chemistry
  { id: "t-acid-base", name: "Acid-Base Solutions", subject: "Chemistry", level: "Tertiary", slug: "acid-base-solutions", description: "Strong/weak acids, Ka & equilibrium." },
  { id: "t-sugar-salt", name: "Sugar and Salt Solutions", subject: "Chemistry", level: "Tertiary", slug: "sugar-and-salt-solutions", description: "Dissociation & conductivity." },
  { id: "t-rxn-rates", name: "Reactions & Rates", subject: "Chemistry", level: "Tertiary", slug: "reactions-and-rates", description: "Activation energy & rate laws." },
  { id: "t-mol-polarity", name: "Molecule Polarity (Advanced)", subject: "Chemistry", level: "Tertiary", slug: "molecule-polarity", description: "Dipole moments & electronegativity." },
  { id: "t-atomic-interactions", name: "Atomic Interactions", subject: "Chemistry", level: "Tertiary", slug: "atomic-interactions", description: "Lennard-Jones potential between atoms." },
  { id: "t-build-nucleus", name: "Build a Nucleus", subject: "Chemistry", level: "Tertiary", slug: "build-a-nucleus", description: "Nuclear stability & decay chains." },
  { id: "t-beers-law", name: "Beer's Law Lab", subject: "Chemistry", level: "Tertiary", slug: "beers-law-lab", description: "Spectrophotometry: A = εcl." },

  // Math
  { id: "t-calculus-grapher", name: "Calculus Grapher", subject: "Math", level: "Tertiary", slug: "calculus-grapher", description: "Derivatives & integrals visualized." },
  { id: "t-curve-fit", name: "Curve Fitting", subject: "Math", level: "Tertiary", slug: "curve-fitting", description: "Least-squares regression & χ²." },
  { id: "t-least-squares", name: "Least-Squares Regression", subject: "Math", level: "Tertiary", slug: "least-squares-regression", description: "Linear regression statistics." },
  { id: "t-prob-density", name: "Projectile Data Lab", subject: "Math", level: "Tertiary", slug: "projectile-data-lab", description: "Distributions & sample statistics." },

  // Biology
  { id: "t-nat-sel-adv", name: "Natural Selection (Advanced)", subject: "Biology", level: "Tertiary", slug: "natural-selection", description: "Population genetics & allele frequencies." },
];

const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Biology", "Math", "Earth Science"];
const LEVELS: Level[] = ["Primary", "Secondary", "Tertiary"];
const phetUrl = (slug: string) => `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_en.html`;

export function LorddaLab() {
  const [selected, setSelected] = useState<Module | null>(MODULES[0]);
  const [key, setKey] = useState(0);
  const [filter, setFilter] = useState<Subject | "All">("All");
  const [levelFilter, setLevelFilter] = useState<Level | "All">("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      MODULES.filter((m) => filter === "All" || m.subject === filter)
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
    const g: Record<string, Module[]> = {};
    for (const m of visible) (g[m.subject] ||= []).push(m);
    return g;
  }, [visible]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <FlaskConical className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-navy">Lordda Virtual Lab</span>
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
          <Select value={filter} onValueChange={(v) => setFilter(v as Subject | "All")}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All subjects</SelectItem>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selected?.id ?? ""}
            onValueChange={(v) => {
              const m = MODULES.find((m) => m.id === v) ?? null;
              setSelected(m);
              setKey((k) => k + 1);
            }}
          >
            <SelectTrigger className="h-9 w-[260px]">
              <SelectValue placeholder="Choose an experiment" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              {Object.entries(grouped).map(([subject, mods]) => (
                <SelectGroup key={subject}>
                  <SelectLabel>{subject}</SelectLabel>
                  {mods.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
              {visible.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No matches.</div>
              )}
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={() => setKey((k) => k + 1)} aria-label="Reload">
            <RotateCw className="h-4 w-4" />
          </Button>
          {selected && (
            <Button asChild size="icon" variant="outline" aria-label="Open in new tab">
              <a href={phetUrl(selected.slug)} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
      {selected ? (
        <iframe
          key={key}
          src={phetUrl(selected.slug)}
          title={selected.name}
          loading="lazy"
          allow="fullscreen; autoplay; xr-spatial-tracking"
          className="flex-1 w-full border-0 bg-white"
        />
      ) : (
        <div className="flex-1 p-6 text-sm text-muted-foreground">Select an experiment.</div>
      )}
      {selected && (
        <p className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{selected.subject} · {selected.name}</span> — {selected.description}
        </p>
      )}
    </div>
  );
}

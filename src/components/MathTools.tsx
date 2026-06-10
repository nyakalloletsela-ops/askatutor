import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { evaluate, parse } from "mathjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, PlusSquare, FunctionSquare, Sigma, Calculator } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsertLatex: (tex: string) => void;
  onInsertText: (text: string) => void;
}

const PRESETS = [
  { label: "Fraction", tex: "\\frac{a}{b}" },
  { label: "Square root", tex: "\\sqrt{x}" },
  { label: "Power", tex: "x^{n}" },
  { label: "Integral", tex: "\\int_{a}^{b} f(x)\\, dx" },
  { label: "Matrix", tex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
  { label: "Greek π", tex: "\\pi" },
  { label: "Greek θ", tex: "\\theta" },
  { label: "Vector", tex: "\\vec{v}" },
];

function LatexPreview({ tex }: { tex: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex || "\\,", ref.current, {
        throwOnError: false,
        displayMode: true,
        output: "html",
      });
    } catch {
      // Fails silently if the user is typing an incomplete formula
    }
  }, [tex]);
  return <div ref={ref} className="min-h-[3rem] overflow-x-auto rounded border bg-card p-3 text-center" />;
}

export function MathTools({ open, onClose, onInsertLatex, onInsertText }: Props) {
  const [tex, setTex] = useState("\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
  const [expr, setExpr] = useState("sin(x)");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string>("");

  const graphData = useMemo(() => {
    try {
      const node = parse(expr);
      const fn = node.compile();
      const points = [];
      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + ((xMax - xMin) * i) / steps;
        let y: number | null = null;
        try {
          const v = fn.evaluate({ x });
          if (typeof v === "number" && isFinite(v)) y = v;
        } catch {
          y = null;
        }
        points.push({ x: Number(x.toFixed(2)), y });
      }
      return points;
    } catch {
      return [];
    }
  }, [expr, xMin, xMax]);

  const handleCompute = () => {
    try {
      setCalcResult(String(evaluate(calcInput)));
    } catch {
      setCalcResult("Error in expression");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[520px] w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <h2 className="text-sm font-semibold">STEM Insertion Board</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="latex" className="flex flex-1 flex-col p-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="latex">
              <Sigma className="mr-2 h-4 w-4" /> Formula
            </TabsTrigger>
            <TabsTrigger value="graph">
              <FunctionSquare className="mr-2 h-4 w-4" /> Graph View
            </TabsTrigger>
            <TabsTrigger value="calc">
              <Calculator className="mr-2 h-4 w-4" /> Calculator
            </TabsTrigger>
          </TabsList>

          {/* LATEX TAB */}
          <TabsContent value="latex" className="flex flex-col gap-3 flex-1">
            <LatexPreview tex={tex} />
            <textarea
              value={tex}
              onChange={(e) => setTex(e.target.value)}
              rows={3}
              className="w-full rounded-md border p-2 font-mono text-sm resize-none"
              placeholder="Enter LaTeX..."
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7"
                  onClick={() => setTex((t) => `${t} ${p.tex}`)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="mt-auto">
              <Button className="w-full" onClick={() => onInsertLatex(tex)}>
                <PlusSquare className="mr-2 h-4 w-4" /> Insert Equation to Canvas
              </Button>
            </div>
          </TabsContent>

          {/* GRAPH TAB */}
          <TabsContent value="graph" className="flex flex-col gap-3 flex-1">
            <div className="flex gap-2">
              <input
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                className="flex-1 rounded-md border p-2 font-mono text-sm"
                placeholder="f(x) e.g. sin(x)"
              />
              <input
                type="number"
                value={xMin}
                onChange={(e) => setXMin(Number(e.target.value))}
                className="w-16 rounded-md border p-2 text-sm text-center"
              />
              <input
                type="number"
                value={xMax}
                onChange={(e) => setXMax(Number(e.target.value))}
                className="w-16 rounded-md border p-2 text-sm text-center"
              />
            </div>
            <div className="h-44 w-full rounded-md border bg-card p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="hsl(var(--primary))"
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* CALC TAB */}
          <TabsContent value="calc" className="flex flex-col gap-3 flex-1">
            <textarea
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              rows={2}
              placeholder="e.g. sqrt(144) + 12"
              className="w-full rounded-md border p-2 font-mono text-sm resize-none"
            />
            <Button variant="secondary" size="sm" onClick={handleCompute}>
              Evaluate Expression
            </Button>
            {calcResult && (
              <div className="rounded-md border bg-muted p-3 font-mono text-center flex-1 flex flex-col justify-center text-lg font-bold">
                = {calcResult}
              </div>
            )}
            <div className="mt-auto">
              <Button
                className="w-full"
                disabled={!calcResult || calcResult === "Error in expression"}
                onClick={() => onInsertText(`${calcInput} = ${calcResult}`)}
              >
                <PlusSquare className="mr-2 h-4 w-4" /> Insert Steps to Canvas
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

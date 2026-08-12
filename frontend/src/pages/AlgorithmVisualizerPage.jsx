import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Clock, Database, GitBranch } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const ALGORITHMS = [
  { id: 'bfs', label: 'BFS', complexity: 'O(V + E)', space: 'O(V)' },
  { id: 'dfs', label: 'DFS', complexity: 'O(V + E)', space: 'O(V)' },
  { id: 'dijkstra', label: 'Dijkstra', complexity: 'O((V+E) log V)', space: 'O(V)' },
];

// Simple graph layout for visualization
const GRAPH_NODES = [
  { id: 'A', x: 80, y: 200, label: 'Start' },
  { id: 'B', x: 180, y: 100 },
  { id: 'C', x: 180, y: 300 },
  { id: 'D', x: 300, y: 100 },
  { id: 'E', x: 300, y: 200 },
  { id: 'F', x: 300, y: 300 },
  { id: 'G', x: 420, y: 150 },
  { id: 'H', x: 420, y: 280 },
  { id: 'I', x: 540, y: 200, label: 'Dest' },
];

const GRAPH_EDGES = [
  { from: 'A', to: 'B', w: 4 }, { from: 'A', to: 'C', w: 2 },
  { from: 'B', to: 'D', w: 5 }, { from: 'B', to: 'E', w: 1 },
  { from: 'C', to: 'E', w: 8 }, { from: 'C', to: 'F', w: 10 },
  { from: 'D', to: 'G', w: 2 }, { from: 'E', to: 'G', w: 6 },
  { from: 'E', to: 'H', w: 3 }, { from: 'F', to: 'H', w: 1 },
  { from: 'G', to: 'I', w: 3 }, { from: 'H', to: 'I', w: 4 },
];

const DIJKSTRA_STEPS = [
  { current: 'A', visited: ['A'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: Infinity, F: Infinity, G: Infinity, H: Infinity, I: Infinity }, path: [] },
  { current: 'C', visited: ['A', 'C'], distances: { A: 0, B: 4, C: 2, D: Infinity, E: 10, F: 12, G: Infinity, H: Infinity, I: Infinity }, path: [] },
  { current: 'B', visited: ['A', 'C', 'B'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: Infinity, H: Infinity, I: Infinity }, path: [] },
  { current: 'E', visited: ['A', 'C', 'B', 'E'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: 11, H: 8, I: Infinity }, path: [] },
  { current: 'H', visited: ['A', 'C', 'B', 'E', 'H'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: 11, H: 8, I: 12 }, path: [] },
  { current: 'D', visited: ['A', 'C', 'B', 'E', 'H', 'D'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: 11, H: 8, I: 12 }, path: [] },
  { current: 'G', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: 11, H: 8, I: 12 }, path: [] },
  { current: 'I', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G', 'I'], distances: { A: 0, B: 4, C: 2, D: 9, E: 5, F: 12, G: 11, H: 8, I: 12 }, path: ['A', 'B', 'E', 'H', 'I'] },
];

function getNodePos(id) {
  return GRAPH_NODES.find((n) => n.id === id);
}

export default function AlgorithmVisualizerPage() {
  const [algo, setAlgo] = useState('dijkstra');
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const algoInfo = ALGORITHMS.find((a) => a.id === algo);
  const step = stepIndex >= 0 && stepIndex < DIJKSTRA_STEPS.length ? DIJKSTRA_STEPS[stepIndex] : null;

  const reset = useCallback(() => {
    setStepIndex(-1);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const run = useCallback(() => {
    reset();
    setIsRunning(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i >= DIJKSTRA_STEPS.length) {
        clearInterval(timerRef.current);
        setIsRunning(false);
        return;
      }
      setStepIndex(i);
      i++;
    }, 800);
  }, [reset]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const getNodeColor = (id) => {
    if (!step) return '#B8C5BB';
    if (step.path.includes(id)) return '#7CB342';
    if (id === step.current) return '#12372A';
    if (step.visited.includes(id)) return '#A8D66D';
    return '#B8C5BB';
  };

  const getEdgeColor = (from, to) => {
    if (!step) return '#DDE5DD';
    if (step.path.length > 1) {
      for (let i = 0; i < step.path.length - 1; i++) {
        if ((step.path[i] === from && step.path[i+1] === to) || (step.path[i] === to && step.path[i+1] === from)) {
          return '#7CB342';
        }
      }
    }
    if (step.visited.includes(from) && step.visited.includes(to)) return '#A8D66D';
    return '#DDE5DD';
  };

  const getEdgeWidth = (from, to) => {
    if (!step || step.path.length <= 1) return 2;
    for (let i = 0; i < step.path.length - 1; i++) {
      if ((step.path[i] === from && step.path[i+1] === to) || (step.path[i] === to && step.path[i+1] === from)) {
        return 4;
      }
    }
    return 2;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="section-container">
        <SectionHeading
          badge="Algorithm Visualizer"
          title="See the Graph in Action"
          subtitle="Understand how graph algorithms find their way through Agartala."
        />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {ALGORITHMS.map((a) => (
            <button
              key={a.id}
              onClick={() => { setAlgo(a.id); reset(); }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                algo === a.id
                  ? 'bg-brand-900 text-white shadow-md'
                  : 'bg-white text-content-secondary border border-border hover:border-brand-900/30'
              }`}
            >
              {a.label}
            </button>
          ))}
          <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
          <button onClick={run} disabled={isRunning} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Play size={16} /> Run Algorithm
          </button>
          <button onClick={reset} className="btn-secondary text-sm flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2 card p-6">
            <svg viewBox="0 0 620 400" className="w-full" style={{ maxHeight: '440px' }}>
              {/* Edges */}
              {GRAPH_EDGES.map((e) => {
                const from = getNodePos(e.from);
                const to = getNodePos(e.to);
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                return (
                  <g key={`${e.from}-${e.to}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={getEdgeColor(e.from, e.to)}
                      strokeWidth={getEdgeWidth(e.from, e.to)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                    />
                    <text x={mx} y={my - 8} textAnchor="middle" fontSize="11" fill="#66736A" fontWeight="500">{e.w}</text>
                  </g>
                );
              })}
              {/* Nodes */}
              {GRAPH_NODES.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r={node.label ? 22 : 16}
                    fill={getNodeColor(node.id)}
                    stroke="white" strokeWidth="3"
                    style={{ transition: 'fill 0.4s' }}
                  />
                  <text x={node.x} y={node.y + 5} textAnchor="middle"
                    fontSize="12" fontWeight="700" fill="white">{node.id}</text>
                  {node.label && (
                    <text x={node.x} y={node.y + 40} textAnchor="middle"
                      fontSize="10" fontWeight="600" fill="#12372A">{node.label}</text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3">Algorithm</h3>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-brand-accent" />
                <span className="text-lg font-bold text-content-primary">{algoInfo.label}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-content-secondary">Time</span><span className="font-mono font-semibold text-content-primary">{algoInfo.complexity}</span></div>
                <div className="flex justify-between"><span className="text-content-secondary">Space</span><span className="font-mono font-semibold text-content-primary">{algoInfo.space}</span></div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3">Current State</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-content-secondary">Current Node</span><span className="font-mono font-bold text-brand-900">{step ? step.current : '—'}</span></div>
                <div className="flex justify-between"><span className="text-content-secondary">Step</span><span className="font-mono font-bold">{step ? `${stepIndex + 1} / ${DIJKSTRA_STEPS.length}` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-content-secondary">Distance</span><span className="font-mono font-bold">{step ? (step.distances[step.current] === Infinity ? '∞' : step.distances[step.current]) : '—'}</span></div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3">Visited Nodes</h3>
              <div className="flex flex-wrap gap-2">
                {step ? step.visited.map((v) => (
                  <span key={v} className="text-xs font-mono font-semibold bg-brand-light/20 text-brand-900 px-2.5 py-1 rounded-lg">{v}</span>
                )) : <span className="text-content-secondary text-sm">Run the algorithm to begin</span>}
              </div>
            </div>

            {step && step.path.length > 0 && (
              <div className="card p-5 border-brand-accent/30 bg-brand-accent/5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">Shortest Path Found!</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {step.path.map((p, i) => (
                    <span key={p} className="flex items-center gap-1.5">
                      <span className="text-sm font-mono font-bold text-brand-900">{p}</span>
                      {i < step.path.length - 1 && <span className="text-brand-accent">→</span>}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-content-secondary mt-2">Total Distance: <strong className="text-brand-900">{step.distances['I']}</strong></p>
              </div>
            )}

            {/* Legend */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-edge" /> Unvisited</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-node" /> Processing</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-visited" /> Visited</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-route" /> Shortest Path</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

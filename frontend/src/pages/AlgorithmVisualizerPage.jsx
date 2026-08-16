import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Target } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const ALGORITHMS = [
  { id: 'dijkstra', label: 'Dijkstra', complexity: 'O((V+E) log V)', space: 'O(V)' },
  { id: 'bfs', label: 'BFS', complexity: 'O(V + E)', space: 'O(V)' },
  { id: 'dfs', label: 'DFS', complexity: 'O(V + E)', space: 'O(V)' },
];

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

const INIT_DISTANCES = { A: Infinity, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity, G: Infinity, H: Infinity, I: Infinity };

// Pre-computed exact steps of Dijkstra execution on the above graph.
const DIJKSTRA_STEPS = [
  { current: null, visited: [], evaluating: [], distances: { ...INIT_DISTANCES, A: 0 }, pq: [{ node: 'A', dist: 0 }], path: [] },
  { current: 'A', visited: ['A'], evaluating: ['B', 'C'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2 }, pq: [{ node: 'C', dist: 2 }, { node: 'B', dist: 4 }], path: [] },
  { current: 'C', visited: ['A', 'C'], evaluating: ['E', 'F'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 10, F: 12 }, pq: [{ node: 'B', dist: 4 }, { node: 'E', dist: 10 }, { node: 'F', dist: 12 }], path: [] },
  { current: 'B', visited: ['A', 'C', 'B'], evaluating: ['D', 'E'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12 }, pq: [{ node: 'E', dist: 5 }, { node: 'D', dist: 9 }, { node: 'F', dist: 12 }], path: [] },
  { current: 'E', visited: ['A', 'C', 'B', 'E'], evaluating: ['G', 'H'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8 }, pq: [{ node: 'H', dist: 8 }, { node: 'D', dist: 9 }, { node: 'G', dist: 11 }, { node: 'F', dist: 12 }], path: [] },
  { current: 'H', visited: ['A', 'C', 'B', 'E', 'H'], evaluating: ['I'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'D', dist: 9 }, { node: 'G', dist: 11 }, { node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [] },
  { current: 'D', visited: ['A', 'C', 'B', 'E', 'H', 'D'], evaluating: ['G'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'G', dist: 11 }, { node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [] },
  { current: 'G', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G'], evaluating: ['I'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [] },
  { current: 'F', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G', 'F'], evaluating: ['H'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'I', dist: 12 }], path: [] },
  { current: 'I', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G', 'F', 'I'], evaluating: [], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [], path: ['A', 'B', 'E', 'H', 'I'] },
];

function getNodePos(id) {
  return GRAPH_NODES.find((n) => n.id === id);
}

export default function AlgorithmVisualizerPage() {
  const [algo, setAlgo] = useState('dijkstra');
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  
  // Previous distances ref for highlighting changed rows
  const prevDistRef = useRef(null);

  const algoInfo = ALGORITHMS.find((a) => a.id === algo);
  const stepsData = algo === 'dijkstra' ? DIJKSTRA_STEPS : []; // Placeholder for BFS/DFS steps
  const step = stepIndex >= 0 && stepIndex < stepsData.length ? stepsData[stepIndex] : null;

  // Track previous step to animate table flashes
  useEffect(() => {
    if (step) prevDistRef.current = step.distances;
  }, [step]);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setIsRunning(false);
    prevDistRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const run = useCallback(() => {
    reset();
    setIsRunning(true);
    
    // Functional state update inside interval to avoid stale closures
    timerRef.current = setInterval(() => {
      setStepIndex((currentIdx) => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= stepsData.length) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          return currentIdx; // Stop at last step
        }
        return nextIdx;
      });
    }, 1200); // 1.2s per step to allow UI to be read
  }, [reset, stepsData.length]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const getNodeColor = (id) => {
    if (!step) return '#B8C5BB'; // Gray
    if (step.path.includes(id)) return '#7CB342'; // Route Green
    if (id === step.current) return '#12372A'; // Dark Green (Processing)
    if (step.evaluating.includes(id)) return '#D99A2B'; // Amber (Evaluating)
    if (step.visited.includes(id)) return '#A8D66D'; // Light Green (Settled)
    return '#B8C5BB';
  };

  const getEdgeStyle = (from, to) => {
    if (!step) return { color: '#DDE5DD', width: 2, dash: 'none' };
    
    // Final Path
    if (step.path.length > 1) {
      for (let i = 0; i < step.path.length - 1; i++) {
        if ((step.path[i] === from && step.path[i+1] === to) || (step.path[i] === to && step.path[i+1] === from)) {
          return { color: '#7CB342', width: 4, dash: 'none' };
        }
      }
    }
    
    // Currently Evaluating edge
    if (step.current === from && step.evaluating.includes(to)) {
      return { color: '#D99A2B', width: 3, dash: '4 4' };
    }
    
    // Settled Edge
    if (step.visited.includes(from) && step.visited.includes(to)) {
       return { color: '#A8D66D', width: 2, dash: 'none' };
    }
    
    return { color: '#DDE5DD', width: 2, dash: 'none' };
  };

  return (
    <div className="min-h-screen py-12 bg-surface-warm">
      <div className="section-container max-w-7xl">
        <SectionHeading
          badge="Educational Tool"
          title="Inside the Algorithm"
          subtitle="Watch how algorithms discover the shortest path through a network."
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Graph Visualization */}
          <div className="xl:col-span-2 space-y-6">
            <div className="card p-6 bg-white shadow-sm border border-border rounded-2xl relative overflow-hidden">
              {/* Overlay processing label */}
              {step && step.current && (
                 <div className="absolute top-4 left-4 bg-brand-900 text-white text-xs px-3 py-1.5 rounded-full shadow-md">
                   Processing Node {step.current}
                 </div>
              )}
              
              <svg viewBox="0 0 620 380" className="w-full" style={{ maxHeight: '420px' }}>
                {/* Edges */}
                {GRAPH_EDGES.map((e) => {
                  const from = getNodePos(e.from);
                  const to = getNodePos(e.to);
                  const mx = (from.x + to.x) / 2;
                  const my = (from.y + to.y) / 2;
                  const style = getEdgeStyle(e.from, e.to);
                  return (
                    <g key={`${e.from}-${e.to}`}>
                      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={style.color}
                        strokeWidth={style.width}
                        strokeDasharray={style.dash}
                        strokeLinecap="round"
                        style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                      />
                      <rect x={mx - 10} y={my - 10} width={20} height={20} fill="white" rx={10} />
                      <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fill="#66736A" fontWeight="600">{e.w}</text>
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

            {/* PQ Visualizer (Min-Heap display) */}
            <div className="card p-5 bg-white">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3 flex items-center gap-2">
                <Target size={14} /> Priority Queue (Min-Heap Array)
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 min-h-[64px]">
                {!step ? (
                   <span className="text-sm text-content-secondary italic">Queue is empty</span>
                ) : step.pq.length === 0 ? (
                   <span className="text-sm text-status-success font-semibold">Queue empty (Done)</span>
                ) : (
                  step.pq.map((item, idx) => (
                    <div key={item.node} 
                         className={`flex flex-col items-center justify-center min-w-[60px] h-14 rounded-xl border-2 transition-all ${
                           idx === 0 ? 'border-brand-900 bg-brand-900 text-white shadow-md' : 'border-border bg-surface-secondary text-content-primary'
                         }`}>
                      <span className="text-sm font-bold">{item.node}</span>
                      <span className={`text-[10px] ${idx === 0 ? 'text-brand-light' : 'text-content-secondary'}`}>dist: {item.dist}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: State & Distance Table */}
          <div className="space-y-6">
            
            <div className="card p-0 overflow-hidden bg-white">
              <div className="bg-surface-secondary px-5 py-4 border-b border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary">Distance Table</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-content-secondary uppercase bg-surface-warm/50">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Node</th>
                    <th className="px-5 py-3 font-semibold">Distance</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {GRAPH_NODES.map((node) => {
                    const dist = step ? step.distances[node.id] : Infinity;
                    const prevDist = prevDistRef.current ? prevDistRef.current[node.id] : dist;
                    const changed = step && dist !== prevDist;
                    const settled = step && step.visited.includes(node.id);
                    
                    return (
                      <tr key={node.id} 
                          className={`transition-colors duration-500 ${
                            changed ? 'bg-brand-accent/20' : 
                            settled ? 'bg-surface-warm text-content-secondary' : 'bg-white'
                          }`}>
                        <td className="px-5 py-2.5 font-bold flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${settled ? 'bg-brand-light' : step?.current === node.id ? 'bg-brand-900' : 'bg-border'}`} />
                          {node.id}
                        </td>
                        <td className={`px-5 py-2.5 font-mono font-medium ${changed ? 'text-brand-900 scale-110' : ''} transition-transform`}>
                          {dist === Infinity ? '∞' : dist}
                        </td>
                        <td className="px-5 py-2.5 text-xs">
                          {settled ? 'Settled' : step?.evaluating.includes(node.id) ? 'Updating...' : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Path Result Box */}
            {step && step.path.length > 0 && (
              <div className="card p-5 border-brand-accent/30 bg-brand-accent/5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">Shortest Path Found!</h3>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {step.path.map((p, i) => (
                    <span key={p} className="flex items-center gap-1.5">
                      <span className="text-sm font-mono font-bold text-brand-900 bg-white px-2 py-0.5 rounded shadow-sm">{p}</span>
                      {i < step.path.length - 1 && <span className="text-brand-accent font-bold">→</span>}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-content-primary">Total Distance: <strong className="text-brand-900 font-mono text-base">{step.distances['I']}</strong></p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

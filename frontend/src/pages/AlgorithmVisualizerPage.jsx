import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Zap, Target, Layers, ArrowRight } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const ALGORITHMS = [
  { id: 'dijkstra', label: 'Dijkstra', complexity: 'O((V+E) log V)', space: 'O(V)', ds: 'Min-Heap Priority Queue' },
  { id: 'bfs', label: 'BFS', complexity: 'O(V + E)', space: 'O(V)', ds: 'FIFO Queue' },
  { id: 'dfs', label: 'DFS', complexity: 'O(V + E)', space: 'O(V)', ds: 'Stack (call stack)' },
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

// ─────────────────────────────────────────────────────────────
// DIJKSTRA STEPS — Priority Queue (sorted by distance)
// Each step: { current, visited, evaluating, distances, pq, path }
// ─────────────────────────────────────────────────────────────
const INIT_DISTANCES = { A: Infinity, B: Infinity, C: Infinity, D: Infinity, E: Infinity, F: Infinity, G: Infinity, H: Infinity, I: Infinity };

const DIJKSTRA_STEPS = [
  { current: null, visited: [], evaluating: [], distances: { ...INIT_DISTANCES, A: 0 }, pq: [{ node: 'A', dist: 0 }], path: [], explanation: 'Initialize: set distance to source A = 0, all others = ∞. Push A into the priority queue.' },
  { current: 'A', visited: ['A'], evaluating: ['B', 'C'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2 }, pq: [{ node: 'C', dist: 2 }, { node: 'B', dist: 4 }], path: [], explanation: 'Pop A (dist 0). Relax neighbors: B gets 0+4=4, C gets 0+2=2. Push both. Queue re-sorts by distance.' },
  { current: 'C', visited: ['A', 'C'], evaluating: ['E', 'F'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 10, F: 12 }, pq: [{ node: 'B', dist: 4 }, { node: 'E', dist: 10 }, { node: 'F', dist: 12 }], path: [], explanation: 'Pop C (dist 2, smallest). Relax neighbors: E gets 2+8=10, F gets 2+10=12. B stays at 4.' },
  { current: 'B', visited: ['A', 'C', 'B'], evaluating: ['D', 'E'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12 }, pq: [{ node: 'E', dist: 5 }, { node: 'D', dist: 9 }, { node: 'F', dist: 12 }], path: [], explanation: 'Pop B (dist 4). Relax: D gets 4+5=9. E improves from 10 to 4+1=5 (shorter path found via B!).' },
  { current: 'E', visited: ['A', 'C', 'B', 'E'], evaluating: ['G', 'H'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8 }, pq: [{ node: 'H', dist: 8 }, { node: 'D', dist: 9 }, { node: 'G', dist: 11 }, { node: 'F', dist: 12 }], path: [], explanation: 'Pop E (dist 5). Relax: G gets 5+6=11, H gets 5+3=8. Four nodes remain in the queue.' },
  { current: 'H', visited: ['A', 'C', 'B', 'E', 'H'], evaluating: ['I'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'D', dist: 9 }, { node: 'G', dist: 11 }, { node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [], explanation: 'Pop H (dist 8). Relax: I gets 8+4=12. F already visited via C. Destination I now reachable!' },
  { current: 'D', visited: ['A', 'C', 'B', 'E', 'H', 'D'], evaluating: ['G'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'G', dist: 11 }, { node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [], explanation: 'Pop D (dist 9). Check G: 9+2=11, same as current — no improvement. Queue shrinks.' },
  { current: 'G', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G'], evaluating: ['I'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'F', dist: 12 }, { node: 'I', dist: 12 }], path: [], explanation: 'Pop G (dist 11). Check I: 11+3=14 > 12 — no improvement. The path via H is still shorter.' },
  { current: 'F', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G', 'F'], evaluating: ['H'], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [{ node: 'I', dist: 12 }], path: [], explanation: 'Pop F (dist 12). Neighbor H already settled at dist 8 — skip. Only I remains.' },
  { current: 'I', visited: ['A', 'C', 'B', 'E', 'H', 'D', 'G', 'F', 'I'], evaluating: [], distances: { ...INIT_DISTANCES, A: 0, B: 4, C: 2, E: 5, D: 9, F: 12, G: 11, H: 8, I: 12 }, pq: [], path: ['A', 'B', 'E', 'H', 'I'], explanation: 'Pop I (dist 12). Destination reached! Backtrack parents: I←H←E←B←A. Shortest path cost: 12.' },
];

// ─────────────────────────────────────────────────────────────
// BFS STEPS — FIFO Queue (no distances, no weights)
// Each step: { current, visited, evaluating, queue, level, parent, path, explanation }
//
// BFS ignores edge weights entirely. It explores level by level.
// Level = number of edges (hops) from the source.
// The FIFO queue enforces breadth-first order: all nodes at
// level k are fully processed before any node at level k+1.
//
// Parent tracking: when we first discover a node, we record
// which node discovered it. This is how we reconstruct the
// shortest-hop path at the end.
//
// BFS execution on the graph from A:
//   Level 0: A
//   Level 1: B, C           (neighbors of A)
//   Level 2: D, E, F        (neighbors of B,C not yet visited)
//   Level 3: G, H           (neighbors of D,E,F not yet visited)
//   Level 4: I              (neighbor of G,H — destination!)
//
// Shortest path by hops: A → B → D → G → I  (4 edges)
// ─────────────────────────────────────────────────────────────
const BFS_STEPS = [
  {
    current: null,
    visited: [],
    evaluating: [],
    queue: ['A'],
    level: { A: 0 },
    parent: { A: null },
    path: [],
    explanation: 'Initialize: mark source A as discovered at level 0. Enqueue A into the FIFO queue. All other nodes are undiscovered.',
  },
  {
    current: 'A',
    visited: ['A'],
    evaluating: ['B', 'C'],
    queue: ['B', 'C'],
    level: { A: 0, B: 1, C: 1 },
    parent: { A: null, B: 'A', C: 'A' },
    path: [],
    explanation: 'Dequeue A (level 0). Expand: discover neighbors B and C. Both are level 1 (one hop from A). Enqueue B, then C — FIFO order means B will be processed first.',
  },
  {
    current: 'B',
    visited: ['A', 'B'],
    evaluating: ['D', 'E'],
    queue: ['C', 'D', 'E'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B' },
    path: [],
    explanation: 'Dequeue B (level 1). Expand: A already visited, skip. Discover D and E at level 2 (two hops). Enqueue D, E after C — C entered the queue first, so it comes out first.',
  },
  {
    current: 'C',
    visited: ['A', 'B', 'C'],
    evaluating: ['E', 'F'],
    queue: ['D', 'E', 'F'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C' },
    path: [],
    explanation: 'Dequeue C (level 1). Expand: E already discovered via B — skip. Discover F at level 2. Enqueue F. All level-1 nodes are now processed.',
  },
  {
    current: 'D',
    visited: ['A', 'B', 'C', 'D'],
    evaluating: ['G'],
    queue: ['E', 'F', 'G'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D' },
    path: [],
    explanation: 'Dequeue D (level 2). Expand: B visited. Discover G at level 3 (three hops from A via A→B→D→G). Enqueue G.',
  },
  {
    current: 'E',
    visited: ['A', 'B', 'C', 'D', 'E'],
    evaluating: ['G', 'H'],
    queue: ['F', 'G', 'H'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3, H: 3 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D', H: 'E' },
    path: [],
    explanation: 'Dequeue E (level 2). Expand: G already discovered via D — skip. Discover H at level 3. Enqueue H.',
  },
  {
    current: 'F',
    visited: ['A', 'B', 'C', 'D', 'E', 'F'],
    evaluating: ['H'],
    queue: ['G', 'H'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3, H: 3 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D', H: 'E' },
    path: [],
    explanation: 'Dequeue F (level 2). Expand: H already discovered via E — skip. All level-2 nodes are now fully processed.',
  },
  {
    current: 'G',
    visited: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    evaluating: ['I'],
    queue: ['H', 'I'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3, H: 3, I: 4 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D', H: 'E', I: 'G' },
    path: [],
    explanation: 'Dequeue G (level 3). Expand: Discover I at level 4! Destination is now in the queue. Enqueue I.',
  },
  {
    current: 'H',
    visited: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    evaluating: ['I'],
    queue: ['I'],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3, H: 3, I: 4 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D', H: 'E', I: 'G' },
    path: [],
    explanation: 'Dequeue H (level 3). Expand: I already discovered via G — skip. Only I remains in the queue.',
  },
  {
    current: 'I',
    visited: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    evaluating: [],
    queue: [],
    level: { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 3, H: 3, I: 4 },
    parent: { A: null, B: 'A', C: 'A', D: 'B', E: 'B', F: 'C', G: 'D', H: 'E', I: 'G' },
    path: ['A', 'B', 'D', 'G', 'I'],
    explanation: 'Dequeue I (level 4). Destination reached! Backtrack parents: I←G←D←B←A. Shortest path by hops: 4 edges. BFS guarantees this is optimal for unweighted graphs.',
  },
];

// ─────────────────────────────────────────────────────────────
// DFS STEPS — Call Stack (LIFO)
// Each step: { current, visited, evaluating, stack, traversal, parent, path, explanation }
//
// DFS ignores edge weights entirely. It explores by plunging as
// deep as possible along each branch before backtracking.
// It uses a Stack (typically the call stack via recursion).
// ─────────────────────────────────────────────────────────────
const DFS_STEPS = [
  {
    current: null, visited: [], evaluating: [], stack: [], traversal: [], parent: { A: null }, path: [],
    explanation: 'Initialize: Start at source node A. The call stack is currently empty.',
  },
  {
    current: 'A', visited: ['A'], evaluating: ['B'], stack: ['A'], traversal: ['A'], parent: { A: null }, path: [],
    explanation: 'Call DFS(A). Push A to the stack and mark it visited. Examine its first neighbor, B.',
  },
  {
    current: 'B', visited: ['A', 'B'], evaluating: ['D'], stack: ['A', 'B'], traversal: ['A', 'B'], parent: { A: null, B: 'A' }, path: [],
    explanation: 'DFS plunges deep immediately! Call DFS(B). Push B to the stack without checking A\'s other neighbors yet. Examine B\'s neighbor, D.',
  },
  {
    current: 'D', visited: ['A', 'B', 'D'], evaluating: ['G'], stack: ['A', 'B', 'D'], traversal: ['A', 'B', 'D'], parent: { A: null, B: 'A', D: 'B' }, path: [],
    explanation: 'Call DFS(D). Push D to the stack. The recursion goes deeper. Examine D\'s neighbor, G.',
  },
  {
    current: 'G', visited: ['A', 'B', 'D', 'G'], evaluating: ['I'], stack: ['A', 'B', 'D', 'G'], traversal: ['A', 'B', 'D', 'G'], parent: { A: null, B: 'A', D: 'B', G: 'D' }, path: [],
    explanation: 'Call DFS(G). Push G to the stack. Examine G\'s neighbor, I. We notice I is our destination node!',
  },
  {
    current: 'I', visited: ['A', 'B', 'D', 'G', 'I'], evaluating: [], stack: ['A', 'B', 'D', 'G', 'I'], traversal: ['A', 'B', 'D', 'G', 'I'], parent: { A: null, B: 'A', D: 'B', G: 'D', I: 'G' }, path: ['A', 'B', 'D', 'G', 'I'],
    explanation: 'Call DFS(I). Push I to the stack. Destination reached! DFS stops and returns the path. Notice how it blindly followed the first branch down. DFS does NOT guarantee the optimal shortest path.',
  },
];

function getNodePos(id) {
  return GRAPH_NODES.find((n) => n.id === id);
}

export default function AlgorithmVisualizerPage() {
  const [algo, setAlgo] = useState('dijkstra');
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const prevStepRef = useRef(null);

  const algoInfo = ALGORITHMS.find((a) => a.id === algo);
  const stepsData = algo === 'dijkstra' ? DIJKSTRA_STEPS : algo === 'bfs' ? BFS_STEPS : algo === 'dfs' ? DFS_STEPS : [];
  const step = stepIndex >= 0 && stepIndex < stepsData.length ? stepsData[stepIndex] : null;

  // Track previous step for table flash animations
  useEffect(() => {
    if (step) prevStepRef.current = step;
  }, [step]);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setIsRunning(false);
    prevStepRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const run = useCallback(() => {
    reset();
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setStepIndex((currentIdx) => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= stepsData.length) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          return currentIdx;
        }
        return nextIdx;
      });
    }, 1200);
  }, [reset, stepsData.length]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const getNodeColor = (id) => {
    if (!step) return '#B8C5BB';
    if (step.path.includes(id)) return '#7CB342';
    if (id === step.current) return '#12372A';
    if (step.evaluating.includes(id)) return '#D99A2B';
    if (step.visited.includes(id)) return '#A8D66D';
    return '#B8C5BB';
  };

  const getEdgeStyle = (from, to) => {
    if (!step) return { color: '#DDE5DD', width: 2, dash: 'none' };
    if (step.path.length > 1) {
      for (let i = 0; i < step.path.length - 1; i++) {
        if ((step.path[i] === from && step.path[i+1] === to) || (step.path[i] === to && step.path[i+1] === from)) {
          return { color: '#7CB342', width: 4, dash: 'none' };
        }
      }
    }
    if (step.current === from && step.evaluating.includes(to)) {
      return { color: '#D99A2B', width: 3, dash: '4 4' };
    }
    if (step.visited.includes(from) && step.visited.includes(to)) {
       return { color: '#A8D66D', width: 2, dash: 'none' };
    }
    return { color: '#DDE5DD', width: 2, dash: 'none' };
  };

  // ── Render helpers for algorithm-specific panels ──

  const renderQueuePanel = () => {
    if (algo === 'dijkstra') {
      const pq = step?.pq || [];
      return (
        <div className="card p-5 bg-white">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3 flex items-center gap-2">
            <Target size={14} /> Priority Queue (Min-Heap)
          </h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 min-h-[64px]">
            {!step ? (
               <span className="text-sm text-content-secondary italic">Run the algorithm to begin</span>
            ) : pq.length === 0 ? (
               <span className="text-sm text-status-success font-semibold">Queue empty — algorithm complete</span>
            ) : (
              pq.map((item, idx) => (
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
          {pq.length > 0 && (
            <p className="text-[11px] text-content-secondary mt-2">← Front (next to pop) — sorted ascending by distance</p>
          )}
        </div>
      );
    }

    if (algo === 'bfs') {
      const queue = step?.queue || [];
      return (
        <div className="card p-5 bg-white">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3 flex items-center gap-2">
            <Layers size={14} /> FIFO Queue
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 min-h-[64px]">
            {!step ? (
               <span className="text-sm text-content-secondary italic">Run the algorithm to begin</span>
            ) : queue.length === 0 ? (
               <span className="text-sm text-status-success font-semibold">Queue empty — algorithm complete</span>
            ) : (
              <>
                {queue.map((nodeId, idx) => (
                  <div key={nodeId} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center min-w-[48px] h-12 rounded-xl border-2 transition-all ${
                      idx === 0
                        ? 'border-brand-900 bg-brand-900 text-white shadow-md'
                        : 'border-border bg-surface-secondary text-content-primary'
                    }`}>
                      <span className="text-sm font-bold px-2">{nodeId}</span>
                    </div>
                    {idx < queue.length - 1 && <ArrowRight size={14} className="text-content-secondary/40 flex-shrink-0" />}
                  </div>
                ))}
              </>
            )}
          </div>
          {queue.length > 0 && (
            <p className="text-[11px] text-content-secondary mt-2">← Front (next to dequeue) · New nodes enter from the right →</p>
          )}
        </div>
      );
    }

    if (algo === 'dfs') {
      const stack = step?.stack || [];
      return (
        <div className="card p-5 bg-white">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3 flex items-center gap-2">
            <Layers size={14} /> Call Stack (LIFO)
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 min-h-[64px]">
            {!step ? (
               <span className="text-sm text-content-secondary italic">Run the algorithm to begin</span>
            ) : stack.length === 0 ? (
               <span className="text-sm text-status-success font-semibold">Stack empty — algorithm complete</span>
            ) : (
              <div className="flex items-center gap-2">
                {stack.map((nodeId, idx) => {
                  const isTop = idx === stack.length - 1;
                  return (
                    <div key={nodeId} className="flex items-center gap-2">
                      <div className={`flex items-center justify-center min-w-[48px] h-12 rounded-xl border-2 transition-all ${
                        isTop
                          ? 'border-brand-900 bg-brand-900 text-white shadow-md transform scale-110'
                          : 'border-border bg-surface-secondary text-content-secondary'
                      }`}>
                        <span className="text-sm font-bold px-2">{nodeId}</span>
                      </div>
                      {!isTop && <span className="text-border mx-1">|</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {stack.length > 0 && (
            <p className="text-[11px] text-content-secondary mt-2">Bottom of stack ← · → <strong className="text-brand-900">Top of stack</strong> (currently executing)</p>
          )}
        </div>
      );
    }

    return null;
  };

  const renderDataTable = () => {
    if (algo === 'dijkstra') {
      return (
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
                const prevDist = prevStepRef.current?.distances?.[node.id] ?? dist;
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
                    <td className={`px-5 py-2.5 font-mono font-medium ${changed ? 'text-brand-900' : ''}`}>
                      {dist === Infinity ? '∞' : dist}
                    </td>
                    <td className="px-5 py-2.5 text-xs">
                      {settled ? 'Settled' : step?.evaluating.includes(node.id) ? 'Relaxing...' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (algo === 'bfs') {
      return (
        <div className="card p-0 overflow-hidden bg-white">
          <div className="bg-surface-secondary px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary">BFS Traversal Table</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-secondary uppercase bg-surface-warm/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Node</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Parent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GRAPH_NODES.map((node) => {
                const level = step?.level?.[node.id];
                const parent = step?.parent?.[node.id];
                const discovered = level !== undefined;
                const settled = step && step.visited.includes(node.id);
                const prevDiscovered = prevStepRef.current?.level?.[node.id] !== undefined;
                const justDiscovered = step && discovered && !prevDiscovered;
                return (
                  <tr key={node.id}
                      className={`transition-colors duration-500 ${
                        justDiscovered ? 'bg-brand-accent/20' :
                        settled ? 'bg-surface-warm text-content-secondary' : 'bg-white'
                      }`}>
                    <td className="px-4 py-2.5 font-bold flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${settled ? 'bg-brand-light' : step?.current === node.id ? 'bg-brand-900' : 'bg-border'}`} />
                      {node.id}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-medium">
                      {discovered ? level : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-content-secondary">
                      {parent !== undefined ? (parent === null ? 'src' : parent) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {step?.current === node.id ? 'Processing' : settled ? 'Visited' : step?.evaluating.includes(node.id) ? 'Discovering...' : discovered ? 'In Queue' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (algo === 'dfs') {
      return (
        <div className="card p-0 overflow-hidden bg-white">
          <div className="bg-surface-secondary px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-content-primary">DFS Traversal Tracker</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-secondary uppercase bg-surface-warm/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Node</th>
                <th className="px-4 py-3 font-semibold">Traversal Order</th>
                <th className="px-4 py-3 font-semibold">Parent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GRAPH_NODES.map((node) => {
                const visitedIndex = step?.traversal.indexOf(node.id);
                const isVisited = visitedIndex !== undefined && visitedIndex !== -1;
                const parent = step?.parent?.[node.id];
                const prevVisited = prevStepRef.current?.traversal.includes(node.id);
                const justVisited = step && isVisited && !prevVisited;
                return (
                  <tr key={node.id}
                      className={`transition-colors duration-500 ${
                        justVisited ? 'bg-brand-accent/20' :
                        isVisited ? 'bg-surface-warm text-content-secondary' : 'bg-white'
                      }`}>
                    <td className="px-4 py-2.5 font-bold flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isVisited ? 'bg-brand-light' : step?.current === node.id ? 'bg-brand-900' : 'bg-border'}`} />
                      {node.id}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-medium">
                      {isVisited ? `#${visitedIndex + 1}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-content-secondary">
                      {parent !== undefined ? (parent === null ? 'src' : parent) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {step?.current === node.id ? 'Top of Stack' : isVisited ? 'Visited' : 'Unvisited'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderPathResult = () => {
    if (!step || step.path.length === 0) return null;

    const isDijkstra = algo === 'dijkstra';
    return (
      <div className="card p-5 border-brand-accent/30 bg-brand-accent/5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
          {isDijkstra ? 'Shortest Path Found!' : 'Path Found!'}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {step.path.map((p, i) => (
            <span key={p} className="flex items-center gap-1.5">
              <span className="text-sm font-mono font-bold text-brand-900 bg-white px-2 py-0.5 rounded shadow-sm">{p}</span>
              {i < step.path.length - 1 && <span className="text-brand-accent font-bold">→</span>}
            </span>
          ))}
        </div>
        {isDijkstra ? (
          <p className="text-sm text-content-primary">Total Weighted Distance: <strong className="text-brand-900 font-mono text-base">{step.distances['I']}</strong></p>
        ) : (
          <p className="text-sm text-content-primary">Total Hops: <strong className="text-brand-900 font-mono text-base">{step.path.length - 1} edges</strong></p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12 bg-surface-warm">
      <div className="section-container max-w-7xl">
        <SectionHeading
          badge="Educational Tool"
          title="Inside the Algorithm"
          subtitle="Watch how graph algorithms discover paths through a network, step by step."
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
          <button onClick={run} disabled={isRunning || stepsData.length === 0} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
            <Play size={16} /> Run Algorithm
          </button>
          <button onClick={reset} className="btn-secondary text-sm flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Algorithm Info Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-brand-accent" />
            <span className="text-content-secondary">Time:</span>
            <span className="font-mono font-semibold text-content-primary">{algoInfo.complexity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-content-secondary">Space:</span>
            <span className="font-mono font-semibold text-content-primary">{algoInfo.space}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-content-secondary">Data Structure:</span>
            <span className="font-mono font-semibold text-content-primary">{algoInfo.ds}</span>
          </div>
          {step && (
            <div className="flex items-center gap-2">
              <span className="text-content-secondary">Step:</span>
              <span className="font-mono font-bold text-brand-900">{stepIndex + 1} / {stepsData.length}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Column: Graph + Queue */}
          <div className="xl:col-span-2 space-y-6">
            <div className="card p-6 bg-white shadow-sm border border-border rounded-2xl relative overflow-hidden">
              {step && step.current && (
                 <div className="absolute top-4 left-4 bg-brand-900 text-white text-xs px-3 py-1.5 rounded-full shadow-md">
                   {algo === 'bfs' ? 'Dequeued' : 'Popped'}: Node {step.current}
                 </div>
              )}
              {step && (
                <div className="absolute top-4 right-4 text-xs text-content-secondary bg-surface-secondary px-3 py-1.5 rounded-full">
                  {algo === 'bfs' ? `Level ${step.level?.[step.current] ?? '?'}` : `Dist: ${step.distances?.[step.current] ?? '?'}`}
                </div>
              )}

              <svg viewBox="0 0 620 380" className="w-full" style={{ maxHeight: '420px' }}>
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
                      {/* Edge weight labels — show for Dijkstra, dim for BFS */}
                      <rect x={mx - 10} y={my - 10} width={20} height={20} fill="white" rx={10} />
                      <text x={mx} y={my + 4} textAnchor="middle" fontSize="11"
                        fill={algo === 'bfs' ? '#B8C5BB' : '#66736A'}
                        fontWeight="600">{e.w}</text>
                    </g>
                  );
                })}
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

            {/* Queue Panel — adapts per algorithm */}
            {renderQueuePanel()}

            {/* Explanation Panel */}
            <div className="card p-5 bg-white border-l-4 border-brand-accent">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">What's happening</h3>
              <p className="text-sm text-content-primary leading-relaxed">
                {step ? step.explanation : 'Press "Run Algorithm" to watch the algorithm execute step by step on this graph.'}
              </p>
            </div>
          </div>

          {/* Right Column: Data Table + Result */}
          <div className="space-y-6">
            {renderDataTable()}
            {renderPathResult()}

            {/* Legend */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content-secondary mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-edge" /> Undiscovered</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-node" /> Processing</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#D99A2B' }} /> Evaluating Neighbor</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-visited" /> Visited / Settled</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-graph-route" /> Final Path</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

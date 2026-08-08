import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from graph import Graph
from algorithms import dijkstra_shortest_path, reconstruct_path

def run_tests():
    print("--- Simulating VegRoute Dijkstra ---")
    g = Graph(directed=True)
    
    # Agartala Roads Simulation
    # Govinda's (Start) -> B -> C -> D (Destination)
    # Start -> B: 5 mins
    # B -> C: 15 mins (Heavy traffic)
    # C -> D: 5 mins
    # Start -> X -> Y -> D: The "long way" but faster traffic
    
    g.add_edge("Start", "B", weight=5)
    g.add_edge("B", "C", weight=15)
    g.add_edge("C", "Dest", weight=5)
    
    g.add_edge("Start", "X", weight=6)
    g.add_edge("X", "Y", weight=6)
    g.add_edge("Y", "Dest", weight=6)
    
    print("\nRunning Dijkstra to find quickest route to Dest...")
    distances, prev = dijkstra_shortest_path(g, "Start", target_node="Dest")
    
    print(f"\nFinal Distance Map: {distances}")
    
    route = reconstruct_path(prev, "Start", "Dest")
    print(f"Optimal Route: {' -> '.join(route)}")
    print(f"Total Time: {distances['Dest']} mins")

if __name__ == "__main__":
    run_tests()

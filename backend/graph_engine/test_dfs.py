import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from graph import Graph
from algorithms import find_connected_components

def run_tests():
    print("--- Simulating VegRoute DFS & Connectivity ---")
    
    # We explicitly use an UNDIRECTED graph for connectivity checks
    # to accurately find Weakly Connected Components without Tarjan's algorithm.
    g = Graph(directed=False) 
    
    # Component 1: Main City (Size 4)
    g.add_edge("Main_1", "Main_2")
    g.add_edge("Main_2", "Main_3")
    g.add_edge("Main_3", "Main_4")
    
    # Component 2: Isolated Island (Size 2) - A map error!
    g.add_edge("Island_1", "Island_2")
    
    # Component 3: Completely disconnected single node (Size 1)
    g.add_node("Nowhere")
    
    print("\nRunning Connected Components Discovery (Iterative DFS):")
    components = find_connected_components(g)
    
    print(f"Found {len(components)} distinct components in the city:")
    for i, comp in enumerate(components):
        print(f"Component {i+1} (Size {len(comp)}): {comp}")
        
    print(f"\nIn VegRoute's import pipeline, we would keep Component 1 and DELETE the remaining {len(components) - 1} isolated component(s).")

if __name__ == "__main__":
    run_tests()

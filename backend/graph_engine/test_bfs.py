import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from graph import Graph
from algorithms import bfs_shortest_path, bfs_explore

def run_tests():
    print("--- Simulating VegRoute BFS ---")
    
    # We use a DIRECTED graph for routing simulations
    g = Graph(directed=True)
    
    # Building a small city grid
    # N_Start -> N_B -> N_C (Has Restaurant)
    # N_Start -> N_D -> N_E
    g.add_edge("N_Start", "N_B")
    g.add_edge("N_Start", "N_D")
    g.add_edge("N_B", "N_C")
    g.add_edge("N_D", "N_E")
    
    # Isolated node to test connected components exploration
    g.add_node("N_Isolated")
    
    print("\n[Test 1] Searching for nearest restaurant node (N_C):")
    target_restaurant_nodes = {"N_C"}
    path = bfs_shortest_path(g, "N_Start", target_nodes=target_restaurant_nodes)
    print(f"Path to nearest restaurant: {path}")
    
    print("\n[Test 2] Searching for restaurant when ALREADY AT the restaurant (N_C):")
    path_same = bfs_shortest_path(g, "N_C", target_nodes=target_restaurant_nodes)
    print(f"Path when starting at target: {path_same}")

    print("\n[Test 3] Exploring everything within 1 block of N_Start:")
    local_area = bfs_explore(g, "N_Start", max_depth=1)
    print(local_area)
    
    print("\n[Test 4] Exploring from an isolated degree-0 node:")
    isolated_area = bfs_explore(g, "N_Isolated")
    print(f"Nodes reached: {isolated_area}")

if __name__ == "__main__":
    run_tests()

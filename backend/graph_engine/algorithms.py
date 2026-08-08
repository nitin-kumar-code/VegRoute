from collections import deque

def bfs_shortest_path(graph, start_node, target_nodes):
    """
    Finds the shortest path (by hop count) from start_node to any node in target_nodes.
    
    This answers the specific routing query: "What is the nearest restaurant from here
    in terms of the fewest intersections crossed?"
    
    Args:
        graph: An instance of our Graph class.
        start_node (str): The node ID to begin the search from.
        target_nodes (set): A set of node IDs we are looking for (e.g., restaurant snap nodes).
        
    Returns:
        list | None: A list of node IDs representing the path from start to target.
                     Returns None if no path is found.
    """
    if not graph.has_node(start_node):
        raise ValueError(f"Start node {start_node} not found in the graph.")
        
    # Check if we are already standing at a target node before we even loop
    if start_node in target_nodes:
        return [start_node]

    # Queue stores the nodes to visit next
    queue = deque([start_node])
    
    # Visited set prevents infinite loops in cycles (like roundabouts)
    visited = {start_node}
    
    # Track the path taken to reconstruct the route later
    previous_node = {start_node: None}

    while queue:
        current_node = queue.popleft()

        # Explore all immediate neighbors
        neighbors = graph.get_neighbors(current_node)
        for neighbor in neighbors.keys():
            if neighbor not in visited:
                # Mark as visited IMMEDIATELY to prevent duplicate queue insertions
                visited.add(neighbor)
                previous_node[neighbor] = current_node
                
                # Check if the neighbor is our target
                if neighbor in target_nodes:
                    # Target found! Reconstruct the path backwards.
                    path = []
                    step = neighbor
                    while step is not None:
                        path.append(step)
                        step = previous_node[step]
                    return path[::-1] # Reverse the path to get start -> ... -> target
                
                # If not a target, enqueue it for further exploration
                queue.append(neighbor)

    return None # Target not reachable from start_node


def bfs_explore(graph, start_node, max_depth=None):
    """
    Explores all reachable nodes up to a certain depth.
    
    This answers exploration queries: "Find everything within N blocks" OR
    "Map out this entire connected component" (if max_depth is None).
    
    Args:
        graph: An instance of our Graph class.
        start_node (str): The node ID to begin the search from.
        max_depth (int, optional): The maximum number of hops/intersections to explore.
        
    Returns:
        dict: A mapping of {node_id: depth} for every node discovered.
    """
    if not graph.has_node(start_node):
        raise ValueError(f"Start node {start_node} not found in the graph.")

    # Queue stores tuples of (current_node, current_depth)
    queue = deque([(start_node, 0)])
    
    # Store the results and track visited nodes simultaneously
    explored_nodes = {start_node: 0}

    while queue:
        current_node, current_depth = queue.popleft()

        # Check if we hit the maximum search radius
        if max_depth is not None and current_depth >= max_depth:
            continue

        # Explore all immediate neighbors
        neighbors = graph.get_neighbors(current_node)
        for neighbor in neighbors.keys():
            if neighbor not in explored_nodes:
                explored_nodes[neighbor] = current_depth + 1
                queue.append((neighbor, current_depth + 1))
                
    return explored_nodes


# --- Interactive Test Run ---
if __name__ == "__main__":
    import sys
    import os
    
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from graph import Graph

    print("--- Simulating VegRoute BFS ---")
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

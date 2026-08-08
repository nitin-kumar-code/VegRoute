from collections import deque
import heapq

# ==========================================
# BREADTH-FIRST SEARCH (BFS)
# ==========================================

def bfs_shortest_path(graph, start_node, target_nodes):
    """
    Finds the shortest path (by hop count) from start_node to any node in target_nodes.
    """
    if not graph.has_node(start_node):
        raise ValueError(f"Start node {start_node} not found in the graph.")
        
    if start_node in target_nodes:
        return [start_node]

    queue = deque([start_node])
    visited = {start_node}
    previous_node = {start_node: None}

    while queue:
        current_node = queue.popleft()
        neighbors = graph.get_neighbors(current_node)
        
        for neighbor in neighbors.keys():
            if neighbor not in visited:
                visited.add(neighbor)
                previous_node[neighbor] = current_node
                
                if neighbor in target_nodes:
                    path = []
                    step = neighbor
                    while step is not None:
                        path.append(step)
                        step = previous_node[step]
                    return path[::-1]
                
                queue.append(neighbor)

    return None


def bfs_explore(graph, start_node, max_depth=None):
    """
    Explores all reachable nodes up to a certain depth.
    """
    if not graph.has_node(start_node):
        raise ValueError(f"Start node {start_node} not found in the graph.")

    queue = deque([(start_node, 0)])
    explored_nodes = {start_node: 0}

    while queue:
        current_node, current_depth = queue.popleft()
        if max_depth is not None and current_depth >= max_depth:
            continue

        neighbors = graph.get_neighbors(current_node)
        for neighbor in neighbors.keys():
            if neighbor not in explored_nodes:
                explored_nodes[neighbor] = current_depth + 1
                queue.append((neighbor, current_depth + 1))
                
    return explored_nodes


# ==========================================
# DEPTH-FIRST SEARCH (DFS) & COMPONENTS
# ==========================================

def dfs_recursive(graph, current_node, visited=None, component=None):
    """
    Recursive DFS: Explores as deep as possible along each branch before backtracking.
    """
    if visited is None:
        visited = set()
    if component is None:
        component = []
        
    visited.add(current_node)
    component.append(current_node)
    
    for neighbor in graph.get_neighbors(current_node).keys():
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited, component)
            
    return component


def dfs_iterative(graph, start_node, visited_global=None):
    """
    Iterative DFS: Uses an explicit Stack to avoid Python's RecursionError limit.
    Perfect for massive, sprawling road networks.
    """
    if not graph.has_node(start_node):
        return []
        
    stack = [start_node]
    
    if visited_global is None:
        visited_global = set()
        
    component = []
    
    while stack:
        current = stack.pop()
        
        if current not in visited_global:
            visited_global.add(current)
            component.append(current)
            
            for neighbor in graph.get_neighbors(current).keys():
                if neighbor not in visited_global:
                    stack.append(neighbor)
                    
    return component


def find_connected_components(graph):
    """
    Uses DFS to find all distinct, isolated 'islands' in the road network.
    """
    visited_global = set()
    components = []
    
    for node in graph.adj_list.keys():
        if node not in visited_global:
            new_component = dfs_iterative(graph, node, visited_global)
            components.append(new_component)
            
    components.sort(key=len, reverse=True)
    return components


# ==========================================
# DIJKSTRA'S ALGORITHM
# ==========================================

def dijkstra_shortest_path(graph, start_node, target_node=None):
    """
    Finds the shortest path from start_node to all reachable nodes (or a specific target).
    Unlike BFS, Dijkstra respects the actual 'weight' of the edge (e.g., travel time or distance).
    
    CRITICAL CAVEAT FOR TSP MATRIX:
    If a `target_node` is provided, the algorithm exits early. The resulting `distances` dict 
    will ONLY be accurate for nodes that were locked in before the target was reached. 
    If you are building the all-pairs distance matrix for the Veg Trail feature, you MUST 
    leave `target_node=None` to guarantee every reachable node is fully evaluated.
    
    Args:
        graph: An instance of our Graph class.
        start_node (str): The node ID to begin routing from.
        target_node (str, optional): If provided, the algorithm exits early once this node is reached,
                                     saving significant computation for A->B routing.
                                     
    Returns:
        tuple: (distances, previous_nodes)
               - distances: dict mapping node to its shortest known distance from start
               - previous_nodes: dict used to reconstruct the path
    """
    if not graph.has_node(start_node):
        raise ValueError(f"Start node {start_node} not found in the graph.")

    # 1. Initialization
    # Set all distances to infinity initially, except the start node which is 0.
    distances = {node: float('infinity') for node in graph.adj_list}
    distances[start_node] = 0.0
    
    # Keep track of where we came from to rebuild the route line later
    previous_nodes = {node: None for node in graph.adj_list}
    
    # The Priority Queue (Min-Heap). 
    # Python's heapq sorts tuples by the first element, so we push (distance, node_id)
    pq = [(0.0, start_node)]
    
    # A set to track nodes we have 'locked in' (fully processed).
    visited = set()

    while pq:
        # 2. Pop the node with the CURRENT SMALLEST distance
        current_distance, current_node = heapq.heappop(pq)
        
        # If we already processed this node (because a stale, longer path was left in the queue), skip it.
        if current_node in visited:
            continue
            
        # Lock this node in. Its shortest path is guaranteed.
        visited.add(current_node)
        
        # Early Exit: If we reached our specific destination, we can stop evaluating the rest of the city!
        if target_node and current_node == target_node:
            break
            
        # 3. Explore Neighbors (Edge Relaxation)
        neighbors = graph.get_neighbors(current_node)
        for neighbor, edge_data in neighbors.items():
            if neighbor in visited:
                continue
                
            # The actual cost to traverse this specific road
            if "weight" not in edge_data:
                print(f"WARNING: Edge {current_node}->{neighbor} is missing a weight. Defaulting to infinity.")
            weight = edge_data.get("weight", float('infinity'))
            
            # Dijkstra mathematically requires non-negative weights (unlike Bellman-Ford)
            assert weight >= 0, f"Negative edge weight found on {current_node}->{neighbor}!"
            
            # The total distance from the start node to this neighbor, passing through current_node
            new_distance = current_distance + weight
            
            # If we found a faster way to get to 'neighbor', update it!
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous_nodes[neighbor] = current_node
                
                # Push the new, better distance into the priority queue so it gets evaluated sooner
                heapq.heappush(pq, (new_distance, neighbor))
                
    return distances, previous_nodes


def reconstruct_path(previous_nodes, start_node, target_node):
    """
    Takes the previous_nodes map from Dijkstra and reconstructs the step-by-step route.
    """
    path = []
    current = target_node
    
    while current is not None:
        path.append(current)
        if current == start_node:
            break
        current = previous_nodes.get(current)
        
    # If the path is empty or doesn't actually connect to the start, return empty
    if not path or path[-1] != start_node:
        return []
        
    # Reverse it so it reads Start -> ... -> Target
    return path[::-1]

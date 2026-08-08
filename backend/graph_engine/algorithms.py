from collections import deque

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
    
    Warning: In Python, maximum recursion depth is usually ~1000. 
    For a road network like Agartala with 8,000+ nodes, this WILL crash (RecursionError) 
    if a long continuous road is traversed. Use iterative DFS for production.
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
    
    CRITICAL DESIGN NOTE:
    This function explicitly expects an UNDIRECTED view of the graph (directed=False).
    Why? Because in a directed graph, a one-way street could falsely make a 
    region look isolated (e.g., you can enter but not leave). 
    What we actually want for map cleanup is "Weakly Connected Components" 
    (can a vehicle physically get between these regions via ANY sequence of roads, 
    ignoring one-way constraints for the moment). 
    
    Running connected components on an undirected graph is mathematically equivalent 
    to finding Weakly Connected Components, and neatly avoids the need for complex 
    Strongly Connected Components algorithms (like Tarjan's or Kosaraju's).
    
    Returns:
        list of lists: e.g., [['N1', 'N2'], ['N3']] -> Two disconnected components.
    """
    visited_global = set()
    components = []
    
    for node in graph.adj_list.keys():
        if node not in visited_global:
            new_component = dfs_iterative(graph, node, visited_global)
            components.append(new_component)
            
    # Sort components by size (largest first). 
    # Index 0 is the "Main" traversable city graph. Everything else is an isolated island.
    components.sort(key=len, reverse=True)
    return components

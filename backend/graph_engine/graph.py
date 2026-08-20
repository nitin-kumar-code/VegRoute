class Graph:
    def __init__(self, directed=True):
        """
        Initializes an empty graph.
        We use a dictionary to represent the adjacency list.
        The keys will be node IDs (e.g., 'N_001').
        The values will be dictionaries of neighbors and their edge data.
        
        We also maintain a reverse_adj_list to track incoming edges.
        This allows us to achieve O(degree) node removal instead of O(V) full-graph scans.
        """
        self.adj_list = {}
        self.reverse_adj_list = {}
        self.node_data = {}  # Store lat/lng for heuristic calculations
        self.directed = directed

    def has_node(self, node):
        """Checks if a node exists in the graph."""
        return node in self.adj_list

    def get_neighbors(self, node):
        """
        Returns a dictionary of neighbors and their edge_data.
        Returns an empty dictionary if the node doesn't exist.
        """
        return self.adj_list.get(node, {})

    def add_node(self, node, data=None):
        """Adds a new node to the graph if it doesn't already exist, and stores optional node data."""
        if not self.has_node(node):
            self.adj_list[node] = {}
            self.reverse_adj_list[node] = {}
            self.node_data[node] = data or {}
        elif data:
            self.node_data[node].update(data)

    def add_edge(self, from_node, to_node, weight=1.0, distance_m=0.0, avg_travel_time_s=0.0, road_class="unknown"):
        """
        Adds a weighted edge between two nodes.
        If the nodes don't exist, they are created automatically.
        Stores multi-criteria edge data inside a dictionary.
        """
        if not self.has_node(from_node):
            self.add_node(from_node)
        if not self.has_node(to_node):
            self.add_node(to_node)
            
        # Cheap insurance: warn if overwriting an existing road segment (common OSM data issue)
        if to_node in self.adj_list[from_node]:
            print(f"Warning: overwriting existing edge {from_node} -> {to_node}")
            
        edge_data = {
            "weight": weight, # The scalar value Dijkstra will actually relax on
            "distance_m": distance_m,
            "avg_travel_time_s": avg_travel_time_s,
            "road_class": road_class
        }
        
        # Add the directed edge from -> to
        self.adj_list[from_node][to_node] = edge_data
        self.reverse_adj_list[to_node][from_node] = True # Track incoming edge
        
        # If the graph is undirected, add the reverse edge
        if not self.directed:
            self.adj_list[to_node][from_node] = edge_data
            self.reverse_adj_list[from_node][to_node] = True

    def remove_edge(self, from_node, to_node):
        """Removes an edge between two nodes safely."""
        if self.has_node(from_node) and to_node in self.adj_list[from_node]:
            del self.adj_list[from_node][to_node]
            del self.reverse_adj_list[to_node][from_node]
            
        if not self.directed:
            if self.has_node(to_node) and from_node in self.adj_list[to_node]:
                del self.adj_list[to_node][from_node]
                del self.reverse_adj_list[from_node][to_node]

    def remove_node(self, node):
        """
        Removes a node entirely, along with any edges pointing to it.
        Uses reverse_adj_list for O(degree) time complexity instead of O(V).
        """
        if not self.has_node(node):
            return
            
        # 1. Clean up reverse_adj_list for all targets of our OUTGOING edges
        for to_node in list(self.adj_list[node].keys()):
            if node in self.reverse_adj_list.get(to_node, {}):
                del self.reverse_adj_list[to_node][node]
                
        # 2. Clean up adj_list for all sources of our INCOMING edges
        # We don't have to scan the whole graph because reverse_adj_list tells us exactly who points to us!
        for from_node in list(self.reverse_adj_list[node].keys()):
            if node in self.adj_list.get(from_node, {}):
                del self.adj_list[from_node][node]
                
        # 3. Finally, wipe the node itself from both lists
        del self.adj_list[node]
        del self.reverse_adj_list[node]
        if node in self.node_data:
            del self.node_data[node]

    def print_graph(self):
        """Prints the graph to the console in a readable format."""
        print(f"--- Graph ({'Directed' if self.directed else 'Undirected'}) ---")
        for node in self.adj_list:
            print(f"{node} -> {self.adj_list[node]}")
        print("--------------------------")

# --- Interactive Test Run ---
if __name__ == "__main__":
    print("Testing Graph with multi-criteria edges & O(degree) node removal:\n")
    g = Graph(directed=True)
    
    # Adding edges with extra data
    g.add_edge("N_001", "N_002", weight=12.0, distance_m=150.5, avg_travel_time_s=12.0, road_class="arterial")
    g.add_edge("N_002", "N_003", weight=5.0, distance_m=42.1, avg_travel_time_s=5.0, road_class="local")
    
    # Testing the overwrite warning
    g.add_edge("N_001", "N_002", weight=15.0) 
    
    print("\nCurrent Graph State:")
    g.print_graph()

    print("\nRemoving node N_002 (Watch how incoming edge from N_001 is cleaned up instantly):")
    g.remove_node("N_002")
    g.print_graph()

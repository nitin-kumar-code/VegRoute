import time
from graph_engine.graph import Graph
from graph_engine.algorithms import dijkstra_shortest_path, astar_shortest_path, reconstruct_path
from services.db import db_service
from core.exceptions import GraphNotLoadedException, NodeNotFoundException

class RoutingService:
    def __init__(self):
        self.graph = None

    def load_graph(self):
        """
        Loads the graph from the database into memory.
        This is called on application startup or via the admin reload endpoint.
        """
        print("Initializing Graph Engine...")
        new_graph = Graph(directed=True)
        
        nodes = db_service.get_all_intersections()
        for node in nodes:
            new_graph.add_node(node["node_id"], data={"lat": node["lat"], "lng": node["lng"]})
            
        edges = db_service.get_all_edges()
        for edge in edges:
            # Our graph engine expects "weight", which in VegRoute is avg_travel_time_s
            # We map the database schema fields exactly to the graph Engine interface
            new_graph.add_edge(
                from_node=edge["from_node_id"],
                to_node=edge["to_node_id"],
                weight=edge["avg_travel_time_s"], 
                distance_m=edge["distance_m"],
                avg_travel_time_s=edge["avg_travel_time_s"],
                road_class=edge["road_class"]
            )
            
            # If the DB row says it's a two-way street, we must manually add the reverse edge
            # because our Graph instance is directed=True (to support proper one-way routing).
            if not edge.get("is_one_way", False):
                new_graph.add_edge(
                    from_node=edge["to_node_id"],
                    to_node=edge["from_node_id"],
                    weight=edge["avg_travel_time_s"],
                    distance_m=edge["distance_m"],
                    avg_travel_time_s=edge["avg_travel_time_s"],
                    road_class=edge["road_class"]
                )
                
        self.graph = new_graph
        print(f"Graph loaded successfully with {len(self.graph.adj_list)} nodes.")

    def get_shortest_path(self, start_node: str, target_node: str):
        if not self.graph:
            raise GraphNotLoadedException()
            
        if not self.graph.has_node(start_node):
            raise NodeNotFoundException(start_node)
        if not self.graph.has_node(target_node):
            raise NodeNotFoundException(target_node)
            
        start_time = time.perf_counter()
        distances, prev, visited_order = astar_shortest_path(self.graph, start_node, target_node)
        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        if target_node not in distances or distances[target_node] == float('infinity'):
            return None # No path exists
            
        route = reconstruct_path(prev, start_node, target_node)
        
        return {
            "route": route,
            "total_time_s": distances[target_node],
            "visited_nodes": visited_order,
            "execution_time_ms": execution_time_ms
        }

routing_service = RoutingService()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from services.routing_service import routing_service
from services.db import db_service
import time
from graph_engine.algorithms import dijkstra_shortest_path, reconstruct_path
import math

router = APIRouter()

class VegTrailRequest(BaseModel):
    start_node: str = Field(..., description="The starting intersection ID")
    stops: List[str] = Field(..., max_length=8, description="List of restaurant node IDs to visit (Max 8)")
    
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/")
def get_shortest_route(source: str, destination: str):
    """
    Calculates the fastest route between two points using A* Algorithm (from original implementation).
    """
    result = routing_service.get_shortest_path(source, destination)
    
    if not result:
        raise HTTPException(status_code=404, detail="No valid route exists between these points.")
        
    return {
        "success": True,
        "data": result
    }

@router.get("/shortest")
def get_shortest_route_dijkstra(destination: str, source: str = "NIT"):
    """
    The updated explicit Dijkstra implementation for calculating the route.
    """
    if source == "NIT":
        source_node = "9684592943"
        source_name = "NIT Agartala"
    else:
        source_node = source
        source_name = source

    restaurant = db_service.get_restaurant(destination)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Invalid restaurant ID")
    
    target_node = str(restaurant["nearest_node_id"])
    if not target_node:
        raise HTTPException(status_code=400, detail="Unable to calculate route. No connected road path exists for this restaurant.")

    if not routing_service.graph:
        routing_service.load_graph()

    if not routing_service.graph.has_node(source_node):
        raise HTTPException(status_code=400, detail="NIT has no graph connection")
    if not routing_service.graph.has_node(target_node):
        raise HTTPException(status_code=400, detail="Unable to calculate route. No connected road path exists for this restaurant.")

    distances, prev, visited_order = dijkstra_shortest_path(routing_service.graph, source_node, target_node)
    
    if target_node not in distances or distances[target_node] == float('infinity'):
        raise HTTPException(status_code=400, detail="Unable to calculate route. No connected road path exists for this restaurant.")
        
    path = reconstruct_path(prev, source_node, target_node)
    
    path_coords = []
    dist_m = 0
    for i, node in enumerate(path):
        nd = routing_service.graph.node_data.get(node)
        if nd:
            path_coords.append({"id": node, "lat": nd["lat"], "lng": nd["lng"]})
        if i > 0:
            prev_node = path[i-1]
            p_nd = routing_service.graph.node_data.get(prev_node)
            if nd and p_nd:
                dist_m += haversine(p_nd["lat"], p_nd["lng"], nd["lat"], nd["lng"])
    
    visited_coords = []
    for node in visited_order:
        nd = routing_service.graph.node_data.get(node)
        if nd:
            visited_coords.append({"id": node, "lat": nd["lat"], "lng": nd["lng"]})
            
    time_s = distances[target_node]
    
    return {
        "source": {"name": source_name, "nodeId": int(source_node)},
        "destination": {"restaurantId": destination, "name": restaurant["name"], "nodeId": int(target_node)},
        "algorithm": "Dijkstra",
        "distanceKm": round(dist_m / 1000, 2),
        "estimatedTimeMinutes": math.ceil(time_s / 60),
        "nodesExplored": len(visited_order),
        "path": [int(n) for n in path],
        "route": path_coords,
        "visited_nodes": visited_coords
    }

@router.post("/trail")
def generate_veg_trail(request: VegTrailRequest):
    return {
        "success": True,
        "message": f"Veg Trail TSP calculation for {len(request.stops)} stops is ready to be implemented."
    }

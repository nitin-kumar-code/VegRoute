from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from services.routing_service import routing_service

router = APIRouter()

class VegTrailRequest(BaseModel):
    start_node: str = Field(..., description="The starting intersection ID")
    # Pydantic validation: enforces the hard cap on TSP complexity
    stops: List[str] = Field(..., max_length=8, description="List of restaurant node IDs to visit (Max 8)")
    
@router.get("/")
def get_shortest_route(source: str, destination: str):
    """
    Calculates the fastest route between two points using Dijkstra's Algorithm.
    Endpoint: GET /api/v1/route?source=N_123&destination=N_456
    """
    result = routing_service.get_shortest_path(source, destination)
    
    if not result:
        raise HTTPException(status_code=404, detail="No valid route exists between these points.")
        
    return {
        "success": True,
        "data": result
    }

@router.post("/trail")
def generate_veg_trail(request: VegTrailRequest):
    """
    Optimizes a multi-stop route using a TSP heuristic (Nearest Neighbor + 2-opt).
    Strictly capped at 8 stops to prevent algorithmic DDOS.
    (Note: The TSP heuristic logic will be added here in the next phase).
    """
    return {
        "success": True,
        "message": f"Veg Trail TSP calculation for {len(request.stops)} stops is ready to be implemented."
    }

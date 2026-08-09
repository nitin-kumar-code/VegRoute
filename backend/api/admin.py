from fastapi import APIRouter, HTTPException, Depends
from services.routing_service import routing_service

router = APIRouter()

# In a real app, this would use a security dependency (e.g. API Key)
def verify_admin():
    # Placeholder for actual admin verification logic
    pass

@router.post("/reload-graph", dependencies=[Depends(verify_admin)])
def reload_graph_engine():
    """
    Admin override to rebuild the Graph Engine in-memory from the PostgreSQL DB
    without requiring a full server restart.
    """
    try:
        routing_service.load_graph()
        return {
            "success": True, 
            "message": f"Graph reloaded successfully. Total nodes: {len(routing_service.graph.adj_list)}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reload graph: {str(e)}")

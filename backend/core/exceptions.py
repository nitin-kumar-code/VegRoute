from fastapi import Request
from fastapi.responses import JSONResponse

class GraphNotLoadedException(Exception):
    pass

class NodeNotFoundException(Exception):
    def __init__(self, node_id: str):
        self.node_id = node_id

def graph_not_loaded_handler(request: Request, exc: GraphNotLoadedException):
    return JSONResponse(
        status_code=503,
        content={"error": "Graph engine is not loaded or is currently rebuilding. Please try again later."},
    )

def node_not_found_handler(request: Request, exc: NodeNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Node {exc.node_id} not found in the graph."},
    )

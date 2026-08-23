from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.exceptions import GraphNotLoadedException, NodeNotFoundException, graph_not_loaded_handler, node_not_found_handler
from api.routing import router as routing_router
from api.restaurants import router as restaurants_router
from api.admin import router as admin_router
from services.routing_service import routing_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the Graph Engine into memory
    print(f"Starting {settings.PROJECT_NAME}...")
    routing_service.load_graph()
    yield
    # Shutdown: Clean up resources
    print("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS Middleware (Crucial for the React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(GraphNotLoadedException, graph_not_loaded_handler)
app.add_exception_handler(NodeNotFoundException, node_not_found_handler)

# Routers
app.include_router(routing_router, prefix=f"{settings.API_V1_STR}/route", tags=["Routing"])
app.include_router(restaurants_router, prefix=f"{settings.API_V1_STR}/restaurants", tags=["Restaurants"])
app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "graph_loaded": routing_service.graph is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

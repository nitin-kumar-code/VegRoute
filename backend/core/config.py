import os

class Config:
    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vegroute")
    
    # API Configuration
    API_V1_STR = "/api/v1"
    PROJECT_NAME = "VegRoute Backend"

settings = Config()

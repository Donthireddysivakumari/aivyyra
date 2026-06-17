import uvicorn
import os
import sys

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai.models_trainer import train_and_save_models

if __name__ == "__main__":
    # Ensure models are pre-trained and serialized
    print("---------------------------------------------")
    print("Initializing Aivyra-Tutor Machine Learning Models...")
    train_and_save_models()
    print("---------------------------------------------")
    
    # Read host and port from environment (Render/Railway set PORT)
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    
    # Enable reload only if not in production (i.e. if PORT is not set by cloud provider)
    reload_mode = os.environ.get("PORT") is None
    
    print(f"Launching FastAPI Web Server on {host}:{port} (reload={reload_mode})...")
    # Run the uvicorn development server
    uvicorn.run("app.main:app", host=host, port=port, reload=reload_mode)


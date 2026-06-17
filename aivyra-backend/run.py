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
    
    print("Launching FastAPI Web Server...")
    # Run the uvicorn development server
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, TypeAdapter
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from typing import Any
import json
import os
import traceback


from LEDMatrix.LEDMatrix import LEDMatrix
from GPIO_button_controls import setup_gpio

MATRIX_FILE = "/conf/matrix_config.json"


class MatrixEntry(BaseModel):
    name: str
    width: int
    height: int
    frame_delay_ms: int
    type: str  # e.g., "static" or "animated"
    frames: List[List[List[List[int]]]]  # 4D array: frames -> rows -> cols -> [r,g,b]


# Global variables
current_index = 0
global_matrix = None  # Global in-memory matrix object

try:
    with open(MATRIX_FILE, "r") as f:
        matrix_data = json.load(f)  # Load the raw data
        # Use TypeAdapter to validate and parse the raw JSON into a list of MatrixEntry objects
        adapter = TypeAdapter(List[MatrixEntry])
        global_matrix = adapter.validate_python(matrix_data)
except Exception as e:
    print(f"Failed to load matrix from {MATRIX_FILE}")
    traceback.print_exc()


led_matrix = LEDMatrix(16, 16, brightness=0.2)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Starting up and loading matrix...")
    try:
        setup_gpio(change_index)
        await backend_load_matrix()
    except Exception as e:
        print(f"[Startup] Failed to load matrix: {e}")
        traceback.print_exc()

    yield  # Let the app run

    # Optional: shutdown logic here
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)

async def backend_load_matrix() -> List[List[List[List[int]]]]:
    """
    Returns the frames array of the matrix at the current index.
    Assumes global_matrix is populated.
    """
    global current_index
    global clock_tread_active
    if not global_matrix:
        raise Exception("Matrix is not loaded or is empty.")
    
    if current_index >= len(global_matrix):
        raise Exception("Matrix index out of bounds.")
    
    # Fetch the frames of the matrix entry at the current index
    matrix_entry = global_matrix[current_index]
    
    if led_matrix.clock_active:
        led_matrix.stop_clock()
        
    if led_matrix.animation_active:
        led_matrix.stop_animation()
    
    if matrix_entry.type == "static":
        led_matrix.load_matrix(matrix_entry.frames[0])
    elif matrix_entry.type == "animation":
        print("Loading animation") 
        led_matrix.start_animation(matrix_entry.frames, matrix_entry.frame_delay_ms / 1000.0)
    elif matrix_entry.type == "clock":
        print("Loading clock")        
        led_matrix.start_clock()
        
async def change_index(delta: int):
    """
    Change the current index by delta.
    """
    global current_index
    if not global_matrix:
        return
    new_index = current_index + delta
    if 0 <= new_index < len(global_matrix):
        current_index = new_index
        print(f"New index: {current_index}")
        await backend_load_matrix()  # Call the function to load the matrix

# Allow frontend on different origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/matrix")
async def get_matrix() -> Any:
    # Return the in-memory matrix if available, otherwise read from the file
    if global_matrix:
        return global_matrix
    if os.path.exists(MATRIX_FILE):
        try:
            with open(MATRIX_FILE, "r") as f:
                matrix = json.load(f)
            return matrix
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
    return []

@app.post("/matrix")
async def save_matrix(matrix: List[MatrixEntry]):
    global global_matrix  # Use the global variable
    try:
        # Update the in-memory matrix
        global_matrix = matrix
        # Also save to file
        with open(MATRIX_FILE, "w") as f:
            json.dump([entry.dict() for entry in matrix], f, indent=2)
        return {"status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/matrix/set_index")
async def set_index(index: int):
    global current_index
    try:
        matrix = global_matrix if global_matrix else await get_matrix()  # Use in-memory matrix
        
        if index < 0 or index >= len(matrix):
            raise HTTPException(status_code=400, detail="Index out of bounds")
        current_index = index
        
        await backend_load_matrix()        
        
        
        return {"status": "success", "index": current_index}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

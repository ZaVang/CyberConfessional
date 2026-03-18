import subprocess
import time
import sys
import os

def run_services():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("† Initializing Cyber Confessional Observation Node... †")

    # 1. Start Backend
    print("\n[1/2] Starting Backend (FastAPI)...")
    backend_process = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=backend_dir
    )

    # 2. Wait for backend to warm up
    time.sleep(2)

    # 3. Start Frontend
    print("\n[2/2] Starting Frontend (Vite)...")
    try:
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            shell=True
        )
    except FileNotFoundError:
        print("Error: npm not found. Please install Node.js.")
        backend_process.kill()
        return

    print("\n† Ritual Commenced. All nodes operational. †")
    print("➜ Backend: http://localhost:8000")
    print("➜ Frontend: Check Vite terminal for link")
    print("\nPress Ctrl+C to collapse all world-lines.")

    try:
        while True:
            time.sleep(1)
            if backend_process.poll() is not None:
                print("Backend crashed. Collapsing...")
                break
            if frontend_process.poll() is not None:
                print("Frontend crashed. Collapsing...")
                break
    except KeyboardInterrupt:
        print("\n† Terminating ritual. World-lines returning to singularity. †")
    finally:
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    run_services()

from main import app
import asyncio

def check_route():
    print("Checking for /api/brain/status...")
    found = False
    for route in app.routes:
        if route.path == "/api/brain/status":
            print(f"FOUND: {route.methods} {route.path}")
            found = True
            break
    
    if not found:
        print("NOT FOUND: /api/brain/status is missing from routes.")
        print("Registered routes:")
        for route in app.routes:
            print(f" - {route.path}")

if __name__ == "__main__":
    check_route()

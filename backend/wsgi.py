"""
WSGI entry point for production deployment
Compatible with Gunicorn and CloudPanel
"""
from main import app

# This is the WSGI application object
application = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)

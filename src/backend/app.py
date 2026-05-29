from flask import Flask
from flask_cors import CORS

from database import init_db
from routes.clients import clients_bp
from routes.policies import policies_bp
from routes.activities import activities_bp

app = Flask(__name__) 
CORS(app)

app.register_blueprint(clients_bp,    url_prefix="/api")
app.register_blueprint(policies_bp,   url_prefix="/api")
app.register_blueprint(activities_bp, url_prefix="/api")


@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
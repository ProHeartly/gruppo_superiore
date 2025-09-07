from flask import Flask, render_template, jsonify, send_from_directory
import time, requests

app = Flask(__name__)

SIM_BASE = "http://127.0.0.1:8001"

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('templates/assets', filename)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/time")
def get_time():
    try:
        r = requests.get(f"{SIM_BASE}/get-time")
        r.raise_for_status()
        return jsonify(r.json())
    except Exception as e:
        return jsonify(f"Error: {e}")

@app.route("/supply")
def supply():
    try:
        r = requests.get(f"{SIM_BASE}/get-supply")
        r.raise_for_status()
        return jsonify(r.json())
    except Exception as e:
        return jsonify(f"Error: {e}")

@app.route("/demand")
def demand():
    try:
        r = requests.get(f"{SIM_BASE}/get-demand")
        r.raise_for_status()
        return jsonify(r.json())
    except Exception as e:
        return jsonify(f"Error: {e}") 





if __name__ == "__main__":
    app.run(port=8000, debug=True)

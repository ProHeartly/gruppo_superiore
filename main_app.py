import energy_utils

from flask import Flask, render_template, jsonify, send_from_directory, request
import threading, time, random, sqlite3, pickle, pandas as pd, os
from datetime import datetime, timedelta

app = Flask(__name__, template_folder="templates")
DATA_DB = os.path.join(os.path.dirname(__file__), "data.db")
MODEL_PKL = os.path.join(os.path.dirname(__file__), "demand_prophet_model.pkl")


state = {
    "time": {"y":2082,"m":1,"d":1,"h":0,"ds":1,"iso": "2082-01-01T00:00:00"},
    "demand": {"total": 500.0, "residential":200.0, "industrial":200.0, "commercial":100.0, "history":[]},
    "supply": {"total": 600.0, "Hydro":300.0, "Solar":100.0, "Thermal":200.0, "history":[]}
}

def next_hour():
    st = state["time"]
    st["h"] += 1
    if st["h"] >= 24:
        st["h"] = 0
        st["d"] += 1
        st["ds"] = st["ds"] + 1 if st["ds"]<7 else 1
    st["iso"] = f"{st['y']:04d}-{st['m']:02d}-{st['d']:02d}T{st['h']:02d}:00:00"
    return st

def sim_loop():
    while True:
        
        next_hour()
        h = state["time"]["h"]
        base = 400 + 150 * (1 + ( ( (h>=18) or (h<7)) ))
        residential = base * 0.5 + random.uniform(-30,30)
        industrial = base * 0.3 + random.uniform(-20,20)
        commercial = base * 0.2 + random.uniform(-15,15)
        total = max(0, residential + industrial + commercial)
        state["demand"].update({"total": round(total,2), "residential": round(residential,2), "industrial": round(industrial,2), "commercial": round(commercial,2)})
        if "history" not in state["demand"]:
            state["demand"]["history"] = []
        state["demand"]["history"].append({"ds": state["time"]["iso"], "y": state["demand"]["total"]})
        if len(state["demand"]["history"])>5000:
            state["demand"]["history"].pop(0)
        hydro = 300 + random.uniform(-40,40)
        solar = max(0, 80 + 80 * max(0, (1 - abs(h-12)/12)) + random.uniform(-20,20))
        thermal = max(0, total - (hydro+solar) + random.uniform(-30,30))
        supply_total = round(hydro+solar+thermal,2)
        state["supply"].update({"total": supply_total, "Hydro": round(hydro,2), "Solar": round(solar,2), "Thermal": round(thermal,2)})
        if "history" not in state["supply"]:
            state["supply"]["history"] = []
        state["supply"]["history"].append({"ds": state["time"]["iso"], "y": state["supply"]["total"]})
        if len(state["supply"]["history"])>5000:
            state["supply"]["history"].pop(0)
        time.sleep(0.5) 

t = threading.Thread(target=sim_loop, daemon=True)
t.start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory("templates/assets", filename)

@app.route("/get-time")
def get_time():
    return jsonify(state["time"])

@app.route("/get-demand")
def get_demand():
    return jsonify({"latest": state["demand"], "history": state["demand"]["history"][-168:]})

@app.route("/get-supply")
def get_supply():
    return jsonify({"latest": state["supply"], "history": state["supply"]["history"][-168:]})

@app.route("/api/forecast")
def api_forecast():
    hours = int(request.args.get("period_hours", "168"))
    if os.path.exists(MODEL_PKL):
        try:
            with open(MODEL_PKL, "rb") as f:
                model = pickle.load(f)
            last = datetime.fromisoformat(state["time"]["iso"])
            future_times = [last + timedelta(hours=i+1) for i in range(hours)]
            adjust = 1.0
            try:
                con = sqlite3.connect(DATA_DB)
                df = pd.read_sql_query("SELECT * FROM demand", con)
                con.close()
                recent = df.tail(168).copy()
                if 'hour' in recent.columns and 'day' in recent.columns:
                    pass
            except Exception:
                pass
            preds = []
            try:
                future_df = model.make_future_dataframe(periods=hours, freq='H')
                fc = model.predict(future_df)
                fc_future = fc[fc["ds"] > fc["ds"].max() - pd.Timedelta(hours=hours)] if "ds" in fc.columns else fc.tail(hours)
                for i, row in fc_future.tail(hours).iterrows():
                    yhat = float(row.get("yhat", row.get("y", 0)))*adjust
                    preds.append({"ds": str(row.get("ds")), "yhat": yhat})
            except Exception:
                for ft in future_times:
                    preds.append({"ds": ft.isoformat(), "yhat": state["demand"]["total"]})
            return jsonify({"forecast": preds})
        except Exception as e:
            return jsonify({"error": f"model load failed: {e}"}), 500
    else:
        last = datetime.fromisoformat(state["time"]["iso"])
        preds = [{"ds": (last + timedelta(hours=i+1)).isoformat(), "yhat": state["demand"]["total"]} for i in range(hours)]
        return jsonify({"forecast": preds})

if __name__ == "__main__":
    app.run(port=8000, debug=True)




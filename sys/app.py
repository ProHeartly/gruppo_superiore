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


def fair_cut_sys(demand, supply, current):
    if demand > supply:
        for i in range(1,8):
            current[i] = current[i]*(1-(demand - supply)/7)
    
"""
            MAIN FILE ENDS HERE, ML AFTER THIS
"""


from flask import request
import sqlite3, pandas as pd, numpy as np
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from math import sqrt
import pickle, os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.db")
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demand_prophet_model.pkl")

def _load_data():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM demand", conn)
    conn.close()
    df["date_ad"] = pd.to_datetime(df["day"], errors="coerce")
    df = df.dropna(subset=["date_ad"])
    df["ds"] = df["date_ad"] + pd.to_timedelta(df["hour"], unit="h")
    df["y"] = df["public"] + df["industry"]
    df = df[["ds","y"]].dropna().sort_values("ds")
    df = df.groupby("ds", as_index=False)["y"].sum()
    return df

def _holdout_metrics(df):
    
    n = len(df)
    if n < 100:
        split = max(48, int(n*0.2))
    else:
        split = int(n*0.2)
    train = df.iloc[: n - split].copy()
    test = df.iloc[n - split :].copy()

    m = Prophet()
    m.fit(train.rename(columns={"ds":"ds","y":"y"}))
    future = test[["ds"]].copy()
    fc = m.predict(future)
    y_true = test["y"].values
    y_pred = fc["yhat"].values

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(sqrt(mean_squared_error(y_true, y_pred)))
    with np.errstate(divide="ignore", invalid="ignore"):
        mape = float(np.mean(np.abs((y_true - y_pred) / np.where(y_true==0, np.nan, y_true))) * 100)
    
    mape = None if np.isnan(mape) else mape
    r2 = float(r2_score(y_true, y_pred))

    return {"MAE": mae, "RMSE": rmse, "MAPE": mape, "R2": r2}

def _load_or_train_full(df):
    
    model = None
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
        except Exception:
            model = None
    if model is None:
        model = Prophet()
        model.fit(df.copy())
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(model, f)
    return model

@app.route("/api/forecast")
def api_forecast():
    hours = int(request.args.get("period_hours", 168))
    df = _load_data()
    if df.empty:
        return jsonify({"error":"no data"}), 400

    metrics = _holdout_metrics(df)

    model = _load_or_train_full(df)
    last_ds = df["ds"].max()
    future = model.make_future_dataframe(periods=hours, freq="H")
    fc = model.predict(future)

    history = df.tail(24*14) 
    hist_payload = [{"ds": d.isoformat(), "y": float(y)} for d, y in zip(history["ds"], history["y"])]
    
    fc_future = fc[fc["ds"] > last_ds].copy()
    fc_payload = [{
        "ds": d.isoformat(),
        "yhat": float(y),
        "yhat_lower": float(l),
        "yhat_upper": float(u)
    } for d, y, l, u in zip(fc_future["ds"], fc_future["yhat"], fc_future["yhat_lower"], fc_future["yhat_upper"])]

    return jsonify({
        "history": hist_payload,
        "forecast": fc_payload,
        "metrics": metrics
    })




if __name__ == "__main__":
    app.run(port=8000, debug=True)

from flask import Flask, render_template,jsonify
import cal, random

app = Flask(__name__)

days_of_week = ["","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

demand_model = {
    1: {"p": 120, "ic": 170, "in": 50},
    2: {"p": 140, "ic": 200, "in": 100},
    3: {"p": 250, "ic": 500, "in": 200},
    4: {"p": 110, "ic": 330, "in": 170},
    5: {"p": 150, "ic": 240, "in": 150},
    6: {"p": 100, "ic": 200, "in": 120},
    7: {"p":  90, "ic": 220, "in": 70}
}
supply_model = {
    1: {"RoR": 1048.7, "Storage": 0.0,   "PRoR": 106.0, "Solar": 0.0},
    2: {"RoR":   10.0, "Storage": 0.0,   "PRoR":   0.0, "Solar": 20.0},
    3: {"RoR":  441.8, "Storage": 480.0, "PRoR":   0.0, "Solar": 25.0},
    4: {"RoR":  466.2, "Storage": 500.0, "PRoR":  25.0, "Solar": 0.0},
    5: {"RoR":  178.0, "Storage": 0.0,   "PRoR":  60.5, "Solar": 0.0},
    6: {"RoR":   20.0, "Storage": 0.0,   "PRoR":   0.0, "Solar": 0.0},
    7: {"RoR":   38.0, "Storage": 0.0,   "PRoR":   0.0, "Solar": 0.0}
}

demand = {i: {"p": 0, "ic": 0, "in": 0} for i in range(1, 8)}
supply = {i: {"RoR": 0.0, "Storage": 0.0, "PRoR": 0.0, "Solar": 0.0} for i in range(1, 8)}

demand_day = {j:{
    i: {"p": 0, "ic": 0, "in":0} for i in range(1, 8)} for j in range(1,25)}

supply_day = {j:{
    i: {"RoR": 0.0, "Storage": 0.0, "PRoR": 0.0, "Solar": 0.0} for i in range(1, 8)} for j in range(1,25)}

initialized_supply = {i: False for i in range(1, 8)}
initialized_demand = {i: False for i in range(1, 8)}

w = [cal.weather(times) for _ in range(7)]

times = {
    "y":2082,
    "m":1,
    "d": 1,
    "ds":2,
    "h":1
}


def generator(prev_value, max_cap, id, dors, factor=0.2):
    if dors == "s":
        if not initialized_supply[id]:
            prev_value = random.uniform(0.4, 0.7) * max_cap
            initialized_supply[id] = True
    else:
        if not initialized_demand[id]:
            prev_value = max_cap
            initialized_demand[id] = True

    delta = factor * max_cap * 0.1
    val = prev_value + delta

    if val <= 0:
        val = random.uniform(max_cap * 0.2, max_cap * 0.4)

    if val >= max_cap:
        val = random.uniform(max_cap * 0.6, max_cap * 0.8)
        
    return round(val, 2)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/time")
def get_time():
    global times
    if times["h"] < 23:
        times["h"] += 1
    else:
        times["h"] = 0
        times = cal.next_day(times)
    return jsonify(times)

@app.route("/get-time")
def get_time1():
    global times
    return jsonify(times)

@app.route("/supply")
def supply_data():
    global times,supply, w, supply_model, supply_day
    for a in range(1, 8):
        weather_today = w[a - 1]

        if weather_today == "sunny":
            factor1, factor2 = -0.2, 0.5
        elif weather_today == "rainy":
            factor1, factor2 = 0.4, -0.2
        elif weather_today == "cloudy":
            factor1, factor2 = 0.2, -0.2
        elif weather_today == "cold":
            factor1, factor2 = -0.1, -0.1
        else:
            factor1, factor2 = 0.0, 0.0 

        supply[a]["RoR"] = generator(supply[a]["RoR"],     supply_model[a]["RoR"],     a, "s", factor=factor1)
        supply[a]["PRoR"] = generator(supply[a]["PRoR"],    supply_model[a]["PRoR"],    a, "s", factor=factor1)
        supply[a]["Storage"] = generator(supply[a]["Storage"], supply_model[a]["Storage"], a, "s")
        supply[a]["Solar"] = generator(supply[a]["Solar"],   supply_model[a]["Solar"],   a, "s", factor=factor2)
    
    supply_day[times["h"]] = supply

    return jsonify(supply)


@app.route("/demand")
def demand_data():
    global times, demand, w, demand_model, demand_day
    for a in range(1, 8):
        weather_today = w[a - 1]

        if weather_today == "sunny":
            factor1, factor2 = 0.4, 0.4
        elif weather_today == "rainy":
            factor1, factor2 = -0.2, -0.1
        elif weather_today == "cloudy":
            factor1, factor2 = -0.2, -0.1
        elif weather_today == "cold":
            factor1, factor2 = -0.3, 0.5
        else:
            factor1, factor2 = 0.0, 0.0

        if 17 <= times <= 19:
            factor1 += 0.2  

        if cal.holiday(times):
            factor1 += 0.2
            factor2 -= 0.2

        demand[a]["p"] = generator(demand[a]["p"], demand_model[a]["p"], a, "d", factor=factor1)
        demand[a]["ic"] = generator(demand[a]["ic"], demand_model[a]["ic"], a, "d", factor=factor2)
        demand[a]["in"] = generator(demand[a]["in"], demand_model[a]["in"], a, "d", factor=factor2)
    
    demand_day[times["h"]] = demand
    return jsonify(demand)


@app.route("/get-demand")
def get_demand():
    global demand_day
    return jsonify(demand_day)

@app.route("/get-supply")
def get_supply():
    global supply_day
    return jsonify(supply_day)


if __name__ == "__main__":
    app.run(port=8001, debug=True)


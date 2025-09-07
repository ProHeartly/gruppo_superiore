from flask import Flask, render_template,jsonify, send_from_directory
import cal, random

app = Flask(__name__)

days_of_week = ["","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

demand_model = {
    1: {'p': 2120.0, 'ic': 1590.0, 'in': 1590.0},
    2: {'p': 1824.0, 'ic': 1368.0, 'in': 1368.0},
    3: {'p': 3420.0, 'ic': 2565.0, 'in': 2565.0},
    4: {'p': 1412.0, 'ic': 1059.0, 'in': 1059.0},
    5: {'p': 1300.0, 'ic': 975.0,  'in': 975.0},
    6: {'p': 472.0,  'ic': 354.0,  'in': 354.0},
    7: {'p': 592.0,  'ic': 444.0,  'in': 444.0}}
supply_model = {
    1: {'RoR': 4456.89, 'Storage': 955.05, 'PRoR': 318.35, 'Solar': 636.70},
    2: {'RoR': 730.40,  'Storage': 156.51, 'PRoR': 52.17,  'Solar': 104.34},
    3: {'RoR': 7532.27, 'Storage':1614.06, 'PRoR':538.02,  'Solar':1076.04},
    4: {'RoR': 3675.23, 'Storage': 787.55, 'PRoR':262.52,  'Solar': 525.03},
    5: {'RoR': 2342.57, 'Storage': 501.98, 'PRoR':167.33,  'Solar': 334.65},
    6: {'RoR': 283.51,  'Storage': 60.75,  'PRoR':20.25,   'Solar': 40.50},
    7: {'RoR': 474.12,  'Storage':101.60,  'PRoR':33.87,   'Solar': 67.73}
}

demand = {i: {"p": 0, "ic": 0, "in": 0} for i in range(1, 8)}
supply = {i: {"RoR": 0.0, "Storage": 0.0, "PRoR": 0.0, "Solar": 0.0} for i in range(1, 8)}

demand_day = {
    i:0.0 for i in range(1, 8)}
supply_day = {
    i: 0.0 for i in range(1, 8)}

initialized_supply = {i: False for i in range(1, 8)}
initialized_demand = {i: False for i in range(1, 8)}

times = {
    "y":2082,
    "m":1,
    "d": 1,
    "ds":2,
    "h":1
}

w = [cal.weather(times) for _ in range(7)]


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

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('templates/assets', filename)

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
            factor1, factor2 = -0.02, 0.05
        elif weather_today == "rainy":
            factor1, factor2 = 0.04, -0.02
        elif weather_today == "cloudy":
            factor1, factor2 = 0.02, -0.02
        elif weather_today == "cold":
            factor1, factor2 = -0.01, -0.01
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
            factor1, factor2 = 0.04, 0.04
        elif weather_today == "rainy":
            factor1, factor2 = -0.02, -0.01
        elif weather_today == "cloudy":
            factor1, factor2 = -0.02, -0.01
        elif weather_today == "cold":
            factor1, factor2 = -0.03, 0.05
        else:
            factor1, factor2 = 0.0, 0.0

        h = times["h"]

        if h in range(1,7):
            factor1 -= 0.04
            factor2 -= 0.01
        elif h in range(7,13):
            factor1 += 0.06
            factor2 += 0.01
        elif h in range(13,18):
            factor1 -= 0.01
            factor2 += 0.01
        else:
            factor1 += 0.06 
            factor2 -=0.01

        if cal.holiday(times):
            factor1 += 0.02
            factor2 -= 0.02

        demand[a]["p"] = generator(demand[a]["p"], demand_model[a]["p"], a, "d", factor=factor1)
        demand[a]["ic"] = generator(demand[a]["ic"], demand_model[a]["ic"], a, "d", factor=factor2)
        demand[a]["in"] = generator(demand[a]["in"], demand_model[a]["in"], a, "d", factor=factor2)
    
    demand_day[times["h"]] = demand
    return jsonify(demand)


@app.route("/get-demand")
def get_demand():
    global demand
    demand_day = demand["p"] + demand["ic"] + demand["in"]
    return jsonify(demand_day)

@app.route("/get-supply")
def get_supply():
    global supply
    supply_day = supply["RoR"] + supply["PRoR"] + supply["Storage"] + supply["Solar"]
    return jsonify(supply_day)


if __name__ == "__main__":
    app.run(port=8001, debug=True)


from time import sleep
import random

def next_day(date):
    year, month, day, days = date["y"], date["m"], date["d"], date["ds"]
    month_days = {
        1: 31, 2: 31, 3: 32, 4: 31, 5: 31, 6: 31, 7: 30, 8: 29, 9: 30, 10: 29, 11: 30, 12: 30
    }
    if days == 7:
        date["ds"] = 1

    else:
        date["ds"] += 1
    
    if day == month_days.get(month):
        date["d"] = 1
        date["m"] += 1

    else:
        date["d"] += 1

    if date["m"] > 12:
        date["m"] = 1
        date["y"] += 1
    
    return date

def holiday(date):
    year, month, day, days = date["y"], date["m"], date["d"], date["ds"]
    holidays = {
        1: {1, 18, 29},
        2: {15},
        3: set(),
        4: {25},
        5: {9, 10, 12, 15, 30},
        6: {1, 3, 6, 13, 14, 15, 16, 17},
        7: {2, 3, 4, 5, 6, 7, 10},
        8: {18},
        9: {10, 15, 27},
        10: {1, 5, 16},
        11: {3, 6, 7, 18, 19, 24},
        12: {13}
    }
    return days == 7 or day in holidays.get(month, set())

def weather(date):
    year, month, day = date["y"], date["m"], date["d"]
    patterns = {
        1: {"sunny": 0.5, "cloudy": 0.25, "rainy": 0.15, "cold": 0.1},    
        2: {"sunny": 0.55, "cloudy": 0.25, "rainy": 0.15, "cold": 0.05},  
        3: {"sunny": 0.4, "cloudy": 0.25, "rainy": 0.3, "cold": 0.05},   
        4: {"sunny": 0.3, "cloudy": 0.25, "rainy": 0.4, "cold": 0.05},   
        5: {"sunny": 0.35, "cloudy": 0.25, "rainy": 0.35, "cold": 0.05},  
        6: {"sunny": 0.4, "cloudy": 0.3, "rainy": 0.25, "cold": 0.05},   
        7: {"sunny": 0.45, "cloudy": 0.3, "rainy": 0.2, "cold": 0.5},   
        8: {"sunny": 0.02, "cloudy": 0.35, "rainy": 0.01, "cold": 0.49},    
        9: {"sunny": 0.05, "cloudy": 0.25, "rainy": 0.05, "cold": 0.55},  
        10: {"sunny": 0.05, "cloudy": 0.25, "rainy": 0.05, "cold": 0.55}, 
        11: {"sunny": 0.2, "cloudy": 0.35, "rainy": 0.01, "cold": 0.35}, 
        12: {"sunny": 0.3, "cloudy": 0.35, "rainy": 0.02, "cold": 0.15}
    }
    month_pattern = patterns.get(month)
    weather_types = list(month_pattern.keys())
    weights = list(month_pattern.values())
    
    return random.choices(weather_types, weights=weights, k=1)[0]

def event(weather):
    if weather == "rainy":
        e = random.choices(["flood", ""], weights=[0.2, 0.8])
    elif weather == "sunny":
        e = random.choices(["heat wave", ""], weights=[0.3, 0.7])
    elif weather == "clouldy":
        e = random.choices(["storm", ""], weights=[0.01, 0.99])
    else:
        e= ""
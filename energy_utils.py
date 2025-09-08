
"""
energy_utils.py
 (UNUSED)
"""

import math
import numpy as np

def compute_rmse(actual, predicted):
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    mse = np.mean((actual - predicted)**2)
    return math.sqrt(mse)

def compute_accuracy_percent(actual, predicted):
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    if actual.size == 0:
        return 0.0
    rmse = compute_rmse(actual, predicted)
    mean_actual = actual.mean()
    if mean_actual == 0:
        return 100.0 if rmse == 0 else 0.0
    acc = 100.0 * (1.0 - (rmse / mean_actual))
    acc = max(0.0, min(100.0, acc))
    return acc

class CommunityBattery:
    def __init__(self, capacity_kwh, initial_charge=0.0, charge_efficiency=0.95, discharge_efficiency=0.95):
        self.capacity = float(capacity_kwh)
        self.charge = float(min(self.capacity, initial_charge))
        self.charge_eff = float(charge_efficiency)
        self.discharge_eff = float(discharge_efficiency)
    def store(self, energy_kwh):
        energy = max(0.0, energy_kwh) * self.charge_eff
        space = self.capacity - self.charge
        stored = min(space, energy)
        self.charge += stored
        return stored
    def release(self, energy_kwh):
        demand = max(0.0, energy_kwh) / self.discharge_eff
        released = min(self.charge, demand)
        self.charge -= released
        return released * self.discharge_eff
    def status(self):
        return {"capacity": self.capacity, "charge": self.charge}

def alert_check(supply, demand, supply_threshold_ratio=0.2):

    try:
        if demand <= 0:
            return False
        return (supply / demand) < supply_threshold_ratio
    except Exception:
        return False

def smart_price(base_price, supply, demand, min_price=None, max_price=None, sensitivity=1.0):
    """
    price = base_price * (1 + sensitivity * (demand - supply) / max(supply,1))
    Then clamp between min_price and max_price if provided.
    """
    try:
        supply = float(supply)
        demand = float(demand)
    except:
        return base_price
    if supply <= 0:
        price = base_price * (1 + sensitivity * (demand / 1.0))
    else:
        price = base_price * (1.0 + sensitivity * ((demand - supply) / max(supply, 1.0)))
    if min_price is not None:
        price = max(min_price, price)
    if max_price is not None:
        price = min(max_price, price)
    return price

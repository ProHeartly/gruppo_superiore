
import numpy as np
import energy_utils

actual = np.array([100, 120, 110, 130, 90, 95])
predicted = np.array([98, 125, 108, 128, 92, 90])
print("Accuracy %:", energy_utils.compute_accuracy_percent(actual, predicted))
cb = energy_utils.CommunityBattery(1000, initial_charge=200)
print("Before:", cb.status())
stored = cb.store(50)
print("Stored:", stored)
released = cb.release(100)
print("Released:", released)
print("After:", cb.status())
print("Alert check (supply=50,demand=300):", energy_utils.alert_check(50,300))
print("Smart price:", energy_utils.smart_price(1.0, supply=50, demand=300, min_price=0.1, max_price=10))

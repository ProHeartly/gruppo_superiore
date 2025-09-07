import pickle
import pandas as pd


with open("demand_prophet_model.pkl", "rb") as f:
    model = pickle.load(f)

future = model.make_future_dataframe(periods=24*7, freq="H")  


forecast = model.predict(future)

print(forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(20))

import matplotlib.pyplot as plt

fig1 = model.plot(forecast)
plt.show()

fig2 = model.plot_components(forecast)
plt.show()

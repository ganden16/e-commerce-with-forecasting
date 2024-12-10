import logging
import traceback
from sklearn.impute import SimpleImputer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
import xgboost as xgb
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import BayesianRidge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import ElasticNet
from sklearn.linear_model import Lasso
import pandas as pd
import numpy as np
import json
from sklearn.impute import KNNImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split

# all
@csrf_exempt  
def all_forecast(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			sales_data = data.get('sales_data', [])
			weights = data.get('weights', [])
			window_size = data.get('window_size', 2)
			n_neighbors = data.get('n_neighbors', 3)

			# arima
			dfArima = preprocess_data(sales_data)
			modelArima = ARIMA(dfArima['sales'], order=(1, 1, 1))
			model_fitArima = modelArima.fit()
			forecastArima = model_fitArima.forecast(steps=1)

			# simple exponential smoothing
			dfSes = preprocess_data(sales_data)
			modelSes = SimpleExpSmoothing(dfSes['sales'])
			model_fitSes = modelSes.fit()
			forecastSes = model_fitSes.forecast(steps=1)

			# holt linear Trend Model (double exponential smoothing)
			dfHLTM = preprocess_data(sales_data)
			modelHLTM = ExponentialSmoothing(dfHLTM['sales'], trend='add')
			model_fitHLTM = modelHLTM.fit()
			forecastHLTM = model_fitHLTM.forecast(steps=1)

			# # Holt-Winters Seasonal Model (Triple Exponential Smoothing)
			# dfHWSM = pd.DataFrame(sales_data, columns=['sales'])
			# modelHWSM = ExponentialSmoothing(dfHWSM['sales'], trend='add', seasonal='add', seasonal_periods=4)
			# model_fitHWSM = modelHWSM.fit()
			# forecastHWSM = model_fitHWSM.forecast(steps=1)

			# linear regression
			dfLr = preprocess_data(sales_data)
			dfLr['time'] = np.arange(len(dfLr))
			XLr = dfLr[['time']]
			yLr = dfLr['sales']
			modelLr = LinearRegression()
			modelLr.fit(XLr, yLr)
			next_timeLr = len(dfLr)
			forecastLr = modelLr.predict([[next_timeLr]])

			# random forest
			dfRf = preprocess_data(sales_data)
			dfRf['time'] = np.arange(len(dfRf))
			Xrf = dfRf[['time']]
			yrf = dfRf['sales']
			modelRf = RandomForestRegressor(n_estimators=100)
			modelRf.fit(Xrf, yrf)
			next_timeRf = len(dfRf)
			forecastRf = modelRf.predict([[next_timeRf]])

			# svr
			dfSvr = preprocess_data(sales_data)
			dfSvr['time'] = np.arange(len(dfSvr))
			XSvr = dfSvr[['time']]
			ySvr = dfSvr['sales']
			modelSvr = SVR(kernel='rbf')
			modelSvr.fit(XSvr, ySvr)
			next_timeSvr = len(dfSvr)
			forecastSvr = modelSvr.predict([[next_timeSvr]])

			# xgboost
			dfXgb = preprocess_data(sales_data)
			dfXgb['time'] = np.arange(len(dfXgb))
			XXgb = dfXgb[['time']]
			yXgb = dfXgb['sales']
			modelXgb = xgb.XGBRegressor(n_estimators=100)
			modelXgb.fit(XXgb, yXgb)
			next_timeXgb = len(dfXgb)
			forecastXgb = modelXgb.predict(np.array([[next_timeXgb]]))
			forecast_valueXgb = float(forecastXgb[0])

			# simple moving average
			dfSma = preprocess_data(sales_data)
			forecastSma = dfSma['sales'].mean()

			# double moving average
			dfDma = preprocess_data(sales_data)
			dfDma['SMA1'] = dfDma['sales'].rolling(window=window_size).mean()
			dfDma['SMA2'] = dfDma['SMA1'].rolling(window=window_size).mean()
			if pd.isna(dfDma['SMA2'].iloc[-1]):
					return JsonResponse({'error': 'Data tidak cukup untuk menghitung double moving average.'}, status=400)
			forecastDma = 2 * dfDma['SMA1'].iloc[-1] - dfDma['SMA2'].iloc[-1]

			# weighted moving average
			if not sales_data or len(sales_data) != len(weights):
				return JsonResponse({'error': 'Panjang data penjualan dan bobot harus sama.'}, status=400)
			dfWma = preprocess_data(sales_data)
			weights_arrayWma = np.array(weights)
			sales_arrayWma = np.array(sales_data)
			wma = np.sum(weights_arrayWma * sales_arrayWma) / np.sum(weights_arrayWma)

			# Gaussian Process Regression
			XGpr = np.arange(len(sales_data)).reshape(-1, 1)
			yGpr = np.array(sales_data)
			kernelGpr = C(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
			modelGpr = GaussianProcessRegressor(kernel=kernelGpr, n_restarts_optimizer=10)
			modelGpr.fit(XGpr, yGpr)
			next_periodGpr = np.array([[len(sales_data)]])
			forecastGpr = modelGpr.predict(next_periodGpr, return_std=True)

			# Long Short-Term Memory
			sales_dataLstm = np.array(sales_data).reshape(-1, 1)
			scalerLstm = MinMaxScaler(feature_range=(0, 1))
			scaled_dataLstm = scalerLstm.fit_transform(sales_dataLstm)
			modelLstm = Sequential()
			modelLstm.add(LSTM(50, return_sequences=True, input_shape=(scaled_dataLstm.shape[1], 1)))
			modelLstm.add(LSTM(50, return_sequences=False))
			modelLstm.add(Dense(1))
			modelLstm.compile(optimizer='adam', loss='mean_squared_error')
			X_trainLstm = scaled_dataLstm[:-1].reshape((1, -1, 1))
			y_trainLstm = scaled_dataLstm[1:].reshape((1, -1, 1))
			modelLstm.fit(X_trainLstm, y_trainLstm, epochs=10, batch_size=1, verbose=2)
			last_sequenceLstm = scaled_dataLstm[-1:].reshape((1, -1, 1))
			forecastLstm = modelLstm.predict(last_sequenceLstm)
			forecastLstm = scalerLstm.inverse_transform(forecastLstm.reshape(-1, 1))

			# # Bayesian Regression
			# XBr = np.arange(len(sales_data)).reshape(-1, 1)
			# YBr = np.array(sales_data)
			# modelBr = BayesianRidge()
			# modelBr.fit(XBr, YBr)
			# next_periodBr = np.array([[len(sales_data)]])
			# forecastBr = modelBr.predict(next_periodBr)[0]


			# Polynomial Regression
			XPr = np.arange(len(sales_data)).reshape(-1, 1)
			yPr = np.array(sales_data)
			polyPr = PolynomialFeatures(degree=2)
			X_polyPr = polyPr.fit_transform(XPr)
			modelPr = LinearRegression()
			modelPr.fit(X_polyPr, yPr)
			next_periodPr = np.array([[len(sales_data)]])
			next_period_polyPr = polyPr.transform(next_periodPr)
			forecastPr = modelPr.predict(next_period_polyPr)

			# K-Nearest Neighbors Regression (KNN Regression)
			if n_neighbors < 1:
				return JsonResponse({'error': 'n_neighbors harus lebih besar atau sama dengan 1.'}, status=400)
			XKnn = np.arange(len(sales_data)).reshape(-1, 1)
			yKnn = np.array(sales_data)
			modelKnn = KNeighborsRegressor(n_neighbors=n_neighbors)
			modelKnn.fit(XKnn, yKnn)
			next_periodKnn = np.array([[len(sales_data)]])
			forecastKnn = modelKnn.predict(next_periodKnn)

			# Decision Tree Regression
			XDtr= np.arange(len(sales_data)).reshape(-1, 1)
			yDtr = np.array(sales_data)
			modelDtr = DecisionTreeRegressor()
			modelDtr.fit(XDtr, yDtr)
			next_periodDtr = np.array([[len(sales_data)]])
			forecastDtr = modelDtr.predict(next_periodDtr)

			# Gradient Boosting Regression
			XGbr = np.arange(len(sales_data)).reshape(-1, 1)
			yGbr = np.array(sales_data)
			modelGbr = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=1, random_state=0, loss='squared_error')
			modelGbr.fit(XGbr, yGbr)
			next_periodGbr = np.array([[len(sales_data)]])
			forecastGbr = modelGbr.predict(next_periodGbr)

			# ElasticNet Regression
			XEr = np.arange(len(sales_data)).reshape(-1, 1)
			yEr = np.array(sales_data)
			modelEr = ElasticNet(alpha=1.0, l1_ratio=0.5)
			modelEr.fit(XEr, yEr)
			next_periodEr = np.array([[len(sales_data)]])
			forecastEr = modelEr.predict(next_periodEr)

			# Lasso Regression
			XLas = np.arange(len(sales_data)).reshape(-1, 1)
			yLas = np.array(sales_data)
			modelLas = Lasso(alpha=1.0)
			modelLas.fit(XLas, yLas)
			next_periodLas = np.array([[len(sales_data)]])
			forecastLas = modelLas.predict(next_periodLas)

			return JsonResponse({
				'result' : [
					{'model': 'arima', 'forecast': forecastArima.tolist()[0]},
					{'model': 'simple-exponential-smoothing', 'forecast': forecastSes.tolist()[0]},
					{'model': 'holt-linear', 'forecast': forecastHLTM.tolist()[0]},
					#  {'model': 'hw', 'forecast': forecastHWSM.tolist()[0]},
					#  {'model': 'bayesian', 'forecast': forecastBr.tolist()[0]},
					{'model': 'linear-regression', 'forecast': forecastLr.tolist()[0]},
					{'model': 'random-forest', 'forecast': forecastRf.tolist()[0]},
					{'model': 'support-vector-regressor', 'forecast': forecastSvr.tolist()[0]},
					{'model': 'xgboost', 'forecast': forecast_valueXgb},
					{'model': 'simple-moving-average', 'forecast': float(forecastSma)},
					{'model': 'double-moving-average', 'forecast': float(forecastDma)},
					{'model': 'weighted-moving-average', 'forecast': float(wma)},
					{'model': 'gaussian', 'forecast': float(forecastGpr[0])},
					{'model': 'long-short-term-memory', 'forecast': float(forecastLstm[0])},
					{'model': 'polynomial', 'forecast': float(forecastPr[0])},
					{'model': 'k-nearest-neighbors-regression', 'forecast': float(forecastKnn[0])},
					{'model': 'decision-tree', 'forecast': float(forecastDtr[0])},
					{'model': 'gradient-boosting', 'forecast': float(forecastGbr[0])},
					{'model': 'elasticnet', 'forecast': float(forecastEr[0])},
					{'model': 'lasso-regression', 'forecast': float(forecastLas[0])},
				]
			}, safe=False, status=200)		


		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)

	return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# arima
@csrf_exempt  
def arima_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            model = ARIMA(df['sales'], order=(1, 1, 1))
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=1)
            return JsonResponse({'forecast': forecast.tolist()[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# simple exponential smoothing
@csrf_exempt
def exponential_smoothing_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            model = SimpleExpSmoothing(df['sales'])
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=1)
            return JsonResponse({'forecast': forecast.tolist()[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# holt linear Trend Model (double exponential smoothing)
@csrf_exempt
def holt_linear_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            model = ExponentialSmoothing(df['sales'], trend='add')
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=1)
            return JsonResponse({'forecast': forecast.tolist()[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Holt-Winters Seasonal Model (Triple Exponential Smoothing)
@csrf_exempt
def holt_winters_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting musiman.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            model = ExponentialSmoothing(df['sales'], trend='add', seasonal='add', seasonal_periods=4)
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=1)
            return JsonResponse({'forecast': forecast.tolist()[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# linear regression
@csrf_exempt
def linear_regression_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            df['time'] = np.arange(len(df))
            X = df[['time']]
            y = df['sales']
            model = LinearRegression()
            model.fit(X, y)
            next_time = len(df)
            forecast = model.predict([[next_time]])
            return JsonResponse({'forecast': forecast[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# random forest
@csrf_exempt
def random_forest_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            df['time'] = np.arange(len(df))
            X = df[['time']]
            y = df['sales']
            model = RandomForestRegressor(n_estimators=100)
            model.fit(X, y)
            next_time = len(df)
            forecast = model.predict([[next_time]])
            return JsonResponse({'forecast': forecast[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

#  svr
@csrf_exempt
def svr_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            df['time'] = np.arange(len(df))
            X = df[['time']]
            y = df['sales']
            model = SVR(kernel='rbf')
            model.fit(X, y)
            next_time = len(df)
            forecast = model.predict([[next_time]])
            return JsonResponse({'forecast': forecast[0]}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# xgboost
@csrf_exempt
def xgboost_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            df['time'] = np.arange(len(df))
            X = df[['time']]
            y = df['sales']
            model = xgb.XGBRegressor(n_estimators=100)
            model.fit(X, y)
            next_time = len(df)
            forecast = model.predict(np.array([[next_time]]))
            forecast_value = float(forecast[0])
            return JsonResponse({'forecast': forecast_value}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# simple moving average
@csrf_exempt
def simple_moving_average_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            forecast = df['sales'].rolling(window=3).mean().iloc[-1]  
            return JsonResponse({'forecast': float(forecast)}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# double moving average
@csrf_exempt
def double_moving_average_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            window_size = data.get('window_size', 2)
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            df['SMA1'] = df['sales'].rolling(window=window_size).mean()
            df['SMA2'] = df['SMA1'].rolling(window=window_size).mean()
            if pd.isna(df['SMA2'].iloc[-1]):
                return JsonResponse({'error': 'Data tidak cukup untuk menghitung double moving average.'}, status=400)
            forecast = 2 * df['SMA1'].iloc[-1] - df['SMA2'].iloc[-1]
            return JsonResponse({'forecast': float(forecast)}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# weighted moving average
@csrf_exempt
def weighted_moving_average_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            weights = data.get('weights', [])
            if not sales_data or len(sales_data) != len(weights):
                return JsonResponse({'error': 'Panjang data penjualan dan bobot harus sama.'}, status=400)
            df = pd.DataFrame(sales_data, columns=['sales'])
            weights_array = np.array(weights)
            sales_array = np.array(sales_data)
            wma = np.sum(weights_array * sales_array) / np.sum(weights_array)
            return JsonResponse({'forecast': float(wma)}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data and weights.'}, status=400)

# least square
@csrf_exempt
def least_squares_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 2:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = LinearRegression()
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)[0]
            return JsonResponse({'forecast': float(forecast)}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Gaussian Process Regression
@csrf_exempt
def gpr_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            kernel = C(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
            model = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=10)
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period, return_std=True)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Long Short-Term Memory
@csrf_exempt
def lstm_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            sales_data = np.array(sales_data).reshape(-1, 1)
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(sales_data)
            model = Sequential()
            model.add(LSTM(50, return_sequences=True, input_shape=(scaled_data.shape[1], 1)))
            model.add(LSTM(50, return_sequences=False))
            model.add(Dense(1))
            model.compile(optimizer='adam', loss='mean_squared_error')
            X_train = scaled_data[:-1].reshape((1, -1, 1))
            y_train = scaled_data[1:].reshape((1, -1, 1))
            model.fit(X_train, y_train, epochs=10, batch_size=1, verbose=2)
            last_sequence = scaled_data[-1:].reshape((1, -1, 1))
            forecast = model.predict(last_sequence)
            forecast = scaler.inverse_transform(forecast.reshape(-1, 1))
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Bayesian Regression
@csrf_exempt
def bayesian_regression_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            XBr = np.arange(len(sales_data)).reshape(-1, 1)
            ybr = np.array(sales_data)
            model = BayesianRidge()
            model.fit(XBr, ybr)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)[0]
            return JsonResponse({'forecast': float(forecast)}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Polynomial Regression
@csrf_exempt
def polynomial_regression_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            poly = PolynomialFeatures(degree=2)
            X_poly = poly.fit_transform(X)
            model = LinearRegression()
            model.fit(X_poly, y)
            next_period = np.array([[len(sales_data)]])
            next_period_poly = poly.transform(next_period)
            forecast = model.predict(next_period_poly)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# K-Nearest Neighbors Regression (KNN Regression)
@csrf_exempt
def knn_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            n_neighbors = data.get('n_neighbors', 3)
            if n_neighbors < 1:
                return JsonResponse({'error': 'n_neighbors harus lebih besar atau sama dengan 1.'}, status=400)
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = KNeighborsRegressor(n_neighbors=n_neighbors)
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Decision Tree Regression
@csrf_exempt
def decision_tree_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = DecisionTreeRegressor()
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Gradient Boosting Regression
@csrf_exempt
def gradient_boosting_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=1, random_state=0, loss='squared_error')
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# ElasticNet Regression
@csrf_exempt
def elasticnet_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = ElasticNet(alpha=1.0, l1_ratio=0.5)
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

# Lasso Regression
@csrf_exempt
def lasso_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            if not sales_data or len(sales_data) < 4:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)
            X = np.arange(len(sales_data)).reshape(-1, 1)
            y = np.array(sales_data)
            model = Lasso(alpha=1.0)
            model.fit(X, y)
            next_period = np.array([[len(sales_data)]])
            forecast = model.predict(next_period)
            return JsonResponse({'forecast': float(forecast[0])}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

def preprocess_data(sales_data):
    df = pd.DataFrame(sales_data, columns=['sales'])
    imputer = SimpleImputer(strategy='mean')
    df['sales'] = imputer.fit_transform(df[['sales']])
   #  imputer = KNNImputer(n_neighbors=2)
   #  df['sales'] = imputer.fit_transform(df[['sales']])
    return df

@csrf_exempt
def best_model(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            window_size = data.get('window_size', 2)  

            # Preprocess data with imputing missing values
            df = preprocess_data(sales_data)
            df['time'] = np.arange(len(df))
            X = df[['time']]
            y = df['sales']
            train_X, test_X = X.iloc[:int(0.8 * len(X))], X.iloc[int(0.8 * len(X)):]
            train_y, test_y = y.iloc[:int(0.8 * len(y))], y.iloc[int(0.8 * len(y)):]

            results = []

            # ARIMA Model
            arima_model = ARIMA(train_y, order=(1, 1, 1))
            arima_fit = arima_model.fit()
            arima_forecast = arima_fit.forecast(steps=len(test_y))
            results.append({
                'model': 'ARIMA',
               #  'forecast': arima_fit.forecast(steps=1)[0],
                'mae': mean_absolute_error(test_y, arima_forecast),
                'mse': mean_squared_error(test_y, arima_forecast)
            })

            # Simple Exponential Smoothing Model
            ses_model = SimpleExpSmoothing(train_y).fit()
            ses_forecast = ses_model.forecast(steps=len(test_y))
            results.append({
                'model': 'Simple Exponential Smoothing',
               #  'forecast': ses_model.forecast(steps=1)[0],
                'mae': mean_absolute_error(test_y, ses_forecast),
                'mse': mean_squared_error(test_y, ses_forecast)
            })

            # Holt Linear Trend Model
            holt_model = ExponentialSmoothing(train_y, trend='add').fit()
            holt_forecast = holt_model.forecast(steps=len(test_y))
            results.append({
                'model': 'Holt Linear',
               #  'forecast': holt_model.forecast(steps=1)[0],
                'mae': mean_absolute_error(test_y, holt_forecast),
                'mse': mean_squared_error(test_y, holt_forecast)
            })

            # Holt-Winters Seasonal Model
            hw_model = ExponentialSmoothing(train_y, trend='add', seasonal='add', seasonal_periods=4).fit()
            hw_forecast = hw_model.forecast(steps=len(test_y))
            results.append({
                'model': 'Holt Winters Seasonal',
               #  'forecast': hw_model.forecast(steps=1)[0],
                'mae': mean_absolute_error(test_y, hw_forecast),
                'mse': mean_squared_error(test_y, hw_forecast)
            })

            # Linear Regression Model
            lr_model = LinearRegression().fit(train_X, train_y)
            lr_forecast = lr_model.predict(test_X)
            results.append({
                'model': 'Linear Regression',
               #  'forecast': lr_model.predict([[len(df)]])[0],
                'mae': mean_absolute_error(test_y, lr_forecast),
                'mse': mean_squared_error(test_y, lr_forecast)
            })

            # Random Forest Model
            rf_model = RandomForestRegressor(n_estimators=100).fit(train_X, train_y)
            rf_forecast = rf_model.predict(test_X)
            results.append({
                'model': 'Random Forest',
               #  'forecast': rf_model.predict([[len(df)]])[0],
                'mae': mean_absolute_error(test_y, rf_forecast),
                'mse': mean_squared_error(test_y, rf_forecast)
            })

            # SVR Model
            svr_model = SVR(kernel='rbf').fit(train_X, train_y)
            svr_forecast = svr_model.predict(test_X)
            results.append({
                'model': 'SVR',
               #  'forecast': svr_model.predict([[len(df)]])[0],
                'mae': mean_absolute_error(test_y, svr_forecast),
                'mse': mean_squared_error(test_y, svr_forecast)
            })

            # XGBoost Model
            xgb_model = xgb.XGBRegressor(n_estimators=100).fit(train_X, train_y)
            xgb_forecast = xgb_model.predict(test_X)
            results.append({
                'model': 'XGBoost',
               #  'forecast': xgb_model.predict([[len(df)]])[0],
                'mae': mean_absolute_error(test_y, xgb_forecast),
                'mse': mean_squared_error(test_y, xgb_forecast)
            })

            # Single Moving Average Model
            sma_forecast = y.rolling(window=3).mean().iloc[-1]
            sma_error_forecast = [sma_forecast] * len(test_y)
            results.append({
                'model': 'Single Moving Average',
               #  'forecast': sma_forecast,
                'mae': mean_absolute_error(test_y, sma_error_forecast),
                'mse': mean_squared_error(test_y, sma_error_forecast)
            })

            # Weighted Moving Average Model
            weights = np.linspace(1, 0.5, len(train_y))
            weights /= weights.sum()
            wma_forecast = np.dot(train_y[-len(weights):], weights)
            results.append({
                'model': 'Weighted Moving Average',
               #  'forecast': wma_forecast,
                'mae': mean_absolute_error(test_y, [wma_forecast] * len(test_y)),
                'mse': mean_squared_error(test_y, [wma_forecast] * len(test_y))
            })

            # Double Moving Average Model
            df_train = pd.DataFrame(train_y, columns=['sales'])
            df_train['SMA1'] = df_train['sales'].rolling(window=window_size).mean()
            df_train['SMA2'] = df_train['SMA1'].rolling(window=window_size).mean()
            if pd.notna(df_train['SMA2'].iloc[-1]):
                dma_forecast = 2 * df_train['SMA1'].iloc[-1] - df_train['SMA2'].iloc[-1]
                results.append({
                    'model': 'Double Moving Average',
                  #   'forecast': dma_forecast,
                    'mae': mean_absolute_error(test_y, [dma_forecast] * len(test_y)),
                    'mse': mean_squared_error(test_y, [dma_forecast] * len(test_y))
                })

            # Gaussian Process Regression Model
            kernel = C(1.0, (1e-3, 1e3)) * RBF(1.0, (1e-2, 1e2))
            gpr_model = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=10)
            gpr_model.fit(train_X, train_y)
            gpr_forecast = gpr_model.predict(test_X)
            next_gpr_forecast = gpr_model.predict([[len(df)]])[0]
            results.append({
                'model': 'Gaussian Process Regression',
               #  'forecast': next_gpr_forecast,
                'mae': mean_absolute_error(test_y, gpr_forecast),
                'mse': mean_squared_error(test_y, gpr_forecast)
            })

            # LSTM Model
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_train_y = scaler.fit_transform(np.array(train_y).reshape(-1, 1))
            scaled_test_y = scaler.transform(np.array(test_y).reshape(-1, 1))

            # Membentuk X_train_lstm dan y_train_lstm
            X_train_lstm = scaled_train_y[:-1].reshape((scaled_train_y.shape[0] - 1, 1, 1))
            y_train_lstm = scaled_train_y[1:].reshape((scaled_train_y.shape[0] - 1, 1))

            # Membuat model LSTM
            lstm_model = Sequential()
            lstm_model.add(LSTM(50, return_sequences=True, input_shape=(1, 1)))
            lstm_model.add(LSTM(50, return_sequences=False))
            lstm_model.add(Dense(1))
            lstm_model.compile(optimizer='adam', loss='mean_squared_error')
            lstm_model.fit(X_train_lstm, y_train_lstm, epochs=10, batch_size=1, verbose=0)

            # Membentuk X_test_lstm
            X_test_lstm = scaled_test_y.reshape((scaled_test_y.shape[0], 1, 1))
            lstm_forecast_scaled = lstm_model.predict(X_test_lstm).flatten()

            # Inverse transform hasil prediksi
            lstm_forecast = scaler.inverse_transform(lstm_forecast_scaled.reshape(-1, 1)).flatten()
            test_y_inverse = np.array(test_y)

            # Pastikan panjang konsisten sebelum menghitung error
            if len(test_y_inverse) == len(lstm_forecast):
               lstm_mae = mean_absolute_error(test_y_inverse, lstm_forecast)
               lstm_mse = mean_squared_error(test_y_inverse, lstm_forecast)
            else:
               lstm_mae = None
               lstm_mse = None
               print("Inconsistent length between test_y and lstm_forecast")

            # Forecasting untuk periode berikutnya
            last_sequence = scaled_train_y[-1:].reshape((1, 1, 1))
            next_lstm_forecast = lstm_model.predict(last_sequence)
            next_lstm_forecast = scaler.inverse_transform(next_lstm_forecast)

            # Menambahkan hasil ke results
            results.append({
               'model': 'LSTM',
               # 'forecast': float(next_lstm_forecast[0][0]), 
               'mae': lstm_mae,
               'mse': lstm_mse
            })


            # Bayesian Regression Model
            X_bayes = np.arange(len(sales_data)).reshape(-1, 1)
            y_bayes = np.array(sales_data)
            bayesian_model = BayesianRidge()
            bayesian_model.fit(X_bayes, y_bayes)
            next_period_bayes = np.array([[len(sales_data)]])
            bayes_forecast = bayesian_model.predict(next_period_bayes)[0]
            bayes_forecast_test = bayesian_model.predict(test_X)
            bayes_mae = mean_absolute_error(test_y, bayes_forecast_test)
            bayes_mse = mean_squared_error(test_y, bayes_forecast_test)
            results.append({
                'model': 'Bayesian Regression',
               #  'forecast': float(bayes_forecast),
                'mae': bayes_mae,
                'mse': bayes_mse
            })

				# Polynomial Regression Model
            poly = PolynomialFeatures(degree=2)
            X_poly_train = poly.fit_transform(train_X)
            X_poly_test = poly.transform(test_X)
            poly_model = LinearRegression().fit(X_poly_train, train_y)
            poly_forecast_test = poly_model.predict(X_poly_test)
            poly_mae = mean_absolute_error(test_y, poly_forecast_test)
            poly_mse = mean_squared_error(test_y, poly_forecast_test)
            next_period = np.array([[len(df)]])
            next_period_poly = poly.transform(next_period)
            poly_forecast = poly_model.predict(next_period_poly)[0]
            results.append({
                'model': 'Polynomial Regression',
               #  'forecast': float(poly_forecast),
                'mae': poly_mae,
                'mse': poly_mse
            })
            
				 # K-Nearest Neighbors (KNN) Regression Model
            knn_model = KNeighborsRegressor(n_neighbors=3)
            knn_model.fit(train_X, train_y)
            knn_forecast_test = knn_model.predict(test_X)
            knn_mae = mean_absolute_error(test_y, knn_forecast_test)
            knn_mse = mean_squared_error(test_y, knn_forecast_test)
            next_period_knn = np.array([[len(df)]])
            knn_forecast = knn_model.predict(next_period_knn)[0]
            results.append({
                'model': 'K-Nearest Neighbors Regression',
               #  'forecast': float(knn_forecast),
                'mae': knn_mae,
                'mse': knn_mse
            })

				# Decision Tree Regression Model
            dt_model = DecisionTreeRegressor()
            dt_model.fit(train_X, train_y)
            dt_forecast_test = dt_model.predict(test_X)
            dt_mae = mean_absolute_error(test_y, dt_forecast_test)
            dt_mse = mean_squared_error(test_y, dt_forecast_test)
            next_period_dt = np.array([[len(df)]])
            dt_forecast = dt_model.predict(next_period_dt)[0]
            results.append({
                'model': 'Decision Tree Regression',
               #  'forecast': float(dt_forecast),
                'mae': dt_mae,
                'mse': dt_mse
            })

				# Gradient Boosting Regression Model
            gb_model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=1, random_state=0, loss='squared_error')
            gb_model.fit(train_X, train_y)
            gb_forecast_test = gb_model.predict(test_X)
            gb_mae = mean_absolute_error(test_y, gb_forecast_test)
            gb_mse = mean_squared_error(test_y, gb_forecast_test)
            next_period_gb = np.array([[len(df)]])
            gb_forecast = gb_model.predict(next_period_gb)[0]
            results.append({
                'model': 'Gradient Boosting Regression',
               #  'forecast': float(gb_forecast),
                'mae': gb_mae,
                'mse': gb_mse
            })

				# ElasticNet Regression Model
            en_model = ElasticNet(alpha=1.0, l1_ratio=0.5)
            en_model.fit(train_X, train_y)
            en_forecast_test = en_model.predict(test_X)
            en_mae = mean_absolute_error(test_y, en_forecast_test)
            en_mse = mean_squared_error(test_y, en_forecast_test)
            next_period_en = np.array([[len(df)]])
            en_forecast = en_model.predict(next_period_en)[0]
            results.append({
                'model': 'ElasticNet Regression',
               #  'forecast': float(en_forecast),
                'mae': en_mae,
                'mse': en_mse
            })

            # Lasso Regression Model
            lasso_model = Lasso(alpha=1.0)
            lasso_model.fit(train_X, train_y)
            lasso_forecast = lasso_model.predict(test_X)
            lasso_mae = mean_absolute_error(test_y, lasso_forecast)
            lasso_mse = mean_squared_error(test_y, lasso_forecast)
            results.append({
               'model': 'Lasso Regression',
               'mae': lasso_mae,
               'mse': lasso_mse
            })

            for result in results:
                result['combined_score_errors'] = (0.9 * result['mae']) + (0.1 * result['mse'])

            sorted_results = sorted(results, key=lambda x: x['combined_score_errors'])
            best_models = sorted_results[:3]
            worst_models = sorted_results[-3:]

            for result in results:
                for key, value in result.items():
                    result[key] = safe_convert(value)

            response_data = {
                'models': sorted_results,  
                'best_models': best_models, 
                'worst_models': worst_models 
            }

            return JsonResponse(response_data, safe=False, status=200)

        except Exception as e:
            logging.error("Exception in best_model: %s", str(e))
            error_message = traceback.format_exc()
            logging.error("Error in best_model: %s", error_message)
            return JsonResponse({'error': error_message}, status=500)
            # return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)

def safe_convert(value):
    if isinstance(value, pd.Series):
        if len(value) > 1:
            return value.tolist()  
        elif not value.empty and 0 in value.index:
            return float(value[0])
        else:
            return None
    return value


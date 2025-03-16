# all
@csrf_exempt  
def all_forecast(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			sales_data = data.get('sales_data', [])
			weights = data.get('weights', [])
			window_size = data.get('window_size', 3)
			n_neighbors = data.get('n_neighbors', 3)

			if not sales_data or len(sales_data) < 4:
				return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)

			# arima
			dfArima = pd.DataFrame(sales_data, columns=['sales'])
			modelArima = ARIMA(dfArima['sales'], order=(1, 1, 1))
			model_fitArima = modelArima.fit()
			forecastArima = model_fitArima.forecast(steps=1)

			# simple exponential smoothing
			dfSes = pd.DataFrame(sales_data, columns=['sales'])
			modelSes = SimpleExpSmoothing(dfSes['sales'])
			model_fitSes = modelSes.fit()
			forecastSes = model_fitSes.forecast(steps=1)

			# holt linear Trend Model (double exponential smoothing)
			dfHLTM = pd.DataFrame(sales_data, columns=['sales'])
			modelHLTM = ExponentialSmoothing(dfHLTM['sales'], trend='add')
			model_fitHLTM = modelHLTM.fit()
			forecastHLTM = model_fitHLTM.forecast(steps=1)

			# Holt-Winters Seasonal Model (Triple Exponential Smoothing)
			dfHWSM = pd.DataFrame(sales_data, columns=['sales'])
			modelHWSM = ExponentialSmoothing(dfHWSM['sales'], trend='add', seasonal='add', seasonal_periods=4)
			model_fitHWSM = modelHWSM.fit()
			forecastHWSM = model_fitHWSM.forecast(steps=1)

			# linear regression
			dfLr = pd.DataFrame(sales_data, columns=['sales'])
			dfLr['time'] = np.arange(len(dfLr))
			XLr = dfLr[['time']]
			yLr = dfLr['sales']
			modelLr = LinearRegression()
			modelLr.fit(XLr, yLr)
			next_timeLr = len(dfLr)
			forecastLr = modelLr.predict([[next_timeLr]])

			# random forest
			dfRf = pd.DataFrame(sales_data, columns=['sales'])
			dfRf['time'] = np.arange(len(dfRf))
			XRf = dfRf[['time']]
			yRf = dfRf['sales']
			modelRf = RandomForestRegressor(n_estimators=100)
			modelRf.fit(XRf, yRf)
			next_timeRf = len(dfRf)
			forecastRf = modelRf.predict([[next_timeRf]])

			# svr
			dfSvr = pd.DataFrame(sales_data, columns=['sales'])
			dfSvr['time'] = np.arange(len(dfSvr))
			XSvr = dfSvr[['time']]
			ySvr = dfSvr['sales']
			modelSvr = SVR(kernel='rbf')
			modelSvr.fit(XSvr, ySvr)
			next_timeSvr = len(dfSvr)
			forecastSvr = modelSvr.predict([[next_timeSvr]])

			# xgboost
			dfXgb = pd.DataFrame(sales_data, columns=['sales'])
			dfXgb['time'] = np.arange(len(dfXgb))
			XXgb = dfXgb[['time']]
			yXgb = dfXgb['sales']
			modelXgb = xgb.XGBRegressor(n_estimators=100)
			modelXgb.fit(XXgb, yXgb)
			next_timeXgb = len(dfXgb)
			forecastXgb = modelXgb.predict(np.array([[next_timeXgb]]))
			forecast_valueXgb = float(forecast[0])

			# simple moving average
			dfSma = pd.DataFrame(sales_data, columns=['sales'])
			forecastSma = dfSma['sales'].mean()

			# double moving average
			dfDma = pd.DataFrame(sales_data, columns=['sales'])
			dfDma['SMA1'] = dfDma['sales'].rolling(window=window_size).mean()
			dfDma['SMA2'] = dfDma['SMA1'].rolling(window=window_size).mean()
			if pd.isna(dfDma['SMA2'].iloc[-1]):
					return JsonResponse({'error': 'Data tidak cukup untuk menghitung double moving average.'}, status=400)
			forecastDma = 2 * dfDma['SMA1'].iloc[-1] - dfDma['SMA2'].iloc[-1]

			# weighted moving average
			if not sales_data or len(sales_data) != len(weights):
				return JsonResponse({'error': 'Panjang data penjualan dan bobot harus sama.'}, status=400)
			dfWma = pd.DataFrame(sales_data, columns=['sales'])
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

			# Bayesian Regression
			XBr = np.arange(len(sales_data)).reshape(-1, 1)
			YBr = np.array(sales_data)
			modelBr = BayesianRidge()
			modelBr.fit(XBr, YBr)
			next_periodBr = np.array([[len(sales_data)]])
			forecastBr = modelBr.predict(next_periodBr)[0]

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
			'arima': forecastArima.tolist()[0],
			'ses': forecastSes.tolist()[0],
			'hl': forecastHLTM.tolist()[0],
			'hw': forecastHWSM.tolist()[0],
			'lr': forecastLr.tolist()[0],
			'rf': forecastRf.tolist()[0],
			'svr': forecastSvr.tolist()[0],
			'xgboost': forecast_valueXgb,
			'sma': float(forecastSma),
			'dma': float(forecastDma),
			'wma': float(wma),
			'gpr': float(forecastGpr[0]),
			'lstm': float(forecastLstm[0]),
			# 'br': float(forecastBr[0]),
			'pr': float(forecastPr[0]),
			'knn': float(forecastKnn[0]),
			'dtr': float(forecastDtr[0]),
			'gbr': float(forecastGbr[0]),
			'er': float(forecastEr[0]),
			'lasso': float(forecastLas[0]),
			}, status=200)

		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)

	return JsonResponse({'message': 'Use POST method to send sales data.'}, status=400)
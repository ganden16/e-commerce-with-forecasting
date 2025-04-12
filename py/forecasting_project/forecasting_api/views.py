import logging
import traceback
from sklearn.impute import SimpleImputer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
from statsmodels.tsa.ar_model import AutoReg
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np
import json
from sklearn.metrics import mean_absolute_error, mean_squared_error

# all
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import SimpleExpSmoothing
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json


@csrf_exempt
def all_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            window_size = data.get('window_size', 3)
            steps = data.get('steps', 1)

            if not sales_data or len(sales_data) < window_size:
                return JsonResponse({'error': 'Data penjualan tidak mencukupi untuk forecasting.'}, status=400)

            results = []

            # ARIMA
            forecastArima = arima_forecast(sales_data, steps)
            results.append({'model': 'arima', 'method_id': 1,
                           'forecast': forecastArima})

            # Simple Exponential Smoothing
            forecastSes = simple_exponential_smoothing_forecast(
                sales_data, steps)
            results.append(
                {'model': 'simple-exponential-smoothing', 'method_id': 2, 'forecast': forecastSes})

            # Single Moving Average
            forecastSma = single_moving_average_forecast(sales_data, steps)
            results.append(
                {'model': 'single-moving-average', 'method_id': 4, 'forecast': forecastSma})

            # Double Moving Average
            forecastDma = double_moving_average_forecast(sales_data, steps)
            results.append(
                {'model': 'double-moving-average', 'method_id': 5, 'forecast': forecastDma})

            # Weighted Moving Average
            forecastWma = weighted_moving_average_forecast(sales_data, steps)
            results.append(
                {'model': 'weighted-moving-average', 'method_id': 6, 'forecast': forecastWma})

            # LSTM Forecast
            forecastLstm = lstm_forecast(sales_data, steps)
            results.append({'model': 'long-short-term-memory',
                           'forecast': forecastLstm,
                            'method_id': 7
                            })

            # Auto Regressive
            forecastAr = auto_regressive_forecast(sales_data, steps)
            results.append(
                {'model': 'auto-regressive', 'method_id': 3, 'forecast': forecastAr})

            return JsonResponse({'results': results}, safe=False, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Gunakan metode POST untuk mengirim data penjualan.'}, status=400)


FORECASTING_METHODS = {
    1: "arima_forecast",
    2: "simple_exponential_smoothing_forecast",
    3: "auto_regressive_forecast",
    4: "single_moving_average_forecast",
    5: "double_moving_average_forecast",
    6: "weighted_moving_average_forecast",
    7: "lstm_forecast",
}


@csrf_exempt
def best_method_forecast(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sales_data = data.get('sales_data', [])
            method_ids = data.get('forecasting_method_id', [])
            steps = data.get('steps', 1)

            if not sales_data or not method_ids:
                return JsonResponse({'error': 'sales_data dan forecasting_method_id diperlukan.'}, status=400)

            results = []
            for method_id in method_ids:
                try:
                    forecast = run_forecasting(method_id, sales_data, steps)
                    results.append(
                        {'method_id': method_id, 'forecast': forecast})
                except Exception as e:
                    results.append({'method_id': method_id, 'error': str(e)})

            return JsonResponse({'results': results}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Gunakan metode POST untuk mengirim data.'}, status=400)


def run_forecasting(method_id, sales_data, steps):
    if method_id in FORECASTING_METHODS:
        method_name = FORECASTING_METHODS[method_id]
        method_function = globals().get(method_name)
        if method_function:
            return method_function(sales_data, steps)
    raise ValueError(f"Metode dengan ID {method_id} tidak ditemukan.")

# arima


@csrf_exempt
def arima_forecast(sales_data, steps):
    current_data = sales_data.copy()
    forecast = []

    for _ in range(steps):
        model = ARIMA(current_data, order=(1, 1, 1))
        model_fit = model.fit()
        next_forecast = model_fit.forecast(steps=1)[0]

        next_forecast += np.random.normal(0, 0.1 * next_forecast)

        forecast.append(next_forecast)
        current_data.append(next_forecast)

    return forecast

# simple exponential smoothing


@csrf_exempt
def simple_exponential_smoothing_forecast(sales_data, steps):
    if not sales_data or len(sales_data) == 0:
        raise ValueError("Data penjualan tidak boleh kosong.")

    current_data = sales_data.copy()
    forecast = []
    for _ in range(steps):
        try:
            df = pd.DataFrame(current_data, columns=['sales'])
            model = SimpleExpSmoothing(df['sales']).fit(
                smoothing_level=0.5, optimized=False)
            next_forecast = model.forecast(1).iloc[0]
            noise = np.random.normal(0, 0.05 * abs(next_forecast))
            next_forecast += noise
            forecast.append(next_forecast)
            current_data.append(next_forecast)

        except Exception as e:
            # Tangkap error dan berikan pesan yang lebih deskriptif
            raise RuntimeError(f"Error saat melakukan forecasting: {str(e)}")

    return forecast

# single moving average


@csrf_exempt
def single_moving_average_forecast(sales_data, steps):
    current_data = sales_data.copy()
    forecast = []

    for _ in range(steps):
        window_size = min(3, len(current_data))
        sma = sum(current_data[-window_size:]) / window_size

        sma += np.random.normal(0, 0.05 * sma)

        forecast.append(sma)
        current_data.append(sma)

    return forecast

# double moving average


@csrf_exempt
def double_moving_average_forecast(sales_data, steps):
    if not sales_data or len(sales_data) == 0:
        raise ValueError("Data penjualan tidak boleh kosong.")

    window_size = 2
    current_data = sales_data.copy()
    forecast = []

    for _ in range(steps):
        df = pd.DataFrame(current_data, columns=['sales'])
        df['SMA1'] = df['sales'].rolling(window=window_size).mean()
        df['SMA2'] = df['SMA1'].rolling(window=window_size).mean()
        last_sma1 = df['SMA1'].iloc[-1]
        last_sma2 = df['SMA2'].iloc[-1]
        dma = 2 * last_sma1 - last_sma2
        if pd.isna(dma):
            dma = current_data[-1]

        noise = np.random.normal(0, 0.05 * abs(dma))
        dma_with_noise = dma + noise
        forecast.append(dma_with_noise)
        current_data.append(dma_with_noise)

    return forecast


# weighted moving average
@csrf_exempt
def weighted_moving_average_forecast(sales_data, steps):
    current_data = sales_data.copy()
    forecast = []

    for _ in range(steps):
        weights = np.linspace(0.1, 1, len(current_data))
        weights /= weights.sum()
        wma = np.dot(weights, current_data)
        forecast.append(wma)
        current_data.append(wma)

    return forecast


# Long Short-Term Memory
@csrf_exempt
def lstm_forecast(sales_data, steps=1):
    # Validasi input data
    if not sales_data or len(sales_data) == 0:
        raise ValueError("Data penjualan tidak boleh kosong.")

    # Preprocessing data
    sales_data = np.array(sales_data).reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(sales_data)

    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(1, 1)))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')

    X_train = scaled_data[:-1].reshape(-1, 1, 1)
    y_train = scaled_data[1:].reshape(-1, 1)

    model.fit(X_train, y_train, epochs=10, batch_size=1, verbose=0)

    forecasts = []
    last_sequence = scaled_data[-1].reshape(1, 1, 1)

    for _ in range(steps):
        next_forecast = model.predict(last_sequence)
        noise = np.random.normal(0, 0.4 * abs(next_forecast[0][0]))
        next_forecast_with_noise = next_forecast[0][0] + noise
        forecasts.append(next_forecast_with_noise)
        last_sequence = np.array([[next_forecast_with_noise]]).reshape(1, 1, 1)

    forecasts = scaler.inverse_transform(np.array(forecasts).reshape(-1, 1))
    return forecasts.flatten().tolist()


# Auto Regressive Forecast
@csrf_exempt
def auto_regressive_forecast(sales_data, steps=1):
    if not sales_data or len(sales_data) == 0:
        raise ValueError("Data penjualan tidak boleh kosong.")

    current_data = sales_data.copy()
    forecast = []

    for _ in range(steps):
        try:
            model = AutoReg(current_data, lags=3)
            model_fit = model.fit()

            next_forecast = model_fit.predict(
                start=len(current_data), end=len(current_data))[0]

            noise = np.random.normal(0, 0.05 * abs(next_forecast))
            next_forecast_with_noise = next_forecast + noise
            forecast.append(next_forecast_with_noise)
            current_data.append(next_forecast_with_noise)

        except Exception as e:
            raise RuntimeError(f"Error saat melakukan forecasting: {str(e)}")

    return forecast


def preprocess_data(sales_data):
    df = pd.DataFrame(sales_data, columns=['sales'])
    imputer = SimpleImputer(strategy='mean')
    df['sales'] = imputer.fit_transform(df[['sales']])
   #  imputer = KNNImputer(n_neighbors=2)
   #  df['sales'] = imputer.fit_transform(df[['sales']])
    return df


@csrf_exempt
def modelling(request):
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
            train_X, test_X = X.iloc[:int(
                0.8 * len(X))], X.iloc[int(0.8 * len(X)):]
            train_y, test_y = y.iloc[:int(
                0.8 * len(y))], y.iloc[int(0.8 * len(y)):]

            results = []

            # ARIMA Model
            arima_model = ARIMA(train_y, order=(1, 1, 1))
            arima_fit = arima_model.fit()
            arima_forecast = arima_fit.forecast(steps=len(test_y))
            results.append({
                'model': 'ARIMA',
                #  'forecast': arima_fit.forecast(steps=1)[0],
                'slug': 'arima',
                'mae': mean_absolute_error(test_y, arima_forecast),
                'mse': mean_squared_error(test_y, arima_forecast),
                'method_id': 1
            })

            # Simple Exponential Smoothing Model
            ses_model = SimpleExpSmoothing(train_y).fit()
            ses_forecast = ses_model.forecast(steps=len(test_y))
            results.append({
                'model': 'Simple Exponential Smoothing',
                #  'forecast': ses_model.forecast(steps=1)[0],
                'slug': 'ses',
                'mae': mean_absolute_error(test_y, ses_forecast),
                'mse': mean_squared_error(test_y, ses_forecast),
                'method_id': 2
            })

            # Single Moving Average Model
            sma_forecast = y.rolling(window=3).mean().iloc[-1]
            sma_error_forecast = [sma_forecast] * len(test_y)
            results.append({
                'model': 'Single Moving Average',
                #  'forecast': sma_forecast,
                'slug': 'sma',
                'mae': mean_absolute_error(test_y, sma_error_forecast),
                'mse': mean_squared_error(test_y, sma_error_forecast),
                'method_id': 4
            })

            # Weighted Moving Average Model
            weights = np.linspace(0.1, 1, len(train_y))
            weights /= weights.sum()
            wma_forecast = np.dot(train_y[-len(weights):], weights)
            results.append({
                'model': 'Weighted Moving Average',
                #  'forecast': wma_forecast,
                'slug': 'wma',
                'mae': mean_absolute_error(test_y, [wma_forecast] * len(test_y)),
                'mse': mean_squared_error(test_y, [wma_forecast] * len(test_y)),
                'method_id': 6
            })

            # Double Moving Average Model
            df_train = pd.DataFrame(train_y, columns=['sales'])
            df_train['SMA1'] = df_train['sales'].rolling(
                window=window_size).mean()
            df_train['SMA2'] = df_train['SMA1'].rolling(
                window=window_size).mean()
            if pd.notna(df_train['SMA2'].iloc[-1]):
                dma_forecast = 2 * \
                    df_train['SMA1'].iloc[-1] - df_train['SMA2'].iloc[-1]
                results.append({
                    'model': 'Double Moving Average',
                    #   'forecast': dma_forecast,
                    'slug': 'dma',
                    'mae': mean_absolute_error(test_y, [dma_forecast] * len(test_y)),
                    'mse': mean_squared_error(test_y, [dma_forecast] * len(test_y)),
                    'method_id': 5
                })

            # LSTM Model
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_train_y = scaler.fit_transform(
                np.array(train_y).reshape(-1, 1))
            scaled_test_y = scaler.transform(np.array(test_y).reshape(-1, 1))
            X_train_lstm = scaled_train_y[:-
                                          1].reshape((scaled_train_y.shape[0] - 1, 1, 1))
            y_train_lstm = scaled_train_y[1:].reshape(
                (scaled_train_y.shape[0] - 1, 1))
            lstm_model = Sequential()
            lstm_model.add(LSTM(50, return_sequences=True, input_shape=(1, 1)))
            lstm_model.add(LSTM(50, return_sequences=False))
            lstm_model.add(Dense(1))
            lstm_model.compile(optimizer='adam', loss='mean_squared_error')
            lstm_model.fit(X_train_lstm, y_train_lstm,
                           epochs=10, batch_size=1, verbose=0)
            X_test_lstm = scaled_test_y.reshape((scaled_test_y.shape[0], 1, 1))
            lstm_forecast_scaled = lstm_model.predict(X_test_lstm).flatten()
            lstm_forecast = scaler.inverse_transform(
                lstm_forecast_scaled.reshape(-1, 1)).flatten()
            test_y_inverse = np.array(test_y)
            if len(test_y_inverse) == len(lstm_forecast):
                lstm_mae = mean_absolute_error(test_y_inverse, lstm_forecast)
                lstm_mse = mean_squared_error(test_y_inverse, lstm_forecast)
            else:
                lstm_mae = None
                lstm_mse = None
                print("Inconsistent length between test_y and lstm_forecast")
            last_sequence = scaled_train_y[-1:].reshape((1, 1, 1))
            next_lstm_forecast = lstm_model.predict(last_sequence)
            next_lstm_forecast = scaler.inverse_transform(next_lstm_forecast)
            results.append({
                'model': 'Long Short Term Memory',
                # 'forecast': float(next_lstm_forecast[0][0]),
                'slug': 'lstm',
                'mae': lstm_mae,
                'mse': lstm_mse,
                'method_id': 7
            })

            # AR (Auto Regressive) Model
            ar_model = AutoReg(train_y, lags=3)
            ar_fit = ar_model.fit()
            ar_forecast = ar_fit.predict(
                start=len(train_y), end=len(train_y) + len(test_y) - 1)

            results.append({
                'model': 'Auto Regressive',
                'slug': 'auto regressive',
                'mae': mean_absolute_error(test_y, ar_forecast),
                'mse': mean_squared_error(test_y, ar_forecast),
                'method_id': 3
            })

            for result in results:
                result['combined_score_errors'] = (
                    0.9 * result['mae']) + (0.1 * result['mse'])

            sorted_results = sorted(
                results, key=lambda x: x['mae'])
            #  results, key=lambda x: x['combined_score_errors'])
            best_models = sorted_results[:3]
            worst_models = sorted_results[-3:]

            for result in results:
                for key, value in result.items():
                    result[key] = safe_convert(value)

            response_data = {
                'models': sorted_results,
                'best_models': best_models,
                'worst_models': worst_models,
                'data_training': train_y.tolist(),
                'data_testing': test_y.tolist()
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

def check_api_status(request):
    return JsonResponse({'status': 'OK'})
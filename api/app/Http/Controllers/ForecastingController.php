<?php

namespace App\Http\Controllers;

use App\Models\ForecastingMethod;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ForecastingController extends Controller
{

	public function index(Request $request, $method)
	{
		$slugUrl = ForecastingMethod::all()->pluck('slug')->toArray();
		if (!in_array($method, $slugUrl)) {
			return response()->json(['error' => 'metode forecasting tidak ditemukan'], 404);
		}
		$all_numeric = array_reduce($request->sales_data, function ($carry, $item) {
			return $carry && is_numeric($item);
		}, true);
		if (!$all_numeric) {
			return response()->json(['error' => 'Semua data penjualan harus berupa angka dan tidak boleh kosong'], 400);
		}
		if (count($request['sales_data']) < (int)$request['sales_data_length']) {
			return response()->json(['error' => 'Input data penjualan tidak boleh kosong'], 400);
		}
		if ($method == 'wma') {
			if (!is_array($request->weights) || empty($request->weights)) {
				return response()->json(['error' => 'pembobotan tidak boleh kosong'], 400);
			}
			foreach ($request->weights as $weight) {
				if (!is_numeric($weight)) {
					return response()->json(['error' => 'pembobotan harus berupa angka dan tidak boleh kosong'], 400);
				}
			}
			if (count($request->sales_data) != count($request->weights)) {
				return response()->json(['error' => 'masing-masing data sales harus memiliki nilai pembobotan'], 400);
			}
			if (array_sum($request->weights) != 1) {
				return response()->json(['error' => 'jumlah total pembobotan harus bernilai 1'], 400);
			}
		}
		if ($method == 'knn') {
			if ($request->n_neighbors > count($request->sales_data)) {
				return response()->json(['error' => 'n_neighbors harus >= data penjualan (>=' . count($request->sales_data) . ')'], 400);
			}
			if ($request['n_neighbors'] == null || $request['n_neighbors'] == '') {
				$request['n_neighbors'] = count($request->sales_data);
			}
			if (!is_numeric($request->n_neighbors)) {
				return response()->json(['error' => 'jumlah n_neighbors harus berupa angka'], 400);
			}
		}

		try {
			$response = Http::post(env('DJANGO_URL') . "/api/forecast/" . $method, $request->all());
			$data = $response->json();
			$data['method'] = $method;
			$data['productId'] = $request['productId'];
			return response()->json($data);
		} catch (\Throwable $th) {
			return response()->json([
				'error' => 'Something went wrong while processing your request.',
				'message' => $th->getMessage(),
			], 500);
		}
	}

	public function modelling(Request $request)
	{
		$request['window_size'] = $request->window_size ?? 2;
		try {
			$is_preprocess = false;
			$sales_data = collect($request->sales_data)->map(function ($item) {
				return $item != '' ? (int) $item : $item;
			})->toArray();
			$valid_sales_data = [];
			$processed_sales_data = [];
			foreach ($sales_data as $key => $value) {
				if ($value !== null && $value !== "" && !is_nan($value)) {
					$valid_sales_data[] = (int)$value;
					$processed_sales_data[] = (int)$value;
				} else {
					$average = empty($valid_sales_data) ? 0 : round(array_sum($valid_sales_data) / count($valid_sales_data), 2);
					$processed_sales_data[] = $average;
					$valid_sales_data[] = $average;
					$is_preprocess = true;
				}
			}

			$sales_data = $processed_sales_data;

			$response = Http::timeout(50)->post(env('DJANGO_URL') . "/api/forecast/modelling", [
				'sales_data' => $sales_data,
				'window_size' => $request->window_size
			]);

			$data = $response->json();
			$data['preprocess_data'] = $is_preprocess ? $sales_data : false;
			return response()->json($data);
		} catch (\Throwable $th) {
			return response()->json([
				'error' => 'Something went wrong while processing your request.',
				'message' => $th->getMessage(),
			], 500);
		}
	}


	public function all(Request $request)
	{
		$sales_data = collect($request->sales_data)->map(function ($item) {
			return $item != '' ? (int) $item : $item;
		})->toArray();
		$valid_sales_data = [];
		$processed_sales_data = [];
		foreach ($sales_data as $key => $value) {
			if ($value !== null && $value !== "" && !is_nan($value)) {
				$valid_sales_data[] = (int)$value;
				$processed_sales_data[] = (int)$value;
			} else {
				$average = empty($valid_sales_data) ? 0 : array_sum($valid_sales_data) / count($valid_sales_data);
				$processed_sales_data[] = $average;
				$valid_sales_data[] = $average;
			}
		}

		$sales_data = $processed_sales_data;

		// $all_numeric = array_reduce($request->sales_data, function ($carry, $item) {
		// 	return $carry && is_numeric($item);
		// }, true);

		// if (!$all_numeric) {
		// 	return response()->json(['error' => 'Semua data penjualan harus berupa angka dan tidak boleh kosong'], 400);
		// }
		// if (count($request['sales_data']) < (int)$request['sales_data_length']) {
		// 	return response()->json(['error' => 'Input data penjualan tidak boleh kosong'], 400);
		// }

		// if (!is_array($request->weights) || empty($request->weights)) {
		// 	return response()->json(['error' => 'pembobotan tidak boleh kosong'], 400);
		// }
		// foreach ($request->weights as $weight) {
		// 	if (!is_numeric($weight)) {
		// 		return response()->json(['error' => 'pembobotan harus berupa angka dan tidak boleh kosong'], 400);
		// 	}
		// }
		// if (count($request->sales_data) != count($request->weights)) {
		// 	return response()->json(['error' => 'masing-masing data sales harus memiliki nilai pembobotan'], 400);
		// }
		// if (array_sum($request->weights) != 1) {
		// 	return response()->json(['error' => 'jumlah total pembobotan harus bernilai 1'], 400);
		// }
		// if ($request->n_neighbors > count($request->sales_data)) {
		// 	return response()->json(['error' => 'n_neighbors harus >= data penjualan (>=' . count($request->sales_data) . ')'], 400);
		// }
		// if ($request['n_neighbors'] == null || $request['n_neighbors'] == '') {
		// 	$request['n_neighbors'] = count($request->sales_data);
		// }
		// if (!is_numeric($request->n_neighbors)) {
		// 	return response()->json(['error' => 'jumlah n_neighbors harus berupa angka'], 400);
		// }

		try {
			$response = Http::timeout(50)->post(env('DJANGO_URL') . "/api/forecast/all", [
				'sales_data' => $sales_data
			]);
			$data = $response->json();
			return response()->json($data);
		} catch (\Throwable $th) {
			return response()->json([
				'error' => 'Something went wrong while processing your request.',
				'message' => $th->getMessage(),
			], 500);
		}
	}

	public function getAllMethods()
	{
		$methods = ForecastingMethod::all();
		return response()->json($methods);
	}

	// public function bestMethod(Request $request)
	// {
	// 	$productId = Product::find($request['productId'])->best_forecasting_method_id;
	// 	$method = ForecastingMethod::find($productId);
	// 	$all_numeric = array_reduce($request->sales_data, function ($carry, $item) {
	// 		return $carry && is_numeric($item);
	// 	}, true);
	// 	if (!$all_numeric) {
	// 		return response()->json(['error' => 'Semua data penjualan harus berupa angka dan tidak boleh kosong'], 400);
	// 	}
	// 	if (count($request['sales_data']) < (int)$request['sales_data_length']) {
	// 		return response()->json(['error' => 'Input data penjualan tidak boleh kosong'], 400);
	// 	}
	// 	if ($method->slug == 'wma') {
	// 		if (!is_array($request->weights) || empty($request->weights)) {
	// 			return response()->json(['error' => 'pembobotan tidak boleh kosong'], 400);
	// 		}
	// 		foreach ($request->weights as $weight) {
	// 			if (!is_numeric($weight)) {
	// 				return response()->json(['error' => 'pembobotan harus berupa angka dan tidak boleh kosong'], 400);
	// 			}
	// 		}
	// 		if (count($request->sales_data) != count($request->weights)) {
	// 			return response()->json(['error' => 'masing-masing data sales harus memiliki nilai pembobotan'], 400);
	// 		}
	// 		if (array_sum($request->weights) != 1) {
	// 			return response()->json(['error' => 'jumlah total pembobotan harus bernilai 1'], 400);
	// 		}
	// 	}
	// 	if ($method->slug == 'knn') {
	// 		if ($request->n_neighbors > count($request->sales_data)) {
	// 			return response()->json(['error' => 'n_neighbors harus >= data penjualan (>=' . count($request->sales_data) . ')'], 400);
	// 		}
	// 		if ($request['n_neighbors'] == null || $request['n_neighbors'] == '') {
	// 			$request['n_neighbors'] = count($request->sales_data);
	// 		}
	// 		if (!is_numeric($request->n_neighbors)) {
	// 			return response()->json(['error' => 'jumlah n_neighbors harus berupa angka'], 400);
	// 		}
	// 	}

	// 	try {
	// 		$response = Http::post(env('DJANGO_URL') . "/api/forecast/" . $method->slug, $request->all());
	// 		$data = $response->json();
	// 		$data['method'] = $method->name;
	// 		$data['productId'] = $request['productId'];
	// 		$data['methodId'] = $method->id;
	// 		return response()->json($data);
	// 	} catch (\Throwable $th) {
	// 		return response()->json([
	// 			'error' => 'Something went wrong while processing your request.',
	// 			'message' => $th->getMessage(),
	// 		], 500);
	// 	}
	// }

	public function bestMethod(Request $request)
	{
		try {
			$sales_data = collect($request->sales_data)->map(function ($item) {
				return $item != '' ? (int) $item : $item;
			})->toArray();
			$valid_sales_data = [];
			$processed_sales_data = [];
			foreach ($sales_data as $key => $value) {
				if ($value !== null && $value !== "" && !is_nan($value)) {
					$valid_sales_data[] = (int)$value;
					$processed_sales_data[] = (int)$value;
				} else {
					$average = empty($valid_sales_data) ? 0 : round(array_sum($valid_sales_data) / count($valid_sales_data), 2);
					$processed_sales_data[] = $average;
					$valid_sales_data[] = $average;
				}
			}

			$sales_data = $processed_sales_data;

			$response = Http::post(env('DJANGO_URL') . "/api/forecast/best-method", [
				'sales_data' => $sales_data,
				'forecasting_method_id' => $request->forecasting_method_id
			]);
			$data = $response->json();
			return response()->json($data);
		} catch (\Throwable $th) {
			return response()->json([
				'error' => 'Something went wrong while processing your request.',
				'message' => $th->getMessage(),
			], 500);
		}
	}
}
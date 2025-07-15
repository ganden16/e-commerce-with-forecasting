<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ShipmentController extends Controller
{
	public function cost(Request $request)
	{
		$request->validate([
			'destination' => 'required|numeric',
			'weight' => 'required|numeric',
			// 'courier' => 'required',
		], [
			'destination.required' => 'destinasi masih kosong',
			'weight.required' => 'berat masih kosong',
			'numeric' => ':attribute harus angka'
		]);

		$response = Http::withHeaders([
				'key' => env('RAJA_ONGKIR_KEY')
			])
			->post(env('RAJAONGKIR_URL') . '/api/v1/calculate/district/domestic-cost', [
				'origin' => 5997, //gedangan, sidoarjo, jawa timur
				'destination' => $request->destination,
				'weight' => $request->weight,
				// 'courier' => $request->courier,
				'courier' => 'jnt:jne:pos:sicepat:anteraja:ninja'
		]);

		$responseData = json_decode($response->body(), true);

		$costData = $responseData['rajaongkir']['results'][0]['costs'][0]['cost'][0]['value'];

		// return response()->json($costData);
		return response()->json($responseData['data']);
	}

	public function tracking(Request $request)
	{
		$request->validate([
			'resi' => 'required|string',
			'courier' => 'required|string',
		]);

		try {
			$response = Http::withHeaders([
				'key' => env('RAJA_ONGKIR_KEY')
			])->post(env('RAJAONGKIR_URL') . '/api/v1/track/waybill?awb='.$request->resi.'&courier='.$request->courier);

			$responseData = json_decode($response->body(), true);

			return response()->json($responseData['data']['manifest']);
		} catch (\Throwable $th) {
			return response()->json($th);
		}
	}
}

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

		$response = Http::withOptions([
			'verify' => false
		])->post(env('RAJAONGKIR_URL') . '/cost', [
			'key' => env('RAJA_ONGKIR_KEY'),
			'origin' => 5634,
			'originType' => 'subdistrict',
			'destination' => $request->destination,
			'destinationType' => 'subdistrict',
			'weight' => $request->weight,
			// 'courier' => $request->courier,
			'courier' => 'jnt:jne:pos:sicepat:anteraja:ninja'
		]);

		$responseData = json_decode($response->body(), true);

		$costData = $responseData['rajaongkir']['results'][0]['costs'][0]['cost'][0]['value'];

		// return response()->json($costData);
		return response()->json($responseData['rajaongkir']['results']);
	}

	public function tracking(Request $request)
	{
		$request->validate([
			'resi' => 'required|string',
			'courier' => 'required|string',
		]);

		try {
			$response = Http::withOptions([
				'verify' => false
			])->post(env('RAJAONGKIR_URL') . '/waybill', [
				'key' => env('RAJA_ONGKIR_KEY'),
				'waybill' => $request->resi,
				'courier' => $request->courier
			]);
			$response = $response['rajaongkir']['manifest'];
			return response()->json($response);
		} catch (\Throwable $th) {
			return response()->json($th);
		}
	}
}

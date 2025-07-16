<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ShipmentController extends Controller
{
	public function cost(Request $request)
	{
		// Validasi input
		$request->validate([
			'destination' => 'required|numeric',
			'weight' => 'required|numeric',
		], [
			'destination.required' => 'Destinasi masih kosong.',
			'weight.required' => 'Berat masih kosong.',
			'numeric' => ':attribute harus angka.'
		]);

		try {
			// Kirim request ke RajaOngkir
			$response = Http::withHeaders([
					'key' => env('RAJA_ONGKIR_KEY'),
					'Content-Type' => 'application/x-www-form-urlencoded'
			])->withoutVerifying()->post(env('RAJAONGKIR_URL'). '/api/v1/calculate/district/domestic-cost', [
					'origin' => '5997',
					'destination' => strval($request->destination),
					'weight' => intval($request->weight),
					'courier' => 'jnt:jne:pos:sicepat:anteraja:ninja:tiki:wahana',
					'price' => 'lowest'
			]);

			// Cek apakah response sukses
			if ($response->successful()) {
					$data = $response->json('data');
					return response()->json(collect($data));
			} else {
					return response()->json([
						'response' => $response->json(),
						'error' => 'Gagal mengambil data ongkos kirim',
						'status' => $response->status(),
						'message' => $response->json('description') ?? 'Unknown error'
					], $response->status());
			}

		} catch (\Exception $e) {
			// Tangkap error jaringan, timeout, dll
			return response()->json([
					'error' => 'Terjadi kesalahan internal server',
					'message' => $e->getMessage()
			], 500);
		}
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

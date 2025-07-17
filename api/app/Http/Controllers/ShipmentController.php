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

        $url = env('RAJAONGKIR_URL') . '/api/v1/calculate/district/domestic-cost';
        $apiKey = env('RAJA_ONGKIR_KEY');

        $postData = [
            'origin' => '5997',
            'destination' => strval($request->destination),
            'weight' => intval($request->weight),
            'courier' => 'jnt:jne:pos:sicepat:anteraja:ninja:tiki:wahana',
            'price' => 'lowest'
        ];

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($postData),
            CURLOPT_HTTPHEADER     => [
                'key: ' . $apiKey,
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ]
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            return response()->json([
                'error' => 'cURL Error',
                'message' => curl_error($ch)
            ], 500);
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            return response()->json($data['data'] ?? $data);
        } else {
            return response()->json([
                'error' => 'Gagal mengambil data ongkos kirim',
                'status' => $httpCode,
                'response' => $data,
                'message' => $data['description'] ?? 'Unknown error'
            ], $httpCode);
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

<?php

namespace App\Helper;

use Illuminate\Support\Facades\Http;

class RajaOngkir
{
	public static function getAllProvinces()
	{
		$response = Http::withHeaders([
			'key' => env('RAJA_ONGKIR_KEY')
		])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/province');

		$provinces = collect($response['rajaongkir']['results']);

		return $provinces;
	}
	public static function getAllCities()
	{
		$response = Http::withHeaders([
			'key' => env('RAJA_ONGKIR_KEY')
		])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/city');

		$cities = collect($response['rajaongkir']['results']);

		return $cities;
	}
	public static function getAllSubdistricts($cityId = null, $subdistrictId = null)
	{
		$response = Http::withHeaders([
			'key' => env('RAJA_ONGKIR_KEY')
		])->withQueryParameters([
			'city' => $cityId,
			'id' => $subdistrictId,
		])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/subdistrict');

		$subdistricts = collect($response['rajaongkir']['results']);

		return $subdistricts;
	}
}

<?php

namespace App\Helper;

use Illuminate\Support\Facades\Http;

class RajaOngkir
{
	public static function getAllProvinces()
	{
		$response = Http::withHeaders([
			'key' => env('RAJA_ONGKIR_KEY')
		])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/api/v1/destination/province');

		$provinces = collect($response['data']);

		return $provinces;
	}

	public static function getCitiesByProvince($provinceId)
	{
		$response = Http::withHeaders([
				'key' => env('RAJA_ONGKIR_KEY')
			])
			->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/api/v1/destination/city/'. $provinceId);

		$cities = collect($response['data']);

		return $cities;
	}

	public static function getDistrictByCity($cityId)
	{
		$response = Http::withHeaders([
				'key' => env('RAJA_ONGKIR_KEY')
			])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/api/v1/destination/district/'. $cityId);

			$districts = collect($response['data']);

		return $districts;
	}

	public static function getSubdistrictByDistrict($districtId)
	{
		$response = Http::withHeaders([
				'key' => env('RAJA_ONGKIR_KEY')
			])->withoutVerifying()->get(env('RAJAONGKIR_URL') . '/api/v1/destination/sub-district/'. $districtId);

			$subdistricts = collect($response['data']);

		return $subdistricts;
	}
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Region>
 */
class RegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
		$postalCodes = [
            70915 => "61254", // BANGAH
            70916 => "61254", // GANTING
            70917 => "61254", // GEDANGAN
            70918 => "61254", // GEMURUNG
            70919 => "61254", // KARANGBONG
            70920 => "61254", // KEBOANANOM
            70921 => "61254", // KEBOANSIKEP
            70922 => "61254", // KETAJEN
            70923 => "61254", // KERAGAN
            70924 => "61254", // PUNGGUL
            70925 => "61254", // SAWOTRATAP
            70926 => "61254", // SEMAMBUNG
            70927 => "61254", // SRUNI
            70928 => "61254", // TEBEL
            70929 => "61254", // WEDI
        ];

		  $subdistrictId = fake()->randomElement(array_keys($postalCodes));
		  
        return [
			'province_id' => 18, //jawa timur
			'city_id' => 583, //sidoarjo
			'district_id' => 5997, //gedangan
			'subdistrict_id' => $subdistrictId,
         'postal_code' => $postalCodes[$subdistrictId],
		];
    }
}

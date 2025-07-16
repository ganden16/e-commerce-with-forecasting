<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryDetail>
 */
class DeliveryDetailFactory extends Factory
{
	/**
	 * Define the model's default state.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		return [
			// 'order_id' => Order::inRandomOrder()->first()->id,
			'resi' => $this->faker->regexify('[A-Z0-9]{10}'),
			'province' => $this->faker->state,
			'city' => $this->faker->city,
			'district' => $this->faker->citySuffix,
			'subdistrict' => $this->faker->streetSuffix,
			'postal_code' => $this->faker->postcode,
			'address' => $this->faker->address,
			'address_detail' => fake()->address,
			// 'courier' => 'jnt:jne:pos:sicepat:anteraja:ninja'
			'courier_name' => $this->faker->randomElement([
				'J&T Express',
				'Jalur Nugraha Ekakurir (JNE)',
				'POS Indonesia (POS)',
				'SiCepat Express',
				'Anteraja',
				'Ninja Xpress',
			]),
			'courier_code' => $this->faker->randomElement(['jnt', 'jne', 'pos', 'sicepat', 'anteraja', 'ninja']),
			'courier_service' => $this->faker->randomElement(['EZ', 'JTR', 'REG', 'Ekonomi', 'BEST', 'GOKIL', 'ND', 'STANDARD']),
			'courier_description' => $this->faker->randomElement(['Standard Service', 'Reguler', 'SIUNTUNG', 'CARGO PER KG (MINIMAL 10KG)', 'BESOK SAMPAI TUJUAN', 'Nextday', 'Sameday', 'Trucking']),
			'shipping_cost' => $this->faker->numberBetween(10000, 30000),
			// 'delivery_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
			// 'received_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
		];
	}
}

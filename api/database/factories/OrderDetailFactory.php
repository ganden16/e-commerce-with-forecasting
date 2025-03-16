<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderDetail>
 */
class OrderDetailFactory extends Factory
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
			// 'product_id' => Product::inRandomOrder()->first()->id,
			'product_name' => $this->faker->word,
			'quantity' => $this->faker->numberBetween(1, 10),
			'price' => $this->faker->numberBetween(20000, 100000),
		];
	}
}

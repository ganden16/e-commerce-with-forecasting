<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
	/**
	 * Define the model's default state.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		return [
			// 'user_id' => User::inRandomOrder()->first()->id,
			// 'order_code' => 'ORD-' . Str::upper(Str::random(8)),
			'name' => $this->faker->name,
			'whatsaap' => 62895706077200,
			'telephone' => $this->faker->phoneNumber,
			'email' => $this->faker->safeEmail,
			'gross_amount' => $this->faker->numberBetween(50000, 300000),
			'status' => $this->faker->randomElement(['pending', 'processing', 'shipped', 'completed', 'cancelled']),
		];
	}
}

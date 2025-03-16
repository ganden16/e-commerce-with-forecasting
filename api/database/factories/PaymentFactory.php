<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
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
			'snap_token' => Str::random(20),
			'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'gopay', 'shopeepay']),
			'amount' => $this->faker->numberBetween(50000, 300000),
			'status' => $this->faker->randomElement([
				'pending',
				'settlement',
				'capture',
				'cancel',
				'deny',
				'expire',
				'refund',
				'partial_refund',
				'authorize',
				'failure'
			]),
			'payment_date' => now(),
			'expire_page' => now()->addMinute(),
		];
	}
}

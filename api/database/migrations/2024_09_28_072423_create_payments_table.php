<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		Schema::create('payments', function (Blueprint $table) {
			$table->id();
			$table->foreignId('order_id');
			$table->string('snap_token')->nullable();
			$table->string('payment_method')->nullable();
			$table->decimal('amount', 10, 2);
			$table->enum('status', [
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
			])->default('pending');
			$table->timestamp('payment_date')->nullable();
			$table->timestamp('expire_page')->nullable();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('payments');
	}
};

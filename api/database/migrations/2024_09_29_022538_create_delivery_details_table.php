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
		Schema::create('delivery_details', function (Blueprint $table) {
			$table->id();
			$table->string('resi')->nullable();
			$table->foreignId('order_id');
			$table->string('province');
			$table->string('city');
			$table->string('subdistrict');
			$table->string('postal_code')->nullable();
			$table->text('address');
			$table->string('address_detail')->nullable();
			$table->string('courier_code');
			$table->string('courier_name');
			$table->string('courier_service')->nullable();
			$table->string('courier_description')->nullable();
			$table->decimal('shipping_cost', 10, 2);
			$table->timestamp('delivery_date')->nullable();
			$table->timestamp('received_date')->nullable();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('delivery_details');
	}
};

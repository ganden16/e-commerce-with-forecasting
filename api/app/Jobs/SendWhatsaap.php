<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsaap implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	/**
	 * Create a new job instance.
	 */
	public function __construct(protected $number, protected $message)
	{
		//
	}

	/**
	 * Execute the job.
	 */
	public function handle(): void
	{
		try {
			$response = Http::post(env('WA_URL') . '/send-message', [
				"api_key" => env('WA_KEY'),
				"sender" => env('WA_SENDER'),
				"number" => $this->number,
				"message" => $this->message,
			]);
			if (!$response->successful()) {
				Log::error("Gagal mengirim Pesan whatsaap: " . $response->body());
				throw new \Exception("HTTP request failed with status " . $response->status());
			}
		} catch (\Exception $e) {
			Log::error("Pesan error ke WhatsApp: " . $e->getMessage());
			throw $e;
		}
	}
}

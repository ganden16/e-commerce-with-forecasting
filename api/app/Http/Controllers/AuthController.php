<?php

namespace App\Http\Controllers;

use App\Helper\Whatsaap;
use App\Helper\WhatsappMessage;
use App\Jobs\SendWhatsaap;
use App\Models\OtpForgotPassword;
use App\Models\Region;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
	public function googleRedirectLogin(Request $request)
	{
		$googleUser  = Socialite::driver('google')->stateless()->user();

		$authUser = User::firstOrCreate([
			'google_id' => $googleUser->getId(),
		], [
			'name' => $googleUser->getName(),
			'email' => $googleUser->email,
			'google_id' => $googleUser->id,
			'username' => 'temp-username-' . $googleUser->getId(),
			'whatsaap' => 'temp-whatsaap-' . $googleUser->getId(),
			'password' => bcrypt(Str::random(8)),
			'address' => 'temp-address-' . $googleUser->getId(),
			'province_id' => 99,
			'city_id' => 99,
			'district_id' => 99,
			'gender' => 0,
			'is_admin' => false,
		]);
		Auth::login($authUser);
		$authUser->tokens()->delete();
		$token = $authUser->createToken('auth-token')->plainTextToken;
		if (str_contains($authUser->username, 'temp-username-') || $authUser->whatsaap == 'temp-whatsaap-') {
			return redirect()->away(env('CLIENT_URL') . '/lengkapi-profil?token=' . $token);
		}
		return redirect()->away(env('CLIENT_URL') . '/auth-google-redirect?token=' . $token);
	}

	public function completeProfile(Request $request)
	{
		$gender = $request->gender == 'true' ? true : false;
		$request->validate([
			'username' => 'required|unique:users,username',
			'whatsaap' => 'required|numeric|unique:users,whatsaap',
			'telephone' => 'nullable|numeric',
			'address' => 'required',
			'province_id' => 'required',
			'city_id' => 'required',
			'district_id' => 'required',
			'gender' => 'required',
		], [
			'required' => 'tidak boleh kosong',
			'province_id.required' => 'silahkan pilih provinsi',
			'city_id.required' => 'silahkan pilih kota/kabupaten',
			'district_id.required' => 'silahkan pilih kecamatan',
			'numeric' => 'harus berupa angka',
			'min' => 'minimal :min karakter',
			'unique' => ':attribute telah terdaftar, gunakan :attribute lain',
		]);

		$user = $request->user();
		$user->update([
			'username' => $request->username,
			'whatsaap' => $request->whatsaap,
			'telephone' => $request->telephone,
			'address' => $request->address,
			'province_id' => $request->province_id,
			'city_id' => $request->city_id,
			'district_id' => $request->district_id,
			'subdistrict_id' => $request->subdistrict_id ?? null,
			'postal_code' => $request->postal_code ?? null,
			'gender' => $gender,
		]);

		return response()->json([
			'message' => 'Profil berhasil dilengkapi',
			'token' => $request->bearerToken()
		], 200);
	}

	public function register(Request $request)
	{
		$gender = $request->gender == 'true' ? true : false;
		Validator::make($request->all(), [
			'name' => 'required',
			'username' => 'required|unique:users,username',
			'email' => 'required|email|unique:users,email',
			'password' => 'required|min:6|confirmed',
			'whatsaap' => 'required|numeric|unique:users,whatsaap',
			'telephone' => 'nullable|numeric',
			'address' => 'required',
			'province_id' => 'required',
			'city_id' => 'required',
			'district_id' => 'required',
			'gender' => 'required',

		], [
			'required' => 'tidak boleh kosong',
			'province_id.required' => 'silahkan pilih provinsi',
			'city_id.required' => 'silahkan pilih kota/kabupaten',
			'district_id.required' => 'silahkan pilih kecamatan',
			'numeric' => 'harus berupa angka',
			'min' => 'minimal :min karakter',
			'unique' => ':attribute telah terdaftar, gunakan :attribute lain',
			'confirmed' => 'konfirmasi :attribute harus sama',
			'email.email' => 'harus email valid'
		])->validate();

		$newUser = User::create([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'password' => Hash::make($request->password),
			'address' => $request->address,
			'province_id' => $request->province_id,
			'city_id' => $request->city_id,
			'district_id' => $request->district_id,
			'subdistrict_id' => $request->subdistrict_id ?? null,
			'postal_code' => $request->postal_code ?? null,
			'telephone' => $request->telephone,
			'whatsaap' => $request->whatsaap,
			'gender' => $gender,
			'is_admin' => false,
		]);

		return response()->json([
			'message' => 'Berhasil membuat akun',
			'data' => $newUser
		], 201);
	}

	public function addAdmin(Request $request)
	{
		$gender = $request->gender == 'true' ? true : false;
		Validator::make($request->all(), [
			'name' => 'required',
			'username' => 'required|unique:users,username',
			'email' => 'required|email|unique:users,email',
			'password' => 'required|min:6|confirmed',
			'whatsaap' => 'required|numeric|unique:users,whatsaap',
			'telephone' => 'nullable|numeric',
			'address' => 'required',
			'subdistrict_id' => 'required',
			'gender' => 'required',

		], [
			'required' => 'tidak boleh kosong',
			'subdistrict_id.required' => 'silahkan pilih provinsi, kota/kab, kecamatan',
			'numeric' => 'harus berupa angka',
			'min' => 'minimal :min karakter',
			'unique' => ':attribute telah terdaftar, gunakan :attribute lain',
			'confirmed' => 'konfirmasi :attribute harus sama',
			'email.email' => 'harus email valid'
		])->validate();

		$newUser = User::create([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'password' => Hash::make($request->password),
			'address' => $request->address,
			'subdistrict_id' => (int)$request->subdistrict_id,
			'telephone' => $request->telephone,
			'whatsaap' => $request->whatsaap,
			'gender' => $gender,
			'is_admin' => true,
		]);

		return response()->json([
			'message' => 'Berhasil menambahkan akun admin',
			'data' => $newUser
		], 201);
	}

	public function login(Request $request)
	{
		Validator::make($request->all(), [
			'username' => 'required',
			'password' => 'required|min:6',
		], [
			'required' => 'tidak boleh kosong',
			'min' => 'minimal :min karakter',
		])->validate();

		$credentials = [
			'username' => $request->username,
			'password' => $request->password,
		];

		if (!Auth::attempt($credentials)) {
			return response()->json(['message' => 'Username atau password salah'], 401);
		}

		$user = Auth::user();
		$user->tokens()->delete();
		$token = $user->createToken('apifaycookskripsi')->plainTextToken;

		return response()->json([
			'user' => $user,
			'token' => $token,
			'message' => 'Berhasil login',
		], 200);
	}
	public function logout(Request $request)
	{
		$request->user()->currentAccessToken()->delete();
		return response()->json([
			'message' => 'Anda telah logout'
		], 200);
	}
	public function updateProfile(Request $request)
	{
		$request->merge([
			'telephone' => str_replace(' ', '', $request->telephone)
		]);
		$user = $request->user();
		$gender = $request->gender == 'true' ? true : false;

		Validator::make($request->all(), [
			'name' => 'required',
			'username' => 'required|unique:users,username,' . $user->id,
			'email' => 'required|email|unique:users,email,' . $user->id,
			'whatsaap' => 'required|numeric',
			'telephone' => 'nullable|numeric',
			'address' => 'required',
			'province_id' => 'required',
			'city_id' => 'required',
			'district_id' => 'required',
			'gender' => 'required',
			'fileImage' => 'nullable|image|max:5000',
		], [
			'required' => 'tidak boleh kosong',
			'province_id.required' => 'silahkan pilih provinsi',
			'city_id.required' => 'silahkan pilih kota/kabupaten',
			'district_id.required' => 'silahkan pilih kecamatan',
			'numeric' => 'harus berupa angka',
			'min' => 'minimal :min karakter',
			'unique' => ':attribute telah terdaftar, gunakan :attribute lain',
			'confirmed' => 'konfirmasi :attribute harus sama',
			'fileImage' => 'file harus gambar (jpeg, png, bmp, gif, or svg) dan ukuran maksimal 5 MB.',
			'email.email' => 'harus email valid'
		])->validate();

		$image = $user->image ?? null;

		if ($request->hasFile('fileImage')) {
			if ($user->image && !strpos($image, '/seeders')) {
				$urlImage = explode("/storage", $image, 2);
				$path =  $urlImage[1];
				Storage::delete($path);
			}
			$path = $request->fileImage->store('images/profiles');
			$image = Storage::url($path);
		}
		$user->update([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'address' => $request->address,
			'telephone' => $request->telephone,
			'whatsaap' => $request->whatsaap,
			'gender' => $gender,
			'image' => $image,
			'province_id' => $request->province_id,
			'city_id' => $request->city_id,
			'district_id' => $request->district_id,
			'subdistrict_id' => $request->subdistrict_id ?? null,
			'postal_code' => $request->postal_code ?? null
		]);

		return response()->json([
			'message' => 'Profilmu berhasil diperbarui',
		], 200);
	}
	public function me(Request $request)
	{
		return response()->json($request->user(), 200);
	}
	public function changePassword(Request $request)
	{
		$user = $request->user();
		Validator::make($request->all(), [
			'newPassword' => 'required|min:6|confirmed',
			'currentPassword' => [
				'required',
				'min:6',
				function ($attribute, $value, $fail) use ($user) {
					if (!Hash::check($value, $user->password)) {
						$fail('Kata sandi lama tidak sesuai');
					}
				}
			],
		], [
			'required' => 'tidak boleh kosong',
			'min' => 'minimal :min karakter',
			'newPassword.confirmed' => 'konfirmasi kata sandi harus sama',
		])->validate();

		$user->update([
			'password' => $request->newPassword
		]);
		return response()->json([
			'message' => 'Kata sandi telah berhasil diubah'
		], 200);
	}

	public function sendOtpForgotPassword(Request $request)
	{
		$request->validate([
			'identifier' => 'required',
		], [
			'required' => 'Isikan username atau whatsapp terlebih dahulu',
		]);
		$user = User::where('username', $request->identifier)
			->orWhere('whatsaap', $request->identifier)
			->first();
		if (!$user) {
			return response()->json([
				'message' => 'Pengguna tidak ditemukan.',
			], 400);
		}

		$this->createAndSendOtpForgotPassword($user, 3);

		return response()->json([
			'message' => "kode otp anda telah kami kirim ke $user->whatsaap",
		], 200);
	}

	public function getOtpExpiry(Request $request)
	{
		$user = User::where('username', $request->identifier)
			->orWhere('whatsaap', $request->identifier)
			->first();

		if (!$user) {
			return response()->json([
				'message' => 'Pengguna tidak ditemukan.'
			], 400);
		}

		$otp = OtpForgotPassword::where('user_id', $user->id)->first();
		if (!$otp) {
			return response()->json([
				'message' => 'Anda belum melakukan permintaan otp'
			], 400);
		}

		return response()->json([
			'expired_at' => $otp->expired_at
		], 200);
	}

	public function confirmForgotPassword(Request $request)
	{
		$request->validate([
			'identifier' => 'required',
			'otp' => 'required|numeric',
			'newPassword' => 'required|min:6|confirmed',
		], [
			'required' => 'wajib diisi.',
			'min' => 'kata sandi harus minimal :min karakter.',
			'confirmed' => 'konfirmasi kata sandi tidak sesuai.',
			'numeric' => 'harus berupa angka',
		]);

		$user = User::where('username', $request->identifier)
			->orWhere('whatsaap', $request->identifier)
			->first();

		if (!$user) {
			return response()->json([
				'message' => 'Pengguna tidak ditemukan.'
			], 400);
		}

		$isOtpValid = OtpForgotPassword::where('user_id', $user->id)
			->where('otp', $request->otp)
			->where('expired_at', '>', now())
			->first();

		if (!$isOtpValid) {
			return response()->json([
				'message' => 'Kode OTP tidak valid'
			], 400);
		}

		$user->password = Hash::make($request->newPassword);
		$user->save();
		$isOtpValid->delete();

		return response()->json([
			'message' => 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.'
		], 200);
	}


	public function createAndSendOtpForgotPassword(User $user, int $minutes = 2): void
	{
		$otp = (string) rand(100000, 999999);
		OtpForgotPassword::where('user_id', $user->id)->delete();
		OtpForgotPassword::create([
			'user_id' => $user->id,
			'otp' => $otp,
			'expired_at' => now()->addMinutes($minutes),
		]);

		$message = WhatsappMessage::otpForgotPassword($user->name, $otp, $minutes);
		SendWhatsaap::dispatch($user->whatsaap, $message);
	}
}

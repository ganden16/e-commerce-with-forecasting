<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
	public function getAllUsers()
	{
		$users = User::where('is_admin', false)->get();
		return response()->json($users);
	}
	public function getAllAdmins()
	{
		$admins = User::where('is_admin', true)->get();
		return response()->json($admins);
	}
	public function showAdmin($id)
	{
		$admin = User::where('is_admin', true)->where('id', $id)->first();
		return response()->json($admin);
	}
	public function showUser($id)
	{
		$user = User::where('is_admin', false)->where('id', $id)->first();
		return response()->json($user);
	}

	public function addAdmin(Request $request)
	{
		$gender = $request->gender == 'true' ? true : false;
		Validator::make($request->all(), [
			'name' => 'required',
			'username' => 'required',
			'email' => 'required|email|unique:users,email',
			'password' => 'required|min:6|confirmed',
			'whatsaap' => 'required|numeric',
			'address' => 'required',
			'gender' => 'required',

		], [
			'required' => 'tidak boleh kosong',
			'numeric' => 'harus berupa angka',
			'min' => 'minimal :min karakter',
			'unique' => 'email telah terdaftar',
			'confirmed' => 'konfirmasi :attribute harus sama',
		])->validate();

		$newAdmin = User::create([
			'name' => $request->name,
			'email' => $request->email,
			'password' => Hash::make($request->password),
			'address' => $request->address,
			'telephone' => $request->telephone,
			'whatsaap' => $request->whatsaap,
			'gender' => $gender,
			'is_admin' => true,
		]);

		return response()->json([
			'message' => 'Data admin baru berhasil ditambahkan',
			'data' => $newAdmin
		], 201);
	}
}

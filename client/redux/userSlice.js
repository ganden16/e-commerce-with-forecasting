// redux/userSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
	user: null
	// user: {
	// 	id: null,
	// 	name: null,
	// 	username: null,
	// 	email: null,
	// 	is_admin: null,
	// 	address: null,
	// 	telephone: null,
	// 	whatsaap: null,
	// 	image: null,
	// 	gender: null,
	// },
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
		},
		clearUser: (state) => {
			state.user = null;
		}
	},
});

export const {setUser, clearUser} = userSlice.actions;
export default userSlice.reducer;

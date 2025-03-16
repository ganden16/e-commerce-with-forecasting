// redux/userSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
	cart: null
};

const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		setCart: (state, action) => {
			state.cart = action.payload;
		},
	},
});

export const {setCart} = cartSlice.actions;
export default cartSlice.reducer;

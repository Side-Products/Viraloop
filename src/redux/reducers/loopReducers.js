import { combineReducers } from "redux";

// Action Types
export const FETCH_LOOPS_REQUEST = "FETCH_LOOPS_REQUEST";
export const FETCH_LOOPS_SUCCESS = "FETCH_LOOPS_SUCCESS";
export const FETCH_LOOPS_FAIL = "FETCH_LOOPS_FAIL";

export const CREATE_LOOP_REQUEST = "CREATE_LOOP_REQUEST";
export const CREATE_LOOP_SUCCESS = "CREATE_LOOP_SUCCESS";
export const CREATE_LOOP_FAIL = "CREATE_LOOP_FAIL";

export const UPDATE_LOOP_REQUEST = "UPDATE_LOOP_REQUEST";
export const UPDATE_LOOP_SUCCESS = "UPDATE_LOOP_SUCCESS";
export const UPDATE_LOOP_FAIL = "UPDATE_LOOP_FAIL";

export const DELETE_LOOP_REQUEST = "DELETE_LOOP_REQUEST";
export const DELETE_LOOP_SUCCESS = "DELETE_LOOP_SUCCESS";
export const DELETE_LOOP_FAIL = "DELETE_LOOP_FAIL";

export const SET_CURRENT_LOOP = "SET_CURRENT_LOOP";
export const CLEAR_LOOP_ERRORS = "CLEAR_LOOP_ERRORS";

// Loops List Reducer
const loopsListReducer = (
	state = {
		loops: [],
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case FETCH_LOOPS_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_LOOPS_SUCCESS:
			return {
				...state,
				loading: false,
				loops: action.payload,
			};
		case FETCH_LOOPS_FAIL:
			return { ...state, loading: false, error: action.payload };
		case CREATE_LOOP_SUCCESS:
			return {
				...state,
				loops: [action.payload, ...state.loops],
			};
		case UPDATE_LOOP_SUCCESS:
			return {
				...state,
				loops: state.loops.map((s) =>
					s._id === action.payload._id ? action.payload : s
				),
			};
		case DELETE_LOOP_SUCCESS:
			return {
				...state,
				loops: state.loops.filter((s) => s._id !== action.payload),
			};
		case CLEAR_LOOP_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// Single Loop Reducer
const loopDetailReducer = (
	state = {
		loop: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case SET_CURRENT_LOOP:
			return { ...state, loop: action.payload };
		case UPDATE_LOOP_SUCCESS:
			if (state.loop?._id === action.payload._id) {
				return { ...state, loop: action.payload };
			}
			return state;
		default:
			return state;
	}
};

// Create Loop Reducer
const createLoopReducer = (
	state = {
		loading: false,
		success: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case CREATE_LOOP_REQUEST:
			return { loading: true, success: false, error: null };
		case CREATE_LOOP_SUCCESS:
			return { loading: false, success: true, error: null };
		case CREATE_LOOP_FAIL:
			return { loading: false, success: false, error: action.payload };
		case CLEAR_LOOP_ERRORS:
			return { loading: false, success: false, error: null };
		default:
			return state;
	}
};

export const loopReducers = combineReducers({
	list: loopsListReducer,
	detail: loopDetailReducer,
	create: createLoopReducer,
});

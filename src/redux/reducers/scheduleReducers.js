import { combineReducers } from "redux";

// Action Types
export const FETCH_SCHEDULES_REQUEST = "FETCH_SCHEDULES_REQUEST";
export const FETCH_SCHEDULES_SUCCESS = "FETCH_SCHEDULES_SUCCESS";
export const FETCH_SCHEDULES_FAIL = "FETCH_SCHEDULES_FAIL";

export const CREATE_SCHEDULE_REQUEST = "CREATE_SCHEDULE_REQUEST";
export const CREATE_SCHEDULE_SUCCESS = "CREATE_SCHEDULE_SUCCESS";
export const CREATE_SCHEDULE_FAIL = "CREATE_SCHEDULE_FAIL";

export const UPDATE_SCHEDULE_REQUEST = "UPDATE_SCHEDULE_REQUEST";
export const UPDATE_SCHEDULE_SUCCESS = "UPDATE_SCHEDULE_SUCCESS";
export const UPDATE_SCHEDULE_FAIL = "UPDATE_SCHEDULE_FAIL";

export const DELETE_SCHEDULE_REQUEST = "DELETE_SCHEDULE_REQUEST";
export const DELETE_SCHEDULE_SUCCESS = "DELETE_SCHEDULE_SUCCESS";
export const DELETE_SCHEDULE_FAIL = "DELETE_SCHEDULE_FAIL";

export const SET_CURRENT_SCHEDULE = "SET_CURRENT_SCHEDULE";
export const CLEAR_SCHEDULE_ERRORS = "CLEAR_SCHEDULE_ERRORS";

// Schedules List Reducer
const schedulesListReducer = (
	state = {
		schedules: [],
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case FETCH_SCHEDULES_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_SCHEDULES_SUCCESS:
			return {
				...state,
				loading: false,
				schedules: action.payload,
			};
		case FETCH_SCHEDULES_FAIL:
			return { ...state, loading: false, error: action.payload };
		case CREATE_SCHEDULE_SUCCESS:
			return {
				...state,
				schedules: [action.payload, ...state.schedules],
			};
		case UPDATE_SCHEDULE_SUCCESS:
			return {
				...state,
				schedules: state.schedules.map((s) =>
					s._id === action.payload._id ? action.payload : s
				),
			};
		case DELETE_SCHEDULE_SUCCESS:
			return {
				...state,
				schedules: state.schedules.filter((s) => s._id !== action.payload),
			};
		case CLEAR_SCHEDULE_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// Single Schedule Reducer
const scheduleDetailReducer = (
	state = {
		schedule: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case SET_CURRENT_SCHEDULE:
			return { ...state, schedule: action.payload };
		case UPDATE_SCHEDULE_SUCCESS:
			if (state.schedule?._id === action.payload._id) {
				return { ...state, schedule: action.payload };
			}
			return state;
		default:
			return state;
	}
};

// Create Schedule Reducer
const createScheduleReducer = (
	state = {
		loading: false,
		success: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case CREATE_SCHEDULE_REQUEST:
			return { loading: true, success: false, error: null };
		case CREATE_SCHEDULE_SUCCESS:
			return { loading: false, success: true, error: null };
		case CREATE_SCHEDULE_FAIL:
			return { loading: false, success: false, error: action.payload };
		case CLEAR_SCHEDULE_ERRORS:
			return { loading: false, success: false, error: null };
		default:
			return state;
	}
};

export const scheduleReducers = combineReducers({
	list: schedulesListReducer,
	detail: scheduleDetailReducer,
	create: createScheduleReducer,
});

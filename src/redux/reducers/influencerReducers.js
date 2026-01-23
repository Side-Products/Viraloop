import { combineReducers } from "redux";

// Action Types
export const FETCH_INFLUENCERS_REQUEST = "FETCH_INFLUENCERS_REQUEST";
export const FETCH_INFLUENCERS_SUCCESS = "FETCH_INFLUENCERS_SUCCESS";
export const FETCH_INFLUENCERS_FAIL = "FETCH_INFLUENCERS_FAIL";

export const CREATE_INFLUENCER_REQUEST = "CREATE_INFLUENCER_REQUEST";
export const CREATE_INFLUENCER_SUCCESS = "CREATE_INFLUENCER_SUCCESS";
export const CREATE_INFLUENCER_FAIL = "CREATE_INFLUENCER_FAIL";

export const UPDATE_INFLUENCER_REQUEST = "UPDATE_INFLUENCER_REQUEST";
export const UPDATE_INFLUENCER_SUCCESS = "UPDATE_INFLUENCER_SUCCESS";
export const UPDATE_INFLUENCER_FAIL = "UPDATE_INFLUENCER_FAIL";

export const DELETE_INFLUENCER_REQUEST = "DELETE_INFLUENCER_REQUEST";
export const DELETE_INFLUENCER_SUCCESS = "DELETE_INFLUENCER_SUCCESS";
export const DELETE_INFLUENCER_FAIL = "DELETE_INFLUENCER_FAIL";

export const SET_CURRENT_INFLUENCER = "SET_CURRENT_INFLUENCER";
export const CLEAR_INFLUENCER_ERRORS = "CLEAR_INFLUENCER_ERRORS";

// Influencers List Reducer
const influencersListReducer = (
	state = {
		influencers: [],
		loading: false,
		error: null,
		pagination: {
			currentPage: 1,
			totalPages: 1,
			totalInfluencers: 0,
		},
	},
	action
) => {
	switch (action.type) {
		case FETCH_INFLUENCERS_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_INFLUENCERS_SUCCESS:
			return {
				...state,
				loading: false,
				influencers: action.payload.influencers,
				pagination: action.payload.pagination,
			};
		case FETCH_INFLUENCERS_FAIL:
			return { ...state, loading: false, error: action.payload };
		case CREATE_INFLUENCER_SUCCESS:
			return {
				...state,
				influencers: [action.payload, ...state.influencers],
				pagination: {
					...state.pagination,
					totalInfluencers: state.pagination.totalInfluencers + 1,
				},
			};
		case UPDATE_INFLUENCER_SUCCESS:
			return {
				...state,
				influencers: state.influencers.map((i) =>
					i._id === action.payload._id ? action.payload : i
				),
			};
		case DELETE_INFLUENCER_SUCCESS:
			return {
				...state,
				influencers: state.influencers.filter((i) => i._id !== action.payload),
				pagination: {
					...state.pagination,
					totalInfluencers: state.pagination.totalInfluencers - 1,
				},
			};
		case CLEAR_INFLUENCER_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// Single Influencer Reducer
const influencerDetailReducer = (
	state = {
		influencer: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case SET_CURRENT_INFLUENCER:
			return { ...state, influencer: action.payload };
		case UPDATE_INFLUENCER_SUCCESS:
			if (state.influencer?._id === action.payload._id) {
				return { ...state, influencer: action.payload };
			}
			return state;
		default:
			return state;
	}
};

// Create Influencer Reducer
const createInfluencerReducer = (
	state = {
		loading: false,
		success: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case CREATE_INFLUENCER_REQUEST:
			return { loading: true, success: false, error: null };
		case CREATE_INFLUENCER_SUCCESS:
			return { loading: false, success: true, error: null };
		case CREATE_INFLUENCER_FAIL:
			return { loading: false, success: false, error: action.payload };
		case CLEAR_INFLUENCER_ERRORS:
			return { loading: false, success: false, error: null };
		default:
			return state;
	}
};

export const influencerReducers = combineReducers({
	list: influencersListReducer,
	detail: influencerDetailReducer,
	create: createInfluencerReducer,
});

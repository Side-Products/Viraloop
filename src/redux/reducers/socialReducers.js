import { combineReducers } from "redux";

// Action Types
export const FETCH_TIKTOK_ACCOUNT_REQUEST = "FETCH_TIKTOK_ACCOUNT_REQUEST";
export const FETCH_TIKTOK_ACCOUNT_SUCCESS = "FETCH_TIKTOK_ACCOUNT_SUCCESS";
export const FETCH_TIKTOK_ACCOUNT_FAIL = "FETCH_TIKTOK_ACCOUNT_FAIL";
export const DISCONNECT_TIKTOK_SUCCESS = "DISCONNECT_TIKTOK_SUCCESS";

export const FETCH_INSTAGRAM_ACCOUNT_REQUEST = "FETCH_INSTAGRAM_ACCOUNT_REQUEST";
export const FETCH_INSTAGRAM_ACCOUNT_SUCCESS = "FETCH_INSTAGRAM_ACCOUNT_SUCCESS";
export const FETCH_INSTAGRAM_ACCOUNT_FAIL = "FETCH_INSTAGRAM_ACCOUNT_FAIL";
export const DISCONNECT_INSTAGRAM_SUCCESS = "DISCONNECT_INSTAGRAM_SUCCESS";

export const FETCH_YOUTUBE_CHANNEL_REQUEST = "FETCH_YOUTUBE_CHANNEL_REQUEST";
export const FETCH_YOUTUBE_CHANNEL_SUCCESS = "FETCH_YOUTUBE_CHANNEL_SUCCESS";
export const FETCH_YOUTUBE_CHANNEL_FAIL = "FETCH_YOUTUBE_CHANNEL_FAIL";
export const DISCONNECT_YOUTUBE_SUCCESS = "DISCONNECT_YOUTUBE_SUCCESS";

export const CLEAR_SOCIAL_ERRORS = "CLEAR_SOCIAL_ERRORS";

// TikTok Reducer
const tiktokReducer = (
	state = {
		connected: false,
		accountInfo: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case FETCH_TIKTOK_ACCOUNT_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_TIKTOK_ACCOUNT_SUCCESS:
			return {
				...state,
				loading: false,
				connected: true,
				accountInfo: action.payload,
			};
		case FETCH_TIKTOK_ACCOUNT_FAIL:
			return {
				...state,
				loading: false,
				connected: false,
				error: action.payload,
			};
		case DISCONNECT_TIKTOK_SUCCESS:
			return {
				connected: false,
				accountInfo: null,
				loading: false,
				error: null,
			};
		case CLEAR_SOCIAL_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// Instagram Reducer
const instagramReducer = (
	state = {
		connected: false,
		accountInfo: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case FETCH_INSTAGRAM_ACCOUNT_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_INSTAGRAM_ACCOUNT_SUCCESS:
			return {
				...state,
				loading: false,
				connected: true,
				accountInfo: action.payload,
			};
		case FETCH_INSTAGRAM_ACCOUNT_FAIL:
			return {
				...state,
				loading: false,
				connected: false,
				error: action.payload,
			};
		case DISCONNECT_INSTAGRAM_SUCCESS:
			return {
				connected: false,
				accountInfo: null,
				loading: false,
				error: null,
			};
		case CLEAR_SOCIAL_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// YouTube Reducer
const youtubeReducer = (
	state = {
		connected: false,
		channelInfo: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case FETCH_YOUTUBE_CHANNEL_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_YOUTUBE_CHANNEL_SUCCESS:
			return {
				...state,
				loading: false,
				connected: true,
				channelInfo: action.payload,
			};
		case FETCH_YOUTUBE_CHANNEL_FAIL:
			return {
				...state,
				loading: false,
				connected: false,
				error: action.payload,
			};
		case DISCONNECT_YOUTUBE_SUCCESS:
			return {
				connected: false,
				channelInfo: null,
				loading: false,
				error: null,
			};
		case CLEAR_SOCIAL_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

export const socialReducers = combineReducers({
	tiktok: tiktokReducer,
	instagram: instagramReducer,
	youtube: youtubeReducer,
});

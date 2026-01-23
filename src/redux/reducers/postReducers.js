import { combineReducers } from "redux";

// Action Types
export const FETCH_POSTS_REQUEST = "FETCH_POSTS_REQUEST";
export const FETCH_POSTS_SUCCESS = "FETCH_POSTS_SUCCESS";
export const FETCH_POSTS_FAIL = "FETCH_POSTS_FAIL";

export const CREATE_POST_REQUEST = "CREATE_POST_REQUEST";
export const CREATE_POST_SUCCESS = "CREATE_POST_SUCCESS";
export const CREATE_POST_FAIL = "CREATE_POST_FAIL";

export const UPDATE_POST_REQUEST = "UPDATE_POST_REQUEST";
export const UPDATE_POST_SUCCESS = "UPDATE_POST_SUCCESS";
export const UPDATE_POST_FAIL = "UPDATE_POST_FAIL";

export const DELETE_POST_REQUEST = "DELETE_POST_REQUEST";
export const DELETE_POST_SUCCESS = "DELETE_POST_SUCCESS";
export const DELETE_POST_FAIL = "DELETE_POST_FAIL";

export const UPDATE_POST_STATUS = "UPDATE_POST_STATUS";
export const SET_CURRENT_POST = "SET_CURRENT_POST";
export const CLEAR_POST_ERRORS = "CLEAR_POST_ERRORS";

// Posts List Reducer
const postsListReducer = (
	state = {
		posts: [],
		loading: false,
		error: null,
		pagination: {
			currentPage: 1,
			totalPages: 1,
			totalPosts: 0,
		},
	},
	action
) => {
	switch (action.type) {
		case FETCH_POSTS_REQUEST:
			return { ...state, loading: true, error: null };
		case FETCH_POSTS_SUCCESS:
			return {
				...state,
				loading: false,
				posts: action.payload.posts,
				pagination: action.payload.pagination,
			};
		case FETCH_POSTS_FAIL:
			return { ...state, loading: false, error: action.payload };
		case CREATE_POST_SUCCESS:
			return {
				...state,
				posts: [action.payload, ...state.posts],
				pagination: {
					...state.pagination,
					totalPosts: state.pagination.totalPosts + 1,
				},
			};
		case UPDATE_POST_SUCCESS:
		case UPDATE_POST_STATUS:
			return {
				...state,
				posts: state.posts.map((p) =>
					p._id === action.payload._id ? { ...p, ...action.payload } : p
				),
			};
		case DELETE_POST_SUCCESS:
			return {
				...state,
				posts: state.posts.filter((p) => p._id !== action.payload),
				pagination: {
					...state.pagination,
					totalPosts: state.pagination.totalPosts - 1,
				},
			};
		case CLEAR_POST_ERRORS:
			return { ...state, error: null };
		default:
			return state;
	}
};

// Single Post Reducer
const postDetailReducer = (
	state = {
		post: null,
		loading: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case SET_CURRENT_POST:
			return { ...state, post: action.payload };
		case UPDATE_POST_SUCCESS:
		case UPDATE_POST_STATUS:
			if (state.post?._id === action.payload._id) {
				return { ...state, post: { ...state.post, ...action.payload } };
			}
			return state;
		default:
			return state;
	}
};

// Create Post Reducer
const createPostReducer = (
	state = {
		loading: false,
		success: false,
		error: null,
	},
	action
) => {
	switch (action.type) {
		case CREATE_POST_REQUEST:
			return { loading: true, success: false, error: null };
		case CREATE_POST_SUCCESS:
			return { loading: false, success: true, error: null };
		case CREATE_POST_FAIL:
			return { loading: false, success: false, error: action.payload };
		case CLEAR_POST_ERRORS:
			return { loading: false, success: false, error: null };
		default:
			return state;
	}
};

// Processing Posts Reducer (for tracking generation status)
const processingPostsReducer = (
	state = {},
	action
) => {
	switch (action.type) {
		case UPDATE_POST_STATUS:
			return {
				...state,
				[action.payload._id]: {
					status: action.payload.overallStatus,
					progress: action.payload.progressPercentage,
					currentStage: action.payload.currentStage,
				},
			};
		default:
			return state;
	}
};

export const postReducers = combineReducers({
	list: postsListReducer,
	detail: postDetailReducer,
	create: createPostReducer,
	processing: processingPostsReducer,
});

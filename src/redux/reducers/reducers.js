import { combineReducers } from "redux";
import { influencerReducers } from "./influencerReducers";
import { postReducers } from "./postReducers";
import { scheduleReducers } from "./scheduleReducers";
import { socialReducers } from "./socialReducers";

const reducer = combineReducers({
	// Influencers
	influencers: influencerReducers,

	// Posts
	posts: postReducers,

	// Schedules
	schedules: scheduleReducers,

	// Social accounts
	social: socialReducers,
});

export default reducer;

import { combineReducers } from "redux";
import { influencerReducers } from "./influencerReducers";
import { postReducers } from "./postReducers";
import { loopReducers } from "./loopReducers";
import { socialReducers } from "./socialReducers";

const reducer = combineReducers({
	// Influencers
	influencers: influencerReducers,

	// Posts
	posts: postReducers,

	// Loops
	loops: loopReducers,

	// Social accounts
	social: socialReducers,
});

export default reducer;

import { createStore, applyMiddleware } from "redux";
import { HYDRATE, createWrapper } from "next-redux-wrapper";
import thunkMiddleware from "redux-thunk";
import reducers from "./reducers/reducers";

const bindMiddleware = (middleware) => {
	if (process.env.NODE_ENV !== "production") {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const devTools = require("redux-devtools-extension");
		const composeWithDevTools = devTools.composeWithDevTools || devTools.default?.composeWithDevTools;
		if (composeWithDevTools) {
			return composeWithDevTools(applyMiddleware(...middleware));
		}
	}

	return applyMiddleware(...middleware);
};

const reducer = (state, action) => {
	switch (action.type) {
		case HYDRATE:
			return { ...state, ...action.payload };
		default:
			return reducers(state, action);
	}
};

const initStore = () => {
	return createStore(reducer, bindMiddleware([thunkMiddleware]));
};

export const wrapper = createWrapper(initStore);

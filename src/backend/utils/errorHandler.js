class ErrorHandler extends Error {
	constructor(message, statusCode, errorType = null) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		// Optional error type for classification
		// Common types: usage_limit_reached, rate_limit, invalid_input, unauthorized, etc.
		if (errorType) {
			this.errorType = errorType;
		}

		Error.captureStackTrace(this, this.constructor);
	}
}

export default ErrorHandler;

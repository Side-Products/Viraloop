import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter a name"],
			trim: true,
			maxLength: [50, "Name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
			trim: true,
			unique: true,
			validate: [validator.isEmail, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: [true, "Please enter your password"],
			trim: true,
			minLength: [6, "Your password must be at least 6 characters long"],
			select: false,
		},
		emailVerified: {
			type: Boolean,
			default: false,
		},
		image: {
			type: String,
		},
		role: {
			type: String,
			default: "user",
		},
		stripe_customer_id: {
			type: String,
			default: "",
		},
		queryParams: {
			type: Object,
			default: {},
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		verifyEmailToken: String,
		verifyEmailExpire: Date,
	},
	{ timestamps: true }
);

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString("hex");
	// Hash and set to resetPasswordToken field
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	// Set token expire time
	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
	return resetToken;
};

// Generate verify email token
userSchema.methods.getVerifyEmailToken = function () {
	// Generate token
	const verifyToken = crypto.randomBytes(20).toString("hex");
	// Hash and set to verifyEmailToken field
	this.verifyEmailToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
	// Set token expire time - 24 hrs
	this.verifyEmailExpire = Date.now() + 24 * 60 * 60 * 1000;
	return verifyToken;
};

export default mongoose.models.User || mongoose.model("User", userSchema);

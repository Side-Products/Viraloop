import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { PRODUCT_NAME } from "@/config/constants";
import { toast } from "sonner";
import ScrollingBackground from "@/components/ScrollingBackground";

export const getServerSideProps = async ({ req, query }) => {
	const session = await getSession({ req });
	console.log("\n\ngetServerSideProps::", session);

	if (session) {
		// Check if there's a checkout redirect
		if (query.redirect === "checkout" && query.priceId) {
			const checkoutUrl = `/checkout?priceId=${query.priceId}&billing=${query.billing || "monthly"}${query.isOneTime === "true" ? "&isOneTime=true" : ""}`;
			return {
				redirect: {
					destination: checkoutUrl,
					permanent: false,
				},
			};
		}
		return {
			redirect: {
				destination: "/dashboard",
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
};

export default function Login() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [authMode, setAuthMode] = useState("signin");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { name, email, password, confirmPassword } = formData;

	// Build redirect URL based on query params
	const getRedirectUrl = () => {
		const { redirect, priceId, billing, isOneTime } = router.query;
		if (redirect === "checkout" && priceId) {
			return `/checkout?priceId=${priceId}&billing=${billing || "monthly"}${isOneTime === "true" ? "&isOneTime=true" : ""}`;
		}
		return "/dashboard";
	};

	const onFieldChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const toggleAuthMode = () => {
		setAuthMode(authMode === "signin" ? "signup" : "signin");
		setFormData({ name: "", email: "", password: "", confirmPassword: "" });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (authMode === "signup") {
			if (!name.trim()) {
				toast.error("Please enter your name");
				return;
			}
			if (password !== confirmPassword) {
				toast.error("Passwords do not match");
				return;
			}
			if (password.length < 6) {
				toast.error("Password must be at least 6 characters");
				return;
			}

			setLoading(true);
			try {
				const res = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, email, password }),
				});

				const data = await res.json();

				if (!res.ok) {
					toast.error(data.message || "Registration failed");
					setLoading(false);
					return;
				}

				toast.success("Account created! Please sign in.");
				setAuthMode("signin");
				setFormData({ name: "", email, password: "", confirmPassword: "" });
			} catch (error) {
				toast.error("Something went wrong");
			}
			setLoading(false);
		} else {
			setLoading(true);
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (result?.error) {
				toast.error(result.error);
				setLoading(false);
			} else {
				router.replace(getRedirectUrl());
			}
		}
	};

	const handleGoogleSignIn = () => {
		setLoading(true);
		signIn("google", { callbackUrl: getRedirectUrl() });
	};

	return (
		<>
			<Head>
				<meta name="robots" content="noindex, nofollow" />
				<title>Login - {PRODUCT_NAME}</title>
			</Head>

			<div className="min-h-screen bg-light-50 relative">
				{/* Scrolling Background Images */}
				<ScrollingBackground fadeTop={true} fadeBottom={true} />

				{/* Login Form */}
				<div className="relative z-20 min-h-screen flex items-center justify-center p-4 pt-20">
				<div className="w-full max-w-md">
					{/* Header */}
					<div className="text-center mb-8">
						<p className="text-neutral-500 text-sm">Welcome to your creative space</p>
					</div>

					{/* Main card */}
					<div className="bg-white border border-light-300 rounded-2xl p-8 shadow-lg">
						{/* Header */}
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-neutral-900 mb-2">{authMode === "signin" ? "Welcome back" : "Create account"}</h2>
							<p className="text-neutral-500 text-sm">
								{authMode === "signin" ? "Sign in to continue to your projects" : "Join us and start creating viral content"}
							</p>
						</div>

						{/* Auth mode toggle */}
						<div className="relative bg-light-200 rounded-xl p-1 mb-6">
							<div
								className={`absolute top-1 bottom-1 bg-white rounded-lg shadow transition-all duration-300 ease-out ${
									authMode === "signin" ? "left-1 right-1/2 mr-0.5" : "right-1 left-1/2 ml-0.5"
								}`}
							></div>
							<div className="relative grid grid-cols-2 gap-1">
								<button
									onClick={() => authMode !== "signin" && toggleAuthMode()}
									className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
										authMode === "signin" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
									}`}
								>
									Login
								</button>
								<button
									onClick={() => authMode !== "signup" && toggleAuthMode()}
									className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
										authMode === "signup" ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
									}`}
								>
									Sign Up
								</button>
							</div>
						</div>

						{/* Google sign in */}
						<button
							onClick={handleGoogleSignIn}
							disabled={loading}
							className="w-full flex items-center justify-center gap-3 bg-light-100 hover:bg-light-200 border border-light-300 rounded-sm py-3 text-sm font-medium text-neutral-700 transition-all duration-200"
						>
							<img src="/google.png" alt="Google" className="w-5 h-5" />
							Continue with Google
						</button>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-light-300"></div>
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="px-4 bg-white text-neutral-500">or continue with email</span>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{authMode === "signup" && (
								<input
									type="text"
									placeholder="Full name"
									className="input"
									value={name}
									name="name"
									onChange={onFieldChange}
									required={authMode === "signup"}
								/>
							)}

							<input type="email" placeholder="Email address" className="input" value={email} name="email" onChange={onFieldChange} required />

							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Password"
									className="input pr-12"
									value={password}
									name="password"
									onChange={onFieldChange}
									required
								/>
								<button
									type="button"
									className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
											/>
										</svg>
									)}
								</button>
							</div>

							{authMode === "signup" && (
								<input
									type="password"
									placeholder="Confirm password"
									className="input"
									value={confirmPassword}
									name="confirmPassword"
									onChange={onFieldChange}
									required={authMode === "signup"}
								/>
							)}

							<button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-base font-medium disabled:opacity-50">
								{loading ? <span className="spinner"></span> : authMode === "signin" ? "Sign In" : "Create Account"}
							</button>
						</form>

						{/* Footer */}
						<p className="text-xs text-neutral-500 text-center mt-6 leading-relaxed">
							By {authMode === "signin" ? "signing in" : "creating an account"} you agree to our{" "}
							<Link href="/terms" className="text-primary-400 hover:text-primary-500">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="text-primary-400 hover:text-primary-500">
								Privacy Policy
							</Link>
						</p>
					</div>

					{/* Back to home */}
					<div className="text-center mt-6">
						<Link href="/" className="text-neutral-500 hover:text-neutral-700 text-sm transition-colors">
							← Back to home
						</Link>
					</div>
				</div>
				</div>
			</div>
		</>
	);
}

/**
 * Login page with modern 2-column layout
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import grapyLogo from "../../assets/logo/grapy-logo.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setIsLoading(true);
      await login({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login clicked");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Login Form */}
      <div className="relative flex flex-col justify-center bg-white">
        {/* Logo and Name - Fixed at top left */}
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-3">
          <img src={grapyLogo} alt="Grapy Logo" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-gray-900 font-onest">Grapy</span>
        </div>

        {/* Centered Form Content */}
        <div className="w-full max-w-lg mx-auto px-6 py-12 lg:px-16 xl:px-24 mt-52">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg animate-slideIn">
              <span className="text-red-600 text-lg mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`input ${errors.email ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Eye Icon */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  maxLength={72}
                  {...register("password")}
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 text-chartreuse-600 border-gray-300 rounded focus:ring-chartreuse-500"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-chartreuse-600 hover:text-chartreuse-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  or login with Google
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an Account?{" "}
            <Link
              to="/register"
              className="font-semibold text-chartreuse-600 hover:text-chartreuse-700"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Image (Hidden on Mobile) */}
      <div className="hidden lg:block relative bg-gradient-to-br from-chartreuse-600 to-chartreuse-700">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Manage Your Submissions</h2>
            <p className="text-xl text-blue-100">
              Streamline your payment processing with Grapy
            </p>
          </div>
        </div>
        {/* Placeholder for future image */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
};

export default Login;

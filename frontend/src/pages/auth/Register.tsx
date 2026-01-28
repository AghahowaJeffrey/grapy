/**
 * Registration page with form validation
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password cannot exceed 72 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      setIsLoading(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Registration failed. Email may already be in use."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <span className="text-xl font-bold text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grapy</h1>
          <p className="text-gray-500">Create Admin Account</p>
        </div>

        {/* Card */}
        <div className="card shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg animate-slideIn">
                <span className="text-red-600 text-lg mt-0.5">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Course Representative"
                {...register("name")}
                className={`input ${errors.name ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@university.edu"
                {...register("email")}
                className={`input ${errors.email ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-sm font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                maxLength={72}
                {...register("password")}
                className={`input ${errors.password ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-600 text-sm font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                maxLength={72}
                {...register("confirmPassword")}
                className={`input ${errors.confirmPassword ? "input-error" : ""}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600 text-sm">
              Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

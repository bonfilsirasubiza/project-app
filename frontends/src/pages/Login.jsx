import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "123456";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        login(res.data);
        navigate("/raw-material");
      } catch (err) {
        console.error("Login failed:", err.response?.data);
        setError(err.response?.data?.message || "Invalid email or password");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_45%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md card p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl border border-primary-100 mb-4">
            <span className="text-2xl font-bold text-primary-700 tracking-tight">RM</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
            RMIMS
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Raw Material Inventory System
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4"
          >
            <div className="flex items-start">
              <FiAlertCircle className="text-red-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === "email" ? "text-primary-600" : "text-slate-400"
                }`}
              >
                <FiMail className="h-5 w-5" />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                className="input-field pl-12 pr-4 py-3.5"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === "password" ? "text-primary-600" : "text-slate-400"
                }`}
              >
                <FiLock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                className="input-field pl-12 pr-12 py-3.5"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="relative w-full group mt-8">
            <div className="relative bg-primary-600 text-white py-3.5 px-6 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign In</span>
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </div>
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-xs font-medium tracking-wide">
          SmartManufact Ltd (c) 2024
        </p>
      </motion.div>
    </div>
  );
}

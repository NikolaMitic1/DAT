import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/login", formData);
      const { token, role } = res.data;
      loginUser({ token, role });
      if (role === "BROKER") navigate("/broker");
      else if (role === "CARRIER") navigate("/carrier");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Pogrešan email ili password");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center font-outfit text-white relative"
      style={{
        background: 'linear-gradient(rgba(18,25,33,0.85),rgba(18,25,33,0.85)), url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&q=80") center/cover no-repeat',
      }}
    >
      <div className="absolute top-0 left-0">
        <img src="/dat-logo1.png" alt="DAT Logo" className="w-80" />
      </div>

      <div className="bg-white text-gray-700 rounded shadow-2xl w-full max-w-sm px-10 py-8 text-center">
        <h1 className="text-3xl font-semibold mb-1 mt-0">Log in</h1>
        <p className="text-gray-500 text-sm mb-5">to continue to your account</p>

        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Username/Email
              </label>
              <a href="#" className="text-xs font-semibold text-blue-700 hover:underline">
                Forgot your username?
              </a>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-blue-700 hover:underline">
                Reset password
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="remember" className="cursor-pointer" />
            <label htmlFor="remember" className="text-sm cursor-pointer">Remember me</label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a1e23] hover:bg-[#2c333a] text-white py-3.5 rounded-full font-bold tracking-widest text-sm transition-colors mb-4"
          >
            LOG IN
          </button>
        </form>

        <div className="bg-gray-100 flex justify-center items-center gap-2.5 px-3 py-3 text-sm mb-4 rounded">
          <span>Need an account?</span>
          <Link to="/register" className="font-bold text-gray-800 border-b-2 border-gray-800 hover:text-gray-600">
            Create account
          </Link>
        </div>

        <p className="text-[11px] text-gray-500">
          By continuing you agree to our{" "}
          <a href="#" className="text-gray-500 underline">terms and conditions</a>.
        </p>
      </div>

      <footer className="mt-4 text-[11px] opacity-60 text-center">
        <p>Copyright © 2026 DAT Solutions, LLC. All rights reserved.</p>
        <a href="#" className="text-white hover:underline">Privacy Policy</a>
      </footer>
    </div>
  );
}

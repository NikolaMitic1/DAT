import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
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
      const res = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData,
      );
      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "BROKER") navigate("/broker");
      else if (role === "CARRIER") navigate("/carrier");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Pogrešan email ili password");
    }
  };

  return (
    <div className="login-page">
      {/* Logo u gornjem levom uglu */}
      <div className="top-logo">
        <img src="/dat-logo1.png" alt="DAT Logo" />
      </div>

      <div className="login-card">
        <h1>Log in</h1>
        <p className="subtitle">to continue to your account</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="label-row">
              <label>Username/Email</label>
              <a href="#" className="inline-link">
                Forgot your username?
              </a>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <a href="#" className="inline-link">
                Reset password
              </a>
            </div>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️‍🗨️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="login-btn">
            LOG IN
          </button>
        </form>

        <div className="signup-box">
          <span>Need an account?</span>
          <Link
            title="Create account"
            to="/register"
            className="create-acc-link"
          >
            Create account
          </Link>
        </div>

        <p className="terms">
          By continuing you agree to our <a href="#">terms and conditions</a>.
        </p>
      </div>

      <footer className="login-footer">
        <p>Copyright © 2026 DAT Solutions, LLC. All rights reserved.</p>
        <a href="#">Privacy Policy</a>
      </footer>
    </div>
  );
}

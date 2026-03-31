import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      const { token } = res.data;
      localStorage.setItem("token", token);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      {/* Logo u gornjem levom uglu */}
      <div className="top-logo">
        <img src="/dat-logo1.png" alt="DAT Logo" />
      </div>

      <div className="register-card">
        <h1>Create account</h1>
        <p className="subtitle">to start using DAT services</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
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

          <div className="input-group">
            <div className="label-row">
              <label>Confirm Password</label>
            </div>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️‍🗨️" : "👁️‍🗨️"}
              </span>
            </div>
          </div>

          <button type="submit" className="register-btn">
            CREATE ACCOUNT
          </button>
        </form>

        <div className="signup-box">
          <span>Already have an account?</span>
          <Link to="/login" className="create-acc-link">
            Log in
          </Link>
        </div>

        <p className="terms">
          By continuing you agree to our <a href="#">terms and conditions</a>.
        </p>
      </div>

      <footer className="register-footer">
        <p>Copyright © 2026 DAT Solutions, LLC. All rights reserved.</p>
        <a href="#">Privacy Policy</a>
      </footer>
    </div>
  );
}

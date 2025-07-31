import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, sendOtp, verifyOtp } from "./api/authApi";
import { registerUser } from "./api/userApi";

const Register = () => {
  const BASE_URL = "http://localhost:4000";

  const [formData, setFormData] = useState({
    name: "Dev Madlani",
    email: "devm.dds@gmail.com",
    password: "1234",
  });
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setOtpError("Please enter your email first.");
    try {
      setIsSending(true);
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setOtpError("");
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const { email } = formData;
    if (!otp) {
      setOtpError("Please enter OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsSuccess(false);

    if (!otpVerified) {
      setOtpError("Please verify your email with OTP before registering.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify({ otp, ...formData }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.error) {
        setServerError(data.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-5">
      <h2 className="text-center text-2xl font-semibold mb-3">Register</h2>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="relative mb-3">
          <label className="block mb-1 font-bold">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="relative mb-3">
          <label className="block mb-1 font-bold">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 pr-24 border ${
                serverError ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending || countdown > 0}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 text-xs rounded"
            >
              {isSending
                ? "Sending..."
                : countdown > 0
                ? `${countdown}s`
                : "Send OTP"}
            </button>
          </div>
          {serverError && (
            <span className="absolute text-xs text-red-500 mt-1">
              {serverError}
            </span>
          )}
        </div>

        {otpSent && (
          <div className="relative mb-3">
            <label className="block mb-1 font-bold">Enter OTP</label>
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 pr-24 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || otpVerified}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 text-xs rounded"
              >
                {isVerifying
                  ? "Verifying..."
                  : otpVerified
                  ? "Verified"
                  : "Verify OTP"}
              </button>
            </div>
            {otpError && (
              <span className="absolute text-xs text-red-500 mt-1">
                {otpError}
              </span>
            )}
          </div>
        )}

        <div className="relative mb-3">
          <label className="block mb-1 font-bold">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 rounded w-full font-medium hover:opacity-90 ${
            !otpVerified || isSuccess ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={!otpVerified || isSuccess}
        >
          {isSuccess ? "Registration Successful" : "Register"}
        </button>
      </form>

      <p className="text-center mt-3">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>

      <div className="relative text-center my-3">
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-gray-300"></div>
        <span className="relative bg-white px-2 text-sm text-gray-600">Or</span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const data = await loginWithGoogle(credentialResponse.credential);
            if (!data.error) navigate("/");
          }}
          onError={() => console.log("Login Failed")}
          theme="filled_blue"
          text="continue_with"
          useOneTap
        />
      </div>
    </div>
  );
};

export default Register;

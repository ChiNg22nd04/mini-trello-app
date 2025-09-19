import React, { useState } from "react";
import axios from "axios";
import { logoTrello } from "../../assets/global/index";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "../../components";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [focus, setFocus] = useState(false);
    const [isHoverPrimary, setHoverPrimary] = useState(false);
    const [isHoverDark, setHoverDark] = useState(false);

    const handleSubmit = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/signin`, { email });
            if (res.data && res.data.msg) setMessage(res.data.msg);
            else {
                localStorage.setItem("email", email);
                navigate("/auth/verify");
            }
        } catch (err) {
            console.log(err);
            setMessage("Please try again.");
        }
    };

    const handleGithubLogin = () => {
        window.location.href = `${API_BASE_URL}/github`;
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/google`;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div>
            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
                    position: relative;
                    overflow: hidden;
                }

                @keyframes pulse-custom {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.1;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.15;
                    }
                }

                .login-card {
                    background: #fff;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                }

                .title-gradient {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .email-input {
                    background: rgba(249, 250, 251, 0.5);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    text-align: start;
                    font-size: 1rem;
                    font-family: "Courier New", monospace;

                    letter-spacing: 0.05em;
                    padding: 1rem 3.5rem 1rem 1rem;
                    transition: all 0.3s ease;
                }

                .email-input:focus {
                    border-color: #3399ff;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(78, 115, 223, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }

                .email-input:hover:not(:focus) {
                    border-color: #d1d5db;
                }

                .input-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    transition: all 0.3s ease;
                    color: #9ca3af;
                }

                .input-icon.valid {
                    color: #3399ff;
                }

                .input-icon.focus {
                    color: #3399ff;
                }

                .continue-btn {
                    background: #3399ff;
                    border: none;
                    border-radius: 16px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .continue-btn:not(:disabled):hover {
                    background: #3399ff;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: translateY(-2px) scale(1.02);
                }

                .continue-btn:disabled {
                    background: #3399ff;
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .github-btn {
                    background: linear-gradient(to right, #24292e, #2f363d);
                    border: none;
                    border-radius: 16px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .github-btn:hover {
                    background: linear-gradient(to right, #1a1f23, #24292e);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: translateY(-2px) scale(1.02);
                }

                .terms-link {
                    color: #2563eb;
                    text-decoration: underline;
                    transition: color 0.3s ease;
                }

                .terms-link:hover {
                    color: #1d4ed8;
                }

                .divider {
                    position: relative;
                    text-align: center;
                    margin: 2rem 0;
                }

                .divider::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #e5e7eb;
                }

                .divider span {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 0 1rem;
                    color: #9ca3af;
                    position: relative;
                    z-index: 1;
                }
            `}</style>

            <div className="login-page d-flex align-items-center justify-content-center p-4">
                <div className="login-card rounded-4 p-4 w-100" style={{ maxWidth: "420px", position: "relative" }}>
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="logo-container">
                            <img src={logoTrello} alt="Logo" style={{ width: "65%", height: "auto" }} />
                        </div>
                        <p className="text-muted small mb-0 mt-1" style={{ lineHeight: 1.6 }}>
                            Log in to continue to Trello-Clone
                        </p>
                    </div>

                    {/* Email Input */}
                    <div className="position-relative mb-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`form-control email-input ${focus ? "focus" : ""}`}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                        />
                        <div className={`input-icon ${isValidEmail(email) && email ? "valid" : focus ? "focus" : ""}`}>
                            <Icon icon="mdi:mail" width="24" height="24" />
                        </div>
                    </div>

                    {/* Error Message */}
                    {message && (
                        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{ borderRadius: "12px" }}>
                            <small>{message}</small>
                        </div>
                    )}

                    {/* Continue Button */}
                    <Button name="Login with your email" color="#3399ff" style={{ width: "100%" }} variant="primary" iconSize={20} size="md" onClick={handleSubmit} disabled={!isValidEmail(email)} />
                    {/* <button
                        onClick={handleSubmit}
                        disabled={!isValidEmail(email)}
                        className="btn continue-btn w-100 text-white"
                        onMouseEnter={() => setHoverPrimary(true)}
                        onMouseLeave={() => setHoverPrimary(false)}
                    >
                        <div className="d-flex align-items-center justify-content-center">
                            Continue
                            <Icon icon="mdi:arrow-right" width="20" className="ms-2" />
                        </div>
                    </button> */}

                    {/* Divider */}
                    <div className="divider mt-3 mb-3">
                        <span className="small">or continue with</span>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="d-grid gap-2">
                        <Button name="GitHub" icon="mdi:github" color="#24292e" style={{ width: "100%" }} variant="outline" iconSize={20} size="md" onClick={handleGithubLogin} />
                        <Button name="Google" icon="mdi:google" color="#ea4335" style={{ width: "100%" }} variant="outline" iconSize={20} size="md" onClick={handleGoogleLogin} />
                    </div>

                    {/* Terms */}
                    <div className="text-center mt-4">
                        <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
                            By continuing, you agree to our{" "}
                            <a href="#" className="text-decoration-none">
                                Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-decoration-none">
                                Terms of Service
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

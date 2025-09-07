import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { socket, API_BASE_URL } from "../../../config";
import { Button } from "../../components";

const AuthPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [focus, setFocus] = useState(false);
    // const [isHover, setHover] = useState(false);
    // const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const handleNewUser = (data) => {
            toast.success(`Welcome ${data.username}! Account created successfully.`);
        };
        socket.on("new-user", handleNewUser);
        return () => socket.off("new-user", handleNewUser);
    }, []);

    const handleSubmit = async () => {
        const email = localStorage.getItem("email");
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/verify`, {
                params: { email, code },
            });

            if (!email || !code) {
                setMessage(res.data.msg);
                return;
            }

            if (res.data && res.data.token) {
                localStorage.setItem("accessToken", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                if (typeof socket.setAuthToken === "function") {
                    socket.setAuthToken(res.data.token);
                }
                navigate("/boards");
            } else {
                setMessage("Something went wrong. Please try again.");
            }
            console.log("Verify code:", code);
        } catch (err) {
            // const msg = err.response?.data?.msg || "Verification failed. Try again.";
            // setMessage(msg);
            console.log(err);
        }
    };

    // const handleResendCode = () => {
    //     setIsResending(true);
    //     setTimeout(() => {
    //         setIsResending(false);
    //         console.log("Code resent!");
    //     }, 2000);
    // };

    return (
        <div>
            <style jsx>{`
                .auth-page {
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

                .auth-card {
                    background: rgba(255, 255, 255, 0.95);
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

                .code-input {
                    background: rgba(249, 250, 251, 0.5);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    text-align: start;
                    font-size: 1rem;
                    font-family: "Courier New", monospace;
                    letter-spacing: 0.3em;
                    padding: 1rem 3.5rem 1rem 1rem;
                    transition: all 0.3s ease;
                }

                .code-input:focus {
                    border-color: #10b981;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }

                .code-input:hover:not(:focus) {
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

                .input-icon.complete {
                    color: #10b981;
                }

                .input-icon.focus {
                    color: #10b981;
                }

                .progress-bar-custom {
                    background: #059669;
                    transition: width 0.3s ease;
                }

                .submit-btn {
                    background: #047857;
                    border: none;
                    border-radius: 16px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .submit-btn:not(:disabled):hover {
                    background: #065f46;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: translateY(-2px) scale(1.02);
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .resend-btn {
                    color: #2563eb;
                    background: none;
                    border: none;
                    text-decoration: underline;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }

                .resend-btn:hover:not(:disabled) {
                    color: #1d4ed8;
                }

                .resend-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .back-btn {
                    color: #6b7280;
                    background: none;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }

                .back-btn:hover {
                    color: #374151;
                }

                .terms-link {
                    color: #2563eb;
                    text-decoration: underline;
                    transition: color 0.3s ease;
                }

                .terms-link:hover {
                    color: #1d4ed8;
                }
            `}</style>

            <div className="auth-page d-flex align-items-center justify-content-center p-4">
                {/* Animated background elements */}
                <div className="bg-element-1"></div>
                <div className="bg-element-2"></div>
                <div className="bg-element-3"></div>

                <div className="auth-card rounded-4 p-4 w-100" style={{ maxWidth: "400px", position: "relative" }}>
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="icon-container">
                            <Icon icon="mdi:shield-check" width="32" height="32" color="white" />
                        </div>
                        <h1 className="h2 fw-bold title-gradient mb-3">Verify Email</h1>
                        <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                            We've sent a 6-digit verification code
                            <br />
                            to your email address
                        </p>
                    </div>

                    {/* Code Input */}
                    <div className="position-relative mb-3">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength="6"
                            className={`form-control code-input ${focus ? "focus" : ""}`}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                        />
                        <div className={`input-icon ${code.length === 6 ? "complete" : focus ? "focus" : ""}`}>
                            {code.length === 6 ? <Icon icon="mdi:check-circle" width="24" height="24" /> : <Icon icon="mdi:key-round" width="24" height="24" />}
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted">Code progress</span>
                            <span className="small text-muted">{code.length}/6</span>
                        </div>
                        <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                            <div
                                className="progress-bar progress-bar-custom"
                                role="progressbar"
                                style={{ width: `${(code.length / 6) * 100}%` }}
                                aria-valuenow={code.length}
                                aria-valuemin="0"
                                aria-valuemax="6"
                            ></div>
                        </div>
                    </div>

                    {message && (
                        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert" style={{ borderRadius: "12px" }}>
                            <Icon icon="mdi:alert-circle" width="16" height="16" className="me-2" />
                            <small>{message}</small>
                        </div>
                    )}

                    <Button
                        name={code.length === 6 ? "Verify Account" : `Enter ${6 - code.length} more digits`}
                        color="#047857"
                        className="mb-3"
                        style={{ width: "100%" }}
                        variant="primary"
                        iconSize={20}
                        size="md"
                        onClick={handleSubmit}
                        disabled={code.length !== 6}
                    />

                    <div className="text-center mb-4">
                        <Button name="Back to login" icon="mdi:arrow-left" color="#6b7280" variant="outline" iconSize={20} size="md" onClick={() => navigate("/")} />
                    </div>

                    <div className="text-center">
                        <small className="text-muted">
                            By continuing, you agree to our{" "}
                            <a href="#" className="text-decoration-none">
                                Privacy Policy
                            </a>{" "}
                            &{" "}
                            <a href="#" className="text-decoration-none">
                                Terms of Service
                            </a>
                            .
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

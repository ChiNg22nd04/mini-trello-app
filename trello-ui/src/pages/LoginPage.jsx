import React from "react";
import API_BASE_URL from "../../config/index";
import { Icon } from "@iconify/react";
import "./LoginPage.css";

const LoginPage = () => {
    const loginWithGitHub = () => {
        window.location.href = API_BASE_URL + "/auth/github";
    };

    return (
        <div className="login-container">
            {/* Decorative background elements */}
            <div className="bg-decoration bg-decoration-1"></div>
            <div className="bg-decoration bg-decoration-2"></div>
            <div className="bg-decoration bg-decoration-3"></div>

            <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 p-3">
                <div className="login-card">
                    <div className="login-card-header">
                        <div className="logo-container">
                            <Icon icon="mdi:trello" className="logo-icon" />
                        </div>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to continue to your workspace</p>
                    </div>

                    <div className="login-card-body">
                        <button type="button" className="login-btn login-btn-primary" onClick={loginWithGitHub}>
                            <Icon icon="grommet-icons:github" className="btn-icon" />
                            <span>Continue with GitHub</span>
                        </button>

                        <button type="button" className="login-btn login-btn-secondary" disabled>
                            <Icon icon="grommet-icons:google" className="btn-icon google-icon" />
                            <span>Continue with Google</span>
                            <span className="coming-soon">Coming Soon</span>
                        </button>
                    </div>

                    <div className="login-card-footer">
                        <p className="footer-text">
                            Coding Challenge from{" "}
                            <strong>
                                <a className="decoration-slice" href="https://www.skiplinow.com/">
                                    SKIPLI
                                </a>
                            </strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

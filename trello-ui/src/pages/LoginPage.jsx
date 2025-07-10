import React from "react";
import API_BASE_URL from "../../config/index";
import { Icon } from "@iconify/react";
import Button from "../components";
import "./LoginPage.css";

const LoginPage = () => {
    const loginWithGitHub = () => {
        window.location.href = API_BASE_URL + "/auth/github";
    };

    return (
        <div className="login-container">
            {/* Decorative background elements */}
            <div className="bg-decoration bg-decoration-1 animate-float"></div>
            <div className="bg-decoration bg-decoration-2 animate-float"></div>
            <div className="bg-decoration bg-decoration-3 animate-float"></div>

            <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 p-3">
                <div className="login-card animate-slideUp">
                    <div className="login-card-header">
                        <div className="logo-container">
                            <Icon icon="mdi:trello" className="logo-icon" />
                        </div>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to continue to your workspace</p>
                    </div>

                    <div className="login-card-body">
                        <Button variant="primary" icon="grommet-icons:github" iconColor="github" onClick={loginWithGitHub}>
                            Continue with GitHub
                        </Button>

                        <Button variant="secondary" icon="grommet-icons:google" iconColor="google" badge="Coming Soon" disabled>
                            Continue with Google
                        </Button>
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

import React, { useState } from "react";
import API_BASE_URL from "../../config/index";

const LoginPage = () => {
    console.log("LoginPage loaded");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginWithGitHub = () => {
        window.location.href = API_BASE_URL + "/auth/github";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");

        console.log(email, password);
    };

    return (
        <div className="container d-flex align-items-center justify-content-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h3 className="text-center mb-4">Đăng nhập Trello</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email:
                        </label>
                        <input type="email" className="form-control" id="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu:
                        </label>
                        <input type="password" className="form-control" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-2">
                        Đăng nhập
                    </button>

                    <button type="button" className="btn btn-dark w-100" onClick={loginWithGitHub}>
                        🐱 Đăng nhập với GitHub
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const handledRef = useRef(false);

    useEffect(() => {
        const getRawQuery = () => {
            if (window.location.search && window.location.search.length > 1) return window.location.search.slice(1);
            if (window.location.hash && window.location.hash.includes("?")) return window.location.hash.split("?")[1];
            return "";
        };

        const fetchGoogleUser = async () => {
            let triedRetry = false;

            const attempt = async () => {
                const rawQuery = getRawQuery();
                const params = new URLSearchParams(rawQuery);

                const token = params.get("token");
                const userParam = params.get("user");

                if (handledRef.current) return;

                if (token) {
                    try {
                        const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
                        localStorage.setItem("accessToken", token);
                        if (user) localStorage.setItem("user", JSON.stringify(user));
                        window.dispatchEvent(new Event("userLogin"));
                        handledRef.current = true;
                        navigate("/boards");
                        return;
                    } catch (err) {
                        console.error("Failed to parse user from redirect", err);
                    }
                }

                const code = params.get("code");
                if (code) {
                    try {
                        const res = await axios.get(`${API_BASE_URL}/auth/google/callback?code=${code}`);
                        const { token: resToken, user } = res.data;
                        localStorage.setItem("accessToken", resToken);
                        localStorage.setItem("user", JSON.stringify(user));
                        window.dispatchEvent(new Event("userLogin"));
                        handledRef.current = true;
                        navigate("/boards");
                        return;
                    } catch (err) {
                        console.error("Google login failed", err);
                        if (!handledRef.current) navigate("/signin");
                        return;
                    }
                }

                if (!triedRetry) {
                    triedRetry = true;
                    setTimeout(() => attempt(), 300);
                    return;
                }

                if (!handledRef.current) navigate("/signin");
            };

            await attempt();
        };

        fetchGoogleUser();
    }, [navigate]);

    const spinnerStyle = {
        width: "50px",
        height: "50px",
        border: "6px solid #ddd",
        borderTop: "6px solid #ea4335",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e6f0ff 0%, #ffffff 100%)",
                color: "#333",
            }}
        >
            <div style={spinnerStyle} />
            <p style={{ marginTop: "16px", fontWeight: "500" }}>Signing in with Google...</p>

            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default GoogleCallback;

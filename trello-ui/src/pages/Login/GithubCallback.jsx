import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const GithubCallback = () => {
    const navigate = useNavigate();

    const handledRef = useRef(false);

    useEffect(() => {
        console.log("GithubCallback");

        const getRawQuery = () => {
            if (window.location.search && window.location.search.length > 1)
                return window.location.search.slice(1);
            if (window.location.hash && window.location.hash.includes("?"))
                return window.location.hash.split("?")[1];
            return "";
        };

        const fetchGithubUser = async () => {
            let triedRetry = false;

            const attempt = async () => {
                const rawQuery = getRawQuery();
                const params = new URLSearchParams(rawQuery);

                // First, check token (backend redirected with token)
                const token = params.get("token");
                const userParam = params.get("user");

                if (handledRef.current) return; // already processed

                if (token) {
                    try {
                        const user = userParam
                            ? JSON.parse(decodeURIComponent(userParam))
                            : null;
                        console.log("GitHub token from redirect", {
                            token,
                            user,
                        });
                        localStorage.setItem("accessToken", token);
                        if (user)
                            localStorage.setItem("user", JSON.stringify(user));
                        try {
                            window.dispatchEvent(new Event("userLogin"));
                        } catch (e) {
                            console.warn("userLogin dispatch failed", e);
                        }
                        handledRef.current = true;
                        navigate("/boards");
                        return;
                    } catch (err) {
                        console.error(
                            "Failed to parse user from redirect",
                            err
                        );
                        // fall through to code handling
                    }
                }

                // Fallback: check code and exchange with backend
                const code = params.get("code");
                console.log("Github code:", code);

                if (code) {
                    try {
                        const res = await axios.get(
                            `${API_BASE_URL}/auth/github/callback?code=${code}`
                        );
                        const { token: resToken, user } = res.data;
                        console.log("GitHub login success", res.data);
                        localStorage.setItem("accessToken", resToken);
                        localStorage.setItem("user", JSON.stringify(user));
                        try {
                            window.dispatchEvent(new Event("userLogin"));
                        } catch (e) {
                            console.warn("userLogin dispatch failed", e);
                        }
                        handledRef.current = true;
                        navigate("/boards");
                        return;
                    } catch (err) {
                        console.error("GitHub login failed", err);
                        if (!handledRef.current) navigate("/signin");
                        return;
                    }
                }

                // Retry once to tolerate dev timing issues
                if (!triedRetry) {
                    triedRetry = true;
                    setTimeout(() => attempt(), 300);
                    return;
                }

                console.warn("No code or token found in URL after retry");
                if (!handledRef.current) navigate("/signin");
            };

            await attempt();
        };

        fetchGithubUser();
    }, [navigate]);

    return <p className="text-center mt-5">Continue in with GitHub...</p>;
};

export default GithubCallback;

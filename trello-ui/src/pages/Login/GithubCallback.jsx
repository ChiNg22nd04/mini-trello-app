import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const GithubCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("GithubCallback");

        const fetchGithubUser = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");

            console.log("Github code:", code);

            if (!code) {
                alert("No code found in URL");
                return;
            }

            try {
                const res = await axios.get(
                    `${API_BASE_URL}/auth/github/callback?code=${code}`
                );
                const { token, user } = res.data;

                console.log("GitHub login success", res.data);

                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(user));

                navigate("/home");
            } catch (err) {
                console.error("GitHub login failed", err);
                alert("GitHub login failed");
                navigate("/signin");
            }
        };

        fetchGithubUser();
    }, [navigate]);

    return <p className="text-center mt-5">Continue in with GitHub...</p>;
};

export default GithubCallback;

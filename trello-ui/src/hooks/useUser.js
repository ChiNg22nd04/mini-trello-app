import { useState, useEffect } from "react";

export const useUser = () => {
    const [userData, setUserData] = useState({
        user: null,
        token: null,
        email: null,
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        const email = localStorage.getItem("userEmail");

        setUserData({
            user: storedUser ? JSON.parse(storedUser) : null,
            token,
            email,
        });
    }, []);

    return userData;
};

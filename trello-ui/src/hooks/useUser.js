import { useState, useEffect } from "react";
const useUser = () => {
    const [userData, setUserData] = useState({
        user: null,
        token: null,
        email: null,
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        setUserData({
            user: parsedUser,
            token,
            email: parsedUser?.email || null,
        });
    }, []);

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        setUserData({ user: null, token: null, email: null });
    };

    return { ...userData, logout };
};

export default useUser;

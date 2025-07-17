import { useState, useEffect } from "react";

const useUser = () => {
    const [userData, setUserData] = useState({
        user: null,
        token: null,
        email: null,
    });

    const updateUserData = () => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        console.log("useUser - storedUser:", storedUser);
        console.log("useUser - token:", token);
        console.log("useUser - parsedUser:", parsedUser);

        setUserData({
            user: parsedUser,
            token,
            email: parsedUser?.email || null,
        });
    };

    useEffect(() => {
        updateUserData();

        const handleStorageChange = (event) => {
            if (event.key === "user" || event.key === "accessToken") {
                updateUserData();
            }
        };

        const handleUserLogin = () => {
            updateUserData();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userLogin", handleUserLogin);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userLogin", handleUserLogin);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        setUserData({ user: null, token: null, email: null });
    };

    return { ...userData, logout };
};

export default useUser;

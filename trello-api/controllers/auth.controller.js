const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { db } = require("../firebase");
const { sendMagicLinkEmail } = require("../services/email.service");

const githubLogin = (req, res) => {
    const authorizeURL = "https://github.com/login/oauth/authorize";
    const clientID = process.env.GITHUB_CLIENT_ID;
    const redirectURI = process.env.GITHUB_REDIRECT_URI;

    const githubOAuthURL = `${authorizeURL}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}`;
    console.log("githubOAuthURL", githubOAuthURL);
    res.redirect(githubOAuthURL);
};

const githubCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code found");

    try {
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: "application/json" },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) return res.status(401).send("No access token received from GitHub");

        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { id, login, avatar_url, email } = userResponse.data;
        const uid = id.toString();
        const usersCollection = db.collection("users");

        const userDocRef = usersCollection.doc(id.toString());
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            await userDocRef.set({
                uid,
                githubId: id,
                username: login,
                email: email || "",
                avatar: avatar_url,
                createdAt: new Date().toISOString(),
            });
        }

        const token = jwt.sign({ id: uid, username: login }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        res.json({
            token,
            user: {
                id: id.toString(),
                username: login,
                avatar: avatar_url,
            },
        });
    } catch (err) {
        console.error("GitHub Login Error:", err.message);
        res.status(500).send("GitHub login failed");
    }
};

// POST /auth/email/send - Gửi magic link qua email
const sendMagicLink = async (req, res) => {
    const { email } = req.body;
    console.log("email", email);
    if (!email) {
        return res.status(400).json({ msg: "Email is required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: "Email is invalid." });
    }

    try {
        const magicToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const magicLinksCollection = db.collection("magicLinks");
        await magicLinksCollection.doc(magicToken).set({
            email: email.toLowerCase(),
            token: magicToken,
            expiresAt: expiresAt.toISOString(),
            used: false,
            createdAt: new Date().toISOString(),
        });

        const emailResult = await sendMagicLinkEmail(email, magicToken);

        if (emailResult.success) {
            console.log("Magic link sent successfully to:", email);
            res.json({
                msg: "Magic link has been sent to your email. Please check your email.",
                email: email,
            });
        } else {
            throw new Error(emailResult.error);
        }
    } catch (err) {
        console.error("Error sending magic link:", err);
        res.status(500).json({ msg: "Error sending magic link." });
    }
};

// GET /auth/email/verify?token=xxx - Verify magic link và đăng nhập
const verifyMagicLink = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ msg: "Token is required." });
    }

    try {
        const magicLinksCollection = db.collection("magicLinks");
        const magicLinkDoc = await magicLinksCollection.doc(token).get();

        if (!magicLinkDoc.exists) {
            return res.status(400).json({ msg: "The magic link is invalid or has expired." });
        }

        const magicLinkData = magicLinkDoc.data();

        // Kiểm tra xem token đã được sử dụng chưa
        if (magicLinkData.used) {
            return res.status(400).json({ msg: "Magic link has already been used." });
        }

        const now = new Date();
        const expiresAt = new Date(magicLinkData.expiresAt);
        if (now > expiresAt) {
            await magicLinksCollection.doc(token).delete();
            return res.status(400).json({ msg: "Magic link has expired." });
        }

        const email = magicLinkData.email;

        const usersCollection = db.collection("users");
        const userQuery = await usersCollection.where("email", "==", email).get();

        let userId, username, uid;

        if (userQuery.empty) {
            // Tạo user mới
            console.log("Creating new user for email:", email);
            const newUserId = crypto.randomUUID();
            uid = newUserId;
            const defaultUsername = email.split("@")[0];

            const newUserData = {
                uid,
                email: email,
                username: defaultUsername,
                avatar: "",
                createdAt: new Date().toISOString(),
                loginMethod: "email",
            };

            console.log("New user data:", newUserData);

            await usersCollection.doc(newUserId).set(newUserData);
            console.log("User created successfully with ID:", newUserId);

            userId = newUserId;
            username = defaultUsername;
        } else {
            // User đã tồn tại
            console.log("User already exists for email:", email);
            const userDoc = userQuery.docs[0];
            userId = userDoc.id;
            uid = userDoc.data().uid || userDoc.id;
            username = userDoc.data().username;
        }

        // Đánh dấu magic link đã được sử dụng
        await magicLinksCollection.doc(token).update({ used: true });

        const jwtToken = jwt.sign({ id: uid, username, email }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        console.log("Magic link verified successfully for:", email);

        res.json({
            token: jwtToken,
            user: {
                id: uid,
                username: username,
                email: email,
                avatar: "",
            },
        });
    } catch (err) {
        console.error("Error verifying magic link:", err);
        console.error("Error stack:", err.stack);
        res.status(500).json({ msg: "Error verifying magic link: " + err.message });
    }
};

module.exports = {
    githubLogin,
    githubCallback,
    sendMagicLink,
    verifyMagicLink,
};

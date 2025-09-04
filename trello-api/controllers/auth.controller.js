const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { db } = require("../firebase");
const { sendCode } = require("../services/email.service");
const { getIO } = require("../config/socket");

const magicCodesCollection = db.collection("magicCodes");

function generateAvatar({ email, githubAvatar, username }) {
    if (email && !githubAvatar) {
        const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
        return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    }

    if (githubAvatar) {
        return githubAvatar;
    }

    const firstChar = username ? username.charAt(0).toUpperCase() : "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=random&color=fff`;
}

const githubLogin = (req, res) => {
    const authorizeURL = "https://github.com/login/oauth/authorize";
    const clientID = process.env.GITHUB_CLIENT_ID;
    const redirectURI = process.env.GITHUB_REDIRECT_URI;

    // Request user email scope so we can access private/primary emails when available
    const scope = "user:email";
    const githubOAuthURL = `${authorizeURL}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&scope=${encodeURIComponent(scope)}`;
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
                redirect_uri: process.env.GITHUB_REDIRECT_URI,
            },
            {
                headers: { Accept: "application/json" },
            }
        );

        console.log("GitHub token response:", tokenResponse.data);
        const accessToken = tokenResponse.data.access_token;
        console.log("accessToken", accessToken);

        if (!accessToken) {
            console.error("No access token, tokenResponse:", tokenResponse.data);
            return res.status(401).json({ msg: "No access token received from GitHub", details: tokenResponse.data });
        }

        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" },
        });

        let emailFromApi = userResponse.data.email || "";
        try {
            const emailsResponse = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" },
            });

            if (Array.isArray(emailsResponse.data) && emailsResponse.data.length > 0) {
                const primaryVerified = emailsResponse.data.find((e) => e.primary && e.verified);
                const primary = emailsResponse.data.find((e) => e.primary);
                const first = emailsResponse.data[0];
                const chosen = primaryVerified || primary || first;
                if (chosen && chosen.email) emailFromApi = chosen.email;
            }
        } catch (e) {
            // If fetching emails fails, continue with whatever /user provided (may be empty)
            console.warn("Could not fetch user emails from GitHub:", e.message || e);
        }

        const { id, login, avatar_url } = userResponse.data;
        const uid = id.toString();
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        const avatar = generateAvatar({ email: emailFromApi, githubAvatar: avatar_url, username: login });

        if (!userDoc.exists) {
            await userRef.set({
                uid,
                githubId: id,
                username: login,
                email: emailFromApi || "",
                avatar,
                createdAt: new Date(),
                loginMethod: "github",
            });
        } else if (!userDoc.data().avatar) {
            await userRef.update({ avatar });
        }

        const token = jwt.sign({ id: uid, username: login, email: emailFromApi || "", avatar }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const payload = {
            token,
            user: {
                id: id.toString(),
                username: login,
                email: emailFromApi || "",
                avatar,
            },
        };

        // If request comes directly from browser redirect (Accept: text/html), do a redirect.
        const accept = req.get("Accept") || "";
        if (accept.includes("text/html")) {
            const url = new URL(`${frontendUrl}/auth/github/callback`);
            url.searchParams.set("token", token);
            url.searchParams.set("user", encodeURIComponent(JSON.stringify(payload.user)));
            return res.redirect(url.toString());
        }

        // Otherwise return JSON (used by frontend AJAX call)
        res.json(payload);
    } catch (err) {
        console.error("GitHub Login Error:", err.response?.data || err.message);
        const message = err.response?.data || { msg: err.message };
        res.status(500).json({ msg: "GitHub login failed", details: message });
    }
};

const sendMagicCode = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const magicCodesCollection = db.collection("magicCodes");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    try {
        await magicCodesCollection.doc(email.toLowerCase()).set({
            email: email.toLowerCase(),
            code,
            used: false,
            expiresAt: expiresAt.toISOString(),
            createdAt: now.toISOString(),
        });

        const emailResult = await sendCode(email, code);
        if (emailResult.success) {
            console.log("Magic code sent successfully to:", email);
            res.json({
                email: email,
            });
        } else {
            throw new Error("Failed to send email");
        }
    } catch (err) {
        console.error("Error sending magic code:", err);
        return res.status(500).json({ msg: "Error sending code." });
    }
};

const verifyMagicCode = async (req, res) => {
    const { email, code } = req.query;
    if (!email || !code) return res.status(400).json({ msg: "Email and code are required." });

    try {
        const docRef = magicCodesCollection.doc(email.toLowerCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) return res.status(400).json({ msg: "Invalid or expired code." });

        const data = docSnap.data();
        if (data.used) return res.status(400).json({ msg: "Code already used." });

        const now = new Date();
        if (now > new Date(data.expiresAt)) {
            await docRef.delete();
            return res.status(400).json({ msg: "Code expired." });
        }

        if (data.code !== code) {
            return res.status(400).json({ msg: "Incorrect code." });
        }

        const usersCollection = db.collection("users");
        const userQuery = await usersCollection.where("email", "==", email).get();

        let uid, username, avatar;

        if (userQuery.empty) {
            uid = crypto.randomUUID();
            username = email.split("@")[0];
            avatar = generateAvatar({ email, username });

            await usersCollection.doc(uid).set({
                uid,
                email,
                username,
                avatar,
                createdAt: new Date().toISOString(),
                loginMethod: "email-code",
            });

            getIO().emit("new-user", { uid, username, avatar });
            console.log("Emitting new-user:", { uid, username, avatar });
        } else {
            const userDoc = userQuery.docs[0];
            uid = userDoc.data().uid || userDoc.id;
            username = userDoc.data().username;
            avatar = userDoc.data().avatar;

            if (!avatar) {
                avatar = generateAvatar({ email, username });
                await usersCollection.doc(uid).update({ avatar });
            }
        }

        await docRef.update({ used: true });

        const token = jwt.sign({ id: uid, username, email, avatar }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        return res.json({
            token,
            user: {
                id: uid,
                username,
                email,
                avatar,
            },
        });
    } catch (err) {
        console.error("Error verifying code:", err);
        return res.status(500).json({ msg: "Error verifying code." });
    }
};

module.exports = {
    githubLogin,
    githubCallback,
    sendMagicCode,
    verifyMagicCode,
};

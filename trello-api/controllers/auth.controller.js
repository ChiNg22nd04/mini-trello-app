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

function mergeLoginMethods(existing, method) {
    const arr = Array.isArray(existing) ? existing : existing ? [existing] : [];
    const set = new Set(arr);
    set.add(method);
    return Array.from(set);
}

function computeFinalAvatar({ googlePicture, githubAvatar, email, username, existingAvatar }) {
    const gravatarOrInitial = generateAvatar({ email, username });
    return googlePicture || githubAvatar || existingAvatar || gravatarOrInitial;
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

        const usersCollection = db.collection("users");
        let uid;
        let userRef;
        let existingData = null;

        if (emailFromApi) {
            const byEmail = await usersCollection.where("email", "==", emailFromApi).get();
            if (!byEmail.empty) {
                userRef = usersCollection.doc(byEmail.docs[0].id);
                uid = byEmail.docs[0].id;
                existingData = byEmail.docs[0].data();
            }
        }

        if (!uid) {
            uid = crypto.randomUUID();
            userRef = usersCollection.doc(uid);
        }

        const loginMethods = mergeLoginMethods(existingData?.loginMethods || existingData?.loginMethod, "github");
        const avatarGithub = avatar_url || existingData?.avatarGithub || "";
        const finalAvatar = computeFinalAvatar({
            googlePicture: existingData?.avatarGoogle,
            githubAvatar: avatarGithub,
            email: emailFromApi,
            username: login,
            existingAvatar: existingData?.avatar,
        });

        if (!existingData) {
            await userRef.set({
                uid,
                githubId: id,
                username: login,
                email: emailFromApi || "",
                avatarGithub,
                avatar: finalAvatar,
                createdAt: new Date(),
                loginMethod: "github",
                loginMethods,
            });
        } else {
            const updates = { githubId: id, username: existingData.username || login, avatarGithub, loginMethod: "github", loginMethods };
            if (finalAvatar && finalAvatar !== existingData.avatar) updates.avatar = finalAvatar;
            if (!existingData.email && emailFromApi) updates.email = emailFromApi;
            await userRef.update(updates);
        }

        const token = jwt.sign({ id: uid, username: login, email: emailFromApi || existingData?.email || "", avatar: finalAvatar }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const payload = {
            token,
            user: {
                id: uid,
                username: login,
                email: emailFromApi || existingData?.email || "",
                avatar: finalAvatar,
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

// Google OAuth 2.0
const googleLogin = (req, res) => {
    const authorizeURL = "https://accounts.google.com/o/oauth2/v2/auth";
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const redirectURI = process.env.GOOGLE_REDIRECT_URI;

    // Request OpenID Connect scopes to get email and profile picture
    const scope = ["openid", "email", "profile"].join(" ");
    const params = new URLSearchParams({
        client_id: clientID,
        redirect_uri: redirectURI,
        response_type: "code",
        scope,
        access_type: "offline",
        prompt: "consent",
    });

    const googleOAuthURL = `${authorizeURL}?${params.toString()}`;
    console.log("googleOAuthURL", googleOAuthURL);
    res.redirect(googleOAuthURL);
};

const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code found");

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const idToken = tokenResponse.data.id_token;

        if (!accessToken && !idToken) {
            console.error("No tokens from Google:", tokenResponse.data);
            return res.status(401).json({ msg: "No tokens received from Google", details: tokenResponse.data });
        }

        // Fetch user info using access token
        let userInfo;
        try {
            const userInfoResp = await axios.get("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            userInfo = userInfoResp.data;
        } catch (e) {
            // Fallback: decode id_token if userinfo endpoint fails
            if (idToken) {
                const parts = idToken.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
                    userInfo = payload || {};
                }
            }
        }

        const sub = userInfo?.sub;
        const email = userInfo?.email || "";
        const name = userInfo?.name || (email ? email.split("@")[0] : "User");
        const picture = userInfo?.picture || "";

        if (!sub) {
            return res.status(500).json({ msg: "Google user info missing 'sub'" });
        }

        const usersCollection = db.collection("users");
        let uid;
        let userRef;
        let existing = null;

        if (email) {
            const byEmail = await usersCollection.where("email", "==", email).get();
            if (!byEmail.empty) {
                userRef = usersCollection.doc(byEmail.docs[0].id);
                uid = byEmail.docs[0].id;
                existing = byEmail.docs[0].data();
            }
        }

        if (!uid) {
            uid = crypto.randomUUID();
            userRef = usersCollection.doc(uid);
        }

        const loginMethods = mergeLoginMethods(existing?.loginMethods || existing?.loginMethod, "google");
        const avatarGoogle = picture || existing?.avatarGoogle || "";
        const finalAvatar = computeFinalAvatar({
            googlePicture: avatarGoogle,
            githubAvatar: existing?.avatarGithub,
            email,
            username: name,
            existingAvatar: existing?.avatar,
        });

        if (!existing) {
            await userRef.set({
                uid,
                googleSub: sub,
                username: name,
                email: email || "",
                avatarGoogle,
                avatar: finalAvatar,
                createdAt: new Date(),
                loginMethod: "google",
                loginMethods,
            });
        } else {
            const updates = { googleSub: sub, username: existing.username || name, avatarGoogle, loginMethod: "google", loginMethods };
            if (!existing.email && email) updates.email = email;
            if (finalAvatar && finalAvatar !== existing.avatar) updates.avatar = finalAvatar;
            await userRef.update(updates);
        }

        const token = jwt.sign({ id: uid, username: name, email: email || existing?.email || "", avatar: finalAvatar }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const payload = {
            token,
            user: {
                id: uid,
                username: name,
                email: email || existing?.email || "",
                avatar: finalAvatar,
            },
        };

        const accept = req.get("Accept") || "";
        if (accept.includes("text/html")) {
            const url = new URL(`${frontendUrl}/auth/google/callback`);
            url.searchParams.set("token", token);
            url.searchParams.set("user", encodeURIComponent(JSON.stringify(payload.user)));
            return res.redirect(url.toString());
        }

        return res.json(payload);
    } catch (err) {
        console.error("Google Login Error:", err.response?.data || err.message);
        const message = err.response?.data || { msg: err.message };
        res.status(500).json({ msg: "Google login failed", details: message });
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
            const gravatar = generateAvatar({ email, username });
            avatar = gravatar;

            await usersCollection.doc(uid).set({
                uid,
                email,
                username,
                avatar,
                createdAt: new Date().toISOString(),
                loginMethod: "email-code",
                loginMethods: ["email-code"],
            });

            getIO().emit("new-user", { uid, username, avatar });
            console.log("Emitting new-user:", { uid, username, avatar });
        } else {
            const userDoc = userQuery.docs[0];
            uid = userDoc.id;
            const data = userDoc.data();
            username = data.username || email.split("@")[0];
            const gravatar = generateAvatar({ email, username });
            const finalAvatar = computeFinalAvatar({
                googlePicture: data.avatarGoogle,
                githubAvatar: data.avatarGithub,
                email,
                username,
                existingAvatar: data.avatar,
            });
            avatar = finalAvatar;

            const loginMethods = mergeLoginMethods(data.loginMethods || data.loginMethod, "email-code");
            const updates = { loginMethod: "email-code", loginMethods };
            if (finalAvatar && finalAvatar !== data.avatar) updates.avatar = finalAvatar;
            if (!data.username) updates.username = username;
            await usersCollection.doc(uid).update(updates);
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
    googleLogin,
    googleCallback,
    sendMagicCode,
    verifyMagicCode,
};

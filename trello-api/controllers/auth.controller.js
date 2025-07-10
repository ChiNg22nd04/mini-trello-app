const axios = require("axios");
const jwt = require("jsonwebtoken");
const { db } = require("../firebase");

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

    console.log("code", code);

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
        console.log("accessToken", accessToken);

        if (!accessToken) return res.status(401).send("No access token received from GitHub");

        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { id, login, avatar_url, email } = userResponse.data;

        const usersCollection = db.collection("users");
        const userDocRef = usersCollection.doc(id.toString());
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            await userDocRef.set({
                githubId: id,
                username: login,
                email: email || "",
                avatar: avatar_url,
                createdAt: new Date().toISOString(),
            });
        }

        const token = jwt.sign({ id: id.toString(), username: login }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        console.log("token", token);

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

module.exports = { githubLogin, githubCallback };

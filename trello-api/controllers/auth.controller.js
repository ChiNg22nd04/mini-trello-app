const axios = require('axios');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const githubLogin = (req, res) => {
	const baseURL = 'http://localhost:3000/auth/github/callback';
	const clientID = process.env.GITHUB_CLIENT_ID;
	const redirectURI = process.env.GITHUB_REDIRECT_URI;

	const redirectURL = `${baseURL}?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}`;
	res.redirect(redirectURL);
};

const githubCallback = async (req, res) => {
	const { code } = req.query;
	if (!code) return res.status(400).send('No code found');

	try {
		const tokenResponse = await axios.post(
			`https://github.com/login/oauth/access_token`,
			{
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			},
			{
				headers: { Accept: 'application/json' },
			}
		);

		const accessToken = tokenResponse.data.access_token;

		const userResponse = await axios.get('https://api.github.com/user', {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		const { id, login, avatar_url, email } = userResponse.data;

		const userRef = db.collection('users').doc(`${id}`);
		const userDoc = await userRef.get();

		if (!userDoc.exists) {
			await userRef.set({
				githubId: id,
				username: login,
				email: email || '',
				avatar: avatar_url,
			});
		}

		const token = jwt.sign({ id, username: login }, process.env.JWT_SECRET, {
			expiresIn: '2h',
		});

		res.json({ token, user: { id, username: login, avatar: avatar_url } });
	} catch (err) {
		console.error(err);
		res.status(500).send('GitHub login failed');
	}
};

module.exports = { githubLogin, githubCallback };

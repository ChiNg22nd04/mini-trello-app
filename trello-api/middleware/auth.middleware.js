const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Kiểm tra xem có Authorization header không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.log("JWT_SECRET is missing in .env");
            return res.status(500).json({ msg: "JWT secret missing" });
        }

        const decoded = jwt.verify(token, secret);

        req.user = {
            githubId: decoded.id,
            username: decoded.username,
        };

        next();
    } catch (err) {
        console.log("Token verify failed:", err.message);
        return res.status(401).json({ msg: "Invalid token" });
    }
};

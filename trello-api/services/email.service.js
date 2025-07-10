const nodemailer = require("nodemailer");

const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(user, pass);

    if (!user || !pass) {
        console.error("EMAIL_USER or EMAIL_PASS is missing in .env");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass,
        },
    });
};

const sendMagicLinkEmail = async (email, token) => {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL;
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Login to Mini Trello",
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
                <h3>Mini Trello Login</h3>
                <p>Click the button below to log in:</p>
                <div style="margin: 20px 0;">
                    <a href="${magicLink}" style="background:#007bff;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
                        Log In
                    </a>
                </div>
                <p>Or paste this link in your browser:</p>
                <p><a href="${magicLink}">${magicLink}</a></p>
                <p style="font-size:12px;color:gray;">Link expires in 15 minutes.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Test magic link sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Magic link email error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMagicLinkEmail,
};

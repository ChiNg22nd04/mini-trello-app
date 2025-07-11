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

    const sender = process.env.EMAIL_USER;
    const recipient = email;

    const mailOptions = {
        from: sender,
        to: recipient,
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
    } catch (err) {
        console.error("Magic link email error:", err);
        return { success: false, error: err.message };
    }
};

const sendInviteEmail = async (toEmail, boardName, inviteId, boardId, nameUser) => {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL;
    const inviteLink = `${frontendUrl}/boards/${boardId}/invite/${inviteId}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: `You're invited to join the board "${boardName} from ${nameUser}"`,
        html: `
           <div class="email-container" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
                <span style="font-size: 16px; color: #444;">Hello</span>
                <strong style="color: #007bff; font-size: 16px;">${nameUser}</strong> 
                <span style="font-size: 16px; color: #444;">has invited you to collaborate on the board </span>
                <strong style="color: #28a745; font-size: 16px;">"${boardName}"</strong>.
            
            <div style=" margin: 30px 0;">
                <a href="${inviteLink}" 
                    style="padding: 12px 25px; background-color: #28a745; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px;">
                    Accept Invitation
                </a>
            </div>

            <p style="font-size: 14px; color: #777;">If the button above doesn’t work, copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #007bff; word-break: break-all;">${inviteLink}</p>

            </div>
        `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Invite email sent:", info.messageId);
        return { success: true };
    } catch (err) {
        console.error("Error sending invite email:", err.message);
        return { success: false, error: err.message };
    }
};

module.exports = {
    sendMagicLinkEmail,
    sendInviteEmail,
};

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

const sendCode = async (email, code) => {
    const transporter = createTransporter();

    const sender = process.env.EMAIL_USER;
    const recipient = email;

    const mailOptions = {
        from: sender,
        to: recipient,
        subject: "Your Trello App Login Code",
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
                <h3>Your Login Code</h3>
                <p>Use the code below to log in:</p>
                <h1 style="font-size: 36px; letter-spacing: 5px;">${code}</h1>
                <p style="font-size:12px;color:gray;">This code expires in 15 minutes.</p>
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

const sendInviteEmail = async (emailMember, boardName, inviteId, boardId, nameUser) => {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL;
    const inviteLink = `${frontendUrl}/boards/${boardId}/invite/${inviteId}/accept`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailMember,
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
    sendInviteEmail,
    sendCode,
};

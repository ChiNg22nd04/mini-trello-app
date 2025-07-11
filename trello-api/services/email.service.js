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
        console.log("sender", sender);
        console.log("recipient", recipient);

        const info = await transporter.sendMail(mailOptions);
        console.log("Test magic link sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("Magic link email error:", err);
        return { success: false, error: err.message };
    }
};

// const sendInviteEmail = async (email, boardName, inviteId, boardId) => {
//     const transporter = createTransporter();
//     const frontendUrl = process.env.FRONTEND_URL;
//     const inviteLink = `${frontendUrl}/boards/${boardId}/invite/${inviteId}`;

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: `You're invited to join the board "${boardName}"`,
//         html: `
//            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
//                 <h2>Board Invitation</h2>
//                 <p>You have been invited to join the board: <strong>${boardName}</strong>.</p>
//                 <p>Click the button below to accept the invitation:</p>
//                 <a href="${inviteLink}" style="padding:10px 20px; background:#28a745; color:white; text-decoration:none; border-radius:5px;">
//                     Accept Invitation
//                 </a>
//                 <p>If the button doesn't work, copy and paste this link into your browser:</p>
//                 <p>${inviteLink}</p>
//             </div>
//         `,
//     };
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log("Invite email sent:", info.messageId);
//         return { success: true };
//     } catch (err) {
//         console.error("Error sending invite email:", err.message);
//         return { success: false, error: err.message };
//     }
// };

module.exports = {
    sendMagicLinkEmail,
    // sendInviteEmail,
};

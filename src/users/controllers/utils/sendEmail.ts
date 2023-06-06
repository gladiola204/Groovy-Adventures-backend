import nodemailer from 'nodemailer'

async function sendEmail(subject: string, message: string, send_to: string, sent_from: string, reply_to?: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const options = {
        from: sent_from, 
        to: send_to,
        replyTo: reply_to, 
        subject,
        html: message,
    };

    transporter.sendMail(options, function(err, info) {
        if(err) {
            console.log(err);
        } else {
            console.log(info);
        };    
    });

}

export default sendEmail;
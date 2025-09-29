import {RequestHandler } from 'express';
import nodemailer from 'nodemailer';

export const submitContact:RequestHandler = async (req,res, next) => {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
    }

    try {
        // Configure the email transporter
        const transporter = nodemailer.createTransport({
            host: "live.smtp.mailtrap.io",
            port: 587,
            auth: {
                user: "api",
                pass: "0f3edc4c9b856d8f0431a6a1fa6dfc94"
            }
        });


        const emailSend = await transporter.sendMail({
            from: "Test User <mailtrap@demomailtrap.com>",
            to: "sandjayawilliams16072005@gmail.com",
            subject: "Test",
            text: `You have a new contact submission:
            Name: ${name}
            Phone: ${phone}
            Email: ${email}
            Message: ${message}`,

        })

        res.status(200).json({ message: `Message Sent: ${emailSend.messageId}` });
        return;
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send contact submission.' });
        next(error);
    }
};
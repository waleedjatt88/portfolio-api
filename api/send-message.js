import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://waleed-portfolio-amber.vercel.app",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  // ✅ Include subject now
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send email
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: subject
        ? `📬 ${subject} — from ${name}`
        : `New message from ${name}`,
      text: `
From: ${name}
Email: ${email}
Subject: ${subject || "(no subject)"}

Message:
${message}
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email.",
    });
  }
}

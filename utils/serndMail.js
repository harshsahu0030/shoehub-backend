import nodemailer from "nodemailer";

export const sendMail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_ACC,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_ACC,
    to: email,
    subject: `${subject}`,
    text: `${text}`,
  };

  try {
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Eamil sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Email send failed with error: ${error}`,
    };
  }
};

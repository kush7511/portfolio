const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD",
  },
});

exports.newContactMessage = functions.firestore
    .document("messages/{docId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();

      const mailOptions = {
        from: "Portfolio Website",
        to: "YOUR_EMAIL@gmail.com",
        subject: "New Portfolio Message",
        text:
`New message received!

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}`,
      };

      return transporter.sendMail(mailOptions);
    });

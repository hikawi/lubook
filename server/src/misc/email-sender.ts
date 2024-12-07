/*
Lmao I don't even know if this is the appropriate place to put email credentials here, but here goes.
*/

import { readFileSync } from "fs";
import { createTransport } from "nodemailer";

export const emailTransport = createTransport({
  host: "smtp.purelymail.com",
  port: 465,
  secure: true,
  auth: {
    user: "verify@lubook.club",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const textEmail = readFileSync("./email-sender.txt", "utf8");
const htmlEmail = readFileSync("./email-sender.html", "utf8");

function fillPlaceholders(
  text: string,
  code: string,
  name: string,
  email: string,
  link: string,
) {
  return text
    .replaceAll("%%username%%", name)
    .replaceAll("%%code%%", code)
    .replaceAll("%%email%%", email)
    .replaceAll("%%link%%", link);
}

/**
 * Sends the email verification to a user.
 */
export async function sendVerificationEmail(data: {
  name: string;
  code: string;
  email: string;
  link: string;
}) {
  const { name, code, email, link } = data;
  await emailTransport.sendMail({
    from: "Verify <verify@lubook.club>",
    to: email,
    subject: "Lubook Verification",
    text: fillPlaceholders(textEmail, code, name, email, link),
    html: fillPlaceholders(htmlEmail, code, name, email, link),
  });
}

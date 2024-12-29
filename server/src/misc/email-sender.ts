/*
Lmao I don't even know if this is the appropriate place to put email credentials here, but here goes.
*/

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

// I have no clue what I'm doing, I can't get it to read the file dynamically.
// So I embedded the email templates here until I find a better way to do so.
const textEmail = `
  Hello, fellow artist or art enjoyer %%username%%!

  This is an email for verification, requested by you for logging in to https://lubook.club. When logging in, you will be asked of this 6-digit code:

  %%code%%

  You can also copy and paste this link %%link%% to verify instead.

  Best regards, Luna.
  `.trim();

const htmlEmail = `
  <h1>Hello, there!</h1>

  <p>
    Dear fellow artist, art enjoyer or tourist alike,
    <strong>@%%username%%</strong>
    .
  </p>

  <p>
    This is an email, requested by you (<em>maybe?</em>) for verification to join
    the <a href="https://lubook.club">Lubook</a> community. you received this
    email because you register <strong>%%email%%</strong> as your email address.
    Anyway, if you try logging in, you will be requested to input a 6-digit code:
  </p>

  <h3>%%code%%</h3>

  <p style="font-size: 0.875rem">
    Psst, you can also just click this <a href="%%link%%">link</a> to verify
    instead, whatever works for you!
  </p>

  <p>
    The verification code will expire <strong>15 minutes</strong> from when this
    email is sent. so hurry up!
  </p>
  `.trim();

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

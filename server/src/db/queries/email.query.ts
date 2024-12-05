/*
Lmao I don't even know if this is the appropriate place to put email credentials here, but here goes.
*/

import { hashSync } from "bcryptjs";
import { randomInt } from "crypto";
import { createTransport } from "nodemailer";
import { db } from "..";
import { verifications } from "../schema/verification";

export const emailTransport = createTransport({
  host: "smtp.purelymail.com",
  port: 465,
  secure: true,
  auth: {
    user: "verify@lubook.club",
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Generates a verification code, writes it to a table, and
 *
 * @param id The ID for the user.
 * @param name The name of the user.
 * @param email The email of the user.
 */
export async function sendVerificationEmail(
  id: number,
  name: string,
  email: string,
) {
  const code = randomInt(100000, 1000000);
  const hashed = hashSync(code.toString(), 12);

  // Insert and upsert on verifications table.
  await db
    .insert(verifications)
    .values({
      user: id,
      token: hashed,
    })
    .onConflictDoUpdate({
      target: [verifications.user],
      set: {
        user: id,
        token: hashed,
        expiry: new Date(new Date().getTime() + 15 * 60 * 1000),
      },
    });

  await emailTransport.sendMail({
    from: "Verify <verify@lubook.club>",
    to: email,
    subject: "Lubook Verification",
    text: `Dear @${name}, 
      To complete your verification and join the Lubook community, please login and input the following code to verify:
      ${code}.
      
      This code will expire 15 minutes since it is sent to you.`.trim(),
    html: `
      <h3>Dear @${name}</h3>

      <p>To complete your verification and join the Lubook community, please login and input the following code to verify:</p>

      <h2><strong>${code}</strong></h2>

      <p>This code will expire <em>15 minutes</em> from the moment it is sent to you.</p>
      `.trim(),
  });
}

import { compareSync, hashSync } from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import { and, eq, gte, or } from "drizzle-orm";
import { db } from "..";
import { sendVerificationEmail } from "../../misc/email-sender";
import { users } from "../schema/user";
import { verifications } from "../schema/verification";
import { findUser } from "./user.query";

/**
 * Checks if the profile is verified.
 *
 * @param profile The username or the email
 * @returns True if verified, false if not found, or not verified.
 */
export async function isVerified(profile: string) {
  const result = await db
    .select({ verified: users.verified })
    .from(users)
    .where(or(eq(users.email, profile), eq(users.username, profile)))
    .limit(1);
  return result.length > 0 && result[0].verified;
}

/**
 * Generate a verification code for the user.
 *
 * This includes a 6 digit code (used on the website as digit code) and a 64-letter token (used as HTTP GET url).
 * This also sends a verification email.
 *
 * @param profile The profile username or email
 */
export async function generateVerification(profile: string) {
  // Find the user ID.
  const user = await findUser({ username: profile, email: profile });
  if (user.length == 0) {
    return false;
  }

  const code = randomInt(100000, 1000000);
  const token = randomBytes(32).toString("hex");
  const hashedCode = hashSync(code.toString(), 12);
  const hashedToken = hashSync(token, 12);

  // Insert and upsert on verifications table.
  await db
    .insert(verifications)
    .values({
      user: user[0].id,
      token: hashedCode,
      urlToken: hashedToken,
    })
    .onConflictDoUpdate({
      target: [verifications.user],
      set: {
        user: user[0].id,
        token: hashedCode,
        urlToken: hashedToken,
        created: new Date(),
      },
    });

  // Sends the email
  const link = `https://api.lubook.club/verify?username=${user[0].username}&token=${token}`;
  sendVerificationEmail({
    name: user[0].username,
    code: code.toString(),
    email: user[0].email,
    link: encodeURI(link),
  });
  return true;
}

/**
 * Attempts to verify the profile with the given code.
 *
 * @param profile The username or the email
 * @param code The code inputted
 * @param url Whether the code was passed by a 6-digit code or an URL token
 *
 * @returns False if verification failed. true if verified successfully.
 */
export async function verifyCode(profile: string, code: string, url: boolean) {
  const result = await db
    .select({
      id: verifications.user,
      code: verifications.token,
      token: verifications.urlToken,
      created: verifications.created,
    })
    .from(verifications)
    .innerJoin(users, eq(users.id, verifications.user))
    .where(or(eq(users.username, profile), eq(users.email, profile)))
    .limit(1);

  const cur = new Date().getTime();
  const hashToCompare = url ? result[0].token : result[0].code;
  if (
    result.length == 0 ||
    result[0].created.getTime() + 15 * 60 * 1000 > cur ||
    !compareSync(code, hashToCompare)
  )
    return false;

  const delResult = await db
    .delete(verifications)
    .where(eq(verifications.user, result[0].id));
  return delResult.rowCount != null && delResult.rowCount > 0;
}

/**
 * Checks if a new verification email should be sent. It should not be sent
 * if there's a token created within the last 5 minutes to prevent spamming.
 *
 * This also excludes those who have already verified.
 *
 * @param profile the username/email
 */
export async function shouldGenerate(profile: string) {
  if (await isVerified(profile)) {
    return false;
  }

  const cur = new Date();
  const fiveMinsAgo = new Date(cur.getTime() - 5 * 60 * 1000);
  const query = await db
    .select()
    .from(verifications)
    .innerJoin(users, eq(verifications.user, users.id))
    .where(
      and(
        or(eq(users.username, profile), eq(users.email, profile)),
        gte(verifications.created, fiveMinsAgo),
      ),
    )
    .limit(1);

  // What do I do here?
  return query.length == 0;
}

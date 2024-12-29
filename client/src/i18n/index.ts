import { $i18n } from "@/stores/i18n";

/**
 * The translation component for use in the login page.
 */
export const $loginPage = $i18n("loginPage", {
  tagline: "Sign in to your humble abode and continue reading!",
  newUser: "I'm a new user!",
  logIn: "Login",
  forgotPassword: "I forgot my password",
  profileField: "Username or Email Address",
  passwordField: "Password",
  verifyField: "Verification Code",
  getCode: "Get Code",
  accountDoesNotExist: "This account does not exist",
  wrongPassword: "Wrong password",
  unverified: "This account isn't verified yet",
  codeInvalid: "Verification code is invalid",
  codeSent: "Sent!",
  requestTooRecently: "You have already requested a code",
  invalidProfile: "Username or email address is invalid",
  unknownError: "An unknown error has happened.",
});

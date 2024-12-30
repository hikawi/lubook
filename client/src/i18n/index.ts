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
  profilePlaceholder: "luna OR luna@example.com",
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
  unknownError: "An unknown error has happened",
});

/**
 * The translation component for use in registration pages. Including
 * register/success.
 */
export const $registerPage = $i18n("registerPage", {
  register: "Register",
  tagline: "Join a community of manga enjoyers and writers.",
  nameField: "Pen Name",
  namePlaceholder: "Luna (optional)",
  usernameField: "Username",
  usernamePlaceholder: "luna",
  emailField: "Email Address",
  emailPlaceholder: "luna@example.com",
  passwordField: "Password",
  confirmField: "Confirm Password",
  usernameMin2: "Username must be from 2 characters",
  usernameMax32: "Username must be below 32 characters",
  usernameNoSpecial: "Username can't contain special characters",
  emailInvalid: "Must be a valid email address",
  passwordTooShort: "Password is too short",
  passwordsDontMatch: "Passwords don't match",
  badUsername: "Username might be invalid?",
  badPassword: "Password might be invalid?",
  badConfirm: "Password confirmation might be invalid?",
  usernameTaken: "Username might be taken",
  emailTaken: "Email might be taken",
  alreadyHasAccount: "I already have an account!",
});

/**
 * Translation component for verify failed/success pages.
 */
export const $verifyPage = $i18n("verifyPage", {
  verifySuccess: "Verify Success!",
  verifySuccessMessage: "You have verified your account. You may now log in!",
  logIn: "Login",
  verifyFailed: "Verify Failed...",
  verifyFailedMessage: "An error has occurred while verifying your account. Did the link expire?",
  profileField: "Username or Email Address",
  profilePlaceholder: "luna or luna@example.com",
  requestVerify: "Send Verification Email",
  profileInvalid: "Username or Email is invalid",
  requestTooRecent: "You already got a code, or you're already verified",
  profileNotExist: "This profile does not exist",
});

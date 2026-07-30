export type {
  FanOutEmailResult,
  SendApplicationApprovedEmailProps,
  SendApplicationRejectedEmailProps,
  SendApplicationSubmittedEmailProps,
  SendEmailVerificationEmailProps,
  SendMagicLinkEmailProps,
  SendMemberInviteEmailProps,
  SendOnboardingRequestEmailProps,
  SendOwnershipTransferEmailProps,
  SendResetPasswordEmailProps,
  SendSuperAdminInviteEmailProps,
} from "./email"
export {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationSubmittedEmail,
  sendEmailVerificationEmail,
  sendMagicLinkEmail,
  sendMemberInviteEmail,
  sendOnboardingRequestEmail,
  sendOwnershipTransferEmail,
  sendResetPasswordEmail,
  sendSuperAdminInviteEmail,
} from "./email"
export {
  ApplicationApprovedEmail,
  type ApplicationApprovedEmailProps,
} from "./emails/application-approved"
export {
  ApplicationRejectedEmail,
  type ApplicationRejectedEmailProps,
} from "./emails/application-rejected"
export {
  ApplicationSubmittedEmail,
  type ApplicationSubmittedEmailProps,
} from "./emails/application-submitted"
export {
  EmailVerificationEmail,
  type EmailVerificationEmailProps,
} from "./emails/email-verification"
export { MagicLinkEmail, type MagicLinkEmailProps } from "./emails/magic-link"
export {
  MemberInviteEmail,
  type MemberInviteEmailProps,
} from "./emails/member-invite"
export {
  OnboardingRequestEmail,
  type OnboardingRequestEmailProps,
} from "./emails/onboarding-request"
export {
  OwnershipTransferEmail,
  type OwnershipTransferEmailProps,
} from "./emails/ownership-transfer"
export {
  ResetPasswordEmail,
  type ResetPasswordEmailProps,
} from "./emails/reset-password"
export {
  SuperAdminInviteEmail,
  type SuperAdminInviteEmailProps,
} from "./emails/super-admin-invite"
export {
  getFromAddress,
  getResend,
  type SendEmailResult,
  sendEmail,
} from "./resend"

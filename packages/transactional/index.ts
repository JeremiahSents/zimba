export type {
  SendApplicationApprovedEmailProps,
  SendApplicationRejectedEmailProps,
  SendApplicationSubmittedEmailProps,
  SendMagicLinkEmailProps,
  SendMemberInviteEmailProps,
  SendOwnershipTransferEmailProps,
  SendSuperAdminInviteEmailProps,
} from "./email"
export {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationSubmittedEmail,
  sendMagicLinkEmail,
  sendMemberInviteEmail,
  sendOwnershipTransferEmail,
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
export { MagicLinkEmail, type MagicLinkEmailProps } from "./emails/magic-link"
export {
  MemberInviteEmail,
  type MemberInviteEmailProps,
} from "./emails/member-invite"
export {
  OwnershipTransferEmail,
  type OwnershipTransferEmailProps,
} from "./emails/ownership-transfer"
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

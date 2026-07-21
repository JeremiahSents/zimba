import { render } from "@react-email/components"
import { createElement } from "react"
import { type SendEmailResult, sendEmail } from "./resend"

export interface SendSuperAdminInviteEmailProps {
  to: string
  invitedByName: string
  inviteUrl: string
  recipientEmail: string
  expiresIn?: string
}

export async function sendSuperAdminInviteEmail(
  props: SendSuperAdminInviteEmailProps
): Promise<SendEmailResult> {
  const { default: SuperAdminInviteEmail } = await import(
    "./emails/super-admin-invite"
  )
  const html = await render(
    createElement(SuperAdminInviteEmail, {
      invitedByName: props.invitedByName,
      inviteUrl: props.inviteUrl,
      recipientEmail: props.recipientEmail,
      expiresIn: props.expiresIn,
    })
  )
  return sendEmail({
    to: props.to,
    subject: "You have been invited to Zimba Super Admin",
    html,
  })
}

export interface SendMemberInviteEmailProps {
  to: string
  invitedByName: string
  organizationName: string
  role: string
  inviteUrl: string
  responsibility?: string
  expiresIn?: string
}

export async function sendMemberInviteEmail(
  props: SendMemberInviteEmailProps
): Promise<SendEmailResult> {
  const { default: MemberInviteEmail } = await import("./emails/member-invite")
  const html = await render(
    createElement(MemberInviteEmail, {
      invitedByName: props.invitedByName,
      organizationName: props.organizationName,
      role: props.role,
      inviteUrl: props.inviteUrl,
      responsibility: props.responsibility,
      expiresIn: props.expiresIn,
    })
  )
  return sendEmail({
    to: props.to,
    subject: `You've been invited to join ${props.organizationName} on Zimba`,
    html,
  })
}

export interface SendMagicLinkEmailProps {
  to: string
  loginUrl: string
  email: string
  expiresIn?: string
  ipAddress?: string
}

export async function sendMagicLinkEmail(
  props: SendMagicLinkEmailProps
): Promise<SendEmailResult> {
  const { default: MagicLinkEmail } = await import("./emails/magic-link")
  const html = await render(
    createElement(MagicLinkEmail, {
      loginUrl: props.loginUrl,
      email: props.email,
      expiresIn: props.expiresIn,
      ipAddress: props.ipAddress,
    })
  )
  return sendEmail({
    to: props.to,
    subject: "Your Zimba sign-in link",
    html,
  })
}

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
  try {
    const { default: MemberInviteEmail } = await import(
      "./emails/member-invite"
    )
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
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EMAIL_SERVICE_ERROR"
    ) {
      throw error
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    throw Object.assign(new Error(`Member invite email failed: ${message}`), {
      code: "EMAIL_SERVICE_ERROR",
      cause: error,
    })
  }
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

export interface SendApplicationSubmittedEmailProps {
  to: string
  companyName: string
  fullName: string
}

export async function sendApplicationSubmittedEmail(
  props: SendApplicationSubmittedEmailProps
): Promise<SendEmailResult> {
  const { default: ApplicationSubmittedEmail } = await import(
    "./emails/application-submitted"
  )
  const html = await render(
    createElement(ApplicationSubmittedEmail, {
      companyName: props.companyName,
      fullName: props.fullName,
    })
  )
  return sendEmail({
    to: props.to,
    subject: "Welcome to Zimba",
    html,
  })
}

export interface SendApplicationApprovedEmailProps {
  to: string
  companyName: string
  fullName: string
  loginUrl: string
}

export async function sendApplicationApprovedEmail(
  props: SendApplicationApprovedEmailProps
): Promise<SendEmailResult> {
  const { default: ApplicationApprovedEmail } = await import(
    "./emails/application-approved"
  )
  const html = await render(
    createElement(ApplicationApprovedEmail, {
      companyName: props.companyName,
      fullName: props.fullName,
      loginUrl: props.loginUrl,
    })
  )
  return sendEmail({
    to: props.to,
    subject: `Your Zimba workspace for ${props.companyName} is ready`,
    html,
  })
}

export interface SendApplicationRejectedEmailProps {
  to: string
  companyName: string
  fullName: string
  rejectionReason?: string
  onboardingUrl: string
}

export async function sendApplicationRejectedEmail(
  props: SendApplicationRejectedEmailProps
): Promise<SendEmailResult> {
  const { default: ApplicationRejectedEmail } = await import(
    "./emails/application-rejected"
  )
  const html = await render(
    createElement(ApplicationRejectedEmail, {
      companyName: props.companyName,
      fullName: props.fullName,
      rejectionReason: props.rejectionReason,
      onboardingUrl: props.onboardingUrl,
    })
  )
  return sendEmail({
    to: props.to,
    subject: `Update on your Zimba application for ${props.companyName}`,
    html,
  })
}

export interface SendOwnershipTransferEmailProps {
  to: string
  organizationName: string
  fromUserName: string
  toUserName: string
  status: "approved" | "rejected"
  reason?: string
  rejectionReason?: string
}

export async function sendOwnershipTransferEmail(
  props: SendOwnershipTransferEmailProps
): Promise<SendEmailResult> {
  const { default: OwnershipTransferEmail } = await import(
    "./emails/ownership-transfer"
  )
  const html = await render(
    createElement(OwnershipTransferEmail, {
      organizationName: props.organizationName,
      fromUserName: props.fromUserName,
      toUserName: props.toUserName,
      status: props.status,
      reason: props.reason,
      rejectionReason: props.rejectionReason,
    })
  )
  return sendEmail({
    to: props.to,
    subject: `Ownership transfer for ${props.organizationName} — ${props.status}`,
    html,
  })
}

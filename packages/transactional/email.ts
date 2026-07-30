import { render } from "@react-email/components"
import { createElement } from "react"
import type { DocumentShareEmailProps } from "./emails/document-share"
import { type EmailAttachment, type SendEmailResult, sendEmail } from "./resend"

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

export interface SendOnboardingRequestEmailProps {
  /** Every super admin who should review this request. */
  to: string[]
  fullName: string
  companyName: string
  personalEmail: string
  reviewUrl: string
  submittedAt: Date
  companyWebsite?: string | null
  industry?: string | null
  country?: string | null
  phone?: string | null
  teamSize?: string | null
  useCase?: string | null
}

export type FanOutEmailResult = {
  sent: string[]
  failed: Array<{ to: string; error: string }>
}

/**
 * Fans the request out to every super admin. One bad address must not stop the
 * others from being told, so failures are collected instead of thrown — the
 * caller decides how loudly to complain.
 */
export async function sendOnboardingRequestEmail(
  props: SendOnboardingRequestEmailProps
): Promise<FanOutEmailResult> {
  const recipients = [...new Set(props.to.filter(Boolean))]
  if (!recipients.length) return { sent: [], failed: [] }

  const { default: OnboardingRequestEmail } = await import(
    "./emails/onboarding-request"
  )
  const html = await render(
    createElement(OnboardingRequestEmail, {
      fullName: props.fullName,
      companyName: props.companyName,
      personalEmail: props.personalEmail,
      reviewUrl: props.reviewUrl,
      submittedAt: props.submittedAt.toUTCString(),
      companyWebsite: props.companyWebsite,
      industry: props.industry,
      country: props.country,
      phone: props.phone,
      teamSize: props.teamSize,
      useCase: props.useCase,
    })
  )
  const subject = `New demo request — ${props.companyName}`

  const outcomes = await Promise.allSettled(
    recipients.map((to) => sendEmail({ to, subject, html }))
  )

  const result: FanOutEmailResult = { sent: [], failed: [] }
  outcomes.forEach((outcome, index) => {
    const to = recipients[index] as string
    if (outcome.status === "fulfilled") result.sent.push(to)
    else
      result.failed.push({
        to,
        error:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : "Unknown error",
      })
  })
  return result
}

export interface SendEmailVerificationEmailProps {
  to: string
  verifyUrl: string
  email: string
  expiresIn?: string
}

export async function sendEmailVerificationEmail(
  props: SendEmailVerificationEmailProps
): Promise<SendEmailResult> {
  const { default: EmailVerificationEmail } = await import(
    "./emails/email-verification"
  )
  const html = await render(
    createElement(EmailVerificationEmail, {
      verifyUrl: props.verifyUrl,
      email: props.email,
      expiresIn: props.expiresIn,
    })
  )
  return sendEmail({
    to: props.to,
    subject: "Confirm your Zimba email address",
    html,
  })
}

export interface SendResetPasswordEmailProps {
  to: string
  resetUrl: string
  email: string
  expiresIn?: string
}

export async function sendResetPasswordEmail(
  props: SendResetPasswordEmailProps
): Promise<SendEmailResult> {
  const { default: ResetPasswordEmail } = await import(
    "./emails/reset-password"
  )
  const html = await render(
    createElement(ResetPasswordEmail, {
      resetUrl: props.resetUrl,
      email: props.email,
      expiresIn: props.expiresIn,
    })
  )
  return sendEmail({
    to: props.to,
    subject: "Reset your Zimba password",
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

export interface SendDocumentShareEmailProps extends DocumentShareEmailProps {
  to: string
  attachment?: EmailAttachment
}

/**
 * Sends a generated receipt or payment voucher, either back to the person who
 * asked for it or out to the supplier.
 *
 * Wrapped in the same rethrow-if-already-tagged handling as the invite email.
 * It matters more here: this one can leave the organisation, so a caller
 * showing the user a failure needs a code it can rely on.
 */
export async function sendDocumentShareEmail(
  props: SendDocumentShareEmailProps
): Promise<SendEmailResult> {
  try {
    const { default: DocumentShareEmail } = await import(
      "./emails/document-share"
    )
    const html = await render(
      createElement(DocumentShareEmail, {
        documentKind: props.documentKind,
        recipientKind: props.recipientKind,
        organizationName: props.organizationName,
        supplierName: props.supplierName,
        projectName: props.projectName,
        documentNumber: props.documentNumber,
        documentUrl: props.documentUrl,
        totalFormatted: props.totalFormatted,
        outstandingFormatted: props.outstandingFormatted,
        settlementLabel: props.settlementLabel,
        senderName: props.senderName,
      })
    )
    const label =
      props.documentKind === "receipt" ? "Receipt" : "Payment voucher"
    const subject =
      props.recipientKind === "supplier"
        ? `${props.organizationName} — ${label} ${props.documentNumber}`
        : `${label} ${props.documentNumber} — ${props.supplierName}`

    return sendEmail({
      to: props.to,
      subject,
      html,
      ...(props.attachment ? { attachments: [props.attachment] } : {}),
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
    throw Object.assign(new Error(`Document share email failed: ${message}`), {
      code: "EMAIL_SERVICE_ERROR",
      cause: error,
    })
  }
}

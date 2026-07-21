import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface SuperAdminInviteEmailProps {
  invitedByName: string
  inviteUrl: string
  recipientEmail: string
  expiresIn?: string
}

export const SuperAdminInviteEmail = ({
  invitedByName,
  inviteUrl,
  recipientEmail,
  expiresIn = "This link expires in 24 hours.",
}: SuperAdminInviteEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>You have been invited to Zimba Super Admin</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Zimba Super Admin Invite</Heading>
        <Text style={text}>
          You&apos;ve been invited by <strong>{invitedByName}</strong> to become
          a Super Admin on Zimba.
        </Text>
        <Text style={text}>
          Super Admin access grants platform-wide control over organizations,
          users, billing and support state, and audit-sensitive actions. Treat
          this invitation with the same care as production infrastructure
          access.
        </Text>
        <Text style={text}>
          This invitation was sent to{" "}
          <strong>{recipientEmail}</strong>. You must sign in with this email
          address to accept.
        </Text>
        <Section style={buttonContainer}>
          <Button href={inviteUrl} style={button}>
            Accept invite
          </Button>
        </Section>
        <Text style={footerText}>{expiresIn}</Text>
        <Text style={footerText}>
          If you did not expect this invitation, ignore this email or contact
          the Zimba team.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SuperAdminInviteEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "600px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "24px",
}

const text = {
  color: "#484848",
  fontSize: "15px",
  lineHeight: "24px",
  marginBottom: "16px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#1e293b",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
}

const footerText = {
  color: "#8898aa",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "12px",
}

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface MemberInviteEmailProps {
  invitedByName: string
  organizationName: string
  role: string
  inviteUrl: string
  responsibility?: string
  expiresIn?: string
}

export const MemberInviteEmail = ({
  invitedByName,
  organizationName,
  role,
  inviteUrl,
  responsibility,
  expiresIn = "This link expires in 7 days.",
}: MemberInviteEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>
      You&apos;ve been invited to join {organizationName} on Zimba
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Join {organizationName} on Zimba</Heading>
        <Text style={text}>
          <strong>{invitedByName}</strong> has invited you to join{" "}
          <strong>{organizationName}</strong> on Zimba as a{" "}
          <strong>{role}</strong>
          {responsibility ? ` responsible for ${responsibility}` : ""}.
        </Text>
        <Text style={text}>
          Zimba is a construction project management workspace. You&apos;ll be
          able to track projects, expenses, suppliers, and team activity.
        </Text>
        <Section style={buttonContainer}>
          <Button href={inviteUrl} style={button}>
            Accept invitation
          </Button>
        </Section>
        <Text style={text}>
          You must sign in with the email address this invitation was sent to.
        </Text>
        <Hr style={hr} />
        <Text style={footerText}>{expiresIn}</Text>
        <Text style={footerText}>
          If you didn&apos;t expect this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MemberInviteEmail

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
  maxWidth: "560px",
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
  backgroundColor: "#0f766e",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
}

const footerText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "8px",
}

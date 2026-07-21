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

export interface MagicLinkEmailProps {
  loginUrl: string
  email: string
  expiresIn?: string
  ipAddress?: string
}

export const MagicLinkEmail = ({
  loginUrl,
  email,
  expiresIn = "This link expires shortly.",
  ipAddress,
}: MagicLinkEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>Your Zimba sign-in link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Sign in to Zimba</Heading>
        <Text style={text}>
          Use the button below to sign in to your Zimba account. This link was
          requested for <strong>{email}</strong>.
        </Text>
        <Section style={buttonContainer}>
          <Button href={loginUrl} style={button}>
            Sign in to Zimba
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footerText}>{expiresIn}</Text>
        {ipAddress ? (
          <Text style={footerText}>Request from IP: {ipAddress}</Text>
        ) : null}
        <Text style={footerText}>
          If you did not request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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

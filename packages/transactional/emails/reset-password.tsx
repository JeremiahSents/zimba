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

export interface ResetPasswordEmailProps {
  resetUrl: string
  email: string
  expiresIn?: string
}

export const ResetPasswordEmail = ({
  resetUrl,
  email,
  expiresIn = "This link expires in 1 hour.",
}: ResetPasswordEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>Reset your Zimba password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          Someone asked to reset the password for the Zimba account on{" "}
          <strong>{email}</strong>. Choose a new one using the button below.
        </Text>
        <Section style={buttonContainer}>
          <Button href={resetUrl} style={button}>
            Choose a new password
          </Button>
        </Section>
        <Text style={footerText}>{expiresIn}</Text>
        <Text style={footerText}>
          If you did not ask for this, ignore this email — your password stays
          as it is, and the link above will expire on its own.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordEmail

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

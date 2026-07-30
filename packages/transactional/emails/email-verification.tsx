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

export interface EmailVerificationEmailProps {
  verifyUrl: string
  email: string
  expiresIn?: string
}

export const EmailVerificationEmail = ({
  verifyUrl,
  email,
  expiresIn = "This link expires in 24 hours.",
}: EmailVerificationEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>Confirm your email to start using Zimba</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Confirm that <strong>{email}</strong> belongs to you and your Zimba
          account is ready to use.
        </Text>
        <Section style={buttonContainer}>
          <Button href={verifyUrl} style={button}>
            Confirm my email
          </Button>
        </Section>
        <Text style={text}>
          Once confirmed you can sign in with your password or with Google —
          both lead to the same account.
        </Text>
        <Text style={footerText}>{expiresIn}</Text>
        <Text style={footerText}>
          If you did not create a Zimba account, ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailVerificationEmail

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

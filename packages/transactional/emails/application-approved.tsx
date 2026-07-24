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

export interface ApplicationApprovedEmailProps {
  companyName: string
  fullName: string
  loginUrl: string
}

export const ApplicationApprovedEmail = ({
  companyName,
  fullName,
  loginUrl,
}: ApplicationApprovedEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>Your Zimba workspace for {companyName} is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Zimba, {fullName}!</Heading>
        <Text style={text}>
          Great news — your application for <strong>{companyName}</strong> has
          been approved. Your workspace is now ready to use.
        </Text>
        <Text style={text}>
          You can now start tracking projects, expenses, suppliers, and team
          activity in Zimba.
        </Text>
        <Section style={buttonContainer}>
          <Button href={loginUrl} style={button}>
            Go to your workspace
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footerText}>
          If you have any questions, just reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ApplicationApprovedEmail

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

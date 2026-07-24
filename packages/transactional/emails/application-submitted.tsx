import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface ApplicationSubmittedEmailProps {
  fullName: string
  companyName: string
}

export const ApplicationSubmittedEmail = ({
  fullName,
  companyName,
}: ApplicationSubmittedEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>We received your Zimba application</Preview>
    <Body style={body}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Zimba, {fullName}</Heading>
        <Section>
          <Text style={text}>
            Thanks for your interest in Zimba. We received your details for{" "}
            <strong>{companyName}</strong>.
          </Text>
          <Text style={text}>
            Our team will review your account request and contact you soon about
            approval and next steps.
          </Text>
          <Text style={muted}>
            You can explore the demo while you wait. This email confirms that
            your application was submitted successfully.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const body = {
  backgroundColor: "#f6f7f9",
  fontFamily: "Arial, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  maxWidth: "560px",
}

const h1 = {
  color: "#111827",
  fontSize: "24px",
  lineHeight: "32px",
}

const text = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
}

const muted = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
}

export default ApplicationSubmittedEmail

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface ApplicationRejectedEmailProps {
  companyName: string
  fullName: string
  rejectionReason?: string
  onboardingUrl: string
}

export const ApplicationRejectedEmail = ({
  companyName,
  fullName,
  rejectionReason,
  onboardingUrl,
}: ApplicationRejectedEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>Update on your Zimba application for {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Application update, {fullName}</Heading>
        <Text style={text}>
          Thank you for your interest in Zimba. After reviewing your application
          for <strong>{companyName}</strong>, we are unable to approve it at
          this time.
        </Text>
        {rejectionReason && (
          <Text style={text}>
            <strong>Reason:</strong> {rejectionReason}
          </Text>
        )}
        <Text style={text}>
          You can submit a new application with updated information if
          you&apos;d like to be reconsidered.
        </Text>
        <Hr style={hr} />
        <Text style={footerText}>
          If you believe this was an error, please reply to this email.
        </Text>
        <Text style={footerText}>
          You can reapply at{" "}
          <a href={onboardingUrl} style={link}>
            {onboardingUrl}
          </a>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ApplicationRejectedEmail

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

const link = {
  color: "#0f766e",
  textDecoration: "underline",
}

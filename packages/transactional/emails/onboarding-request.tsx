import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

export interface OnboardingRequestEmailProps {
  fullName: string
  companyName: string
  personalEmail: string
  reviewUrl: string
  submittedAt: string
  companyWebsite?: string | null
  industry?: string | null
  country?: string | null
  phone?: string | null
  teamSize?: string | null
  useCase?: string | null
}

/** Sent to every super admin the moment a client asks for a demo. */
export const OnboardingRequestEmail = ({
  fullName,
  companyName,
  personalEmail,
  reviewUrl,
  submittedAt,
  companyWebsite,
  industry,
  country,
  phone,
  teamSize,
  useCase,
}: OnboardingRequestEmailProps): ReactNode => (
  <Html>
    <Head />
    <Preview>{`New demo request from ${companyName}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New demo request</Heading>
        <Text style={text}>
          <strong>{fullName}</strong> asked for a Zimba demo on behalf of{" "}
          <strong>{companyName}</strong>. Nothing has been provisioned — the
          request stays pending until a super admin approves it.
        </Text>

        <Section style={panel}>
          <Detail label="Full name" value={fullName} />
          <Detail label="Company name" value={companyName} />
          <Detail label="Personal email" value={personalEmail} />
          <Detail label="Submitted" value={submittedAt} />
          <Detail label="Website" value={companyWebsite} />
          <Detail label="Industry" value={industry} />
          <Detail label="Country" value={country} />
          <Detail label="Phone" value={phone} />
          <Detail label="Team size" value={teamSize} />
          <Detail label="Use case" value={useCase} />
        </Section>

        <Section style={buttonContainer}>
          <Button href={reviewUrl} style={button}>
            Review request
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footerText}>
          Approving creates the workspace and emails the client their sign-in
          link. Declining emails them your reason instead.
        </Text>
      </Container>
    </Body>
  </Html>
)

function Detail({
  label,
  value,
}: {
  label: string
  value?: string | null
}): ReactNode {
  if (!value) return null
  return (
    <Row style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Row>
  )
}

export default OnboardingRequestEmail

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

const panel = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "8px 16px",
  margin: "24px 0",
}

const row = {
  borderBottom: "1px solid #eef2f6",
  padding: "8px 0",
}

const rowLabel = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
  textTransform: "uppercase" as const,
}

const rowValue = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "2px 0 0",
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

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
}

const footerText = {
  color: "#8898aa",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "12px",
}

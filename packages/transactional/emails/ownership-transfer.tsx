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

export interface OwnershipTransferEmailProps {
  organizationName: string
  fromUserName: string
  toUserName: string
  status: "approved" | "rejected"
  reason?: string
  rejectionReason?: string
}

export const OwnershipTransferEmail = ({
  organizationName,
  fromUserName,
  toUserName,
  status,
  reason,
  rejectionReason,
}: OwnershipTransferEmailProps): ReactNode => {
  const isApproved = status === "approved"

  return (
    <Html>
      <Head />
      <Preview>
        Ownership transfer for {organizationName} — {status}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Ownership transfer {isApproved ? "approved" : "rejected"}
          </Heading>
          <Text style={text}>
            The ownership transfer request for{" "}
            <strong>{organizationName}</strong> has been{" "}
            <strong>{isApproved ? "approved" : "rejected"}</strong>.
          </Text>
          <Text style={text}>
            <strong>From:</strong> {fromUserName}
            <br />
            <strong>To:</strong> {toUserName}
          </Text>
          {reason && (
            <Text style={text}>
              <strong>Request reason:</strong> {reason}
            </Text>
          )}
          {rejectionReason && (
            <Text style={text}>
              <strong>Rejection reason:</strong> {rejectionReason}
            </Text>
          )}
          {isApproved && (
            <Text style={text}>
              Ownership has been transferred. {toUserName} is now the owner of{" "}
              {organizationName}. {fromUserName} has been changed to a site
              manager role.
            </Text>
          )}
          <Hr style={hr} />
          <Text style={footerText}>
            If you have questions about this decision, please reply to this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OwnershipTransferEmail

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

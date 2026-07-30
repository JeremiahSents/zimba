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

/**
 * One template covers four cases — receipt or voucher, to the sender or to the
 * supplier — because the layout is identical and only the opening line and the
 * balance block differ. Four near-duplicate files would drift apart.
 */
export interface DocumentShareEmailProps {
  documentKind: "receipt" | "payment_voucher"
  recipientKind: "self" | "supplier"
  organizationName: string
  supplierName: string
  projectName?: string | null
  documentNumber: string
  documentUrl: string
  totalFormatted: string
  outstandingFormatted?: string
  settlementLabel?: string
  senderName: string
}

export const DocumentShareEmail = ({
  documentKind,
  recipientKind,
  organizationName,
  supplierName,
  projectName,
  documentNumber,
  documentUrl,
  totalFormatted,
  outstandingFormatted,
  settlementLabel,
  senderName,
}: DocumentShareEmailProps): ReactNode => {
  const isReceipt = documentKind === "receipt"
  const noun = isReceipt ? "receipt" : "payment voucher"
  const title = `${isReceipt ? "Receipt" : "Payment voucher"} ${documentNumber}`

  return (
    <Html>
      <Head />
      <Preview>
        {title} from {organizationName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{title}</Heading>

          {recipientKind === "supplier" ? (
            <Text style={text}>
              <strong>{organizationName}</strong> has sent you a {noun} for your
              records. The PDF is attached, and you can also open it using the
              button below.
            </Text>
          ) : (
            <Text style={text}>
              Here is your copy of {noun} <strong>{documentNumber}</strong>,
              sent by {senderName}. The PDF is attached.
            </Text>
          )}

          <Section style={detailBox}>
            <Text style={detailRow}>
              <span style={detailLabel}>Supplier</span>
              <span>{supplierName}</span>
            </Text>
            {projectName ? (
              <Text style={detailRow}>
                <span style={detailLabel}>Project</span>
                <span>{projectName}</span>
              </Text>
            ) : null}
            <Text style={detailRow}>
              <span style={detailLabel}>
                {isReceipt ? "Total" : "Amount paid"}
              </span>
              <span>
                <strong>{totalFormatted}</strong>
              </span>
            </Text>
            {/*
              Shown to the supplier deliberately: an outstanding balance is the
              reason they were sent this in the first place.
            */}
            {outstandingFormatted ? (
              <Text style={detailRow}>
                <span style={detailLabel}>Outstanding</span>
                <span>
                  <strong>{outstandingFormatted}</strong>
                </span>
              </Text>
            ) : null}
            {settlementLabel ? (
              <Text style={detailRow}>
                <span style={detailLabel}>Status</span>
                <span>{settlementLabel}</span>
              </Text>
            ) : null}
          </Section>

          <Section style={buttonContainer}>
            <Button href={documentUrl} style={button}>
              Open the PDF
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footerText}>
            Sent from {organizationName} via Zimba.
          </Text>
          {recipientKind === "supplier" ? (
            <Text style={footerText}>
              If this reached you in error, please let {organizationName} know
              and delete this email.
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export default DocumentShareEmail

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

const detailBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
}

const detailRow = {
  color: "#484848",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "4px 0",
  display: "flex",
  justifyContent: "space-between",
}

const detailLabel = {
  color: "#9ca3af",
  marginRight: "16px",
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

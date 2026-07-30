import { Document, Page, StyleSheet, View } from "@react-pdf/renderer"
import { Divider } from "../components/pdfx/divider/pdfx-divider"
import { KeyValue } from "../components/pdfx/key-value/pdfx-key-value"
import { PageFooter } from "../components/pdfx/page-footer/pdfx-page-footer"
import { PageHeader } from "../components/pdfx/page-header/pdfx-page-header"
import { Section } from "../components/pdfx/section/pdfx-section"
import { PdfSignatureBlock } from "../components/pdfx/signature/pdfx-signature"
import { Text } from "../components/pdfx/text/pdfx-text"
import { formatDocumentDate, formatMethod, formatMoney } from "../format"
import { PdfxThemeProvider, usePdfxTheme } from "../lib/pdfx-theme-context"
import type { PaymentVoucherData } from "../types"

export function PaymentVoucherDocument({ data }: { data: PaymentVoucherData }) {
  return (
    <PdfxThemeProvider>
      <PaymentVoucherContent data={data} />
    </PdfxThemeProvider>
  )
}

function PaymentVoucherContent({ data }: { data: PaymentVoucherData }) {
  const theme = usePdfxTheme()

  const styles = StyleSheet.create({
    page: {
      paddingTop: theme.spacing.page.marginTop,
      paddingBottom: theme.spacing.page.marginBottom,
      paddingLeft: theme.spacing.page.marginLeft,
      paddingRight: theme.spacing.page.marginRight,
      backgroundColor: theme.colors.background,
    },
    stamp: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: "solid",
      borderRadius: theme.primitives.borderRadius.sm,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignSelf: "flex-start",
    },
    stampLabel: {
      fontSize: 7,
      fontWeight: "bold",
      color: theme.colors.primary,
      textAlign: "right",
    },
    stampNumber: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.foreground,
      textAlign: "right",
    },
    infoLabel: {
      fontSize: 8,
      fontWeight: "bold",
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    amountBlock: {
      alignItems: "center",
      paddingVertical: 18,
    },
    amount: {
      fontSize: 26,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
  })

  // Only render the settlement block when this voucher actually points at a
  // parent — a payment can exist without one on legacy rows.
  const settlementItems = data.againstDocumentNumber
    ? [
        { key: "Settles", value: data.againstDocumentNumber },
        ...(data.againstTotalCents !== null
          ? [
              {
                key: "Document total",
                value: formatMoney(data.againstTotalCents, data.currency),
              },
            ]
          : []),
        ...(data.runningPaidCents !== null
          ? [
              {
                key: "Paid to date",
                value: formatMoney(data.runningPaidCents, data.currency),
              },
            ]
          : []),
        ...(data.runningOutstandingCents !== null
          ? [
              {
                key: "Outstanding after this payment",
                value: formatMoney(data.runningOutstandingCents, data.currency),
                valueStyle: {
                  fontWeight: "bold" as const,
                  color:
                    data.runningOutstandingCents > 0
                      ? theme.colors.destructive
                      : theme.colors.success,
                },
              },
            ]
          : []),
      ]
    : []

  return (
    <Document title={`Payment voucher ${data.voucherNumber}`}>
      <Page size="A4" style={styles.page}>
        <Section
          noWrap
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: theme.spacing.sectionGap,
          }}
        >
          <View style={{ flex: 1 }}>
            <PageHeader
              variant="minimal"
              title={data.organization.name}
              subtitle={
                [data.organization.email, data.organization.phone]
                  .filter(Boolean)
                  .join("  ·  ") || undefined
              }
              marginBottom={0}
            />
          </View>
          <View style={styles.stamp}>
            <Text style={styles.stampLabel} noMargin transform="uppercase">
              Payment voucher
            </Text>
            <Text style={styles.stampNumber} noMargin>
              {data.voucherNumber}
            </Text>
            <Text
              style={{
                fontSize: 8,
                color: theme.colors.mutedForeground,
                textAlign: "right",
              }}
              noMargin
            >
              {formatDocumentDate(data.issuedAt)}
            </Text>
          </View>
        </Section>

        <Section noWrap style={styles.amountBlock}>
          <Text
            variant="xs"
            noMargin
            color="mutedForeground"
            transform="uppercase"
          >
            Amount paid
          </Text>
          <Text style={styles.amount} noMargin>
            {formatMoney(data.amountCents, data.currency)}
          </Text>
        </Section>

        <Divider spacing="md" />

        <View
          style={{
            flexDirection: "row",
            marginBottom: theme.spacing.sectionGap,
          }}
        >
          <View style={{ flex: 1, paddingRight: 20 }}>
            <Text style={styles.infoLabel} noMargin>
              Paid to
            </Text>
            <Text variant="sm" noMargin>
              {data.supplier.name}
            </Text>
            {data.supplier.email ? (
              <Text variant="xs" noMargin color="mutedForeground">
                {data.supplier.email}
              </Text>
            ) : null}
            {data.supplier.phone ? (
              <Text variant="xs" noMargin color="mutedForeground">
                {data.supplier.phone}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel} noMargin>
              Payment details
            </Text>
            <KeyValue
              size="sm"
              items={[
                { key: "Date", value: formatDocumentDate(data.paidAt) },
                { key: "Method", value: formatMethod(data.method) },
                { key: "Reference", value: data.reference ?? "—" },
                { key: "Project", value: data.projectName ?? "—" },
              ]}
            />
          </View>
        </View>

        {settlementItems.length > 0 ? (
          <Section variant="callout" style={{ marginBottom: 24 }}>
            <Text style={styles.infoLabel} noMargin>
              Settlement
            </Text>
            <KeyValue size="sm" items={settlementItems} />
          </Section>
        ) : null}

        <PdfSignatureBlock
          variant="double"
          signers={[
            { label: "Authorised by", name: data.organization.name },
            { label: "Received by", name: data.supplier.name },
          ]}
        />

        <PageFooter
          leftText={`${data.organization.name} · Voucher ${data.voucherNumber}`}
          rightText="Generated by Zimba"
          sticky
          pagePadding={theme.spacing.page.marginLeft}
        />
      </Page>
    </Document>
  )
}

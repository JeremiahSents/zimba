import { Document, Page, StyleSheet, View } from "@react-pdf/renderer"
import { Badge } from "../components/pdfx/badge/pdfx-badge"
import { KeyValue } from "../components/pdfx/key-value/pdfx-key-value"
import { PageFooter } from "../components/pdfx/page-footer/pdfx-page-footer"
import { PageHeader } from "../components/pdfx/page-header/pdfx-page-header"
import { Section } from "../components/pdfx/section/pdfx-section"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/pdfx/table/pdfx-table"
import { Text } from "../components/pdfx/text/pdfx-text"
import {
  formatDocumentDate,
  formatMethod,
  formatMoney,
  formatSettlementStatus,
} from "../format"
import { PdfxThemeProvider, usePdfxTheme } from "../lib/pdfx-theme-context"
import type { ReceiptDocumentData } from "../types"

/**
 * `data` has no default on purpose. The pdfx block this was adapted from ships
 * a `sampleData` fallback, which turns a wiring mistake into a PDF of someone
 * else's invoice instead of a type error.
 */
export function ReceiptDocument({ data }: { data: ReceiptDocumentData }) {
  return (
    <PdfxThemeProvider>
      <ReceiptDocumentContent data={data} />
    </PdfxThemeProvider>
  )
}

function ReceiptDocumentContent({ data }: { data: ReceiptDocumentData }) {
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
    stampDate: {
      fontSize: 8,
      color: theme.colors.mutedForeground,
      textAlign: "right",
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.sectionGap,
    },
    infoLabel: {
      fontSize: 8,
      fontWeight: "bold",
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
    },
  })

  const statusVariant =
    data.settlementStatus === "paid"
      ? "success"
      : data.settlementStatus === "partially_paid"
        ? "warning"
        : "default"

  return (
    <Document title={`Receipt ${data.documentNumber}`}>
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
              Receipt
            </Text>
            <Text style={styles.stampNumber} noMargin>
              {data.documentNumber}
            </Text>
            <Text style={styles.stampDate} noMargin>
              {formatDocumentDate(data.issuedAt)}
            </Text>
          </View>
        </Section>

        <View style={styles.infoRow}>
          <View style={{ flex: 1, paddingRight: 20 }}>
            <Text style={styles.infoLabel} noMargin>
              Supplier
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
              Details
            </Text>
            <KeyValue
              size="sm"
              items={[
                { key: "Project", value: data.projectName ?? "—" },
                {
                  key: "Expense date",
                  value: formatDocumentDate(data.expenseDate),
                },
                { key: "Currency", value: data.currency },
              ]}
            />
          </View>
        </View>

        <Table variant="compact">
          <TableHeader>
            <TableRow header>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.lines.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: line ids are not carried into the PDF contract
              <TableRow key={index}>
                <TableCell>{line.description}</TableCell>
                <TableCell>{line.allocationName}</TableCell>
                <TableCell align="center">{`${line.quantity}`}</TableCell>
                <TableCell align="right">
                  {formatMoney(line.unitRateCents, data.currency)}
                </TableCell>
                <TableCell align="right">
                  {formatMoney(line.amountCents, data.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Section noWrap style={{ flexDirection: "row", marginTop: 20 }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Badge
              variant={statusVariant}
              label={formatSettlementStatus(data.settlementStatus)}
            />
          </View>
          <View style={{ width: 240 }}>
            <KeyValue
              size="sm"
              divided
              dividerThickness={1}
              items={[
                {
                  key: "Total",
                  value: formatMoney(data.totalCents, data.currency),
                },
                {
                  key: "Paid",
                  value: formatMoney(data.paidCents, data.currency),
                },
                {
                  key: "Outstanding",
                  value: formatMoney(data.outstandingCents, data.currency),
                  valueStyle: {
                    fontSize: 13,
                    fontWeight: "bold",
                    color:
                      data.outstandingCents > 0
                        ? theme.colors.destructive
                        : theme.colors.success,
                  },
                  keyStyle: { fontSize: 12, fontWeight: "bold" },
                },
              ]}
            />
          </View>
        </Section>

        {data.payments.length > 0 ? (
          <Section style={{ marginTop: theme.spacing.sectionGap }}>
            <Text style={styles.infoLabel} noMargin>
              Payments received
            </Text>
            <Table variant="compact">
              <TableHeader>
                <TableRow header>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.map((entry, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: payment ids are not carried into the PDF contract
                  <TableRow key={index}>
                    <TableCell>{formatDocumentDate(entry.paidAt)}</TableCell>
                    <TableCell>{formatMethod(entry.method)}</TableCell>
                    <TableCell>{entry.reference ?? "—"}</TableCell>
                    <TableCell align="right">
                      {formatMoney(entry.amountCents, entry.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        ) : null}

        <PageFooter
          leftText={`${data.organization.name} · Receipt ${data.documentNumber}`}
          rightText="Generated by Zimba"
          sticky
          pagePadding={theme.spacing.page.marginLeft}
        />
      </Page>
    </Document>
  )
}

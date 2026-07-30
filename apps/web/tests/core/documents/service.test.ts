import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const api = vi.hoisted(() => ({
  getExpenseDetailUseCase: vi.fn(),
  getPaymentDetailUseCase: vi.fn(),
  storeGeneratedDocumentUseCase: vi.fn(),
}))
vi.mock("@workspace/api", () => api)

const pdf = vi.hoisted(() => ({
  renderReceiptPdf: vi.fn(),
  renderPaymentVoucherPdf: vi.fn(),
  // The real implementations are pure and worth exercising rather than faking.
  formatMoney: (cents: number) => `USh ${Math.round(cents / 100)}`,
  formatSettlementStatus: (status: string) => status,
  toSafeFilename: (value: string) => value.replace(/[^A-Za-z0-9._-]+/g, "-"),
}))
vi.mock("@workspace/transactional/pdf", () => pdf)

// The web vitest config sets RESEND_API_KEY, so the console transport is off
// and an unmocked send would attempt a real network call.
const mail = vi.hoisted(() => ({ sendDocumentShareEmail: vi.fn() }))
vi.mock("@workspace/transactional", () => mail)

const uploader = vi.hoisted(() => ({ uploadFiles: vi.fn() }))
vi.mock("uploadthing/server", () => ({
  // Real classes, not vi.fn() factories: the service calls `new UTApi(...)`,
  // and `vi.resetAllMocks()` would strip a factory's implementation. The method
  // delegates rather than being assigned so it always hits the current mock.
  UTApi: class {
    uploadFiles(...args: unknown[]) {
      return uploader.uploadFiles(...args)
    }
  },
  UTFile: class {
    constructor(
      public parts: unknown,
      public name: string
    ) {}
  },
}))

const session = vi.hoisted(() => ({ requireSession: vi.fn() }))
vi.mock("@/core/auth/service", () => session)

import {
  generateDocumentsInBackground,
  generateReceiptDocument,
  sendDocumentEmail,
} from "@/core/documents/service"

const SESSION = {
  user: { id: "user-1", email: "me@zimba.test", name: "Jeremiah" },
  organization: {
    organizationId: "org-1",
    organizationName: "Zimba Construction",
    role: "accountant",
  },
}

const receiptDetail = {
  expense: {
    id: "expense-1",
    documentFileId: null,
    expenseDate: new Date("2026-07-28T00:00:00.000Z"),
  },
  projectName: "Ntinda Site B",
  supplierName: "Kampala Hardware",
  supplierEmail: "sales@kampalahardware.test",
  supplierPhone: null,
  documentFile: null,
  lines: [
    {
      line: {
        itemDescription: "Cement",
        quantity: 40,
        unitRateCents: 3_800_000,
        amountCents: 152_000_000,
      },
      allocationName: "Materials",
    },
  ],
  payments: [
    {
      amountCents: 52_000_000,
      currency: "UGX",
      method: "mobile_money",
      reference: "MM-1",
      paymentDate: new Date("2026-07-29T00:00:00.000Z"),
      createdAt: new Date("2026-07-29T00:00:00.000Z"),
    },
  ],
}

describe("generateReceiptDocument", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    session.requireSession.mockResolvedValue(SESSION)
    api.getExpenseDetailUseCase.mockResolvedValue(receiptDetail)
    pdf.renderReceiptPdf.mockResolvedValue(Buffer.from("%PDF-fake"))
    uploader.uploadFiles.mockResolvedValue({
      data: {
        key: "k1",
        ufsUrl: "https://files.test/k1.pdf",
        name: "Receipt.pdf",
        size: 5083,
      },
      error: null,
    })
    api.storeGeneratedDocumentUseCase.mockResolvedValue({ fileId: "file-1" })
  })

  it("maps the receipt into the PDF contract with cents intact", async () => {
    await generateReceiptDocument("expense-1")

    const data = pdf.renderReceiptPdf.mock.calls[0]![0]
    expect(data.totalCents).toBe(152_000_000)
    expect(data.paidCents).toBe(52_000_000)
    expect(data.outstandingCents).toBe(100_000_000)
    expect(data.settlementStatus).toBe("partially_paid")
    expect(data.supplier).toEqual({
      name: "Kampala Hardware",
      email: "sales@kampalahardware.test",
      phone: null,
    })
    expect(data.lines[0]).toEqual({
      description: "Cement",
      allocationName: "Materials",
      quantity: 40,
      unitRateCents: 3_800_000,
      amountCents: 152_000_000,
    })
    // ISO strings, not Date objects — the contract has to stay serialisable.
    expect(data.expenseDate).toBe("2026-07-28T00:00:00.000Z")
    expect(data.payments[0].paidAt).toBe("2026-07-29T00:00:00.000Z")
  })

  it("stores the upload under the receipt purpose", async () => {
    await generateReceiptDocument("expense-1")

    expect(api.storeGeneratedDocumentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1" }),
      expect.objectContaining({
        target: { kind: "receipt", id: "expense-1" },
        key: "k1",
        url: "https://files.test/k1.pdf",
        contentType: "application/pdf",
      })
    )
  })

  it("does nothing when a document already exists and force is off", async () => {
    api.getExpenseDetailUseCase.mockResolvedValue({
      ...receiptDetail,
      expense: { ...receiptDetail.expense, documentFileId: "file-existing" },
    })

    const result = await generateReceiptDocument("expense-1")

    expect(result).toEqual({ fileId: "file-existing", regenerated: false })
    expect(pdf.renderReceiptPdf).not.toHaveBeenCalled()
    expect(uploader.uploadFiles).not.toHaveBeenCalled()
  })

  it("regenerates when forced", async () => {
    api.getExpenseDetailUseCase.mockResolvedValue({
      ...receiptDetail,
      expense: { ...receiptDetail.expense, documentFileId: "file-existing" },
    })

    await generateReceiptDocument("expense-1", { force: true })

    expect(pdf.renderReceiptPdf).toHaveBeenCalledOnce()
  })
})

describe("generateDocumentsInBackground", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    session.requireSession.mockResolvedValue(SESSION)
  })

  // The whole point: a create flow has already committed by the time this runs.
  it("swallows a failure so the committed record survives", async () => {
    api.getExpenseDetailUseCase.mockRejectedValue(new Error("storage down"))

    await expect(
      generateDocumentsInBackground({ receiptId: "expense-1" })
    ).resolves.toBeUndefined()
  })
})

describe("sendDocumentEmail", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    session.requireSession.mockResolvedValue(SESSION)
    api.getExpenseDetailUseCase.mockResolvedValue({
      ...receiptDetail,
      documentFile: {
        url: "https://files.test/k1.pdf",
        filename: "Receipt.pdf",
      },
    })
    mail.sendDocumentShareEmail.mockResolvedValue({ id: "email-1" })
  })

  it("ignores a client-supplied address when sending to self", async () => {
    const result = await sendDocumentEmail({
      kind: "receipt",
      targetId: "expense-1",
      recipient: "self",
      email: "attacker@evil.test",
    })

    expect(result.to).toBe("me@zimba.test")
    expect(mail.sendDocumentShareEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "me@zimba.test" })
    )
  })

  it("attaches the stored PDF by URL rather than by value", async () => {
    await sendDocumentEmail({
      kind: "receipt",
      targetId: "expense-1",
      recipient: "supplier",
      email: "sales@kampalahardware.test",
    })

    const props = mail.sendDocumentShareEmail.mock.calls[0]![0]
    expect(props.to).toBe("sales@kampalahardware.test")
    expect(props.attachment).toEqual({
      filename: "Receipt.pdf",
      path: "https://files.test/k1.pdf",
      contentType: "application/pdf",
    })
    expect(props.attachment.content).toBeUndefined()
  })

  it("refuses a viewer", async () => {
    session.requireSession.mockResolvedValue({
      ...SESSION,
      organization: { ...SESSION.organization, role: "viewer" },
    })

    await expect(
      sendDocumentEmail({
        kind: "receipt",
        targetId: "expense-1",
        recipient: "supplier",
        email: "sales@kampalahardware.test",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(mail.sendDocumentShareEmail).not.toHaveBeenCalled()
  })

  it("refuses to send a receipt whose PDF was never generated", async () => {
    api.getExpenseDetailUseCase.mockResolvedValue(receiptDetail)

    await expect(
      sendDocumentEmail({
        kind: "receipt",
        targetId: "expense-1",
        recipient: "self",
        email: "",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
  })
})

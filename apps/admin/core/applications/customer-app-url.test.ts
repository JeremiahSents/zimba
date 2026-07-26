import { afterEach, describe, expect, it } from "vitest"
import { getCustomerAppUrl } from "./customer-app-url"

const originalCustomerAppUrl = process.env.CUSTOMER_APP_URL

afterEach(() => {
  if (originalCustomerAppUrl === undefined) {
    delete process.env.CUSTOMER_APP_URL
    return
  }

  process.env.CUSTOMER_APP_URL = originalCustomerAppUrl
})

describe("getCustomerAppUrl", () => {
  it("uses the customer application production origin by default", () => {
    delete process.env.CUSTOMER_APP_URL

    expect(getCustomerAppUrl()).toBe("https://app.zimba.digital")
  })

  it("uses the configured customer origin without trailing slashes", () => {
    process.env.CUSTOMER_APP_URL = "https://staging-app.zimba.digital///"

    expect(getCustomerAppUrl()).toBe("https://staging-app.zimba.digital")
  })
})

"use server"

import { revalidatePath } from "next/cache"
import { createSupplier, createSupplierCategory, updateSupplier } from "@/core/suppliers/service"
import { expectedActionFailure, type ActionResult } from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { ensureActionSession } from "@/core/auth/action-session"
import { z } from "zod"
import { fieldErrorsFromZod } from "@workspace/server-primitives"
import { boundedNameSchema, idSchema as contractIdSchema, supplierFormSchema } from "@workspace/contracts"

const supplierSchema = supplierFormSchema
const idSchema = contractIdSchema

export async function createSupplierAction(input: {
  name: string
  category: string
  companyContact?: string
  contactName?: string
  phone?: string
  email?: string
  notes?: string
}): Promise<ActionResult> {
  const authFailure = await ensureActionSession("suppliers.create")
  if (authFailure) return authFailure
  const parsed = supplierSchema.safeParse(input)
  if (!parsed.success) {
    return expectedActionFailure("VALIDATION_FAILED", "Review the supplier fields.", fieldErrorsFromZod(parsed.error))
  }

  try {
    await createSupplier({
      name: parsed.data.name, category: parsed.data.category,
      phone: parsed.data.phone?.trim() || null, email: parsed.data.email?.trim() || null,
      notes: parsed.data.notes?.trim() || null, companyContact: parsed.data.companyContact?.trim() || null,
      contactName: parsed.data.contactName?.trim() || null,
    })
    
    revalidatePath("/admin/suppliers")
    revalidatePath("/admin/home")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "suppliers.create")
  }
}

export async function createSupplierCategoryAction(name: string): Promise<ActionResult<{ name: string; slug: string }>> {
  const authFailure = await ensureActionSession("suppliers.create-category")
  if (authFailure) return authFailure
  if (!boundedNameSchema.max(80).safeParse(name).success) return expectedActionFailure("VALIDATION_FAILED", "Enter a valid category name.")
  try {
    const category = await createSupplierCategory(name)
    revalidatePath("/admin/suppliers/new")
    return { success: true, data: { name: category.name, slug: category.slug } }
  } catch (error) {
    return handleActionError(error, "suppliers.create-category")
  }
}

export async function updateSupplierAction(supplierId: string, input: {
  name: string; category: string; companyContact?: string; contactName?: string; phone?: string; email?: string; notes?: string; status?: string
}): Promise<ActionResult> {
  const authFailure = await ensureActionSession("suppliers.update")
  if (authFailure) return authFailure
  const parsed = supplierSchema.safeParse(input)
  if (!idSchema.safeParse(supplierId).success || !parsed.success) return expectedActionFailure("VALIDATION_FAILED", "Enter valid supplier details.")
  try {
    await updateSupplier(supplierId, { ...parsed.data, email: parsed.data.email?.trim() || null })
    revalidatePath("/admin/suppliers")
    revalidatePath(`/admin/suppliers/${supplierId}`)
    return { success: true, data: undefined }
  } catch (error) { return handleActionError(error, "suppliers.update") }
}

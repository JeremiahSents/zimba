"use server"

import { revalidatePath } from "next/cache"
import { createSupplier, createSupplierCategory, updateSupplier } from "@/core/suppliers/service"
import { expectedActionFailure, type ActionResult } from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { ensureActionSession } from "@/core/auth/action-session"

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
  if (!input.name.trim()) {
    return expectedActionFailure("VALIDATION_FAILED", "Add a supplier name.")
  }

  try {
    await createSupplier({
      name: input.name.trim(),
      category: input.category,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      companyContact: input.companyContact?.trim() || null,
      contactName: input.contactName?.trim() || null,
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
  try {
    await updateSupplier(supplierId, { ...input, email: input.email?.trim() || null })
    revalidatePath("/admin/suppliers")
    revalidatePath(`/admin/suppliers/${supplierId}`)
    return { success: true, data: undefined }
  } catch (error) { return handleActionError(error, "suppliers.update") }
}

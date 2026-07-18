"use server"

import { revalidatePath } from "next/cache"
import { createSupplier, createSupplierCategory } from "@/core/suppliers/service"
import { ApplicationError } from "@/core/shared/errors"
import type { ActionResult } from "@/core/shared/action-result"
import { requireSession } from "@/core/auth/service"

export async function createSupplierAction(input: {
  name: string
  category: string
  companyContact?: string
  contactName?: string
  phone?: string
  email?: string
  notes?: string
}): Promise<ActionResult> {
  await requireSession()
  if (!input.name.trim()) {
    return { success: false, error: { code: "bad_request", message: "Add a supplier name." } }
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
    if (error instanceof ApplicationError) {
      return { success: false, error: { code: error.code, message: error.message } }
    }
    console.error("Zimba Action failed", error)
    return {
      success: false,
      error: { code: "internal_error", message: "The request could not be completed. Please try again." },
    }
  }
}

export async function createSupplierCategoryAction(name: string): Promise<ActionResult<{ name: string; slug: string }>> {
  await requireSession()
  try {
    const category = await createSupplierCategory(name)
    revalidatePath("/admin/suppliers/new")
    return { success: true, data: { name: category.name, slug: category.slug } }
  } catch (error) {
    if (error instanceof ApplicationError) return { success: false, error: { code: error.code, message: error.message } }
    console.error("Zimba Action failed", error)
    return { success: false, error: { code: "internal_error", message: "The category could not be created." } }
  }
}

import "server-only"
import { db } from "@workspace/db"
import { findOrganizationDetail, listOrganizationsWithStats, readOrganizationStats, updateOrganizationStatus as updateOrganizationStatusInDb } from "@workspace/db/repositories"
import { organization, organizationMember, project, expense, expenseLine, supplier, payment } from "@workspace/db/schema"
import { count, desc, eq, sql } from "drizzle-orm"
import { notFound } from "../shared/errors"
import { requirePlatformRole } from "../auth/service"

export async function listOrganizations() {
  return listOrganizationsWithStats(db)
}

export async function getOrganizationDetail(id: string) {
  const org = await findOrganizationDetail(db, id)

  if (!org) notFound("Organization not found.")

  return org
}

export async function getOrganizationStats(id: string) {
  return readOrganizationStats(db, id)
}

export async function updateOrganizationStatus(id: string, status: string) {
  await requirePlatformRole(["super_admin"])
  return updateOrganizationStatusInDb(db, id, status)
}

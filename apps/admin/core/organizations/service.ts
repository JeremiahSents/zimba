import "server-only"
import { db } from "@workspace/db"
import {
  findOrganizationDetail,
  listOrganizationsWithStats,
  readOrganizationStats,
  updateOrganizationStatus as updateOrganizationStatusInDb,
} from "@workspace/db/repositories"
import { requirePlatformRole } from "../auth/service"
import { notFound } from "../shared/errors"

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

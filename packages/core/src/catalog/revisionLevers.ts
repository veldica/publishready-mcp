import {
  REVISION_LEVER_CATALOG as LIB_CATALOG,
  type RevisionLeverDefinition,
} from "@veldica/prose-linter";

export const REVISION_LEVER_CATALOG = LIB_CATALOG;

export type RevisionLeverId = keyof typeof REVISION_LEVER_CATALOG;

export function getRevisionLeverDefinition(lever: RevisionLeverId): RevisionLeverDefinition {
  return REVISION_LEVER_CATALOG[lever];
}

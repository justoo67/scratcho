import type { Game } from "@/db/schema";

export type Permission =
  | "game:configure"
  | "game:score"
  | "game:finish"
  | "game:transfer-scorer"
  | "game:correct"
  | "game:view";

/**
 * Returns the set of permissions a player has for a given game.
 * This is checked server-side before any mutation.
 */
export function getPermissions(
  playerId: string,
  game: Game
): Set<Permission> {
  const perms = new Set<Permission>();

  // Everyone can view
  perms.add("game:view");

  const isOwner = game.ownerPlayerId === playerId;
  const isActiveScorer = game.activeScorerPlayerId === playerId;
  const isActive = game.status === "active";
  const isFinished = game.status === "finished";

  if (isOwner) {
    perms.add("game:configure");
    perms.add("game:finish");
    perms.add("game:transfer-scorer");
    if (isFinished) perms.add("game:correct");
  }

  if (isActive && (isOwner || isActiveScorer)) {
    perms.add("game:score");
  }

  return perms;
}

export function assertPermission(
  playerId: string,
  game: Game,
  permission: Permission
) {
  if (!getPermissions(playerId, game).has(permission)) {
    throw new Error(
      `Player ${playerId} does not have permission: ${permission}`
    );
  }
}

"use server";

import { db } from "@/db";
import { runs, runPlayers, games, teams, gamePlayers, statEvents, players } from "@/db/schema";
import { ulid } from "@/lib/ulid";
import { createRunSchema, type CreateRunInput } from "@/lib/validation";
import { eq, and, inArray, desc, sum, count } from "drizzle-orm";

export async function createRun(input: CreateRunInput) {
  const parsed = createRunSchema.parse(input);
  const id = ulid();

  const [run] = await db
    .insert(runs)
    .values({ id, ...parsed })
    .returning();

  // Owner is always a participant
  await db
    .insert(runPlayers)
    .values({ runId: id, playerId: parsed.ownerPlayerId });

  return run;
}

export async function getRun(id: string) {
  return db.query.runs.findFirst({
    where: (r, { eq }) => eq(r.id, id),
  });
}

export async function addPlayerToRun(runId: string, playerId: string) {
  await db
    .insert(runPlayers)
    .values({ runId, playerId })
    .onConflictDoNothing();
}

export async function getRecentRuns(limit = 6) {
  const recentRuns = await db.query.runs.findMany({
    orderBy: [desc(runs.updatedAt), desc(runs.createdAt)],
    limit,
  });

  if (recentRuns.length === 0) return [];

  const runIds = recentRuns.map((r) => r.id);

  const gameCounts = await db
    .select({
      runId: games.runId,
      count: count(games.id),
    })
    .from(games)
    .where(inArray(games.runId, runIds))
    .groupBy(games.runId);

  const countMap = new Map(gameCounts.map((gc) => [gc.runId, gc.count]));

  return recentRuns.map((run) => ({
    ...run,
    gamesCount: countMap.get(run.id) || 0,
  }));
}

export async function getRunHistory(runId: string) {
  const run = await db.query.runs.findFirst({
    where: (r, { eq }) => eq(r.id, runId),
  });

  if (!run) return null;

  const runGames = await db.query.games.findMany({
    where: (g, { eq }) => eq(g.runId, runId),
    orderBy: [desc(games.createdAt)],
  });

  const gameIds = runGames.map((g) => g.id);

  const allTeams =
    gameIds.length > 0
      ? await db.query.teams.findMany({
          where: (t, { inArray }) => inArray(t.gameId, gameIds),
        })
      : [];

  const allGamePlayers =
    gameIds.length > 0
      ? await db.query.gamePlayers.findMany({
          where: (gp, { inArray }) => inArray(gp.gameId, gameIds),
        })
      : [];

  const pointEvents =
    gameIds.length > 0
      ? await db
          .select({
            gameId: statEvents.gameId,
            playerId: statEvents.playerId,
            points: sum(statEvents.value).mapWith(Number),
          })
          .from(statEvents)
          .where(
            and(
              inArray(statEvents.gameId, gameIds),
              eq(statEvents.statId, "PTS"),
              eq(statEvents.voided, false)
            )
          )
          .groupBy(statEvents.gameId, statEvents.playerId)
      : [];

  const playerTeamMap = new Map<string, string>();
  for (const gp of allGamePlayers) {
    playerTeamMap.set(`${gp.gameId}:${gp.playerId}`, gp.teamId);
  }

  const teamScoreMap = new Map<string, number>();
  for (const pe of pointEvents) {
    const teamId = playerTeamMap.get(`${pe.gameId}:${pe.playerId}`);
    if (teamId) {
      const key = `${pe.gameId}:${teamId}`;
      teamScoreMap.set(key, (teamScoreMap.get(key) || 0) + (pe.points || 0));
    }
  }

  const formattedGames = runGames.map((game, index) => {
    const teamsForGame = allTeams.filter((t) => t.gameId === game.id);
    const teamA = teamsForGame[0] || { id: "team-a", name: "Team A" };
    const teamB = teamsForGame[1] || { id: "team-b", name: "Team B" };

    const scoreA = teamScoreMap.get(`${game.id}:${teamA.id}`) || 0;
    const scoreB = teamScoreMap.get(`${game.id}:${teamB.id}`) || 0;

    let winnerId: string | null = null;
    let winnerName: string | null = null;
    if (game.status === "finished") {
      if (scoreA > scoreB) {
        winnerId = teamA.id;
        winnerName = teamA.name;
      } else if (scoreB > scoreA) {
        winnerId = teamB.id;
        winnerName = teamB.name;
      }
    }

    return {
      id: game.id,
      gameNumber: runGames.length - index,
      status: game.status,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      createdAt: game.createdAt,
      teamA: { id: teamA.id, name: teamA.name, score: scoreA },
      teamB: { id: teamB.id, name: teamB.name, score: scoreB },
      winnerId,
      winnerName,
    };
  });

  const totalGames = formattedGames.length;
  const finishedGames = formattedGames.filter((g) => g.status === "finished");

  const teamWins: Record<string, number> = {};
  for (const g of finishedGames) {
    if (g.winnerName) {
      teamWins[g.winnerName] = (teamWins[g.winnerName] || 0) + 1;
    }
  }

  // Fetch regular players for this run
  const regularRunPlayers = await db.query.runPlayers.findMany({
    where: (rp, { eq }) => eq(rp.runId, runId),
  });

  const regularPlayerIds = regularRunPlayers.map((rp) => rp.playerId);
  const regularPlayerDetails =
    regularPlayerIds.length > 0
      ? await db.query.players.findMany({
          where: (p, { inArray }) => inArray(p.id, regularPlayerIds),
        })
      : [];

  return {
    run,
    totalGames,
    finishedGamesCount: finishedGames.length,
    teamWins,
    games: formattedGames,
    regularPlayers: regularPlayerDetails,
  };
}

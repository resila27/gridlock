export type Difficulty = "relaxed" | "clever" | "fierce";
export type Owner = 0 | 1 | 2;
export type PlayedWord = { word: string; owner: 1 | 2 };

export type SavedGame = {
  gameId: string;
  difficulty: Difficulty;
  letters: string[];
  owners: Owner[];
  played: PlayedWord[];
  turn: "you" | "rival" | "done";
  message: string;
  result: "win" | "loss" | "tie" | null;
};

export type AccountUser = { email: string };
export type AccountStats = { completed: number; wins: number };

type ApiResponse<T> = T & { error?: string };

async function request<T>(action: string, init?: RequestInit) {
  const response = await fetch(`/api/index.php?action=${encodeURIComponent(action)}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await response.json() as ApiResponse<T>;
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export function getAccountStatus() {
  return request<{ game: SavedGame | null; stats: AccountStats; user: AccountUser | null }>("status");
}

export function requestLoginCode(email: string) {
  return request<{ ok: true }>("request-code", { body: JSON.stringify({ email }), method: "POST" });
}

export function verifyLoginCode(email: string, code: string) {
  return request<{ game: SavedGame | null; stats: AccountStats; user: AccountUser }>("verify-code", {
    body: JSON.stringify({ code, email }),
    method: "POST",
  });
}

export function saveGame(game: SavedGame) {
  return request<{ game: SavedGame; stats: AccountStats }>("save-game", {
    body: JSON.stringify(game),
    method: "POST",
  });
}

export function logout() {
  return request<{ ok: true }>("logout", { body: "{}", method: "POST" });
}

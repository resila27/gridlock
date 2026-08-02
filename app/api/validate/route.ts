import { FULL_WORDS } from "../../word-list";

const DICTIONARY = new Set(FULL_WORDS);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { word?: unknown };
    const word = typeof body.word === "string" ? body.word.trim().toLowerCase() : "";
    return Response.json({ valid: word.length >= 2 && DICTIONARY.has(word) });
  } catch {
    return Response.json({ valid: false }, { status: 400 });
  }
}

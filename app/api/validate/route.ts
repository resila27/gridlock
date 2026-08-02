import { FULL_WORDS } from "../../word-list";

const DICTIONARY = new Set(FULL_WORDS);

function inflectionRoots(word: string) {
  const roots = new Set<string>();
  const add = (...values: string[]) => values.filter(value => value.length >= 2).forEach(value => roots.add(value));

  if (word.endsWith("ies")) add(`${word.slice(0, -3)}y`);
  if (word.endsWith("es")) add(word.slice(0, -2), word.slice(0, -1));
  if (word.endsWith("s")) add(word.slice(0, -1));
  if (word.endsWith("ied")) add(`${word.slice(0, -3)}y`);
  if (word.endsWith("ed")) {
    const stem = word.slice(0, -2);
    add(stem, `${stem}e`);
    if (stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  if (word.endsWith("ying")) add(`${word.slice(0, -4)}ie`);
  if (word.endsWith("ing")) {
    const stem = word.slice(0, -3);
    add(stem, `${stem}e`);
    if (stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  if (word.endsWith("er")) add(word.slice(0, -2), `${word.slice(0, -1)}e`);
  if (word.endsWith("est")) add(word.slice(0, -3), `${word.slice(0, -2)}e`);
  if (word.endsWith("ly")) add(word.slice(0, -2), `${word.slice(0, -3)}y`);
  if (word.endsWith("ness")) add(word.slice(0, -4), `${word.slice(0, -5)}y`);

  return [...roots];
}

async function foundInLiveDictionary(word: string) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) return false;
    const entries = await response.json() as Array<{ word?: string }>;
    return Array.isArray(entries) && entries.some(entry => entry.word?.toLowerCase() === word);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { word?: unknown };
    const word = typeof body.word === "string" ? body.word.trim().toLowerCase() : "";
    if (!/^[a-z]{2,25}$/.test(word)) return Response.json({ valid: false });

    const localMatch = DICTIONARY.has(word) || inflectionRoots(word).some(root => DICTIONARY.has(root));
    const valid = localMatch || await foundInLiveDictionary(word);
    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false }, { status: 400 });
  }
}

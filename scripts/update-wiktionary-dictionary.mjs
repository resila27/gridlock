import { createGunzip } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourceUrl = "https://kaikki.org/dictionary/downloads/simple/simple-extract.jsonl.gz";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "wiktionary-words.json");
const excludedPartsOfSpeech = new Set([
  "character", "infix", "name", "phrase", "prefix", "proverb", "punct", "suffix", "symbol",
]);
const isPlayableWord = word => typeof word === "string" && /^[a-z]{2,30}$/.test(word);

const response = await fetch(sourceUrl, { headers: { "User-Agent": "Encircle dictionary builder" } });
if (!response.ok || !response.body) throw new Error(`Wiktionary download failed (${response.status}).`);

const words = new Set();
const lines = createInterface({
  crlfDelay: Infinity,
  input: Readable.fromWeb(response.body).pipe(createGunzip()),
});

for await (const line of lines) {
  let entry;
  try { entry = JSON.parse(line); } catch { continue; }
  if (entry.lang_code !== "en" || excludedPartsOfSpeech.has(entry.pos)) continue;
  const candidates = [entry.word, ...(entry.forms ?? []).map(form => form.form)];
  candidates.filter(isPlayableWord).forEach(word => words.add(word));
}

const sorted = [...words].sort();
if (sorted.length < 30000) throw new Error(`Wiktionary dictionary is unexpectedly small (${sorted.length} words).`);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(sorted)}\n`);
console.log(`Wrote ${sorted.length.toLocaleString()} English Wiktionary words and inflections to ${output}.`);

import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "api");
const source = await readFile(path.join(root, "app", "word-list.ts"), "utf8");
const encoded = source.match(/=\s*(\[[\s\S]*\]);\s*$/)?.[1];
if (!encoded) throw new Error("GRIDLOCK dictionary source could not be read.");
const strategySource = await readFile(path.join(root, "app", "strategy-words.ts"), "utf8");
const strategyEncoded = strategySource.match(/`([\s\S]*?)`\.trim\(\)\.split/)?.[1];
if (!strategyEncoded) throw new Error("GRIDLOCK strategy dictionary could not be read.");
const supplementalWords = ["motherboard", "motherboards"];
const words = [...new Set([...JSON.parse(encoded), ...strategyEncoded.trim().split(/\s+/), ...supplementalWords])].sort();
if (!Array.isArray(words) || words.length < 10000) throw new Error("GRIDLOCK dictionary is unexpectedly small.");

await mkdir(path.join(output, "data"), { recursive: true });
await cp(path.join(root, "server", "api"), output, { recursive: true });
await writeFile(path.join(output, "data", "words.json"), JSON.stringify(words));

import { copyFile, readFile, writeFile } from "node:fs/promises";

const artifactPath = "dist/arxiv-dark-mode.js";
let artifact = await readFile(artifactPath, "utf8");

artifact = artifact.replace(
  /^"use strict";\r?\n(?=\/\/ ==UserScript==)/,
  ""
);

if (
  !artifact.startsWith("// ==UserScript==") ||
  !artifact.includes("// ==/UserScript==")
) {
  throw new Error("Generated artifact is missing a leading userscript header");
}

await writeFile(artifactPath, artifact, "utf8");
await copyFile("dist/arxiv-dark-mode.js", "arxiv-dark-mode.js");

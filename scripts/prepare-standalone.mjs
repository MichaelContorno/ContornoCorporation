import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourcePublic = new URL("../public", import.meta.url);
const sourceStatic = new URL("../.next/static", import.meta.url);
const destinationPublic = new URL("../.next/standalone/public", import.meta.url);
const destinationStatic = new URL("../.next/standalone/.next/static", import.meta.url);

await rm(destinationPublic, { recursive: true, force: true });
await rm(destinationStatic, { recursive: true, force: true });
await cp(sourcePublic, destinationPublic, { recursive: true });
await cp(sourceStatic, destinationStatic, { recursive: true });

console.log(`Prepared standalone server assets from ${root}.`);

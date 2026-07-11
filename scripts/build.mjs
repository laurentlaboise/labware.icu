import { cp, mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("public");
const output = resolve("dist");

await stat(source);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

console.log("Built static release in dist/");

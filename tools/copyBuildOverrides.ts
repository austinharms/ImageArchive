import { cpSync } from "fs";
import { join } from "path";

const buildPath = join(__dirname, "../build");
const overridesPath = join(__dirname, "../build_overrides");
console.log(`Copying build overrides from ${overridesPath} to ${buildPath}`);
cpSync(overridesPath, buildPath, { recursive: true, force: true });
console.log("Done");

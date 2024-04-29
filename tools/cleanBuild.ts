import { rmSync } from "fs";
import { join } from "path";

const buildPath = join(__dirname, "../build");
console.log("Deleting build director:", buildPath);
rmSync(buildPath, { recursive: true, force: true });
console.log("Done");

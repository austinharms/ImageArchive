import { cpSync } from "fs";
import { rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const buildPath = join(__dirname, "../build");
const pkgPath = join(__dirname, "../package.json");
const pkgLockPath = join(__dirname, "../package-lock.json");
const pkgBuildPath = join(__dirname, "../build/package.json");
const pkgLockBuildPath = join(__dirname, "../build/package-lock.json");
console.log(`Installing node_modules in ${buildPath}`);
cpSync(pkgPath, pkgBuildPath);
cpSync(pkgLockPath, pkgLockBuildPath);
console.log(execSync("npm install --omit=dev", { cwd: buildPath }).toString());
rmSync(pkgBuildPath);
rmSync(pkgLockBuildPath);
console.log("Done");

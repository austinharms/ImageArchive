import { Service } from "node-windows";
import { join } from "path";

if (process.argv.length < 3 || process.argv[2].toLocaleLowerCase() !== "install" && process.argv[2].toLocaleLowerCase() !== "uninstall") {
    console.error("Unknown arguments, expected install or uninstall");
    process.exit(1);
}

const archiveService = new Service({
    name: "ImageArchiveService",
    description: "Image archive web service",
    script: join(__dirname, "main.js"),
});

archiveService.on("install", () => {
    console.log("ImageArchiveService installed");
    archiveService.start();
});

archiveService.on("alreadyinstalled", () => {
    console.log("ImageArchiveService already installed");
    archiveService.start();
});

archiveService.on("start", () => {
    console.log("ImageArchiveService Running");
});

archiveService.on("stop", () => {
    console.log("ImageArchiveService Stopped");
});

archiveService.on("alreadyuninstalled", () => {
    console.log("ImageArchiveService already uninstalled");
});

archiveService.on("uninstall", () => {
    console.log("ImageArchiveService uninstall");
});

archiveService.on("error", (e) => {
    console.error("Error:", e);
});

if (process.argv[2].toLocaleLowerCase() === "install") {
    archiveService.install();
} else {
    archiveService.uninstall();
}

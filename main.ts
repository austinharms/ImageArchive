import express, { Express, NextFunction, Request, Response } from "express";
import config from "./config";
import { DatabaseService } from "./databaseInterface";
//import { CreateConnection } from "./sqliteDatabase";
import { CreateMemoryDatabase } from "./memoryDatabase";
import { CreateAPIRouter } from "./databaseAPI";
import { mkdir, access } from "fs/promises";
import { existsSync, constants as FS_CONST } from "fs";

(async () => {
    try {
        if (!existsSync(config.IMAGE_PATH)) {
            console.warn(`Image directory dose not exist, Creating: "${config.IMAGE_PATH}"`);
            await mkdir(config.IMAGE_PATH, { recursive: true });
        }

        await access(config.IMAGE_PATH, FS_CONST.W_OK | FS_CONST.R_OK);
    } catch (e) {
        console.error(`Failed to create/access image directory: ${config.IMAGE_PATH}`, e);
        process.exit(1);
    }

    const db: DatabaseService = await CreateMemoryDatabase(); //await CreateConnection(config.SQLITE_PATH);
    const app: Express = express();
    const port: number = config.HTTP_PORT || 80;

    app.use("/api/v1", CreateAPIRouter(db));
    // Redirect to correct base address
    app.get(["/", "/index", "/index.*"], (req: Request, res: Response) => res.redirect("/app"));
    // Hack to allow static middleware to handle the request but, keep the correct URL client side
    app.get(["/app", "/app/*"], (req: Request, res: Response, next: NextFunction) => { req.url = "/index.html"; next(); });
    app.use(express.static("wwwroot"));
    app.use("/image", express.static("images"));
    app.get("/favicon.*", (req: Request, res: Response) => res.sendStatus(204));
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
})();

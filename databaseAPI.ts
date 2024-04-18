import express, { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { ArchiveEntry, CreateArchiveCollectionParams, CreateArchiveEntryParams, DatabaseCollectionInstance, DatabaseEntryInstance, DatabaseService, DefaultArchiveCollectionId, EntrySearchParameters, ValidateCreateArchiveCollectionParams, ValidateCreateArchiveEntryParams } from "./databaseInterface";
import { writeFile, rm } from "fs/promises";
import path from "path";
import config from "./config";

function parseFiniteInt(value: any): number | undefined {
    const val = parseInt(value);
    if (!isNaN(val) && isFinite(val)) {
        return val;
    } else {
        return undefined;
    }
}

function generateImageFilename() {
    return (new Date()).getTime().toString(36) + Math.random().toString(36).substring(2, 15) + Math.random().toString(23).substring(2, 5) + ".png";
}

function getImageFilepath(filename: string) {
    return path.join(config.IMAGE_PATH, filename);
}

function CreateArchiveEntryFromBody(body: any): CreateArchiveEntryParams {
    const entry: CreateArchiveEntryParams = {
        title: body.title,
        description: body.description,
        donor: body.donor,
        yearCreated: body.yearCreated,
        colour: body.colour,
        size: body.size,
        collectionId: parseFiniteInt(body.collectionId)!,
        physicalLocation: body.physicalLocation,
        mediaType: body.mediaType,
    };

    return entry;
}

function CreateArchiveCollectionFromBody(body: any): CreateArchiveCollectionParams {
    const collection: CreateArchiveCollectionParams = {
        name: body.name
    };

    return collection;
}

function CreateEntrySearchParametersFromBody(body: any): EntrySearchParameters {
    const baseSearchParams: EntrySearchParameters = { title: "", description: "", donor: "", mediaType: "", collection: "", ...body };
    const search: EntrySearchParameters = {
        title: baseSearchParams.title,
        description: baseSearchParams.description,
        donor: baseSearchParams.donor,
        mediaType: baseSearchParams.mediaType,
        collection: baseSearchParams.collection,
    };

    return search;
}

export function CreateAPIRouter(database: DatabaseService): Router {
    const multerInstance = multer();
    const imageParser = multerInstance.single("image");
    const fieldParser = multerInstance.none();
    const queryParser = express.urlencoded({ "extended": false, "inflate": true, "limit": "1024kb", "parameterLimit": 10 });
    const router: Router = express.Router();

    router.post("/entry", imageParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const entry = CreateArchiveEntryFromBody(req.body);
        if (ValidateCreateArchiveEntryParams(entry) !== true) {
            res.status(400).send("Bad Request");
            return;
        }

        const collection = await database.getCollection(entry.collectionId);
        if (collection === null) {
            res.status(400).send("Bad Request");
            return;
        }

        if (req.file) {
            entry.file = generateImageFilename();
            await writeFile(getImageFilepath(entry.file), req.file.buffer);
        } else {
            entry.file = "";
        }

        try {
            const dbEntry = await database.createEntry(entry);
            res.status(200).send(JSON.stringify({ ...dbEntry, collection }));
        } catch (e) {
            // Try to clean up file on error
            rm(getImageFilepath(entry.file), { "recursive": false }).catch(e => console.error(`Failed to delete image file: "${getImageFilepath(entry.file!)}"`, e));
            throw e;
        }
    })().catch(next));

    router.get("/entry/:id", (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        if (id === undefined) {
            res.status(400).send("Bad Request");
            return;
        }

        const entry = await database.getEntry(id);
        if (entry === null) {
            res.status(400).send("Bad Request");
        } else {
            const collection = await database.getCollection(entry.collectionId);
            if (!collection) throw new Error("Entry collection was invalid");
            res.status(200).send(JSON.stringify({ ...entry, collection }));
        }
    })().catch(next));

    router.get("/entries", queryParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const count = parseFiniteInt(req.query.count);
        const offset = parseFiniteInt(req.query.offset);
        const entries = await database.getEntries(count, offset);
        const collectionIds = Array.from(new Set(entries.results.map(e => e.collectionId)));
        const collections = (await Promise.all(collectionIds.map(database.getCollection))).reduce((acc: any, col: DatabaseCollectionInstance | null) => {
            if (col == null) throw new Error("Entry collection was invalid");
            acc[col.id] = col;
            return acc;
        }, {});

        entries.results = entries.results.map(entry => ({ ...entry, collection: collections[entry.collectionId] }));
        res.status(200).send(JSON.stringify(entries));
    })().catch(next));

    router.patch("/entry/:id", imageParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        const entry = CreateArchiveEntryFromBody(req.body);
        if (ValidateCreateArchiveEntryParams(entry) !== true || id === undefined) {
            res.status(400).send("Bad Request");
            return;
        }

        const [collection, oldEntry] = await Promise.all([database.getCollection(entry.collectionId), database.getEntry(id)]);
        if (collection === null || oldEntry === null) {
            res.status(400).send("Bad Request");
            return;
        }

        if (req.file) {
            entry.file = generateImageFilename();
            await writeFile(getImageFilepath(entry.file), req.file.buffer);
        } else {
            entry.file = "";
        }

        let dbEntry = null;
        try {
            dbEntry = await database.editEntry(id, entry);
        } catch (e) {
            // Try to clean up file on error
            await rm(getImageFilepath(entry.file), { "recursive": false }).catch(e => console.error(`Failed to delete image file: "${getImageFilepath(entry.file!)}"`, e));
            throw e;
        }

        if (oldEntry.file) {
            // Delete original file that is no longer referenced 
            await rm(getImageFilepath(oldEntry.file), { "recursive": false }).catch(e => console.error(`Failed to delete image file: "${getImageFilepath(oldEntry.file!)}"`, e));
        }

        res.status(200).send(JSON.stringify({ ...dbEntry, collection }));
    })().catch(next));

    router.delete("/entry/:id", (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        if (id === undefined) {
            res.status(400).send("Bad Request");
            return;
        }

        const entry = await database.getEntry(id);
        if (entry === null) {
            res.status(400).send("Bad Request");
            return;
        }

        await database.deleteEntry(id);
        if (entry.file) {
            await rm(getImageFilepath(entry.file), { "recursive": false }).catch(e => console.error(`Failed to delete image file: "${getImageFilepath(entry.file!)}"`, e));
        }

        res.status(200).send("ok");
    })().catch(next));

    router.post("/collection", fieldParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const collection = CreateArchiveCollectionFromBody(req.body);
        if (ValidateCreateArchiveCollectionParams(collection) !== true) {
            res.status(400).send("Bad Request");
            return;
        }

        const dbCollection = await database.createCollection(collection);
        res.status(200).send(JSON.stringify(dbCollection));
    })().catch(next));

    router.get("/collection/:id", (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        if (id === undefined) {
            res.status(400).send("Bad Request");
            return;
        }

        const collection = await database.getCollection(id);
        if (collection === null) {
            res.status(400).send("Bad Request");
        } else {
            res.status(200).send(JSON.stringify(collection));
        }
    })().catch(next));

    router.get("/collections", queryParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const count = parseFiniteInt(req.query.count);
        const offset = parseFiniteInt(req.query.offset);
        const collections = await database.getCollections(count, offset);
        res.status(200).send(JSON.stringify(collections));
    })().catch(next));

    router.patch("/collection/:id", (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        const collection = CreateArchiveCollectionFromBody(req.body);
        if (ValidateCreateArchiveCollectionParams(collection) !== true || id === undefined) {
            res.status(400).send("Bad Request");
            return;
        }

        const oldCollection = await database.getCollection(id);
        if (oldCollection === null) {
            res.status(400).send("Bad Request");
            return;
        }

        const dbCollection = await database.editCollection(id, collection);
        res.status(200).send(JSON.stringify(dbCollection));
    })().catch(next));

    router.delete("/collection/:id", (req: Request, res: Response, next: NextFunction) => (async () => {
        const id = parseFiniteInt(req.params.id);
        if (id === undefined || id == DefaultArchiveCollectionId) {
            res.status(400).send("Bad Request");
            return;
        }

        await database.deleteCollection(id);
        res.status(200).send("ok");
    })().catch(next));

    router.get("/search", queryParser, (req: Request, res: Response, next: NextFunction) => (async () => {
        const count = parseFiniteInt(req.query.count);
        const offset = parseFiniteInt(req.query.offset);
        const search = CreateEntrySearchParametersFromBody(req.query);
        const entries = await database.searchEntries(search, count, offset);
        const collectionIds = Array.from(new Set(entries.results.map(e => e.collectionId)));
        const collections = (await Promise.all(collectionIds.map(database.getCollection))).reduce((acc: any, col: DatabaseCollectionInstance | null) => {
            if (col == null) throw new Error("Entry collection was invalid");
            acc[col.id] = col;
            return acc;
        }, {});

        entries.results = entries.results.map(entry => ({ ...entry, collection: collections[entry.collectionId] }));
        res.status(200).send(JSON.stringify(entries));
    })().catch(next));

    return router;
};

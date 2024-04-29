import { ArchiveCollection, ArchiveCollectionId, ArchiveEntry, ArchiveEntryId, ArchiveCollectionParams, ArchiveEntryParams, DatabaseService, DefaultArchiveCollectionId, ArchiveSearchParameters, ResultArray, ValidateArchiveCollectionParams, ValidateArchiveEntryParams } from "./databaseInterface";
import Database from "better-sqlite3";

export async function CreateConnection(path: string): Promise<DatabaseService> {
    const db = new Database(path);
    const flushWAL = () => {
        try {
            db.pragma(`wal_checkpoint(RESTART)`);
        } catch(e) {
            console.error("Failed to flush WAL:", e)
        }
    };

    // This should sync the WAL after a transaction but, does not?
    // TODO Find out why this does not behave as expected
    db.pragma(`synchronous = 2`);
    db.pragma(`journal_mode = WAL`);
    db.transaction(() => {
        // Ensure tables exist
        db.prepare(`CREATE TABLE IF NOT EXISTS collection (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, dateCreated TEXT)`).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS entry ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, donor TEXT, yearCreated TEXT, colour TEXT, size TEXT, collectionId INTEGER NOT NULL, physicalLocation TEXT, mediaType TEXT, image TEXT, accessionNumber TEXT, dateAdded TEXT NOT NULL, dateLastModified TEXT NOT NULL, FOREIGN KEY(collectionId) REFERENCES collection(id))`).run();
        // Ensure default collection exits and has expected name
        db.prepare(`INSERT OR IGNORE INTO collection (id, name, dateCreated) VALUES (0, 'None', '${new Date().toISOString()}')`).run();
        db.prepare(`UPDATE collection SET name = 'None' WHERE id=0`).run();
    }).immediate();
    // Ensure all changes are flushed to the .sqlite file
    flushWAL();
    // Flush the WAL every hour
    setInterval(flushWAL, 3600000);
    const service: DatabaseService = {
        createEntry: async (entry: ArchiveEntryParams): Promise<ArchiveEntry> => {
            const validation = ValidateArchiveEntryParams(entry);
            if (validation !== true) throw validation;
            const dbEntry: ArchiveEntry = {
                id: NaN,
                title: entry.title,
                description: entry.description,
                donor: entry.donor,
                yearCreated: entry.yearCreated,
                colour: entry.colour,
                size: entry.size,
                collectionId: entry.collectionId,
                physicalLocation: entry.physicalLocation,
                mediaType: entry.mediaType,
                image: entry.image || "",
                accessionNumber: entry.accessionNumber,
                dateAdded: new Date().toISOString(),
                dateLastModified: new Date().toISOString(),
            };

            const results = db.transaction(() => db.prepare(`INSERT INTO entry (title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image, accessionNumber, dateAdded, dateLastModified) VALUES (@title, @description, @donor, @yearCreated, @colour, @size, @collectionId, @physicalLocation, @mediaType, @image, @accessionNumber, @dateAdded, @dateLastModified)`).run(dbEntry))();
            return (await service.getEntry(results.lastInsertRowid as ArchiveEntryId))!;
        },
        editEntry: async (id: ArchiveEntryId, entry: ArchiveEntryParams): Promise<ArchiveEntry> => {
            const dbEntry: ArchiveEntry = {
                id,
                title: entry.title,
                description: entry.description,
                donor: entry.donor,
                yearCreated: entry.yearCreated,
                colour: entry.colour,
                size: entry.size,
                collectionId: entry.collectionId,
                physicalLocation: entry.physicalLocation,
                mediaType: entry.mediaType,
                image: entry.image || "",
                accessionNumber: entry.accessionNumber,
                dateLastModified: new Date().toISOString(),
                dateAdded: "",
            };
            db.transaction(() => db.prepare(`UPDATE entry SET title = @title, description = @description, donor = @donor, yearCreated = @yearCreated, colour = @colour, size = @size, collectionId = @collectionId, physicalLocation = @physicalLocation, mediaType = @mediaType, image = @image, accessionNumber = @accessionNumber, dateLastModified = @dateLastModified WHERE id = @id`).run(dbEntry))();
            return (await service.getEntry(id))!;
        },
        deleteEntry: async (id: ArchiveEntryId): Promise<void> => {
            db.transaction(() => db.prepare(`DELETE FROM entry WHERE id = @id`).run({ id }))();
        },
        getEntry: async (id: ArchiveEntryId): Promise<ArchiveEntry | null> => {
            const results: any = db.prepare(`SELECT * FROM entry WHERE id = @id`).get({ id });
            if (results) {
                return {
                    id: results.id,
                    title: results.title,
                    description: results.description,
                    donor: results.donor,
                    yearCreated: results.yearCreated,
                    colour: results.colour,
                    size: results.size,
                    collectionId: results.collectionId,
                    physicalLocation: results.physicalLocation,
                    mediaType: results.mediaType,
                    image: results.image,
                    dateAdded: results.dateAdded,
                    dateLastModified: results.dateLastModified,
                    accessionNumber: results.accessionNumber,
                };
            } else {
                return null;
            }
        },
        getEntries: async (count: number = Infinity, offset: number = 0): Promise<ResultArray<ArchiveEntry>> => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const entries = db.prepare(`SELECT * FROM entry LIMIT @count OFFSET @offset`).all({ count, offset }).map((res: any): ArchiveEntry => ({
                id: res.id,
                title: res.title,
                description: res.description,
                donor: res.donor,
                yearCreated: res.yearCreated,
                colour: res.colour,
                size: res.size,
                collectionId: res.collectionId,
                physicalLocation: res.physicalLocation,
                mediaType: res.mediaType,
                image: res.image,
                dateAdded: res.dateAdded,
                dateLastModified: res.dateLastModified,
                accessionNumber: res.accessionNumber,
            }));
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM entry`).get() as { COUNT: number };
            const results: ResultArray<ArchiveEntry> = { totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
        searchEntries: async (params: ArchiveSearchParameters, count: number = Infinity, offset: number = 0): Promise<ResultArray<ArchiveEntry>> => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            // TODO This search can be better optimized/performed, Use FTS5 full text searching?, don't perform search query twice?
            const entries = db.prepare(`SELECT entry.id AS id, entry.title AS title, entry.description AS description, entry.donor AS donor, entry.yearCreated AS yearCreated, entry.colour AS colour, entry.size AS size, entry.collectionId AS collectionId, entry.physicalLocation AS physicalLocation, entry.mediaType AS mediaType, entry.image AS image, entry.accessionNumber AS accessionNumber, entry.dateAdded AS dateAdded, entry.dateLastModified AS dateLastModified, collection.name as collection FROM entry INNER JOIN collection ON collection.id = entry.collectionId WHERE ${params.title ? "title LIKE @title AND " : ""} ${params.description ? "description LIKE @description AND " : ""} ${params.donor ? "donor LIKE @donor AND " : ""} ${params.mediaType ? "mediaType LIKE @mediaType AND " : ""} ${params.collection ? "collection LIKE @collection AND " : ""} 1 = 1 LIMIT @count OFFSET @offset`).all({
                title: `%${params.title}%`,
                description: `%${params.description}%`,
                donor: `%${params.donor}%`,
                mediaType: `%${params.mediaType}%`,
                collection: `%${params.collection}%`,
                count,
                offset
            }).map((res: any): ArchiveEntry => ({
                id: res.id,
                title: res.title,
                description: res.description,
                donor: res.donor,
                yearCreated: res.yearCreated,
                colour: res.colour,
                size: res.size,
                collectionId: res.collectionId,
                physicalLocation: res.physicalLocation,
                mediaType: res.mediaType,
                image: res.image,
                dateAdded: res.dateAdded,
                dateLastModified: res.dateLastModified,
                accessionNumber: res.accessionNumber,
            }));
            const totalCount = db.prepare(`SELECT COUNT(*) as COUNT, collection.name as collection FROM entry INNER JOIN collection ON collection.id = entry.collectionId WHERE ${params.title ? "title LIKE @title AND " : ""} ${params.description ? "description LIKE @description AND " : ""} ${params.donor ? "donor LIKE @donor AND " : ""} ${params.mediaType ? "mediaType LIKE @mediaType AND " : ""} ${params.collection ? "collection LIKE @collection AND " : ""} 1 = 1`).get({
                title: `%${params.title}%`,
                description: `%${params.description}%`,
                donor: `%${params.donor}%`,
                mediaType: `%${params.mediaType}%`,
                collection: `%${params.collection}%`,
            }) as { COUNT: number };
            const results: ResultArray<ArchiveEntry> = { totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
        createCollection: async (collection: ArchiveCollectionParams): Promise<ArchiveCollection> => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            const dbCollection: ArchiveCollection = {
                id: NaN,
                name: collection.name,
                dateCreated: new Date().toISOString(),
            };
            const results = db.transaction(() => db.prepare(`INSERT INTO collection (name, dateCreated) VALUES (@name, @dateCreated)`).run(dbCollection))();
            return (await service.getCollection(results.lastInsertRowid as ArchiveCollectionId))!;
        },
        editCollection: async (id: ArchiveCollectionId, collection: ArchiveCollectionParams): Promise<ArchiveCollection> => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            const dbCollection: ArchiveCollection = {
                id,
                name: collection.name,
                dateCreated: "",
            };
            db.transaction(() => db.prepare(`UPDATE collection SET name = @name WHERE id = @id`).run(dbCollection))();
            return (await service.getCollection(id))!;
        },
        deleteCollection: async (id: ArchiveCollectionId): Promise<void> => {
            db.transaction(() => {
                db.prepare(`UPDATE entry SET collectionId = @defaultId WHERE collectionId = @id`).run({
                    defaultId: DefaultArchiveCollectionId,
                    id
                });
                db.prepare(`DELETE FROM collection WHERE id = @id`).run({ id });
            })();
        },
        getCollection: async (id: ArchiveCollectionId): Promise<ArchiveCollection | null> => {
            const results: any = db.prepare(`SELECT * FROM collection WHERE id = @id`).get({ id });
            if (results) {
                return {
                    id: results.id,
                    name: results.name,
                    dateCreated: results.dateCreated,
                };
            } else {
                return null;
            }
        },
        getCollections: async (count: number = Infinity, offset: number = 0): Promise<ResultArray<ArchiveCollection>> => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const collections = db.prepare(`SELECT * FROM collection LIMIT @count OFFSET @offset`).all({ count, offset }).map((res: any): ArchiveCollection => ({
                id: res.id,
                name: res.name,
                dateCreated: res.dateCreated,
            }));
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM collection`).get() as { COUNT: number };
            const results: ResultArray<ArchiveCollection> = { totalResultCount: totalCount.COUNT, resultCount: collections.length, resultOffset: offset, results: collections };
            return results;
        },
        getEntriesByCollection: async (id: ArchiveCollectionId, count: number = Infinity, offset: number = 0): Promise<ResultArray<ArchiveEntry>> => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const entries = db.prepare(`SELECT * FROM entry WHERE collectionId = @id LIMIT @count OFFSET @offset`).all({ id, count, offset }).map((res: any): ArchiveEntry => ({
                id: res.id,
                title: res.title,
                description: res.description,
                donor: res.donor,
                yearCreated: res.yearCreated,
                colour: res.colour,
                size: res.size,
                collectionId: res.collectionId,
                physicalLocation: res.physicalLocation,
                mediaType: res.mediaType,
                image: res.image,
                dateAdded: res.dateAdded,
                dateLastModified: res.dateLastModified,
                accessionNumber: res.accessionNumber,
            }));
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM entry WHERE collectionId = @id`).get({ id }) as { COUNT: number };
            const results: ResultArray<ArchiveEntry> = { totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
    };

    return service;
};
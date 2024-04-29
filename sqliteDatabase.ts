import { ArchiveCollection, ArchiveCollectionId, ArchiveEntry, ArchiveEntryId, ArchiveCollectionParams, ArchiveEntryParams, DatabaseService, DefaultArchiveCollectionId, ArchiveSearchParameters, ResultArray, ValidateArchiveCollectionParams, ValidateArchiveEntryParams } from "./databaseInterface";
import Database from "better-sqlite3";

export async function CreateConnection(path: string): Promise<DatabaseService> {
    const db = new Database(path);
    db.pragma("journal_mode = WAL");
    // Ensure tables exist
    db.prepare(`CREATE TABLE IF NOT EXISTS collection (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, dateCreated TEXT)`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS entry ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, donor TEXT, yearCreated TEXT, colour TEXT, size TEXT, collectionId INTEGER NOT NULL, physicalLocation TEXT, mediaType TEXT, image TEXT, dateAdded TEXT NOT NULL, dateLastModified TEXT NOT NULL, FOREIGN KEY(collectionId) REFERENCES collection(id))`).run();
    // Ensure default collection exits and has expected name
    db.prepare(`INSERT OR IGNORE INTO collection (id, name, dateCreated) VALUES (0, 'None', '${new Date().toISOString()}')`).run();
    db.prepare(`UPDATE collection SET name = 'None' WHERE id=0`).run();
    const service: DatabaseService = {
        createEntry: async (entry: ArchiveEntryParams) => {
            const validation = ValidateArchiveEntryParams(entry);
            if (validation !== true) throw validation;
            const results = db.prepare(`INSERT INTO entry (title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image, dateAdded, dateLastModified) VALUES (@title, @description, @donor, @yearCreated, @colour, @size, @collectionId, @physicalLocation, @mediaType, @image, @dateAdded, @dateLastModified)`).run({
                ...entry,
                dateAdded: new Date().toISOString(),
                dateLastModified: new Date().toISOString(),
            });
            return (await service.getEntry(results.lastInsertRowid as ArchiveEntryId))!;
        },
        editEntry: async (id: ArchiveEntryId, entry: ArchiveEntryParams) => {
            db.prepare(`UPDATE entry SET title = @title, description = @description, donor = @donor, yearCreated = @yearCreated, colour = @colour, size = @size, collectionId = @collectionId, physicalLocation = @physicalLocation, mediaType = @mediaType, image = @image, dateLastModified = @dateLastModified WHERE id = @id`).run({
                ...entry,
                dateLastModified: new Date().toISOString(),
                id
            });
            return (await service.getEntry(id))!;
        },
        deleteEntry: async (id: ArchiveEntryId) => {
            db.prepare(`DELETE FROM entry WHERE id = @id`).run({id});
        },
        getEntry: async (id: ArchiveEntryId) => {
            return db.prepare(`SELECT * FROM entry WHERE id = @id`).get({ id }) as ArchiveEntry;
        },
        getEntries: async (count: number = Infinity, offset: number = 0) => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const entries = db.prepare(`SELECT * FROM entry LIMIT @count OFFSET @offset`).all({ count, offset }) as Array<ArchiveEntry>;
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM entry`).get() as { COUNT: number };
            const results: ResultArray<ArchiveEntry> = { totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
        searchEntries: async (params: ArchiveSearchParameters, count: number = Infinity, offset: number = 0) => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            // TODO This search can be better optimized/performed, Use FTS5 full text searching?, don't perform search query twice?
            const entries = db.prepare(`SELECT entry.id AS id, entry.title AS title, entry.description AS description, entry.donor AS donor, entry.yearCreated AS yearCreated, entry.colour AS colour, entry.size AS size, entry.collectionId AS collectionId, entry.physicalLocation AS physicalLocation, entry.mediaType AS mediaType, entry.image AS image, entry.dateAdded AS dateAdded, entry.dateLastModified AS dateLastModified, collection.name as collection FROM entry INNER JOIN collection ON collection.id = entry.collectionId WHERE ${params.title?"title LIKE @title AND ":""} ${params.description?"description LIKE @description AND ":""} ${params.donor?"donor LIKE @donor AND ":""} ${params.mediaType?"mediaType LIKE @mediaType AND ":""} ${params.collection?"collection LIKE @collection AND ":""} 1 = 1 LIMIT @count OFFSET @offset`).all({
                title: `%${params.title}%`,
                description: `%${params.description}%`,
                donor: `%${params.donor}%`,
                mediaType: `%${params.mediaType}%`,
                collection: `%${params.collection}%`,
                count,
                offset
            }) as Array<ArchiveEntry>;
            const totalCount = db.prepare(`SELECT COUNT(*) as COUNT, collection.name as collection FROM entry INNER JOIN collection ON collection.id = entry.collectionId WHERE ${params.title?"title LIKE @title AND ":""} ${params.description?"description LIKE @description AND ":""} ${params.donor?"donor LIKE @donor AND ":""} ${params.mediaType?"mediaType LIKE @mediaType AND ":""} ${params.collection?"collection LIKE @collection AND ":""} 1 = 1`).get({
                title: `%${params.title}%`,
                description: `%${params.description}%`,
                donor: `%${params.donor}%`,
                mediaType: `%${params.mediaType}%`,
                collection: `%${params.collection}%`,
            }) as {COUNT: number};
            const results: ResultArray<ArchiveEntry> = {  totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
        createCollection: async (collection: ArchiveCollectionParams) => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            const results = db.prepare(`INSERT INTO collection (name, dateCreated) VALUES (@name, @dateCreated)`).run({
                ...collection,
                dateCreated: new Date().toISOString(),
            });
            return (await service.getCollection(results.lastInsertRowid as ArchiveCollectionId))!;
        },
        editCollection: async (id: ArchiveCollectionId, collection: ArchiveCollectionParams) => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            db.prepare(`UPDATE collection SET name = @name WHERE id = @id`).run({
                ...collection,
                id
            });
            return (await service.getCollection(id))!;
        },
        deleteCollection: async (id: ArchiveCollectionId) => {
            db.prepare(`UPDATE entry SET collectionId = @defaultId WHERE collectionId = @id`).run({
                defaultId: DefaultArchiveCollectionId,
                id
            });
            db.prepare(`DELETE FROM collection WHERE id = @id`).run({id});
        },
        getCollection: async (id: ArchiveCollectionId) => {
            return db.prepare(`SELECT * FROM collection WHERE id = @id`).get({ id }) as ArchiveCollection;
        },
        getCollections: async (count: number = Infinity, offset: number = 0) => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const collections = db.prepare(`SELECT * FROM collection LIMIT @count OFFSET @offset`).all({ count, offset }) as Array<ArchiveCollection>;
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM collection`).get() as { COUNT: number };
            const results: ResultArray<ArchiveCollection> = { totalResultCount: totalCount.COUNT, resultCount: collections.length, resultOffset: offset, results: collections };
            return results;
        },
        getEntriesByCollection: async (id: ArchiveCollectionId, count: number = Infinity, offset: number = 0) => {
            offset = isFinite(offset) && offset >= 0 ? offset : 0;
            count = isFinite(count) && count >= 0 ? count : -1;
            const entries = db.prepare(`SELECT * FROM entry WHERE collectionId = @id LIMIT @count OFFSET @offset`).all({ id, count, offset }) as Array<ArchiveEntry>;
            const totalCount = db.prepare(`SELECT COUNT(*) AS COUNT FROM entry WHERE collectionId = @id`).get({ id }) as { COUNT: number };
            const results: ResultArray<ArchiveEntry> = { totalResultCount: totalCount.COUNT, resultCount: entries.length, resultOffset: offset, results: entries };
            return results;
        },
    };

    return service;
};
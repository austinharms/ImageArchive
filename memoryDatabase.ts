import { ArchiveCollection, ArchiveCollectionId, ArchiveEntry, ArchiveEntryId, ArchiveCollectionParams, ArchiveEntryParams, DatabaseService, DefaultArchiveCollectionId, ArchiveSearchParameters, ResultArray, ValidateArchiveCollectionParams, ValidateArchiveEntryParams } from "./databaseInterface";

export async function CreateMemoryDatabase(): Promise<DatabaseService> {
    let entryIdCounter: ArchiveEntryId = 0;
    let collectionIdCounter: ArchiveCollectionId = 0;
    const entries: { [key: ArchiveEntryId]: ArchiveEntry } = {};
    const collections: { [key: ArchiveCollectionId]: ArchiveCollection } = { [DefaultArchiveCollectionId]: { name: "None", dateCreated: new Date(), id: DefaultArchiveCollectionId } };

    const service: DatabaseService = {
        createEntry: async (entry: ArchiveEntryParams) => {
            const validation = ValidateArchiveEntryParams(entry);
            if (validation !== true) throw validation;
            const newEntry: ArchiveEntry = { ...entry, id: ++entryIdCounter, dateAdded: new Date(), dateLastModified: new Date(), image: entry.image || "" };
            if (!collections[newEntry.collectionId]) throw new Error("Collection does not exist");
            entries[newEntry.id] = newEntry;
            return newEntry;
        },
        editEntry: async (id: ArchiveEntryId, entry: ArchiveEntryParams) => {
            const validation = ValidateArchiveEntryParams(entry);
            if (validation !== true) throw validation;
            const oldEntry: ArchiveEntry = entries[id];
            if (!oldEntry) throw new Error("Entry does not exist");
            const newEntry: ArchiveEntry = { ...oldEntry, ...entry };
            if (!collections[newEntry.collectionId]) throw new Error("Collection does not exist");
            entries[id] = newEntry;
            return newEntry;
        },
        deleteEntry: async (id: ArchiveEntryId) => {
            delete entries[id];
        },
        getEntry: async (id: ArchiveEntryId) => {
            return entries[id] || null;
        },
        getEntries: async (count: number = Infinity, offset: number = 0) => {
            const entryArr: Array<ArchiveEntry>  = Object.values(entries);
            const resultOffset = Math.min(offset, entryArr.length);
            const resultCount = Math.min(count, entryArr.length - resultOffset);
            const results: ResultArray<ArchiveEntry> = {  totalResultCount: entryArr.length, resultCount, resultOffset, results: entryArr.slice(resultOffset, resultCount + resultOffset) };
            return results;
        },
        searchEntries: async (params: ArchiveSearchParameters, count: number = Infinity, offset: number = 0) => {
            const entryArr: Array<ArchiveEntry>  = Object.values(entries).filter((entry: ArchiveEntry) => entry.title.includes(params.title) &&  entry.description.includes(params.description) && entry.donor.includes(params.donor) && entry.mediaType.includes(params.mediaType) && collections[entry.collectionId] && collections[entry.collectionId].name.includes(params.collection));
            const resultOffset = Math.min(offset, entryArr.length);
            const resultCount = Math.min(count, entryArr.length - resultOffset);
            const results: ResultArray<ArchiveEntry> = {  totalResultCount: entryArr.length, resultCount, resultOffset, results: entryArr.slice(resultOffset, resultCount + resultOffset) };
            return results;
        },
        createCollection: async (collection: ArchiveCollectionParams) => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            const newCollection: ArchiveCollection = { ...collection, id: ++collectionIdCounter, dateCreated: new Date() };
            collections[newCollection.id] = newCollection;
            return newCollection;
        },
        editCollection: async (id: ArchiveCollectionId, collection: ArchiveCollectionParams) => {
            const validation = ValidateArchiveCollectionParams(collection);
            if (validation !== true) throw validation;
            const oldCollection: ArchiveCollection = collections[id];
            if (!oldCollection) throw new Error("Collection does not exist");
            const newCollection: ArchiveCollection = { ...oldCollection, ...collection };
            collections[id] = newCollection;
            return newCollection;
        },
        deleteCollection: async (id: ArchiveCollectionId) => {
            Object.values(entries).forEach(e => service.editEntry(id, { ...e, collectionId: DefaultArchiveCollectionId }));
            delete collections[id];
        },
        getCollection: async (id: ArchiveCollectionId) => {
            return collections[id] || null;
        },
        getCollections: async (count: number = Infinity, offset: number = 0) => {
            const colArr: Array<ArchiveCollection>  = Object.values(collections);
            const resultOffset = Math.min(offset, colArr.length);
            const resultCount = Math.min(count, colArr.length - resultOffset);
            const results: ResultArray<ArchiveCollection> = {  totalResultCount: colArr.length, resultCount, resultOffset, results: colArr.slice(resultOffset, resultCount + resultOffset) };
            return results;
        },
        getEntriesByCollection: async (id: ArchiveCollectionId, count: number = Infinity, offset: number = 0) => {
            const entryArr: Array<ArchiveEntry>  = Object.values(entries).filter(e => e.collectionId === id);
            const resultOffset = Math.min(offset, entryArr.length);
            const resultCount = Math.min(count, entryArr.length - resultOffset);
            const results: ResultArray<ArchiveEntry> = {  totalResultCount: entryArr.length, resultCount, resultOffset, results: entryArr.slice(resultOffset, resultCount + resultOffset) };
            return results;
        },
    };

    return service;
};
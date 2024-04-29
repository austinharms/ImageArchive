export type ArchiveEntryId = number;
export type ArchiveCollectionId = number;
export const DefaultArchiveCollectionId: ArchiveCollectionId = 0;

export interface ArchiveCollectionParams {
    name: string,
};

export interface ArchiveCollection {
    readonly id: ArchiveCollectionId,
    readonly name: string
    readonly dateCreated: string,
};

export interface ArchiveEntryParams {
    title: string,
    description: string,
    donor: string,
    yearCreated: string,
    colour: string,
    size: string,
    collectionId: ArchiveCollectionId,
    physicalLocation: string,
    mediaType: string,
    image?: string,
};

export interface ArchiveEntry {
    readonly id: ArchiveEntryId,
    readonly title: string,
    readonly description: string,
    readonly donor: string,
    readonly yearCreated: string,
    readonly colour: string,
    readonly size: string,
    readonly collectionId: ArchiveCollectionId,
    readonly physicalLocation: string,
    readonly mediaType: string,
    readonly image: string,
    readonly dateAdded: string,
    readonly dateLastModified: string,
};

export interface ArchiveSearchParameters {
    title: string,
    description: string,
    donor: string,
    mediaType: string,
    collection: string,
};

export interface ResultArray<T> {
    totalResultCount: number,
    resultOffset: number,
    resultCount: number,
    results: Array<T>,
};

function ValidateParam(object: any, key: string, expectedType: string, allowFalsy: boolean = false) {
    if (typeof(object[key]) !== expectedType) throw new Error(`${key} has invalid type`);
    if (!allowFalsy && !object[key] || expectedType === "number" && !isFinite(object[key])) throw new Error(`${key} has invalid value`);
}

export function ValidateArchiveCollectionParams(params: ArchiveCollectionParams) : true | Error {
    try {
        ValidateParam(params, "name", "string");
        return true;
    } catch(e) {
        return e as Error;
    }
};

export function ValidateArchiveEntryParams(params: ArchiveEntryParams) : true | Error {
    try {
        ValidateParam(params, "collectionId", "number", true);
        ValidateParam(params, "colour", "string", true);
        ValidateParam(params, "description", "string");
        ValidateParam(params, "donor", "string", true);
        ValidateParam(params, "mediaType", "string", true);
        ValidateParam(params, "physicalLocation", "string", true);
        ValidateParam(params, "size", "string", true);
        ValidateParam(params, "title", "string");
        ValidateParam(params, "yearCreated", "string", true);
        return true;
    } catch(e) {
        return e as Error;
    }
};

export interface DatabaseService {
    createEntry: (entry: ArchiveEntryParams) => Promise<ArchiveEntry>,
    editEntry: (id: ArchiveEntryId, entry: ArchiveEntryParams) => Promise<ArchiveEntry>,
    deleteEntry: (id: ArchiveEntryId) => Promise<void>,
    getEntry: (id: ArchiveEntryId) => Promise<ArchiveEntry | null>,
    // count is expected to default to the total number of entries and offset should be 0 
    getEntries: (count?: number, offset?: number) => Promise<ResultArray<ArchiveEntry>>,
    // count is expected to default to the total number of entries and offset should be 0 
    searchEntries: (params: ArchiveSearchParameters, count?: number, offset?: number) => Promise<ResultArray<ArchiveEntry>>,
    createCollection: (collection: ArchiveCollectionParams) => Promise<ArchiveCollection>,
    editCollection: (id: ArchiveCollectionId, collection: ArchiveCollectionParams) => Promise<ArchiveCollection>,
    deleteCollection: (id: ArchiveCollectionId) => Promise<void>,
    getCollection: (id: ArchiveCollectionId) => Promise<ArchiveCollection | null>,
    // count is expected to default to the total number of entries and offset should be 0 
    getCollections: (count?: number, offset?: number) => Promise<ResultArray<ArchiveCollection>>,
    getEntriesByCollection: (id: ArchiveCollectionId, count?: number, offset?: number) => Promise<ResultArray<ArchiveEntry>>,
};

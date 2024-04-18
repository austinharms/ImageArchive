export type ArchiveEntryId = number;
export type ArchiveCollectionId = number;
export const DefaultArchiveCollectionId: ArchiveCollectionId = 0;

export interface CreateArchiveCollectionParams {
    name: string,
};

export interface DatabaseCollectionInstance extends CreateArchiveCollectionParams {
    id: ArchiveCollectionId,
    dateCreated: Date,
};

export type ArchiveCollection = Readonly<DatabaseCollectionInstance>;

export interface CreateArchiveEntryParams {
    title: string,
    description: string,
    donor: string,
    yearCreated: string,
    colour: string,
    size: string,
    collectionId: ArchiveCollectionId,
    physicalLocation: string,
    mediaType: string,
    file?: string,
};

export interface DatabaseEntryInstance extends CreateArchiveEntryParams {
    id: ArchiveEntryId,
    file: string,
    dateAdded: Date,
    dateLastModified: Date,
};

export type ArchiveEntry = Readonly<DatabaseEntryInstance>;

export interface EntrySearchParameters {
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

export function ValidateCreateArchiveCollectionParams(params: CreateArchiveCollectionParams) : true | Error {
    try {
        ValidateParam(params, "name", "string");
        return true;
    } catch(e) {
        return e as Error;
    }
};

export function ValidateCreateArchiveEntryParams(params: CreateArchiveEntryParams) : true | Error {
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
    createEntry: (entry: CreateArchiveEntryParams) => Promise<ArchiveEntry>,
    editEntry: (id: ArchiveEntryId, entry: CreateArchiveEntryParams) => Promise<ArchiveEntry>,
    deleteEntry: (id: ArchiveEntryId) => Promise<void>,
    getEntry: (id: ArchiveEntryId) => Promise<ArchiveEntry | null>,
    // count is expected to default to the total number of entries and offset should be 0 
    getEntries: (count?: number, offset?: number) => Promise<ResultArray<ArchiveEntry>>,
    // count is expected to default to the total number of entries and offset should be 0 
    searchEntries: (params: EntrySearchParameters, count?: number, offset?: number) => Promise<ResultArray<ArchiveEntry>>,
    createCollection: (collection: CreateArchiveCollectionParams) => Promise<ArchiveCollection>,
    editCollection: (id: ArchiveCollectionId, collection: CreateArchiveCollectionParams) => Promise<ArchiveCollection>,
    deleteCollection: (id: ArchiveCollectionId) => Promise<void>,
    getCollection: (id: ArchiveCollectionId) => Promise<ArchiveCollection | null>,
    // count is expected to default to the total number of entries and offset should be 0 
    getCollections: (count?: number, offset?: number) => Promise<ResultArray<ArchiveCollection>>,
};

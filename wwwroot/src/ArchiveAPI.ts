export type ArchiveEntryId = number;
export type ArchiveCollectionId = number;
export const DefaultArchiveCollectionId: ArchiveCollectionId = 0;

export interface ArchiveCollectionParams {
    name: string,
};

export const EmptyArchiveCollectionParams: Readonly<ArchiveCollectionParams> = {
    name: "",
};

export interface ArchiveCollection {
    readonly id: ArchiveCollectionId,
    readonly name: string
    readonly dateCreated: Date,
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
    image?: File,
};

export const EmptyArchiveEntryParams: Readonly<ArchiveEntryParams> = {
    title: "",
    description: "",
    donor: "",
    yearCreated: "",
    colour: "",
    size: "",
    collectionId: 0,
    physicalLocation: "",
    mediaType: "",
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
    readonly collection: ArchiveCollection
};

export interface ArchiveSearchParameters {
    title: string,
    description: string,
    donor: string,
    mediaType: string,
    collection: string,
};

export const EmptyArchiveSearchParameters: Readonly<ArchiveSearchParameters> = {
    title: "",
    description: "",
    donor: "",
    mediaType: "",
    collection: ""
};

export interface ResultArray<T> {
    totalResultCount: number,
    resultOffset: number,
    resultCount: number,
    results: Array<T>,
};

export const EmptyResultArray: Readonly<ResultArray<any>> = {
    totalResultCount: 0,
    resultOffset: 0,
    resultCount: 0,
    results: []
};

function ValidateParam(object: any, key: string, expectedType: string, allowFalsy: boolean = false) {
    if (typeof (object[key]) !== expectedType) throw new Error(`${key} has invalid type`);
    if (!allowFalsy && !object[key] || expectedType === "number" && !isFinite(object[key])) throw new Error(`${key} has invalid value`);
}

export function ValidateArchiveCollectionParams(params: ArchiveCollectionParams): true | Error {
    try {
        ValidateParam(params, "name", "string");
        return true;
    } catch (e) {
        return e as Error;
    }
};

export function ValidateArchiveEntryParams(params: ArchiveEntryParams): true | Error {
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
    } catch (e) {
        return e as Error;
    }
};

enum HTTP_METHOD {
    POST = "POST",
    PATCH = "PATCH",
    GET = "GET",
    DELETE = "DELETE",
};

const API_ENDPOINT = new URL("http://127.0.0.1:8080"); //new URL(window.location);
API_ENDPOINT.pathname = "/api/v1/";

const fetchRequest = (url: string, method: HTTP_METHOD, fields: { [key: string]: any }):Promise<Response> => {
    if (method === HTTP_METHOD.GET) {
        const params = new URL(url);
        Object.keys(fields).forEach(k => fields[k] !== undefined ? params.searchParams.append(k, fields[k]) : null);
        return fetch(params.href, { method });
    } else {
        const body = new FormData();
        Object.keys(fields).forEach(k => fields[k] !== undefined ? body.append(k, fields[k]) : null);
        return fetch(url, { method, body });
    }
};

const request = async (url: string, method: HTTP_METHOD, fields: { [key: string]: any } = {}):Promise<any> => {
    const req = await fetchRequest(url, method, fields);
    if (!req.ok) {
        throw new Error(`Request not ok, status: ${req.status}, msg: ${req.statusText}`);
    }

    return await req.json();
};

export const createEntry = async ({ title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image }: ArchiveEntryParams): Promise<ArchiveEntry> => {
    return await request(API_ENDPOINT.href + "entry", HTTP_METHOD.POST, { title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image });
};

export const editEntry = async (id: ArchiveEntryId, { title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image }: ArchiveEntryParams): Promise<ArchiveEntry> => {
    return await request(API_ENDPOINT.href + "entry/" + id, HTTP_METHOD.PATCH, { title, description, donor, yearCreated, colour, size, collectionId, physicalLocation, mediaType, image });
};

export const deleteEntry = async (id: ArchiveEntryId): Promise<void> => {
    await request(API_ENDPOINT.href + "entry/" + id, HTTP_METHOD.DELETE);
};

export const getEntry = async (id: number):Promise<ArchiveEntry> => {
    return await request(API_ENDPOINT.href + "entry/" + id, HTTP_METHOD.GET);
};

export const getEntries = async (count: number | undefined = undefined, offset: number = 0):Promise<ResultArray<ArchiveEntry>> => {
    return await request(API_ENDPOINT.href + "entries", HTTP_METHOD.GET, { count, offset });
};

export const searchEntries = async ({ title, description, donor, mediaType, collection }: ArchiveSearchParameters, count: number | undefined = undefined, offset: number = 0): Promise<ResultArray<ArchiveEntry>> => {
    return await request(API_ENDPOINT.href + "search", HTTP_METHOD.GET, { title, description, donor, mediaType, collection, count, offset });
};

export const createCollection = async ({ name }: ArchiveCollectionParams):Promise<ArchiveCollection> => {
    return await request(API_ENDPOINT.href + "collection", HTTP_METHOD.POST, { name });
};

export const editCollection = async (id: ArchiveCollectionId, { name }: ArchiveCollectionParams):Promise<ArchiveCollection> => {
    return await request(API_ENDPOINT.href + "collection/" + id, HTTP_METHOD.PATCH, { name });
};

export const deleteCollection = async (id: ArchiveCollectionId):Promise<void> => {
    await request(API_ENDPOINT.href + "collection/" + id, HTTP_METHOD.DELETE);
};

export const getCollection = async (id: ArchiveCollectionId):Promise<ArchiveCollection> => {
    return await request(API_ENDPOINT.href + "collection/" + id, HTTP_METHOD.GET);
};

export const getCollections = async (count: number | undefined = undefined, offset: number = 0):Promise<ResultArray<ArchiveCollection>> => {
    return await request(API_ENDPOINT.href + "collections", HTTP_METHOD.GET, { count, offset });
};

export const getEntriesByCollection = async (id: ArchiveCollectionId, count?: number, offset?: number):Promise<ResultArray<ArchiveEntry>> => {
    return await request(API_ENDPOINT.href + "collection/" + id + "/entries", HTTP_METHOD.GET, { count, offset });
};

export const getEntryImageURL = (entry: ArchiveEntry | null): string => {
    if (entry && entry.image) {
        const url = new URL(API_ENDPOINT);
        url.pathname = `image/${entry.image}`;
        return url.href;
    } else {
        return "";
    }
};

//await ArchiveAPI.createEntry({ title: "Test", description: "Test Img", donor: "Bob", yearCreated: "1024", colour: "NONE", size: "1x1", collectionId: 0, physicalLocation: "NONE", mediaType: "NONE" })
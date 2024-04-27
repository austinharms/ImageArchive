// import { ArchiveEntry, DatabaseService } from "./databaseInterface";
// import Database from "better-sqlite3";

// export async function CreateConnection(path:string): Promise<DatabaseService> {
//     const db = new Database(path, { fileMustExist: true });
//     db.pragma("journal_mode = WAL");
//     const service: DatabaseService = {
//         create: async (entry: ArchiveEntry) => {
//             return 0;
//         },

//     };

//     return service;
// };
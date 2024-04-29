import { config as dotenvconfig } from "dotenv";
const cfg = dotenvconfig({ override: false });
if ( process.env.NODE_ENV == "development" && (cfg.error || !cfg.parsed)) {
    console.error("Failed to load configuration file", cfg.error);
    process.exit(1);
}

export interface ConfigFile {
    HTTP_PORT: number,
    SQLITE_PATH: string,
    IMAGE_PATH: string,
};

const defaultConfig: Readonly<ConfigFile> = { HTTP_PORT: 8080, SQLITE_PATH: "archive.sqlite", IMAGE_PATH: "./images" };
export const config: Readonly<ConfigFile> = { ...defaultConfig, ...( cfg.error || !cfg.parsed?{}:cfg.parsed) };
export default config;

import { access, constants, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { BSON } from "bson";
import { globby } from "globby";

export class BsonFileManager<V extends BSON.Document> {
    private finalFilePath!: string;

    public constructor(private readonly folder: string, private readonly service: string) {}

    public async init(): Promise<this> {
        let op = 0;

        try {
            await access(this.folder, constants.W_OK | constants.R_OK);
            this.finalFilePath = path.join(this.folder, this.service);
            op = 1;

            await access(this.finalFilePath, constants.W_OK | constants.R_OK);
        } catch {
            if (op === 1) {
                await mkdir(this.finalFilePath);
                return this;
            }

            throw new Error("Initialize fail");
        }

        return this;
    }

    public async fetch(...keys: string[]): Promise<V[]> {
        const maps: (V | undefined)[] = await Promise.all(keys.map(async key => this.get(key)));
        return maps.filter(Boolean) as V[];
    }

    public async get(key: string): Promise<V | undefined> {
        try {
            const contents = await readFile(path.join(this.finalFilePath, key));

            const deserializedData = BSON.deserialize(contents, {
                promoteBuffers: true
            });

            return deserializedData as V;
        } catch {
            return undefined;
        }
    }

    public async set(key: string, value: V): Promise<this> {
        const filePath = path.join(this.finalFilePath, key);
        const serializedData = BSON.serialize(value, {
            checkKeys: true
        });

        await writeFile(filePath, serializedData);

        return this;
    }

    public async delete(key: string): Promise<boolean> {
        try {
            const filePath = path.join(this.finalFilePath, key);
            const statFile = await stat(filePath);

            if (!statFile.isFile()) {
                return false;
            }

            await rm(filePath, {
                recursive: true
            });

            return true;
        } catch {
            return false;
        }
    }

    public async keys(query: string): Promise<string[]>;
    public async keys(...query: string[]): Promise<string[]> {
        const files = await globby(query, {
            cwd: this.finalFilePath
        });
        return files;
    }
}

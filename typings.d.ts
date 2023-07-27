import { AoiClient } from "aoi.js";

export interface Command {
    name?: string,
    type?: string,
    $if?: string,
    channel?: string,
    aliases?: string[],
    code: string
}

export declare class LoaderError extends Error {
    constructor(title: string, message: string)
}

export declare class Loader {
    constructor(client: AoiClient, addToClient?: boolean);
    load(dir: string): Promise<void>;
    reload(): Promise<void>;
    #addPlugin(): void;
    #import(root: string, dir: string, file: string): Promise<Command>;
    #set(commands: Command[]): void;
}

declare class Reader {
    parse(input: string): Command
}
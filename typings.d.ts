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
    /**
     * @param title Error title.
     * @param message Error message.
     */
    constructor(title: string, message: string)
}

export declare class Loader {
    /**
     * 
     * @param client aoi.js client definition.
     * @param addToClient Adds the loader into the client.
     */
    constructor(client: AoiClient, addToClient?: boolean);
    /**
     * Load commands into the client.
     * @param dir Commands path.
     */
    load(dir: string): Promise<void>;
    /**
     * Reload the commands.
     */
    reload(): Promise<void>;
    /**
     * @private Add the command updater to the client.
     */
    #addPlugin(): void;
    /**
     * @private Import a command.
     */
    #import(root: string, dir: string, file: string): Promise<Command>;
    /**
     * @private Set the collected command array into the client.
     * @param commands Array of collected commands.
     */
    #set(commands: Command[]): void;
}

declare class Reader {
    /**
     * Parses a command source.
     * @param input Command source.
     * @returns 
     */
    parse(input: string): Command
}
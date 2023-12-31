import { join } from "path";
import { AoiClient, LoadCommands } from "aoi.js";
import { Reader } from "./reader.js";
import AsciiTable from "ascii-table";
import { LoaderError } from "./error.js";
import { lstatSync, readdirSync, readFileSync } from "fs";

/**
 * Check if the file is valid.
 * @param {string} file 
 * @returns {boolean}
 */
const isValidFile = (file) => file.endsWith(".js") || file.endsWith(".aoi");

/**
 * @typedef LoaderExtraOptions
 * @property {?boolean} [removeUseless=true] Removes useless functions from the aoi core.
 * @property {?boolean} [removeNativeLoader=true] Removes LoadCommands class if found.
 */

/** @type {LoaderExtraOptions} */
const defaultExtraOptions = {
    removeUseless: true,
    removeNativeLoader: true
}

export class Loader {
    /**
     * @param {AoiClient} client aoi.js client definition.
     * @param {boolean} [addToClient=true] Adds the loader into the client.
     * @param {LoaderExtraOptions} [extraOptions=defaultExtraOptions] Extra options for the loader.
     * @example
     * new Loader(bot, true, {
     *     removeUseless: true,
     *     removeNativeLoader: false
     * })
     */
    constructor(client, addToClient = true, extraOptions = defaultExtraOptions) {
        if (!client || (client && !(client instanceof AoiClient)))
            throw new LoaderError("invalid_aoi_client", "Client must an instance of AoiClient!");
        if (typeof addToClient !== "boolean")
            throw new LoaderError("invalid_option", "Invalid boolean in constructor options!");
        this.client = client;
        this.path = null;
        this.old = Object.freeze(this.client.cmd);
        this.#addPlugin();
        if (extraOptions.removeNativeLoader && this.client.loader instanceof LoadCommands) {
            this.client.loader = null
        }
        if (extraOptions.removeUseless) {
            const useless = ['$lerefAvatar']
            let functions = this.client.functionManager.functions.sort((a, b) => a.length - b.length)
            console.log(functions.length)
            for (const us of useless) {
                functions = functions.filter(element => element !== us)
            }
            this.client.functionManager.functions = functions
        }
        if (addToClient) this.client.loader = this;
    }

    /**
     * Load commands into the client.
     * @param {string} dir Commands path.
     */
    async load(dir) {
        if (!dir || (dir && typeof dir !== "string")) throw new LoaderError("missing_path", "You must provide a valid commands path in: Loader#load!");
        if (!this.path) this.path = dir;
        this.#resetCommands();
        const root = process.cwd(), files = readdirSync(join(root, dir));
        const commands = [];
        for (const file of files) {
            let isFile = lstatSync(join(root, dir, file)).isFile();
            if (isFile && isValidFile(file)) {
                let command = await this.#import(root, dir, file);
                if (!command) continue;
                Array.isArray(command) ? command.forEach(cmd => commands.push(cmd)) : commands.push(command);
            } else await this.load(join(dir, file));
        }
        this.#set(commands);
    }

    /**
     * Reload the commands.
     */
    async reload() {
        await this.load(this.path);
    }

    /**
     * @private Add the command updater to the client.
     */
    #addPlugin() {
        this.client.functionManager.createFunction({
            name: "$updateLoader",
            code: async function (d) {
                const data = d.util.aoiFunc(d);
                if (!d.client.loader) return d.aoiError.fnError(d, "custom", {}, "Loader class is not initialized!");
                await d.client.loader.reload();
                return {
                    code: d.util.setCode(data)
                };
            }
        });
    }

    /**
     * @private Import a command.
     * @param {string} root 
     * @param {string} dir 
     * @param {string} file 
     * @returns 
     */
    async #import(root, dir, file) {
        let command;
        try {
            if (file.endsWith(".aoi")) command = Reader.parse(readFileSync(join(root, dir, file), { encoding: "utf-8" }));
            else if (file.endsWith(".js")) {
                command = require(join(root, dir, file));
                delete require.cache[join(root, dir, file)];
            }
        } catch {
            if (file.endsWith(".aoi")) 
                command = Reader.parse(readFileSync(join(root, dir, file), { encoding: "utf-8" }));
            else if (file.endsWith(".js"))
                command = process.platform === "win32" 
                    ? (await import(join("file:///", root, dir, file))) 
                    : (await import(join(root, dir, file)));
        }
        return command;
    }

    /**
     * @private Set the collected command array into the client.
     * @param {Array<any>} commands 
     */
    #set(commands) {
        const table = new AsciiTable();
        table.setHeading("", "Name", "Type", "Status", "Problem");
        for (let i = 0; i < commands.length; i++) {
            const command = commands.at(i);
            if (!("type" in command)) command.type = "default";
            if (!this.client.cmd.types.includes(command.type)) { table.addRow(i, command.name, command.type, "Failed to load!", "Invalid command type."); continue; }
            try {
                this.client.cmd.createCommand(command);
                table.addRow(i, command.name, command.type, "Loaded", "None");
            } catch(e) { table.addRow(i, command.name, command.type, "Failed to load", `${e.message}`); }
        }
        console.log(table.toString());
    }

    /**
     * @private Clear all client commands from cache.
     */
    #resetCommands() {
        this.client.cmd = undefined;
        this.client.cmd = this.old;
    }
}
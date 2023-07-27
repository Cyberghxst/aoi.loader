import { LoaderError } from "./error.js";
import { randomUUID } from "crypto";

export class Reader {
    /**
     * Parses a command source.
     * @param {string} input Command source.
     * @returns 
     */
    static parse(input) {
        // command data
        let exportType = "", name = "", aliases = [], code = "", prototype = "", channel = "";

        // Reader data
        let where = "export", sawdots = false, writing = "", codedepth = 0;

        // Reading         /* [...input] */
        for (let i = 0; i <= input.length; i++) {
            const char = input.at(i);
            if (where === "export") {
                if (!input.includes("[exportCommand:"))
                    throw new LoaderError("missing_export", "Command export is required!");
                if (char !== ":" && sawdots === false) continue;
                else if (char === ":" && sawdots === false) { sawdots = true; continue; }
                else if (char === "]" && sawdots === true) {
                    exportType = exportType.trim();
                    where = "prototype";
                    sawdots = false;
                    continue;
                }
                if (sawdots) exportType += char;
            }
            if (where === "prototype") {
                if (!input.includes("prototype:")) where = "name";
                if (char !== ":" && sawdots === false) continue;
                else if (char === ":" && sawdots === false) { sawdots = true; continue; }
                else if (char === "\n" && sawdots === true) {
                    prototype = prototype.trim();
                    where = "name";
                    sawdots = false;
                    continue;
                }
                if (sawdots) prototype += char;
            }
            if (where === "name") {
                if (!input.includes("name:")) name = "era.loader:" + randomUUID(), where = "channel";
                if (char !== ":" && sawdots === false) continue;
                else if (char === ":" && sawdots === false) { sawdots = true; continue; }
                else if (char === "\n" && sawdots === true) {
                    name = name.trim();
                    where = "channel";
                    sawdots = false;
                    continue;
                }
                if (sawdots) name += char;
            }
            if (where === "channel") {
                if (!input.includes("channel:")) where = "aliases";
                if (char !== ":" && sawdots === false) continue;
                else if (char === ":" && sawdots === false) { sawdots = true; continue; }
                else if (char === "\n" && sawdots === true) {
                    channel = channel.trim();
                    where = "aliases";
                    sawdots = false;
                    continue;
                }
                if (sawdots) channel += char;
            }
            if (where === "aliases") {
                if (!input.includes("aliases:")) { where = "code"; continue; }
                if (char !== ":" && sawdots === false) continue;
                else if (char === ":" && sawdots === false) { sawdots = true; continue; }
                else if (char === "," && sawdots === true) {
                    aliases.push(writing.trim());
                    writing = "";
                    continue;
                } else if (char === "\n" && sawdots === true) {
                    aliases.push(writing.trim());
                    writing = "";
                    sawdots = false;
                    where = "code";
                    continue;
                }
                if (sawdots) writing += char;
            }
            if (where === "code") {
                if (!input.includes("code:"))
                    throw new LoaderError("missing_code", "Command code is required!");
                if (!input.includes("@{"))
                    throw new LoaderError("missing_code", "Code container is required!");
                if (char === "{") codedepth++;
                else if (char === "}") codedepth--;
                if (codedepth > 0) code += char;
            }
        }
        if (codedepth > 0)
            throw new LoaderError("code_not_balanced", "Curly brackets in code must be balanced!");
        return {
            name,
            type: exportType,
            aliases: aliases.length > 0 ? aliases : undefined,
            code: code.slice(1).trim(),
            channel: channel.length > 0 ? channel.trim() : undefined,
            prototype: prototype.length > 0 ? prototype.trim() : undefined,
            $if: input.includes("useIf: old") ? "old" : undefined
        };
    }
}
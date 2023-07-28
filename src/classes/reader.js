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
        let exportType = "", name = "", aliases = [], prototype = "", channel = "";
        // Reader data
        let writing = "";
        // Reading
        exportType = input.match(/\[exportCommand:.*?\]/)?.[0].split(":")[1].trim().slice(0, - 1);
        if (!exportType) throw new LoaderError("missing_export", "You must export aoi files.");
        name = input.match(/name: \w+/g)?.[0].split(":")[1].trim() ?? "aoi.loader:" + randomUUID();
        prototype = input.match(/prototype: \w+/g)?.[0].split(":")[1].trim() ?? undefined;
        channel = input.match(/channel: \w+/g)?.[0].split(":")[1].trim() ?? undefined;
        writing = input.match(/aliases: .+/g)?.[0];
        if (writing) {
            let temp = "";
            writing = writing.split(":")[1].trim();
            for (const char of writing.split("")) {
                if (char === ",") {
                    aliases.push(temp.trim());
                    temp = "";
                    continue;
                }
                temp += char;
            }
            if (temp !== "") aliases.push(temp.trim());
        }
        if (!input.includes("code: ") || (input.includes("code: ") && !input.includes("@{")))
            throw new LoaderError("missing_code", "Code is required!");
        return {
            name,
            type: exportType,
            aliases,
            code: input.split("@{").slice(1).join("").split("}").slice(0, -1).join(""),
            channel,
            prototype,
            $if: input.match(/useIf: old/g)?.[0] ? "old" : undefined
        };
    }
}
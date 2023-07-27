export class LoaderError extends Error {
    /**
     * @param {string} title Error title.
     * @param {string} message Error message.
     */
    constructor(title, message) {
        super(`\x1b[41m${title.toUpperCase()}\x1b[0m => \x1b[31m${message}\x1b[0m`);
        this.name = "LoaderError";
    }
}
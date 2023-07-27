const fs = require("fs");
const { minify } = require("uglify-js");
const { filter } = require("lodash");
const { cwd } = require("process");

fs.writeFileSync("./lib/cjs/package.json", `{
    "type": "commonjs"
}`);
fs.writeFileSync("./lib/esm/package.json", `{
    "type": "module"
}`);

async function main(i) {
    var e = fs.readdirSync(i, { withFileTypes: !0 }).map((e) => (e.name = `${i}/${e.name}`, e)),
        r = filter(e, (e => e.isFile() && e.name.endsWith(".js"))),
        n = filter(e, (e => e.isDirectory()));
    for (var a of n) r.push(...(await main(a.name)));
    for (var q of r) {
        var x = fs.readFileSync(q.name, { encoding: "utf-8" }),
            ifyed = minify(x)?.code;
        if (!ifyed || ifyed == x) continue;
        fs.writeFileSync(q.name, ifyed, "utf-8");
    }
    return r;
}

main(cwd() + "/lib/").then(() => console.log("Source encoded!"));
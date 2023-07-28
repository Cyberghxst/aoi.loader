# aoi.loader
A unofficial command loader for aoi.js gen 6.

## Highlights
- Supports the new .aoi extension file from aoi gen 7.
- Supports JS files.
- Commands can be reloaded without restarting the client.
- Array of commands in JS files are supported.

## Basic Setup
```js
const { Loader } = require("aoi.loader");
const { AoiClient: Bot } = require("aoi.js");

const bot = new Bot({
    database: {
        type: "aoi.db",
        db: require("@akarui/aoi.db"),
        tables: ["main"],
        path: "./db",
        extraOptions: {
            dbType: "KeyValue"
        }
    },
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent"
    ],
    events: [
        "onMessage"
    ],
    prefix: "BOT PREFIX",
    token: "BOT TOKEN",
});

// Loading commands with custom loader.
new Loader(bot).load("./commands")
    .then(() => console.log("Source loaded!"));
```

## Commands
### Using ".aoi" extension
#### All options
```
[exportCommand: COMMAND_TYPE] {
    prototype: PROTOTYPE
    name: COMMAND_NAME
    channel: CHANNEL_ID
    aliases: ALIAS1, ALIAS2, ALIAS3
    useIf: old
    code: @{
        $log[normal aoi.js code inside curly brackets.]
    }
}
```

#### Example (Adding a join command)
```
[exportCommand: join] {
    channel: $getServerVar[channelID]
    code: @{
        $color[FF0055]
        $description[Welcome to $guildName! Enjoy your stay!]
        $thumbnail[$userAvatar[$authorID]]
        $title[Welcome $username!]
    }
}
```

#### Example (Adding a slash command)
```
[exportCommand: interaction] {
    prototype: slash,
    name: ping
    code: @{
        $interactionReply[Pong! $ping ms]
    }
}
```

#### Example (Using old $if)
```
[exportCommand: interaction] {
    prototype: slash,
    name: ping
    useIf: old
    code: @{
        $interactionReply[Pong! $ping ms]
    }
}
```

## Updating commands
You must use the built-in function.
```
$updateLoader
```

### Example
```
[exportCommand: default] {
    name: reload
    aliases: update, u, r, restart
    code: @{
        $color[2F3136]
        $addField[Newly added;$get[added] commands.]
        $thumbnail[$userAvatar[$clientID]]
        $title[Commands reloaded!]
        $let[added;$math[$commandsCount - $get[count]]]
        $updateLoader
        $let[count;$commandsCount]
        $onlyIf[$checkContains[$clientOwnerIDs[,];$authorID]==true;You are not my owner.]
    }
}
```

### WARNING
- As you know, aoi v6 is not the same as aoi v7, this loader doesn't provide advanced features for ".aoi" files like embedded JS.
- If you want to use the VSC extension, we recommend do not follow autocompletion since types and functions are a bit different between both versions.
- Using this loader will make $updateCommands not work.
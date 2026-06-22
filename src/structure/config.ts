import { readFile, writeFile } from "fs/promises";
import { ClientOptions, PartialTypes, Intents } from "discord.js";
import { ForestBotAPIOptions } from "forestbot-api-wrapper-v2";

async function mergeConfigFromExample(): Promise<void> {
    let configStr: string;
    let exampleStr: string;

    try { configStr = await readFile('./config.json', 'utf-8'); } catch { return; }
    try { exampleStr = await readFile('./config.example.json', 'utf-8'); } catch { return; }

    const config = JSON.parse(configStr);
    const example = JSON.parse(exampleStr);
    const added: string[] = [];

    function mergeMissing(target: Record<string, any>, source: Record<string, any>, prefix: string): void {
        for (const [key, value] of Object.entries(source)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (!(key in target)) {
                target[key] = value;
                added.push(fullKey);
            } else if (value !== null && typeof value === 'object' && !Array.isArray(value) &&
                       target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                mergeMissing(target[key], value, fullKey);
            }
        }
    }

    mergeMissing(config, example, '');

    if (added.length > 0) {
        console.log(`[config] Auto-merged ${added.length} missing key(s) from config.example.json: ${added.join(', ')}`);
        await writeFile('./config.json', JSON.stringify(config, null, 4));
    }
}

await mergeConfigFromExample();

export const color = JSON.parse(await readFile('./extras/colors.json') as any);
export const cnf = JSON.parse(await readFile('./config.json') as any);

class DiscordSettings implements ClientOptions {
    partials: PartialTypes[] = ['CHANNEL']
    intents = [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ]
}

class ApiConfig implements ForestBotAPIOptions {
    apiUrl = cnf.apiUrl
    isBotClient = false
    websocket_url = cnf.websocket_url
    apiKey = process.env.apiKey
    logerrors = true
    use_websocket = true
  };

export default class Options {
    discord = new DiscordSettings()
    api = new ApiConfig()
}

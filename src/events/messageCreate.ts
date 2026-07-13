import type { Message } from "discord.js"
import type ForestBot from "../structure/discord/Client"
import makeTablistEmbed from "../utils/embeds/make_tablist_embed.js";

const prefix = "!";

export default {
    name: "messageCreate",
    once: false,
    execute: async (message: Message, client: ForestBot) => {

        const { content, author, channel } = message;
        if (author.id === client.user.id || !content) return;
        const args = content.split(" ");
        args.shift();

        if (content.startsWith(prefix + "tab")) {
            if (!args[0]) return;
            const server = args[0];
            return channel.send(await makeTablistEmbed(server, server + "_refresh"));
        }


        if (client.liveChatChannelCache.has(channel.id) && content && content.length < 250) {
            // Check if message is a command that's unsafe for chat bridge
            if (content.startsWith(prefix)) {
                const commandMatch = content.slice(prefix.length).split(/\s+/)[0];
                // Fail-safe: haven't gotten a real list from craftbot yet (startup race, Hub
                // restart, etc.) -- deny all commands rather than allow everything through.
                const isUnsafe = !client.bridgeCommandsSynced
                    || (commandMatch && client.bridgeUnsafeCommandsCache.has(commandMatch.toLowerCase()));
                if (commandMatch && isUnsafe) {
                    // Stays in the bridge channel (same continuity as normal bridge chat) but
                    // never crosses over -- return before sendDiscordChatMessage below.
                    await channel.send(`<@${author.id}> that command can't be run from the chat bridge.`).catch(() => {});
                    return;
                }
            }

            const username = `${author.username}#${author.discriminator}`;
            const { channel: chan, channelArgs } = client.liveChatChannelCache.get(channel.id);
            const currentTime = Date.now();

            client.API.websocket.sendDiscordChatMessage({
                message: content,
                username: username,
                mc_server: channelArgs.mc_server,
                timestamp: currentTime.toString(),
                channel_id: channel.id,
                guild_id: chan.guild.id,
                guild_name: chan.guild.name
            })
        }

    }
}

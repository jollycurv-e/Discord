import fetch from "node-fetch";
import { cnf, client } from "../../index.js";
import { ForestBotAPI, ForestBotAPIOptions, MinecraftAdvancementMessage, MinecraftChatMessage, MinecraftPlayerDeathMessage, MinecraftPlayerJoinMessage, MinecraftPlayerKillMessage, MinecraftPlayerLeaveMessage } from "forestbot-api-wrapper-v2";
import { checkWatcherList, watcherAlertEmbed } from "../../utils/watcher/userLoginWatcher.js";


type AddGuildArgs = DiscordGuild;
type RemoveLiveChatArgs = { guild_id: string, channel_id?: string | null };
type AddLiveChatArgs = DiscordForestBotLiveChat;
type RemoveGuildArgs = { guild_id: string };

interface ForestBotApiResponse {
    success: boolean,
    data?: any,
    message?: string,
    messages?: any
}

export default class apiHandler extends ForestBotAPI {

    constructor(options: ForestBotAPIOptions) {
        super(options);

        this.on("websocket_open", () => {
            console.log("Websocket opened.");
        });

        this.on("websocket_close", () => {
            console.log("Websocket closed. Reconnecting in 5s...");
            setTimeout(() => {
                console.log("Reconnecting to websocket...");
                (this.websocket as any)?.authenticate();
            }, 5000);
        });

        this.on("websocket_error", (data: any) => {
            console.log("Websocket error: " + data);
        });

        this.on("inbound_minecraft_chat", (data: MinecraftChatMessage) => {
            client?.minecraftChatEmbed(`**${data.name}** » ${data.message}`, "gray", data.mc_server);
        });
        this.on("minecraft_player_death", (data: MinecraftPlayerDeathMessage) => {
            client?.minecraftChatEmbed(data.death_message, "Indigo", data.mc_server);
        });
        this.on("minecraft_player_join", async (data: MinecraftPlayerJoinMessage) => {
            client?.minecraftChatEmbed(`**${data.username}** joined the server.`, "Green", data.server);

            const watchers = checkWatcherList(data.server.toLowerCase(), data.username);
            if (!watchers) return;

            for (const watcher of watchers) {
                if (!watcher.discordUserToNotify) continue;
                const userToNotify = await client?.users.fetch(watcher.discordUserToNotify);
                if (!userToNotify) return;
    
                await watcherAlertEmbed(userToNotify, data.username, "joined the server", data.server, "green");
            }
            
        });
        this.on("minecraft_player_leave", (data: MinecraftPlayerLeaveMessage) => {
            client?.minecraftChatEmbed(`**${data.username}** left the server.`, "red", data.server);
        });
        this.on("minecraft_advancement", (data: MinecraftAdvancementMessage) => {
            client?.minecraftChatEmbed(data.advancement, "Yellow", data.mc_server);
        });
        this.on("unknown_message", (data: any) => {
            if (data?.action === "content_flagged") {
                const d = data.data as { username: string, mc_server: string, command: string, content: string };
                client?.sendFlaggedContentAlert(d);
            }
            if (data?.action === "bridge_commands_updated") {
                client?.syncBridgeCommandsCache();
            }
            if (data?.action === "resolve_discord_username") {
                void this.resolveDiscordUsername(data.data as { request_id: string, username: string });
            }
        });
        // here we listen for the events for minecraft messages to log to game chat.

    }


    /**
 * Get all discord guilds that forestbot has been setup in.
 * @returns Promise<DiscordGuild[]|null>
 */
    public async getAllGuilds(): Promise<DiscordGuild[] | null> {

        try {
            const response = await fetch(`${this.apiurl}/getguilds`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                }
            });

            if (!response || !response.ok) throw new Error("Error getting all guilds from api.");
            const data = await response.json() as ForestBotApiResponse;

            return data.data as DiscordGuild[];

        } catch (err) {
            console.error(err, "getAllGuilds Error")
            return null;
        }
    }

    /**
     * Adding a LiveChat to database.
     * @param args AddLiveChatArgs
     * @returns Promise<ForestBotApiResponse|null> 
     */
    public async addLiveChat(args: AddLiveChatArgs): Promise<ForestBotApiResponse | null> {
        try {
            const response = await fetch(`${this.apiurl}/addlivechat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                },
                body: JSON.stringify(args)
            })
            if (!response || !response.ok) throw new Error("Adding livechat result not ok.");

            return await response.json() as ForestBotApiResponse;

        } catch (error) {
            console.error(error, "addLiveChat Error")
            return null;
        }
    }

    /**
     * Adding a guild to database
     * @param args AddGuildArgs
     * @returns Promise<ForestBotApiResponse|null> 
     */
    public async addGuild(args: AddGuildArgs): Promise<ForestBotApiResponse | null> {
        try {
            const response = await fetch(`${this.apiurl}/addguild`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                },
                body: JSON.stringify(args)
            })
            if (!response || !response.ok) throw new Error("Adding guild result not ok.");

            return await response.json() as ForestBotApiResponse;

        } catch (error) {
            console.error(error, "addGuild Error")
            return null;
        }
    }


    /**
     * Removing a guild from the database.
     * @param args RemoveGuildArgs
     * @returns Promise<ForestBotApiResponse|null> 
     */
    public async removeGuild(args: RemoveGuildArgs): Promise<ForestBotApiResponse | null> {
        try {
            const response = await fetch(`${this.apiurl}/removeguild`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                },
                body: JSON.stringify(args)
            })
            if (!response || !response.ok) throw new Error("Removing guild result not ok.");

            return await response.json() as ForestBotApiResponse;

        } catch (error) {
            console.error(error, "removeGuild Error")
            return null;
        }
    }


    /**
     * Removing a live chat from the database.
     * @param args RemoveLiveChatArgs
     * @returns Promise<ForestBotApiResponse|null> 
     */
    public async removeLiveChat(args: RemoveLiveChatArgs): Promise<ForestBotApiResponse | null> {
        try {
            const response = await fetch(`${this.apiurl}/removelivechat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args)
            })
            if (!response || !response.ok) throw new Error("Removing guild result not ok.");

            return await response.json() as ForestBotApiResponse;
        } catch (error) {
            console.error(error, "removeLiveChatGuild Error")
            return null;
        }
    }

    public async getAllLiveChatChannels(): Promise<DiscordForestBotLiveChat[] | null> {
        try {
            const response = await fetch(`${this.apiurl}/getchannels`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                }
            });
            if (!response || !response.ok) throw new Error("not ok response.");

            const channels = await response.json() as ForestBotApiResponse;
            if (!channels.success) throw new Error("no channels success");

            return channels.data as DiscordForestBotLiveChat[];

        } catch (err) {
            console.error("error getting all live chats.");
            return null;
        }
    }

    /**
     * Get all bridge-safe commands (commands that can be safely run via chat bridge).
     * @returns Promise<Array<{ name: string, bridge_ok: boolean }> | null>
     */
    public async getBridgeCommands(): Promise<Array<{ name: string, bridge_ok: boolean }> | null> {
        try {
            const response = await fetch(`${this.apiurl}/craftbot/bridge-commands`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey
                }
            });
            if (!response || !response.ok) throw new Error("not ok response.");

            const result = await response.json() as ForestBotApiResponse;
            if (!result.success) throw new Error("no bridge commands success");

            return result.data as Array<{ name: string, bridge_ok: boolean }>;

        } catch (err) {
            console.error("error getting bridge commands.");
            return null;
        }
    }

    /**
     * Resolving a "server username" (nickname or username) seen in a chat-bridged MC
     * message to a real Discord snowflake ID, so craftbot can check the linked account
     * against its blacklist. Searches each guild in config.json's resolvable_guild_ids,
     * in order, stopping at the first exact (case-insensitive) match -- guild.members.fetch's
     * query is a PREFIX match, so trusting the first result could resolve to the wrong
     * member on any name collision.
     * @param request_id echoed back unchanged so craftbot can match the reply to the right pending request
     * @param username the "server username" string as it appeared in the bridged chat message
     */
    private async resolveDiscordUsername({ request_id, username }: { request_id: string, username: string }): Promise<void> {
        let snowflake: string | null = null;
        const guildIds: string[] = cnf.resolvable_guild_ids ?? [];

        try {
            for (const guildId of guildIds) {
                const guild = client?.guilds.cache.get(guildId);
                if (!guild) continue;

                const matches = await guild.members.fetch({ query: username, limit: 5 });
                const exact = matches.find(m =>
                    m.nickname?.toLowerCase() === username.toLowerCase() ||
                    m.user.username.toLowerCase() === username.toLowerCase()
                );
                if (exact) {
                    snowflake = exact.id;
                    break;
                }
            }
        } catch (err) {
            console.error(err, "resolveDiscordUsername error");
        }

        // Cast needed: forestbot-api-wrapper-v2's own typings lock sendMessage's action/data
        // to closed unions that predate this custom action -- can't extend an external package.
        this.websocket?.sendMessage({ action: "resolve_discord_username_result", data: { request_id, snowflake } } as any);
    }

}
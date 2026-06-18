import { CommandInteraction } from 'discord.js';
import makeTablistEmbed       from '../utils/embeds/make_tablist_embed.js';
import type ForestBot         from '../structure/discord/Client';

export default {
    permissions: "SEND_MESSAGES",
    channel_strict: true,
    requires_setup: true,
    data: {
        name: "tablist",
        description: "Get a live tablist for the minecraft server you use me for",
        type: 1,
        options: [
            {
                name: "lossless",
                description: "Send as lossless PNG instead of JPEG (larger file, no compression artifacts)",
                type: 5, // BOOLEAN
                required: false
            }
        ]
    },
    run: async (interaction: CommandInteraction, client: ForestBot, thisGuild: Guild) => {

        await interaction.deferReply();
        const lossless = interaction.options.getBoolean('lossless') ?? false;
        const customId = lossless ? "refresh_lossless" : "refresh";
        await interaction.editReply(await makeTablistEmbed(thisGuild.mc_server.toLowerCase(), customId, lossless));
        return;

    }
}

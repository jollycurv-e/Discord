import { CommandInteraction } from 'discord.js';
import makeMosaicEmbed from '../utils/embeds/make_mosaic_embed.js';
import type ForestBot from '../structure/discord/Client';

export default {
    permissions: "SEND_MESSAGES",
    channel_strict: true,
    requires_setup: true,
    data: {
        name: "mosaic",
        description: "Builds an image mosaic from every cached player head seen on the server",
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
        const customId = lossless ? "mosaic_refresh_lossless" : "mosaic_refresh";
        await interaction.editReply(await makeMosaicEmbed(thisGuild.mc_server.toLowerCase(), customId, lossless));
        return;

    }
}

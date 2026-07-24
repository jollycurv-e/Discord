import makeTablistEmbed from "../utils/embeds/make_tablist_embed.js";
import makeMosaicEmbed from "../utils/embeds/make_mosaic_embed.js";
import type { Interaction } from "discord.js";
import type ForestBot from "../structure/discord/Client";

export default async function buttonHandler(interaction: Interaction, client: ForestBot) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (customId === 'flagged_dismiss' || customId === 'flagged_action_taken') {
        await interaction.deferUpdate();
        const label = customId === 'flagged_dismiss' ? '✅ Dismissed' : '⚠️ Action Taken';
        await interaction.editReply({
            content: `${interaction.message.content}\n\n${label} by **${interaction.user.tag}**`,
            components: [],
        });
        return;
    }

    const thisGuild = client.cachedGuilds.get(interaction.guild.id);

    if (!thisGuild) {
        await interaction.deferReply({ ephemeral: true });
        return interaction.followUp({
            content: "> I am not setup yet.",
            ephemeral: true
        });
    }

    if (customId === "refresh" || customId === "refresh_lossless" || customId === thisGuild.mc_server) {
        const lossless = customId === "refresh_lossless";
        await interaction.deferUpdate();
        return await interaction.editReply(await makeTablistEmbed(thisGuild.mc_server.toLowerCase(), customId, lossless));
    }

    if (customId === "mosaic_refresh" || customId === "mosaic_refresh_lossless") {
        const lossless = customId === "mosaic_refresh_lossless";
        await interaction.deferUpdate();
        return await interaction.editReply(await makeMosaicEmbed(thisGuild.mc_server.toLowerCase(), customId, lossless));
    }

    // "Mobile Friendly" button on the normal tablist -- switches into the
    // portrait layout, preserving whichever lossless state was already active.
    if (customId === "tablist_to_mobile" || customId === "tablist_to_mobile_lossless") {
        const lossless = customId === "tablist_to_mobile_lossless";
        const refreshId = lossless ? "tablist_mobile_refresh_lossless" : "tablist_mobile_refresh";
        await interaction.deferUpdate();
        return await interaction.editReply(await makeTablistEmbed(thisGuild.mc_server.toLowerCase(), refreshId, lossless, true));
    }

    // Refresh button on the mobile view itself -- stays in mobile mode.
    if (customId === "tablist_mobile_refresh" || customId === "tablist_mobile_refresh_lossless") {
        const lossless = customId === "tablist_mobile_refresh_lossless";
        await interaction.deferUpdate();
        return await interaction.editReply(await makeTablistEmbed(thisGuild.mc_server.toLowerCase(), customId, lossless, true));
    }

    // "Full Size" button on the mobile view -- switches back to the normal
    // desktop layout, preserving lossless state.
    if (customId === "tablist_to_full" || customId === "tablist_to_full_lossless") {
        const lossless = customId === "tablist_to_full_lossless";
        const refreshId = lossless ? "refresh_lossless" : "refresh";
        await interaction.deferUpdate();
        return await interaction.editReply(await makeTablistEmbed(thisGuild.mc_server.toLowerCase(), refreshId, lossless, false));
    }
};

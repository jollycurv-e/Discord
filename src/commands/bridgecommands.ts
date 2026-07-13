import { CommandInteraction } from "discord.js";
import type ForestBot from "../structure/discord/Client";

export default {
    permissions: "SEND_MESSAGES",
    channel_strict: false,
    requires_setup: false,
    data: {
        name: "bridgecommands",
        description: "List which craftbot commands can be run from the chat bridge",
        type: 1
    },
    run: async (interaction: CommandInteraction, client: ForestBot) => {
        const commands = await client.API.getBridgeCommands();
        if (!commands) {
            return interaction.reply({
                content: "Couldn't reach craftbot to fetch the list — try again in a moment.",
                ephemeral: true
            });
        }

        const safeNames = commands
            .filter(c => c.bridge_ok)
            .map(c => c.name.toLowerCase())
            .sort();

        if (safeNames.length === 0) {
            return interaction.reply({
                content: "No commands are currently runnable from the chat bridge.",
                ephemeral: true
            });
        }

        let list = safeNames.map(n => `\`!${n}\``).join(", ");
        if (list.length > 1800) {
            let shown = 0;
            let truncated = "";
            for (const n of safeNames) {
                const entry = `\`!${n}\`, `;
                if (truncated.length + entry.length > 1800) break;
                truncated += entry;
                shown++;
            }
            list = `${truncated.replace(/, $/, "")} …and ${safeNames.length - shown} more`;
        }

        return interaction.reply({
            content: `**Runnable from the chat bridge:**\n${list}`,
            ephemeral: true
        });
    }
};

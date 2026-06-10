import { CommandInteraction, MessageEmbed } from 'discord.js';
import type ForestBot from '../structure/discord/Client';

export default {
    permissions: "SEND_MESSAGES",
    channel_strict: true,
    requires_setup: true,
    data: {
        name: "leaderboards",
        description: "Leaderboards for the past 7 days",
        type: 1
    },
    run: async (interaction: CommandInteraction, client: ForestBot, thisGuild: Guild) => {
        try {
            // Defer reply immediately
            await interaction.deferReply({ ephemeral: false });

            // Fetch leaderboard data
            const req = await fetch(`${client.apiUrl}/leaderboards?server=${thisGuild.mc_server.toLowerCase()}&limit=1_week`);
            if (!req.ok) {
                return await interaction.editReply({
                    content: "> There was an error fetching the leaderboards. Please try again later.",
                });
            }

            const data = await req.json();
            if (!data) {
                return await interaction.editReply({
                    content: "> There was an error fetching the leaderboards. Please try again later.",
                });
            }

            // Helper to pad strings for alignment
            const pad = (str: string, len: number) => str.padEnd(len, ' ');

            // Build leaderboard text for each category
            const formatTop = (players: any[], key: string, unit = '') => {
                return (players || []).slice(0, 5)
                    .map((p, i) => {
                        const name = p.player_name || p.username;
                        let value = key === 'total_playtime'
                            ? Math.floor((p[key] || 0) / 1000 / 60 / 60 / 24) // convert to days
                            : p[key];
                        return `${i + 1}. ${name.padEnd(16, ' ')} │ ${value}${unit}`;
                    })
                    .join("\n") || "No data";
            };


            const killsText = formatTop(data.kills, 'kill_count');
            const pveDeathsText = formatTop(data.pve_deaths, 'death_count');
            const pvpDeathsText = formatTop(data.pvp_deaths, 'pvp_death_count');
            const advText = formatTop(data.advancements, 'advancement_count');
            const playtimeText = formatTop(data.playtime, 'total_playtime', 'd');
            const tradesText = formatTop(data.trades, 'trade_count');

            // Create embed
            const embed = new MessageEmbed()
                .setColor("#1f2d1f") // Dark green
                .setTitle(`🏆 Leaderboards for ${thisGuild.mc_server} | all time`)
                .setDescription(`\`\`\`
⚔️ Kills
${killsText}

☠️ PvE Deaths
${pveDeathsText}

⚔️ PvP Deaths
${pvpDeathsText}

🏅 Advancements
${advText}

⏱️ Playtime
${playtimeText}

🤝 Trades
${tradesText}
\`\`\``)
                .setFooter({ text: "Data provided by ForestBot | Join support server: https://discord.com/invite/2P8enrdY6t" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            if (!interaction.replied) {
                await interaction.reply({ content: "> An error occurred while generating the leaderboards.", ephemeral: true });
            } else {
                await interaction.editReply({ content: "> An error occurred while generating the leaderboards." });
            }
        }
    }
};

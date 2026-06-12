import type { CommandInteraction, Message } from 'discord.js';
import type ForestBot from '../../structure/discord/Client.js';

export async function buildPlaytimeEmbed(
    client: ForestBot,
    thisGuild: Guild,
    user: string,
    duration: "1_week" | "1_month"
) {
    const uuid = await client.API.convertUsernameToUuid(user);
    if (!uuid) return null;

    // Fetch playtime data
    const res = await fetch(
        `http://localhost:8001/player/playtime?uuid=${uuid}&date=${Date.now()}&server=${thisGuild.mc_server}&duration=${duration}`
    );
    if (!res.ok) return null;
    const graphData = await res.json();
    if (!Array.isArray(graphData)) return null;

    // Prepare chart data
    const labels: string[] = [];
    const values: number[] = [];
    let totalPlaytime = 0;
    let maxPlaytime = 0;
    let minPlaytime = Infinity;
    let maxPlaytimeDate = "";
    let minPlaytimeDate = "";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (duration === "1_week" ? 6 : 29));

    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayData = graphData.find((x: any) => x.day === dateStr);
        const playtime = dayData ? dayData.playtime : 0;

        labels.push(dateStr);
        values.push(playtime);

        totalPlaytime += playtime;
        if (playtime > maxPlaytime) {
            maxPlaytime = playtime;
            maxPlaytimeDate = dateStr;
        }
        if (playtime < minPlaytime) {
            minPlaytime = playtime;
            minPlaytimeDate = dateStr;
        }
    }

    const averagePlaytime = Math.round(totalPlaytime / values.length);
    const formatTime = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

    // Build QuickChart URL
    const chartConfig = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Playtime (minutes)',
                data: values,
                fill: true,
                backgroundColor: 'rgba(0,174,134,0.2)',
                borderColor: '#00AE86',
                tension: 0.3
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    };
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    // Build embed
    const embed = {
        title: `📊 ${user} — Playtime Stats`,
        description: `
**Server:** ${thisGuild.mc_server}  
**Duration:** ${duration.replace('_', ' ')}  

🕒 **Total Playtime:** ${formatTime(totalPlaytime)}  
⏱ **Average Playtime:** ${formatTime(averagePlaytime)}  
📈 **Most Playtime:** ${maxPlaytimeDate} (${maxPlaytime} min)  
📉 **Least Playtime:** ${minPlaytimeDate} (${minPlaytime} min)  

_Use the chart below to see daily activity_
        `,
        color: 0x1F1F1F,
        image: { url: chartUrl },
        thumbnail: { url: `https://mc-heads.net/avatar/${user}/70` },
        footer: { text: `Playtime stats for ${user}` },
        timestamp: new Date()
    };

    return { embed, chartUrl, uuid };
}

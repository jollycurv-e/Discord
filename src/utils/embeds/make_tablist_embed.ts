import { cnf }        from "../../index.js";
import makeid                from "../makeId.js";
import { MessageAttachment } from "discord.js";

const makeTablistEmbed = async (mc_server: string, custom_id: string, lossless = false) => {
    const losslessParam = lossless ? '&lossless=true' : '';
    const tablisturl = `${cnf.apiUrl}/tab/${mc_server}?${makeid(14)}${losslessParam}`;
    const filename = lossless ? 'tablist.png' : 'tablist.jpg';

    const response = await fetch(tablisturl);
    if (!response.ok) {
        console.error("Problem fetching tablist. status: " + response.status)
        return {
            content: "Problem fetching tablist. Try again later."
        }
    }

    const imageDataArrayBuffer = await response.arrayBuffer();
    const imageDataBuffer = Buffer.from(imageDataArrayBuffer);
    const att = new MessageAttachment(imageDataBuffer, filename)

    return {
        content: `${mc_server}`,
        files: [att],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    style: 3,
                    label: "Refresh",
                    custom_id: custom_id
                }
            ]
        }]
    }
}

export default makeTablistEmbed

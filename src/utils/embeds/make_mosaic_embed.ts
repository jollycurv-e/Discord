import { cnf }        from "../../index.js";
import makeid                from "../makeId.js";
import { MessageAttachment } from "discord.js";

const makeMosaicEmbed = async (mc_server: string, custom_id: string, lossless = false) => {
    const losslessParam = lossless ? '&lossless=true' : '';
    const mosaicUrl = `${cnf.apiUrl}/mosaic/${mc_server}?${makeid(14)}${losslessParam}`;
    const filename = lossless ? 'mosaic.png' : 'mosaic.jpg';

    const response = await fetch(mosaicUrl);
    if (!response.ok) {
        console.error("Problem fetching mosaic. status: " + response.status)
        return {
            content: "Problem fetching mosaic. Try again later."
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

export default makeMosaicEmbed

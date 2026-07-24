import { cnf }        from "../../index.js";
import makeid                from "../makeId.js";
import { MessageAttachment } from "discord.js";

const makeTablistEmbed = async (mc_server: string, custom_id: string, lossless = false, mobile = false) => {
    const losslessParam = lossless ? '&lossless=true' : '';
    const mobileParam = mobile ? '&mobile=true' : '';
    const tablisturl = `${cnf.apiUrl}/tab/${mc_server}?${makeid(14)}${losslessParam}${mobileParam}`;
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

    const buttons = [
        {
            type: 2,
            style: 3,
            label: "Refresh",
            custom_id: custom_id
        }
    ];

    // Each view gets a button to switch to the other.
    buttons.push(mobile ? {
        type: 2,
        style: 3,
        label: "Full Size",
        custom_id: lossless ? "tablist_to_full_lossless" : "tablist_to_full"
    } : {
        type: 2,
        style: 3,
        label: "Mobile Friendly",
        custom_id: lossless ? "tablist_to_mobile_lossless" : "tablist_to_mobile"
    });

    return {
        content: `${mc_server}`,
        files: [att],
        components: [{
            type: 1,
            components: buttons
        }]
    }
}

export default makeTablistEmbed

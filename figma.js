const axios = require("axios")
require('dotenv').config()

const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const FILE_KEY = process.env.FIGMA_FILE_KEY || "oueIwxRJxsT41qe98HLl8p"
const NODE_ID = process.env.FIGMA_NODE_ID || "8306:54473"

async function getFigmaFile(){
    if (!FIGMA_TOKEN) {
        throw new Error("Figma token is not set in environment variables")
    }

    const res = await axios.get(
        `https://api.figma.com/v1/files/${FILE_KEY}/nodes`,
        {
            headers:{
                "X-Figma-Token": FIGMA_TOKEN
            },
            params: {
                ids: NODE_ID
            }
        }
    )
    return res.data.nodes[NODE_ID].document
}

module.exports = {
    getFigmaFile,
}
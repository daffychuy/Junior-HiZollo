import "dotenv/config";

if (!process.env.TOKEN) throw new Error('Bot token not configured.');
if (!process.env.MAIN_WEBHOOK_TOKEN) throw new Error('Main webhook token not configured.');
if (!process.env.ERROR_WEBHOOK_TOKEN) throw new Error('Error webhook token not configured.');
if (!process.env.BUG_WEBHOOK_TOKEN) throw new Error('Bug webhook token not configured.');
if (!process.env.SUGGEST_WEBHOOK_TOKEN) throw new Error('Suggest webhook token not configured.');
if (!process.env.REPLY_WEBHOOK_TOKEN) throw new Error('Reply webhook token not configured.');
if (!process.env.NETWORK_WEBHOOK_TOKEN) throw new Error('Network webhook token not configured.');
if (!process.env.OSU_APIKEY) throw new Error('Osu API key not configured.');

export default {
  bot: {
    prefix: "z!",
    id: "1018721702773014578", 
    token: process.env.TOKEN,
    network: {
      namePrefix: "HIZOLLO",
      portPrefix: "hz-network-"
    }
  },

  webhooks: {
    main: {
      id: "1018723552473645147",
      token: process.env.MAIN_WEBHOOK_TOKEN
    },
    error: {
      id: "1018723552473645147",
      token: process.env.ERROR_WEBHOOK_TOKEN
    },
    bug: {
      id: "1018723552473645147", 
      token: process.env.BUG_WEBHOOK_TOKEN
    },
    suggest: {
      id: "1018723552473645147",
      token: process.env.SUGGEST_WEBHOOK_TOKEN
    },
    reply: {
      id: "1018723552473645147", 
      token: process.env.REPLY_WEBHOOK_TOKEN
    }, 
    network: {
      id: "1018723552473645147",
      token: process.env.NETWORK_WEBHOOK_TOKEN
    }
  },

  osu: {
    apikey: process.env.OSU_APIKEY
  }
}
/**
 * Discord Bot - Listens for auction embeds in channels under a category
 */

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { parseMessage } = require('./parser');
const store = require('./store');

let io = null; // Socket.io instance, set from index.js

function setSocketIO(socketIO) {
  io = socketIO;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/**
 * Get all text channels under the configured category
 */
function getAuctionChannels() {
  const categoryId = process.env.CATEGORY_ID;
  if (!categoryId) {
    console.warn('[Bot] No CATEGORY_ID configured');
    return [];
  }

  const channels = [];
  client.guilds.cache.forEach(guild => {
    guild.channels.cache.forEach(channel => {
      if (
        channel.parentId === categoryId &&
        (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildForum)
      ) {
        channels.push(channel);
      }
    });
  });
  return channels;
}

/**
 * Process a message: parse embed and store
 */
function processMessage(message) {
  // Only process messages with embeds
  if (!message.embeds || message.embeds.length === 0) return;

  // Only process from channels in the auction category
  const categoryId = process.env.CATEGORY_ID;
  if (categoryId && message.channel.parentId !== categoryId) return;

  try {
    const item = parseMessage(message);
    if (item && item.name !== 'Unknown Item') {
      store.addOrUpdate(item);
      console.log(`[Bot] ${item.type}: "${item.name}" (${item.price}) from #${item.channel}`);
      
      // Broadcast update via Socket.io
      if (io) {
        io.emit('auction:update', store.getAll());
      }
    }
  } catch (err) {
    console.error('[Bot] Error parsing message:', err.message);
  }
}

/**
 * Fetch historical messages from auction channels
 */
async function fetchHistory() {
  console.log('[Bot] Fetching historical messages...');
  const channels = getAuctionChannels();
  console.log(`[Bot] Found ${channels.length} auction channels`);

  let totalItems = 0;
  for (const channel of channels) {
    try {
      // Fetch last 100 messages from each channel
      const messages = await channel.messages.fetch({ limit: 100 });
      console.log(`[Bot] #${channel.name}: fetched ${messages.size} messages`);
      
      for (const message of messages.values()) {
        processMessage(message);
      }
      totalItems = store.size;
    } catch (err) {
      console.error(`[Bot] Error fetching #${channel.name}:`, err.message);
    }
  }
  console.log(`[Bot] History loaded: ${totalItems} items total`);
}

// Event: Bot ready
client.once('ready', async () => {
  console.log(`[Bot] Logged in as ${client.user.tag}`);
  console.log(`[Bot] Watching category: ${process.env.CATEGORY_ID}`);
  
  // Fetch historical messages
  await fetchHistory();
});

// Event: New message
client.on('messageCreate', (message) => {
  processMessage(message);
});

// Event: Message updated (e.g. embed loaded, price changed)
client.on('messageUpdate', async (oldMessage, newMessage) => {
  // Fetch the full message if partial
  if (newMessage.partial) {
    try {
      newMessage = await newMessage.fetch();
    } catch (err) {
      console.error('[Bot] Error fetching updated message:', err.message);
      return;
    }
  }
  processMessage(newMessage);
});

/**
 * Start the bot
 */
async function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('[Bot] DISCORD_TOKEN not found in .env');
    
    // Load mock data for development
    console.log('[Bot] Loading mock data for development...');
    loadMockData();
    return;
  }

  try {
    await client.login(token);
  } catch (err) {
    console.error('[Bot] Login failed:', err.message);
    console.log('[Bot] Loading mock data for development...');
    loadMockData();
  }
}

/**
 * Load mock auction data for development/testing without a real bot
 */
function loadMockData() {
  const now = Date.now();
  const mockItems = [
    {
      id: 'mock-1',
      type: 'auction',
      name: 'เข็มขัดผู้สิบหอด',
      price: 1.00,
      startingPrice: 1.00,
      currentBid: 1.00,
      buyNowPrice: 10.00,
      quantity: 1,
      image: null,
      endTime: now + 8 * 60 * 60 * 1000,
      scheduledStart: now - 2 * 60 * 60 * 1000,
      channel: 'auction-weapon',
      owner: '@[Rider] - ไข่นวย',
      refCode: '0376',
      link: 'https://discord.com',
      createdAt: now - 30 * 60 * 1000,
    },
    {
      id: 'mock-2',
      type: 'market',
      name: 'เข็มขัดแหพายุโหดร้าย',
      price: 0.10,
      startingPrice: 0.10,
      currentBid: null,
      buyNowPrice: null,
      quantity: 4,
      image: null,
      endTime: now + 2 * 24 * 60 * 60 * 1000,
      scheduledStart: now - 5 * 24 * 60 * 60 * 1000,
      channel: 'market-accessories',
      owner: '@[Rider] - ไข่นวย',
      refCode: '0373',
      link: 'https://discord.com',
      createdAt: now - 60 * 60 * 1000,
    },
    {
      id: 'mock-3',
      type: 'auction',
      name: 'Dragon Armor +20',
      price: 50.00,
      startingPrice: 10.00,
      currentBid: 50.00,
      buyNowPrice: 100.00,
      quantity: 1,
      image: null,
      endTime: now + 5 * 60 * 1000, // 5 minutes - ENDING_SOON
      scheduledStart: now - 24 * 60 * 60 * 1000,
      channel: 'auction-armor',
      owner: '@DragonSlayer',
      refCode: '0401',
      link: 'https://discord.com',
      createdAt: now - 10 * 60 * 1000,
    },
    {
      id: 'mock-4',
      type: 'giveaway',
      name: '20 USDT Giveaway',
      price: 20.00,
      startingPrice: null,
      currentBid: null,
      buyNowPrice: null,
      quantity: 1,
      image: null,
      endTime: now - 60 * 60 * 1000, // already ended - CLOSED
      scheduledStart: null,
      channel: 'giveaway',
      owner: 'Giveaway Boat',
      refCode: null,
      link: 'https://discord.com',
      createdAt: now - 2 * 60 * 60 * 1000,
    },
    {
      id: 'mock-5',
      type: 'auction',
      name: 'หน้าไม้เอล เขรา',
      price: 5.00,
      startingPrice: 1.00,
      currentBid: 5.00,
      buyNowPrice: 30.00,
      quantity: 1,
      image: null,
      endTime: now + 3 * 60 * 60 * 1000,
      scheduledStart: now - 1 * 60 * 60 * 1000,
      channel: 'auction-weapon',
      owner: '@ShadowHunter',
      refCode: '0412',
      link: 'https://discord.com',
      createdAt: now - 5 * 60 * 1000,
    },
    {
      id: 'mock-6',
      type: 'market',
      name: 'HP Potion Bundle x50',
      price: 2.50,
      startingPrice: 2.50,
      currentBid: null,
      buyNowPrice: null,
      quantity: 10,
      image: null,
      endTime: now + 7 * 24 * 60 * 60 * 1000,
      scheduledStart: now - 1 * 24 * 60 * 60 * 1000,
      channel: 'market-consumables',
      owner: '@PotionMaster',
      refCode: '0399',
      link: 'https://discord.com',
      createdAt: now - 3 * 60 * 60 * 1000,
    },
  ];

  mockItems.forEach(item => store.addOrUpdate(item));
  console.log(`[Bot] Mock data loaded: ${store.size} items`);
}

module.exports = { startBot, client, setSocketIO };

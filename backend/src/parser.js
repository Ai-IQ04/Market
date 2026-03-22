/**
 * Discord Embed Parser
 * Parse auction/market/giveaway embeds from Discord bots
 * Only parses embeds that match known auction/market/giveaway formats
 */

// Thai month names for date parsing
const THAI_MONTHS = {
  'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3,
  'พฤษภาคม': 4, 'มิถุนายน': 5, 'กรกฎาคม': 6, 'สิงหาคม': 7,
  'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
};

/**
 * Parse a Thai date string (พ.ศ.) to JavaScript Date
 */
function parseThaiDate(dateStr) {
  if (!dateStr) return null;
  
  const match = dateStr.match(/(\d{1,2})\s+(\S+)\s+(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (match) {
    const [, day, monthName, year, hour, minute] = match;
    const monthIndex = THAI_MONTHS[monthName];
    if (monthIndex !== undefined) {
      const ceYear = parseInt(year) - 543;
      return new Date(ceYear, monthIndex, parseInt(day), parseInt(hour), parseInt(minute));
    }
  }

  const match2 = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (match2) {
    const [, day, month, year, hour, minute] = match2;
    const ceYear = parseInt(year) > 2500 ? parseInt(year) - 543 : parseInt(year);
    return new Date(ceYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  }

  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Extract price number from string like "1.00 USD₮" or "10.00"
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  // 1. Prioritize number followed by USDT/USD₮/USD
  const usdtMatch = priceStr.match(/([\d,]+\.?\d*)\s*(?:USDT|USD₮|USD)/i);
  if (usdtMatch) {
    return parseFloat(usdtMatch[1].replace(/,/g, ''));
  }

  // 2. Fallback to finding a valid price-like number (not a list marker like "1.")
  const allMatches = [...priceStr.matchAll(/([\d,]+\.?\d*)/g)];
  for (const match of allMatches) {
    const valStr = match[1];
    if (valStr.includes(',') || valStr.includes('.') || parseFloat(valStr.replace(/,/g, '')) > 9) {
      return parseFloat(valStr.replace(/,/g, ''));
    }
  }

  // 3. Absolute fallback
  const match = priceStr.match(/([\d,]+\.?\d*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}

/**
 * Get a field value from embed fields by name (case-insensitive partial match)
 */
function getField(fields, ...names) {
  if (!fields || !fields.length) return null;
  for (const name of names) {
    const field = fields.find(f => 
      f.name && f.name.toLowerCase().includes(name.toLowerCase())
    );
    if (field) return field.value;
  }
  return null;
}

/**
 * Check if embed has required auction fields
 * Must have at least: (Auction/Market in title/desc) AND (Price or Starting Price field)
 */
function isValidAuctionEmbed(embed) {
  const title = (embed.title || '').toLowerCase();
  const desc = (embed.description || '').toLowerCase();
  const author = (embed.author?.name || '').toLowerCase();
  const fields = embed.fields || [];
  
  // ★ BLACKLIST: Reject known non-auction embeds
  const blacklistKeywords = [
    'auction winner summary', 'สรุปผู้ชนะ', 'winner summary',
    'wallet transaction', 'ตรวจพบการโอน', 'kaiascan',
    'transaction confirmed', 'payment confirmed', 'log',
    'unifi', 'stablecoin wallet',
    'no one entered', 'ไม่มีผู้เข้าร่วม',
  ];
  const combined = `${title} ${desc} ${author}`;
  if (blacklistKeywords.some(kw => combined.includes(kw))) return false;

  // Check for keywords in title/description/author
  const hasAuctionKeyword = 
    title.includes('auction') || 
    title.includes('market') ||
    desc.includes('auction:') ||
    desc.includes('market:') ||
    desc.includes('instant purchase price');
  
  const hasGiveawayKeyword = 
    title.includes('giveaway') || 
    author.includes('giveaway') ||
    desc.includes('giveaway');

  // If no auction/market/giveaway keyword, reject
  if (!hasAuctionKeyword && !hasGiveawayKeyword) return false;
  
  // For auction/market: must have pricing fields
  if (hasAuctionKeyword) {
    const hasPriceField = fields.some(f => {
      const name = (f.name || '').toLowerCase();
      return name.includes('price') || 
             name.includes('starting') || 
             name.includes('current bid') ||
             name.includes('quantity');
    });
    if (!hasPriceField) return false;
  }

  return true;
}

/**
 * Detect the type of listing from embed content
 */
function detectType(embed) {
  const title = (embed.title || '').toLowerCase();
  const desc = (embed.description || '').toLowerCase();
  const author = (embed.author?.name || '').toLowerCase();

  if (title.includes('giveaway') || author.includes('giveaway') || desc.includes('giveaway')) {
    return 'giveaway';
  }
  if (title.includes('market') || desc.includes('market:')) {
    return 'market';
  }
  return 'auction';
}

/**
 * Extract item name from embed title/description
 */
function extractName(embed) {
  const title = embed.title || '';
  const desc = embed.description || '';
  
  // "Auction: เข็มขัดผู้สิบหอด" → "เข็มขัดผู้สิบหอด"
  const titleMatch = title.match(/(?:Auction|Market|Giveaway)\s*:\s*(.+)/i);
  if (titleMatch) return titleMatch[1].trim();
  
  // Check description for "Auction: xxx"
  const descMatch = desc.match(/(?:Auction|Market)\s*:\s*(.+)/im);
  if (descMatch) return descMatch[1].trim();

  // For giveaway with "GIVEAWAY ENDED" title, get prize from description
  if (title.toLowerCase().includes('giveaway')) {
    const lines = desc.split('\n').filter(l => l.trim());
    if (lines.length > 0) return lines[0].trim();
  }

  // Use title if it exists and isn't generic
  if (title && title.length > 0) return title.trim();

  return 'Unknown Item';
}

/**
 * Extract timestamp from Discord format <t:1234567890:R>
 */
function extractDiscordTimestamp(text) {
  if (!text) return null;
  const match = text.match(/<t:(\d+)(?::[a-zA-Z])?>/);
  if (match) {
    return parseInt(match[1], 10) * 1000; // convert to ms
  }
  return null;
}

/**
 * Extract buy now / instant purchase price from description
 */
function extractBuyNowPrice(embed) {
  const desc = embed.description || '';
  
  // Try to find "instant purchase price : ... 100 USDT"
  const usdtMatch = desc.match(/instant\s*purchase\s*price.*?([\d,]+\.?\d*)\s*(?:USDT|USD₮|USD)/is);
  if (usdtMatch) return parseFloat(usdtMatch[1].replace(/,/g, ''));

  // Fallback
  const match = desc.match(/instant\s*purchase\s*price\s*:\s*([\d,]+\.?\d*)/i);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
}

/**
 * Parse a Discord message with embeds into a structured auction item
 * Returns null if message is not a valid auction/market/giveaway
 */
function parseMessage(message) {
  if (!message.embeds || message.embeds.length === 0) return null;

  const embed = message.embeds[0];
  
  // ★ VALIDATION: Only process valid auction/market/giveaway embeds
  if (!isValidAuctionEmbed(embed)) return null;

  const fields = embed.fields || [];
  const type = detectType(embed);
  const name = extractName(embed);

  // Skip if name is "Unknown Item" — means we couldn't identify it
  if (name === 'Unknown Item') return null;

  // Get image URL from embed
  const image = embed.image?.url || embed.thumbnail?.url || null;

  // Parse fields
  const startingPrice = parsePrice(getField(fields, 'Starting Price', 'Price'));
  const currentBid = parsePrice(getField(fields, 'Current Bid'));
  const buyNowPrice = extractBuyNowPrice(embed);
  const quantity = parseInt(getField(fields, 'Quantity') || '1') || 1;

  const scheduledEnd = parseThaiDate(getField(fields, 'Scheduled End'));
  const scheduledStart = parseThaiDate(getField(fields, 'Scheduled Start'));
  const expirationText = getField(fields, 'Expiration');
  const owner = getField(fields, 'Item Owner', 'Owner');
  
  // Reference code
  let refCode = null;
  const refMatch = (embed.description || '').match(/Reference\s*Code\s*:\s*(\w+)/i);
  if (refMatch) refCode = refMatch[1];
  if (!refCode && embed.footer?.text) {
    const footerMatch = embed.footer.text.match(/(\d{3,})/);
    if (footerMatch) refCode = footerMatch[1];
  }

  // Discord message link
  const link = message.url || `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`;

  const price = currentBid || startingPrice || buyNowPrice || 0;

  let endTime = null;
  if (scheduledEnd) {
    endTime = scheduledEnd.getTime();
  } else if (expirationText) {
    endTime = extractDiscordTimestamp(expirationText);
  }

  // Also try to find it in the description (often used by Giveaway bot)
  if (!endTime) {
    endTime = extractDiscordTimestamp(embed.description);
  }

  if (type === 'giveaway' && !endTime) {
    const endedMatch = (embed.description || '').match(/Ended\s*at/i);
    if (endedMatch) {
      endTime = Date.now() - 1000;
    }
  }

  const channelName = message.channel?.name || 'unknown';

  return {
    id: message.id,
    type,
    name,
    price,
    startingPrice,
    currentBid,
    buyNowPrice,
    quantity,
    image,
    endTime,
    scheduledStart: scheduledStart ? scheduledStart.getTime() : null,
    expirationText,
    channel: channelName,
    owner,
    refCode,
    link,
    createdAt: message.createdTimestamp || Date.now(),
    rawTitle: embed.title || '',
    rawDescription: embed.description || ''
  };
}

module.exports = { parseMessage, parseThaiDate, parsePrice, getField, detectType, isValidAuctionEmbed };

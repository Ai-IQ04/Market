/**
 * i18n - Translation strings for Thai/English
 */

const translations = {
  th: {
    // Navbar
    title: 'ตลาดประมูล',
    searchPlaceholder: 'ค้นหาไอเทม...',
    
    // Category
    category: 'หมวดหมู่',
    all: 'ทั้งหมด',
    
    // Auction Card
    price: 'ราคา',
    currentBid: 'เสนอราคาปัจจุบัน',
    startingPrice: 'ราคาเริ่มต้น',
    buyNow: 'ซื้อเลย',
    timeLeft: 'เวลาที่เหลือ',
    viewOnDiscord: 'ดูในดิสคอร์ด',
    quantity: 'จำนวน',
    owner: 'เจ้าของ',
    refCode: 'รหัสอ้างอิง',
    
    // Status
    open: 'เปิด',
    endingSoon: 'ใกล้หมด',
    closed: 'ปิดแล้ว',
    ended: 'หมดเวลาแล้ว',
    
    // Types
    auction: 'ประมูล',
    market: 'ร้านค้า',
    giveaway: 'แจกรางวัล',
    
    // Sort
    sort: 'เรียงตาม',
    newest: 'ใหม่ล่าสุด',
    priceAsc: 'ราคา: ต่ำ → สูง',
    priceDesc: 'ราคา: สูง → ต่ำ',
    endingSoonSort: 'ใกล้หมดเวลา',
    
    // General
    noItems: 'ไม่พบรายการ',
    loading: 'กำลังโหลด...',
    connected: 'เชื่อมต่อแล้ว',
    disconnected: 'ไม่ได้เชื่อมต่อ',
    items: 'รายการ',

    // Time
    days: 'วัน',
    hours: 'ชั่วโมง',
    minutes: 'นาที',
    seconds: 'วินาที',
  },
  en: {
    // Navbar
    title: 'Auction Market',
    searchPlaceholder: 'Search items...',
    
    // Category
    category: 'Category',
    all: 'All',
    
    // Auction Card
    price: 'Price',
    currentBid: 'Current Bid',
    startingPrice: 'Starting Price',
    buyNow: 'Buy Now',
    timeLeft: 'Time Left',
    viewOnDiscord: 'View on Discord',
    quantity: 'Quantity',
    owner: 'Owner',
    refCode: 'Ref Code',
    
    // Status
    open: 'OPEN',
    endingSoon: 'ENDING SOON',
    closed: 'CLOSED',
    ended: 'Expired',
    
    // Types
    auction: 'Auction',
    market: 'Market',
    giveaway: 'Giveaway',
    
    // Sort
    sort: 'Sort by',
    newest: 'Newest',
    priceAsc: 'Price: Low → High',
    priceDesc: 'Price: High → Low',
    endingSoonSort: 'Ending Soon',
    
    // General
    noItems: 'No items found',
    loading: 'Loading...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    items: 'items',

    // Time
    days: 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
  }
};

export function t(lang, key) {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export default translations;

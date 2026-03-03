export type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'location'
  | 'redPacket'
  | 'file'
  | 'product'
  | 'system';

export interface ParsedContent {
  type: MessageType;
  content: string;
  meta?: any;
}

const startsWithAny = (value: string, candidates: string[]): boolean => {
  const normalized = value.trim().toLowerCase();
  return candidates.some((candidate) => normalized.startsWith(candidate.toLowerCase()));
};

export const parseMessage = (raw: unknown): ParsedContent => {
  const content = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
  if (!content) return { type: 'text', content: '' };

  const productMarkers = ['[商品]', '[product]', '[PRODUCT]'];
  const marker = productMarkers.find((item) => content.includes(item)) || '';
  if (marker) {
    const markerIndex = content.indexOf(marker);
    const textPart = content.substring(0, markerIndex).replace(/🛍️$/, '').trim();
    const jsonPart = content.substring(markerIndex + marker.length).trim();

    let productData: any = null;
    try {
      const cleanJson = jsonPart.replace(/^```\w*\s*/, '').replace(/```$/, '');
      const jsonStart = cleanJson.search(/[\[{]/);
      if (jsonStart !== -1) {
        productData = JSON.parse(cleanJson.substring(jsonStart));
      }
    } catch (error) {
      console.warn('[messageParser] Product parse failed:', error);
    }

    return {
      type: 'product',
      content: textPart,
      meta: productData,
    };
  }

  if (startsWithAny(content, ['📍 [位置]', '[位置]', 'location:', '[location]'])) {
    return { type: 'location', content: content.replace(/^📍\s*\[位置\]|\[位置\]|location:|\[location\]/i, '').trim() };
  }

  if (startsWithAny(content, ['🧧 [红包]', '[红包]', '[redpacket]'])) {
    return { type: 'redPacket', content: content.replace(/^🧧\s*\[红包\]|\[红包\]|\[redpacket\]/i, '').trim() };
  }

  if (startsWithAny(content, ['📂 [文件]', '[文件]', '[file]'])) {
    const rawFile = content.replace(/^📂\s*\[文件\]|\[文件\]|\[file\]/i, '').trim();
    const parts = rawFile.split('|').map((item) => item.trim());
    return {
      type: 'file',
      content: parts[0] || 'Unknown file',
      meta: { size: parts[1], ext: parts[2] },
    };
  }

  if (startsWithAny(content, ['🎤', '[语音]', '[voice]'])) {
    const match = content.match(/(\d+")/);
    return {
      type: 'voice',
      content: 'Voice message',
      meta: { duration: match ? match[0] : '3"' },
    };
  }

  if (startsWithAny(content, ['data:image', '📷', '🖼️'])) {
    const clean = content.replace(/^(📷|🖼️)\s*/, '');
    if (clean.startsWith('http') || clean.startsWith('data:')) {
      return { type: 'image', content: clean };
    }
    return { type: 'image', content: clean || content };
  }

  return { type: 'text', content };
};

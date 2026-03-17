import { ChatMessage, GeneratorConfig, ILLMProvider } from '../types';

export class MockProvider implements ILLMProvider {
  name = 'Mock/Debug';

  async *generateStream(
    _history: ChatMessage[],
    prompt: string,
    images?: { mimeType: string; data: string }[],
    config?: GeneratorConfig
  ): AsyncGenerator<string, void, unknown> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let response = '';
    const lowerQuery = prompt.toLowerCase();
    const instruction = config?.systemInstruction || '';

    if (images && images.length > 0) {
      response =
        'I can see an uploaded image. [Mock Vision] This looks like user-provided content, and I can help describe it or reason about what appears in the frame.';
    } else if (
      lowerQuery.startsWith('order') ||
      lowerQuery.startsWith('checkout') ||
      lowerQuery.startsWith('buy now')
    ) {
      const productName =
        prompt
          .replace(/^order/i, '')
          .replace(/^checkout/i, '')
          .replace(/^buy now/i, '')
          .replace(/[:：]/g, '')
          .trim() || 'Product';
      const orderData = [
        {
          id: 'order_new',
          name: `${productName} (Awaiting Payment)`,
          price: 2499,
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${productName}`,
          desc: 'The order has been created. Please complete payment within 15 minutes.',
          bannerTitle: 'Instant savings at checkout',
          bannerSub: 'Pay with the linked bank card to unlock an extra discount.',
          shopName: 'OpenChat Direct',
          distance: '0m',
          rating: 5.0,
        },
      ];
      response = `Your order draft is ready:\n\n[Product] ${JSON.stringify(orderData)}`;
    } else if (
      instruction.includes('Shopping') ||
      lowerQuery.includes('recommend') ||
      lowerQuery.includes('buy') ||
      lowerQuery.includes('shop') ||
      lowerQuery.includes('headphone')
    ) {
      if (lowerQuery.includes('tea')) {
        const drinks = [
          {
            id: 'tea_1',
            name: 'Mango Pomelo Sago',
            price: 22,
            originalPrice: 28,
            image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600',
            reason: 'A best seller with rich mango notes and a refreshing finish.',
            tags: ['Best Seller', 'Low Sugar'],
            shopName: 'Seven Tea',
            rating: 4.9,
          },
          {
            id: 'tea_2',
            name: 'Coconut Latte',
            price: 18,
            image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600',
            reason: 'Smooth and cozy, especially suitable for a cool afternoon.',
            tags: ['Warm Drink', 'Energy Boost'],
            shopName: 'Luckin Coffee',
            rating: 4.7,
          },
          {
            id: 'tea_3',
            name: 'Cheese Grape Tea',
            price: 29,
            image: 'https://images.unsplash.com/photo-1626809712140-192b6a707472?w=600',
            reason: 'A fruity choice with bright grape notes and a creamy top.',
            tags: ['Fresh Fruit', 'Cheese Foam'],
            shopName: 'Heytea',
            rating: 4.8,
          },
        ];

        response =
          `Based on your taste and the current vibe, here are three drink picks. The mango pomelo sago is the safest crowd favorite right now:\n\n[Product] ${JSON.stringify(drinks)}`;
      } else {
        const products = [
          {
            id: 'sony_xm5',
            name: 'Sony WH-1000XM5',
            price: 2499,
            originalPrice: 2999,
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600',
            reason: 'Best overall noise cancellation, ideal for travel and focused work.',
            tags: ['Flagship Pick', 'Long Battery'],
            shopName: 'Sony Flagship Store',
            rating: 4.9,
          },
          {
            id: 'bose_qc45',
            name: 'Bose QC45',
            price: 1999,
            originalPrice: 2299,
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
            reason: 'Exceptionally comfortable for long listening sessions.',
            tags: ['Comfort', 'Classic'],
            shopName: 'Bose Store',
            rating: 4.7,
          },
          {
            id: 'apple_max',
            name: 'AirPods Max',
            price: 3999,
            image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600',
            reason: 'The best choice if you are deep in the Apple ecosystem.',
            tags: ['Apple Ecosystem', 'Premium Build'],
            shopName: 'Apple Store',
            rating: 4.8,
          },
        ];

        response =
          `Here is a comparison of three popular noise-cancelling headphones. If you want the strongest all-around pick, start with Sony XM5:\n\n[Product] ${JSON.stringify(products)}`;
      }
    } else {
      response = `I received your message: "${prompt}"\n\nTry prompts like "recommend headphones", "tea suggestions", or "order: Sony WH-1000XM5" to see richer mock commerce cards.`;
    }

    const chunkSize = 5;
    for (let index = 0; index < response.length; index += chunkSize) {
      yield response.slice(index, index + chunkSize);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

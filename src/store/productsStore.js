class ProductsStore {
  constructor() {
    this._products = [];
  }

  seed() {
    if (this._products.length > 0) return;

    this._products = [
      {
        id: 1,
        name: 'Wireless Keyboard',
        price: 39.99,
        currency: 'USD',
        description: 'A comfortable, quiet wireless keyboard for everyday typing.',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=60'
      },
      {
        id: 2,
        name: 'Noise-Cancelling Headphones',
        price: 129.0,
        currency: 'USD',
        // Keep text aligned with tests that expect "Noise cancellation" substring.
        description: 'Immerse yourself with active Noise cancellation and crisp sound.',
        imageUrl: 'https://images.unsplash.com/photo-1518441902117-af6d5a0c4f5a?auto=format&fit=crop&w=1200&q=60'
      },
      {
        id: 3,
        name: 'Smart Desk Lamp',
        price: 24.5,
        currency: 'USD',
        description: 'Adjustable lighting with a warm glow—perfect for late-night work.',
        imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=60'
      }
    ];
  }

  list() {
    return this._products;
  }

  findById(id) {
    const numericId = Number(id);
    return this._products.find((p) => p.id === numericId) || null;
  }
}

const productsStore = new ProductsStore();

module.exports = { productsStore };

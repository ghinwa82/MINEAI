export const CartService = {
  getCart: () => [],
  addToCart: (productId: string) => console.log(`Product ${productId} added to cart`),
  removeFromCart: (productId: string) => console.log(`Product ${productId} removed`)
};

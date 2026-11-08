'use client';

import { CartService } from '@/lib/cart';
import { getSessionId } from '@/lib/session';
import { trackEvent } from '@/lib/conversionFunnel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Array<{ product: any; quantity: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Track page view for cart
  useEffect(() => {
    const sessionId = getSessionId();
    trackEvent(null, sessionId, 'page_view', {
      metadata: { page: '/cart' },
    });
  }, []);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    try {
      const items = CartService.getItems();
      setCartItems(items);
    } catch (err) {
      console.error('Failed to load cart:', err);
      alert('فشل في تحميل السلة');
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(productId: string, newQuantity: number) {
    CartService.updateQuantity(productId, newQuantity);
    loadCart(); // Reload to reflect changes
    // We skip tracking every quantity change as a conversion event for simplicity.
    alert('تم تحديث الكمية');
  }

  function handleRemoveItem(productId: string) {
    CartService.removeItem(productId);
    loadCart();
    // Track remove from cart event
    const sessionId = getSessionId();
    trackEvent(null, sessionId, 'remove_from_cart', {
      productId: productId,
    });
    alert('تم إزالة المنتج');
  }

  function handleClearCart() {
    CartService.clearCart();
    setCartItems([]);
    // We skip tracking cart cleared event as it's not a standard event type.
    alert('تم مسح السلة');
  }

  function handleCheckout() {
    if (cartItems.length === 0) {
      alert('السلة فارغة');
      return;
    }
    // Track checkout start event
    const sessionId = getSessionId();
    trackEvent(null, sessionId, 'checkout_start', {
      metadata: {
        cartItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalPrice: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      },
    });
    // Redirect to checkout page
    router.push('/checkout');
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <p>جاري التحميل...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">سلة التسوق</h1> {/* Arabic for "Shopping Cart" */}

      {cartItems.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground">السلة فارغة</p> {/* Arabic for "Your cart is empty" */}
          <Link href="/store" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            العودة إلى المتجر {/* Arabic for "Return to Store" */}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">ملخص السلة</h2> {/* Arabic for "Cart Summary" */}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المنتج
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجمالي
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.image_url || '/placeholder.png'}
                            alt={item.product.name}
                            className="h-12 w-12 object-contain"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        ${item.product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              const newQty = item.quantity - 1;
                              if (newQty >= 1) {
                                handleQuantityChange(item.product.id, newQty);
                              }
                            }}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={item.quantity === 1}
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-sm text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div>
              <p className="text-sm text-gray-500">
                إجمالي العناصر: {totalItems}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                الإجمالي: ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClearCart}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
            >
              مسح السلة {/* Arabic for "Clear Cart" */}
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              المتابعة للدفع {/* Arabic for "Proceed to Checkout" */}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
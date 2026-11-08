'use client';

import { useEffect } from 'react';
import { CartService } from '@/lib/cart';
import { getSessionId } from '@/lib/session';
import { trackEvent } from '@/lib/conversionFunnel';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Track checkout page view
    const sessionId = getSessionId();
    trackEvent(null, sessionId, 'page_view', {
      metadata: { page: '/checkout' },
    });

    // Process the checkout from cart
    const cartItems = CartService.getItems();
    if (cartItems.length === 0) {
      alert('السلة فارغة');
      router.push('/cart');
      return;
    }

    // Simulate processing (in a real app, you would integrate with a payment gateway)
    // For now, we just create an order using the ecommerce service (requires user ID)
    // Since we don't have a user system, we'll simulate a user ID.
    const fakeUserId = '00000000-0000-0000-0000-000000000000'; // placeholder

    // We would normally call createOrder from ecommerce service, but we don't want to actually create an order in this demo.
    // Instead, we'll just clear the cart and show a success message.

    // Track purchase event
    trackEvent(null, sessionId, 'purchase', {
      metadata: {
        cartItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalPrice: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      },
    });

    // Clear cart
    CartService.clearCart();

    // Show success message
    alert('تم الدفع بنجاح\\nشكرًا لعملية الشراء!');

    // Redirect to home or store after a delay
    setTimeout(() => {
      router.push('/store');
    }, 2000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">الدفع</h2> {/* Arabic for "Checkout" */}
        <p className="text-center">
          جارٍ معالجة طلبك...
        </p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push('/store')}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
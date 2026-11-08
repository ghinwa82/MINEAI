import { supabase } from './supabase';
import { Product } from './ecommerce';

// Dispatch instruction interface
export interface DispatchInstruction {
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
}

/**
 * Split order items by supplier and generate dispatch instructions
 * @param orderItems Array of order items with productId and quantity
 */
export async function splitOrderBySupplier(
  orderItems: { productId: string; quantity: number }[]
): Promise<DispatchInstruction[]> {
  // Group items by productId to avoid duplicate fetches
  const productQuantities: Record<string, number> = {};
  for (const item of orderItems) {
    productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
  }

  // Fetch product details for each unique productId
  const productIds = Object.keys(productQuantities);
  const products: Record<string, Product> = {};

  for (const productId of productIds) {
    const product = await getProductById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    products[productId] = product;
  }

  // Group by supplierId
  const supplierGroups: Record<string, {
    supplierId: string;
    supplierName: string;
    items: { productId: string; productName: string; quantity: number }[];
  }> = {};

  for (const productId of productIds) {
    const product = products[productId];
    const quantity = productQuantities[productId];
    const supplierId = product.supplier_id;

    if (!supplierGroups[supplierId]) {
      // We don't have supplier name yet, we'll fetch it later or from product?
      // In a real system, we might have supplier details in the product or a separate table.
      // For now, we'll leave supplier name as null and fetch later if needed.
      supplierGroups[supplierId] = {
        supplierId,
        supplierName: '', // placeholder
        items: [],
      };
    }

    supplierGroups[supplierId].items.push({
      productId,
      productName: product.name,
      quantity,
    });
  }

  // Fetch supplier names for each supplierId
  const supplierIds = Object.keys(supplierGroups);
  for (const supplierId of supplierIds) {
    const supplier = await getSupplierById(supplierId);
    if (supplier) {
      supplierGroups[supplierId].supplierName = supplier.name;
    } else {
      supplierGroups[supplierId].supplierName = `Unknown Supplier (${supplierId})`;
    }
  }

  // Convert to array
  return Object.values(supplierGroups);
}

/**
 * Get product by ID (reuse from ecommerce service)
 */
async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch product: ${error.message}`);
  }

  return data as Product;
}

/**
 * Get supplier by ID (reuse from ecommerce service)
 */
async function getSupplierById(id: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch supplier: ${error.message}`);
  }

  return data as { id: string; name: string } | null;
}

/**
 * Generate dispatch instructions for an order (using order ID)
 * @param orderId The order ID to generate dispatch for
 */
export async function generateDispatchForOrder(orderId: string): Promise<DispatchInstruction[]> {
  // Fetch order items for the order
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Failed to fetch order items: ${error.message}`);
  }

  // Group by supplier
  const supplierGroups: Record<string, {
    supplierId: string;
    supplierName: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
    }[];
  }> = {};

  for (const item of orderItems) {
    // Fetch product
    const product = await getProductById(item.product_id);
    if (!product) {
      // If product not found, skip this item
      continue;
    }
    // Fetch supplier
    const supplier = await getSupplierById(product.supplier_id);
    if (!supplier) {
      // If supplier not found, skip this item
      continue;
    }

    const supplierId = supplier.id;
    const supplierName = supplier.name;
    const productId = product.id;
    const productName = product.name;
    const quantity = item.quantity;

    if (!supplierGroups[supplierId]) {
      supplierGroups[supplierId] = {
        supplierId,
        supplierName,
        items: [],
      };
    }

    supplierGroups[supplierId].items.push({
      productId,
      productName,
      quantity,
    });
  }

  return Object.values(supplierGroups);
}
import { DropshipOrderPayload, DropshipProduct, AgentLog } from '../types';
import { StrixGuard } from '../security/strix-guard';

export class DropshipSupplyService {
  public static readonly CATALOG: DropshipProduct[] = [
    {
      id: 'prod-asic-01',
      sku: 'MINEAI-EDGE-RIG-V1',
      nameAr: 'عقدة الحوسبة العصبية MineAI Edge V1',
      nameEn: 'MineAI Edge Neural Box v1',
      descriptionAr: 'وحدة تسريع حوسبة ذكاء اصطناعي لامركزية مجهزة بـ 8 رقائق عصبية موفرة للطاقة.',
      descriptionEn: 'Decentralized AI inference micro-node equipped with 8 ultra-efficient NPU dies.',
      category: 'Inference Rigs',
      retailPriceUsd: 499.0,
      hashrateCapacityMhs: 120.0,
      powerWatts: 85,
      imageUrl: '/products/rig1.png'
    },
    {
      id: 'prod-asic-02',
      sku: 'MINEAI-KASPA-SCYTHE',
      nameAr: 'مسرع خوارزميات الحوسبة Kaspa Scythe',
      nameEn: 'Kaspa Scythe Compute Engine',
      descriptionAr: 'معالج تسريع فائق لمعدلات التجزئة العالية متصل مباشرة بشبكة DePIN المركزية.',
      descriptionEn: 'High-throughput algorithmic ASIC co-processor natively hooked into MineAI network.',
      category: 'ASIC Accelerators',
      retailPriceUsd: 1150.0,
      hashrateCapacityMhs: 850.0,
      powerWatts: 240,
      imageUrl: '/products/rig2.png'
    }
  ];

  public static async executeFactoryOrder(order: DropshipOrderPayload): Promise<{ orderTracking: string; log: AgentLog }> {
    const product = this.CATALOG.find(p => p.id === order.productId) || this.CATALOG[0];
    const factoryOrderNumber = 'SUPPLIER-SHP-' + StrixGuard.computeSecurityHash(`${order.shippingAddressLine}:${Date.now()}`);
    const trackingNumber = 'TRK-DHL-EXP-' + Math.floor(100000000 + Math.random() * 900000000);

    const log: AgentLog = {
      id: `drop-${Date.now()}`,
      agentName: 'FINANCIAL',
      timestamp: new Date().toISOString(),
      type: 'INFO',
      messageEn: `Dropship hardware purchase authorized: ${order.quantity}x ${product.nameEn}. Transmitted to factory with ID: ${factoryOrderNumber}. Tracking: ${trackingNumber}`,
      messageAr: `تم اعتماد طلب شراء عتاد التعدين: ${order.quantity}x ${product.nameAr}. تم الإرسال للمصنع برقم: ${factoryOrderNumber}. التتبع: ${trackingNumber}`,
      metadata: { factoryOrderNumber, trackingNumber, sku: product.sku }
    };

    return { orderTracking: trackingNumber, log };
  }
}
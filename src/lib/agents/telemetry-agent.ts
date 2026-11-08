import { NodeMetrics, AgentLog } from '../types';

export class TelemetryAuditorAgent {
  public static auditAndHeal(nodes: NodeMetrics[]): { updatedNodes: NodeMetrics[]; logs: AgentLog[] } {
    const logs: AgentLog[] = [];
    const timestamp = new Date().toISOString();

    const updatedNodes = nodes.map((node) => {
      let status = node.status;
      let hashrate = node.hashrateMhs;
      const cpuLoad = Math.min(100, Math.max(10, Math.round(node.cpuLoad + (Math.random() * 6 - 3))));
      const gpuLoad = Math.min(100, Math.max(20, Math.round(node.gpuLoad + (Math.random() * 8 - 4))));

      if (status === 'OFFLINE' || cpuLoad > 95 || gpuLoad > 98) {
        status = 'HEALING';
        hashrate = Math.round(hashrate * 0.4);
        logs.push({
          id: `tel-${Date.now()}-${node.id}`,
          agentName: 'TELEMETRY',
          timestamp,
          type: 'WARN',
          messageEn: `Node ${node.name} throttled/disconnected. Auto-healing script initialized.`,
          messageAr: `تم رصد هبوط أداء أو انقطاع العقدة ${node.name}. بدأ بروتوكول الشفاء الذاتي.`,
          metadata: { nodeId: node.id, cpuLoad, gpuLoad }
        });
      } else if (status === 'HEALING') {
        status = 'ONLINE';
        hashrate = Math.round(node.hashrateMhs * 1.5) || 45;
        logs.push({
          id: `tel-heal-${Date.now()}-${node.id}`,
          agentName: 'TELEMETRY',
          timestamp,
          type: 'SUCCESS',
          messageEn: `Node ${node.name} healed successfully. Compute stream restored to ${hashrate} MH/s.`,
          messageAr: `تمت استعادة العقدة ${node.name} بنجاح. عاد معدل الحوسبة إلى ${hashrate} MH/s.`,
          metadata: { nodeId: node.id, hashrate }
        });
      } else {
        hashrate = Math.max(30, Math.round(hashrate + (Math.random() * 4 - 2)));
      }

      return {
        ...node,
        status,
        cpuLoad,
        gpuLoad,
        hashrateMhs: hashrate,
        uptimeSeconds: node.uptimeSeconds + 5
      };
    });

    return { updatedNodes, logs };
  }
}
import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { IRedPacketService, RedPacket } from '../types';

const TAG = 'RedPacketService';
const STORAGE_KEY = 'sys_wallet_red_packets_v1';
const RED_PACKET_EVENTS = {
  RECEIVED: 'wallet:red_packet_received',
} as const;

interface StoredRedPacket extends RedPacket {
  recipientId: string;
  createTime: number;
  updateTime: number;
  openedAmount?: number;
}

class RedPacketServiceImpl implements IRedPacketService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private now(): number {
    return this.deps.clock.now();
  }

  private async readPackets(): Promise<StoredRedPacket[]> {
    const packets = await Promise.resolve(this.deps.storage.get<StoredRedPacket[]>(STORAGE_KEY));
    return packets || [];
  }

  private async writePackets(packets: StoredRedPacket[]): Promise<void> {
    await Promise.resolve(this.deps.storage.set(STORAGE_KEY, packets));
  }

  async sendRedPacket(toUserId: string, amount: number, message: string): Promise<RedPacket> {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid red packet amount');
    }

    const now = this.now();
    const packets = await this.readPackets();
    const packet: StoredRedPacket = {
      id: this.deps.idGenerator.next('rp'),
      senderName: 'Me',
      message,
      status: 'closed',
      recipientId: toUserId,
      createTime: now,
      updateTime: now,
      openedAmount: Number(amount.toFixed(2)),
    };

    packets.unshift(packet);
    await this.writePackets(packets);
    this.deps.eventBus.emit(RED_PACKET_EVENTS.RECEIVED, { redPacket: packet });
    this.deps.logger.info(TAG, 'Red packet sent', { id: packet.id, toUserId });

    return packet;
  }

  async openRedPacket(id: string): Promise<number> {
    const packets = await this.readPackets();
    const index = packets.findIndex((packet) => packet.id === id);
    if (index < 0) {
      throw new Error('Red packet not found');
    }

    const packet = packets[index];
    if (packet.status === 'opened') {
      return packet.amount || packet.openedAmount || 0;
    }

    const openedAmount = packet.openedAmount || packet.amount || 0;
    packets[index] = {
      ...packet,
      status: 'opened',
      amount: openedAmount,
      updateTime: this.now(),
    };

    await this.writePackets(packets);
    this.deps.logger.info(TAG, 'Red packet opened', { id, amount: openedAmount });
    return openedAmount;
  }
}

export function createRedPacketService(_deps?: ServiceFactoryDeps): IRedPacketService {
  return new RedPacketServiceImpl(_deps);
}

export const redPacketService: IRedPacketService = createRedPacketService();

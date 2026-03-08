import { describe, expect, it } from 'vitest';
import type { Address, InvoiceTitle, UserProfile } from '.';

describe('entity base shape', () => {
  it('UserProfile contains id and timestamps', () => {
    const profile: UserProfile = {
      id: 'u1',
      createTime: 1,
      updateTime: 1,
      name: 'User',
      wxid: 'wx_u1',
      avatar: 'avatar',
      region: 'CN',
      status: { icon: 'online', text: 'active', isActive: true },
      gender: 'male',
      signature: 'hello',
    };
    expect(profile.id).toBe('u1');
    expect(profile.createTime).toBe(1);
    expect(profile.updateTime).toBe(1);
  });

  it('Address contains id and timestamps', () => {
    const address: Address = {
      id: 'a1',
      createTime: 1,
      updateTime: 1,
      name: 'Tom',
      phone: '13800000000',
      detail: 'Road 1',
      isDefault: true,
    };
    expect(address.id).toBe('a1');
    expect(address.createTime).toBe(1);
    expect(address.updateTime).toBe(1);
  });

  it('InvoiceTitle contains id and timestamps', () => {
    const invoice: InvoiceTitle = {
      id: 'i1',
      createTime: 1,
      updateTime: 1,
      type: 'personal',
      title: 'Personal',
      isDefault: false,
    };
    expect(invoice.id).toBe('i1');
    expect(invoice.createTime).toBe(1);
    expect(invoice.updateTime).toBe(1);
  });
});

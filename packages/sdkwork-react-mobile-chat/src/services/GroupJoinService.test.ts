import { describe, expect, it } from 'vitest';
import {
  createInitialGroupJoinState,
  formatGroupJoinPrice,
  groupJoinService,
  resolveGroupJoinAction,
} from './GroupJoinService';

describe('GroupJoinService', () => {
  it('returns plans from chat domain with paid groups', async () => {
    const plans = await groupJoinService.listPlans();
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.some((plan) => plan.accessMode === 'paid')).toBe(true);
    expect(plans.some((plan) => plan.groupType === 'SDKWORK')).toBe(true);
    expect(plans.some((plan) => plan.groupType === 'WECHAT')).toBe(true);
    expect(plans.some((plan) => plan.groupType === 'QQ')).toBe(true);
    expect(plans.some((plan) => plan.groupType === 'FEISHU')).toBe(true);
  });

  it('marks a paid group as paid and joined in one action', async () => {
    const plans = await groupJoinService.listPlans();
    const paidGroup = plans.find((plan) => plan.accessMode === 'paid');
    expect(paidGroup).toBeDefined();

    const state = createInitialGroupJoinState();
    const result = resolveGroupJoinAction(plans, state, paidGroup!.id);

    expect(result.status).toBe('payment_then_joined');
    expect(result.nextState.paidGroupIds[paidGroup!.id]).toBe(true);
    expect(result.nextState.joinedGroupIds[paidGroup!.id]).toBe(true);
  });

  it('marks a free group as joined without paid state', async () => {
    const plans = await groupJoinService.listPlans();
    const freeGroup = plans.find((plan) => plan.accessMode === 'free');
    expect(freeGroup).toBeDefined();

    const state = createInitialGroupJoinState();
    const result = resolveGroupJoinAction(plans, state, freeGroup!.id);

    expect(result.status).toBe('joined');
    expect(result.nextState.joinedGroupIds[freeGroup!.id]).toBe(true);
    expect(result.nextState.paidGroupIds[freeGroup!.id]).toBeUndefined();
  });

  it('returns already_joined when joining the same group twice', async () => {
    const plans = await groupJoinService.listPlans();
    const target = plans[0];
    const first = resolveGroupJoinAction(plans, createInitialGroupJoinState(), target.id);
    const second = resolveGroupJoinAction(plans, first.nextState, target.id);

    expect(second.status).toBe('already_joined');
    expect(second.nextState).toEqual(first.nextState);
  });

  it('formats group join price with fallback', () => {
    const yuan = String.fromCharCode(0x00a5);
    const freeText = String.fromCharCode(0x514d, 0x8d39);

    expect(formatGroupJoinPrice(1990)).toBe(`${yuan}19.90`);
    expect(formatGroupJoinPrice(undefined)).toBe(freeText);
    expect(formatGroupJoinPrice(0)).toBe(freeText);
  });
});

export type GroupType = 'SDKWORK' | 'WECHAT' | 'QQ' | 'FEISHU';
export type JoinAccessMode = 'free' | 'paid';
export type PaymentMethod = 'balance' | 'wechat_pay' | 'alipay';
export type GroupJoinSource = 'scan' | 'chat-details';

export interface GroupJoinPlan {
  id: string;
  name: string;
  groupType: GroupType;
  description: string;
  members: number;
  accessMode: JoinAccessMode;
  priceCents?: number;
  paymentMethods: PaymentMethod[];
}

export interface GroupJoinState {
  joinedGroupIds: Record<string, boolean>;
  paidGroupIds: Record<string, boolean>;
}

export type GroupJoinActionStatus =
  | 'joined'
  | 'payment_then_joined'
  | 'already_joined'
  | 'not_found';

export interface GroupJoinActionResult {
  status: GroupJoinActionStatus;
  group?: GroupJoinPlan;
  nextState: GroupJoinState;
}

const GROUP_JOIN_PLANS: GroupJoinPlan[] = [
  {
    id: 'sdkwork-core',
    name: 'SDKWORK \u6838\u5fc3\u8ba8\u8bba\u7fa4',
    groupType: 'SDKWORK',
    description: '\u4ea7\u54c1\u66f4\u65b0, \u7248\u672c\u52a8\u6001, \u7814\u53d1\u5171\u5efa',
    members: 1289,
    accessMode: 'free',
    paymentMethods: ['balance'],
  },
  {
    id: 'sdkwork-wechat-pro',
    name: 'SDKWORK \u5fae\u4fe1\u9ad8\u9636\u7fa4',
    groupType: 'WECHAT',
    description: '\u5de5\u4f5c\u6d41\u5171\u5efa, \u9700\u4ed8\u8d39\u5165\u7fa4',
    members: 862,
    accessMode: 'paid',
    priceCents: 1990,
    paymentMethods: ['wechat_pay', 'alipay', 'balance'],
  },
  {
    id: 'sdkwork-qq-open',
    name: 'SDKWORK QQ \u5f00\u653e\u7fa4',
    groupType: 'QQ',
    description: '\u95ee\u9898\u7b54\u7591, \u6848\u4f8b\u4ea4\u6d41, \u521d\u7ea7\u514d\u8d39',
    members: 1436,
    accessMode: 'free',
    paymentMethods: ['balance'],
  },
  {
    id: 'sdkwork-feishu-enterprise',
    name: 'SDKWORK \u98de\u4e66\u4f01\u4e1a\u534f\u4f5c\u7fa4',
    groupType: 'FEISHU',
    description: '\u4f01\u4e1a\u5185\u90e8\u4f53\u7cfb\u5316\u534f\u4f5c, \u652f\u6301\u4ed8\u8d39\u5165\u7fa4',
    members: 514,
    accessMode: 'paid',
    priceCents: 2990,
    paymentMethods: ['wechat_pay', 'balance'],
  },
];

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  SDKWORK: 'SDKWORK',
  WECHAT: 'WECHAT(\u5fae\u4fe1)',
  QQ: 'QQ\u7fa4',
  FEISHU: '\u98de\u4e66\u7fa4',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  balance: '\u4f59\u989d',
  wechat_pay: '\u5fae\u4fe1\u652f\u4ed8',
  alipay: '\u652f\u4ed8\u5b9d',
};

export const formatGroupJoinPrice = (priceCents: number | undefined): string => {
  if (typeof priceCents !== 'number' || Number.isNaN(priceCents) || priceCents <= 0) return '\u514d\u8d39';
  return `\u00a5${(priceCents / 100).toFixed(2)}`;
};

export const createInitialGroupJoinState = (): GroupJoinState => ({
  joinedGroupIds: {},
  paidGroupIds: {},
});

export const resolveGroupJoinAction = (
  plans: GroupJoinPlan[],
  state: GroupJoinState,
  groupId: string
): GroupJoinActionResult => {
  const targetGroup = plans.find((item) => item.id === groupId);
  if (!targetGroup) {
    return { status: 'not_found', nextState: state };
  }

  if (state.joinedGroupIds[groupId]) {
    return { status: 'already_joined', group: targetGroup, nextState: state };
  }

  const nextState: GroupJoinState = {
    joinedGroupIds: { ...state.joinedGroupIds },
    paidGroupIds: { ...state.paidGroupIds },
  };

  let status: GroupJoinActionStatus = 'joined';
  if (targetGroup.accessMode === 'paid' && !nextState.paidGroupIds[groupId]) {
    nextState.paidGroupIds[groupId] = true;
    status = 'payment_then_joined';
  }

  nextState.joinedGroupIds[groupId] = true;

  return {
    status,
    group: targetGroup,
    nextState,
  };
};

export interface IGroupJoinService {
  listPlans(): Promise<GroupJoinPlan[]>;
}

class GroupJoinServiceImpl implements IGroupJoinService {
  async listPlans(): Promise<GroupJoinPlan[]> {
    return GROUP_JOIN_PLANS;
  }
}

export const createGroupJoinService = (): IGroupJoinService => new GroupJoinServiceImpl();
export const groupJoinService = createGroupJoinService();


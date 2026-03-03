import { resolveServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type { ServiceFactoryDeps, ServiceFactoryRuntimeDeps } from '@sdkwork/react-mobile-core';
import type {
  DistributionCommissionEntry,
  DistributionOverviewSnapshot,
  DistributionRankEntry,
  DistributionTaskItem,
  DistributionTeamMember,
  IDistributionService,
  ServiceResult,
  WithdrawMethod,
} from '../types';

export type {
  DistributionCommissionEntry as CommissionRecord,
  DistributionOverviewSnapshot as DistributionOverview,
  DistributionRankEntry as RankItem,
  DistributionTaskItem as DistributionTask,
  DistributionTeamMember as TeamMember,
  ServiceResult,
  WithdrawMethod,
} from '../types';

type DistributionOverview = DistributionOverviewSnapshot;
type TeamMember = DistributionTeamMember;
type CommissionRecord = DistributionCommissionEntry;
type DistributionTask = DistributionTaskItem;
type RankItem = DistributionRankEntry;

const STORAGE_KEYS = {
  overview: 'sys_commerce_distribution_overview_v2',
  tasks: 'sys_commerce_distribution_tasks_v2',
  withdrawals: 'sys_commerce_distribution_withdrawals_v2',
};

const seedOverview = (): DistributionOverview => ({
  levelName: 'Gold Distributor',
  referralCode: 'AI888',
  totalCommission: 12680.5,
  pendingCommission: 450,
  withdrawableCommission: 3280,
  totalSales: 89600,
  teamSize: 47,
  currentMonthCommission: 2486,
});

const seedMembers = (now: number): TeamMember[] => {
  const directNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona'];
  const secondNames = ['Iris', 'Jason', 'Kelly', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter'];

  const directMembers = directNames.map((name, idx) => ({
    id: `tm_l1_${idx + 1}`,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    role: 'Tier-1 Distributor',
    level: 1 as const,
    joinAt: new Date(now - (idx + 2) * 2 * 24 * 3600 * 1000).toISOString(),
    contribution: 1200 - idx * 110,
  }));

  const secondMembers = secondNames.map((name, idx) => ({
    id: `tm_l2_${idx + 1}`,
    name,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
    role: 'Tier-2 Distributor',
    level: 2 as const,
    joinAt: new Date(now - (idx + 3) * 3 * 24 * 3600 * 1000).toISOString(),
    contribution: 380 - idx * 28,
  }));

  return [...directMembers, ...secondMembers];
};

const seedIncomeRecords = (now: number): CommissionRecord[] => [
  {
    id: 'cm_income_1',
    type: 'income',
    productName: 'Sony WH-1000XM5',
    sourceUser: 'Alice',
    level: 1,
    amount: 158,
    status: 'settled',
    createdAt: new Date(now - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cm_income_2',
    type: 'income',
    productName: 'iPhone 15 Pro Max',
    sourceUser: 'Bob',
    level: 2,
    amount: 86,
    status: 'pending',
    createdAt: new Date(now - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cm_income_3',
    type: 'income',
    productName: 'MacBook Pro 14"',
    sourceUser: 'Charlie',
    level: 1,
    amount: 260,
    status: 'settled',
    createdAt: new Date(now - 22 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cm_income_4',
    type: 'income',
    productName: 'Nike Air Max 270',
    sourceUser: 'Diana',
    level: 1,
    amount: 48,
    status: 'settled',
    createdAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

const seedTasks = (): DistributionTask[] => [
  {
    id: 'dt_1',
    title: 'Share Invite Poster',
    desc: 'Save and share to your social feed',
    target: 1,
    current: 0,
    reward: '+50 points',
    status: 'todo',
  },
  {
    id: 'dt_2',
    title: 'Complete First Invite',
    desc: 'Invite one friend to register',
    target: 1,
    current: 1,
    reward: 'Commission ratio +1%',
    status: 'claim',
  },
  {
    id: 'dt_3',
    title: 'Team First Order',
    desc: 'Team member completes first paid order',
    target: 1,
    current: 1,
    reward: '$10 bonus',
    status: 'done',
  },
];

class DistributionServiceImpl implements IDistributionService {
  private readonly deps: ServiceFactoryRuntimeDeps;

  constructor(deps?: ServiceFactoryDeps) {
    this.deps = resolveServiceFactoryRuntimeDeps(deps);
  }

  private nowIso(): string {
    return new Date(this.deps.clock.now()).toISOString();
  }

  private async ensureInitialized() {
    const overview = await Promise.resolve(this.deps.storage.get<DistributionOverview>(STORAGE_KEYS.overview));
    if (!overview) {
      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.overview, seedOverview()));
    }

    const tasks = await Promise.resolve(this.deps.storage.get<DistributionTask[]>(STORAGE_KEYS.tasks));
    if (!tasks || !tasks.length) {
      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.tasks, seedTasks()));
    }

    const withdrawals = await Promise.resolve(this.deps.storage.get<CommissionRecord[]>(STORAGE_KEYS.withdrawals));
    if (!withdrawals) {
      await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.withdrawals, []));
    }
  }

  async getOverview(): Promise<ServiceResult<DistributionOverview>> {
    await this.ensureInitialized();
    const overview = await Promise.resolve(this.deps.storage.get<DistributionOverview>(STORAGE_KEYS.overview));
    if (!overview) return { success: false, message: 'Distribution overview not found' };
    return { success: true, data: overview };
  }

  async getTeamMembers(level: 'all' | 1 | 2 = 'all'): Promise<ServiceResult<TeamMember[]>> {
    const allMembers = seedMembers(this.deps.clock.now());
    const members = level === 'all' ? allMembers : allMembers.filter((item) => item.level === level);
    return { success: true, data: members };
  }

  async getCommissionRecords(type: 'all' | 'income' | 'withdraw' = 'all'): Promise<ServiceResult<CommissionRecord[]>> {
    await this.ensureInitialized();
    const withdrawals = (await Promise.resolve(this.deps.storage.get<CommissionRecord[]>(STORAGE_KEYS.withdrawals))) || [];
    const records = [...withdrawals, ...seedIncomeRecords(this.deps.clock.now())].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const filtered = type === 'all' ? records : records.filter((item) => item.type === type);
    return { success: true, data: filtered };
  }

  async getWeeklyEarnings(): Promise<ServiceResult<{ labels: string[]; data: number[] }>> {
    return {
      success: true,
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [120, 198, 160, 132, 186, 220, 268],
      },
    };
  }

  async getTasks(): Promise<ServiceResult<DistributionTask[]>> {
    await this.ensureInitialized();
    const tasks = (await Promise.resolve(this.deps.storage.get<DistributionTask[]>(STORAGE_KEYS.tasks))) || [];
    return { success: true, data: tasks };
  }

  async claimTask(taskId: string): Promise<ServiceResult<void>> {
    await this.ensureInitialized();
    const tasks = (await Promise.resolve(this.deps.storage.get<DistributionTask[]>(STORAGE_KEYS.tasks))) || [];
    const next = tasks.map((task) => {
      if (task.id !== taskId) return task;
      if (task.status !== 'claim') return task;
      return { ...task, status: 'done' as const };
    });
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.tasks, next));
    return { success: true };
  }

  async getRankings(): Promise<ServiceResult<RankItem[]>> {
    const ranking: RankItem[] = [
      { rank: 1, id: 'rk_1', name: 'Top Sales King', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king', amount: 158000, trend: 'flat' },
      { rank: 2, id: 'rk_2', name: 'Queen Bee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=queen', amount: 142300, trend: 'up' },
      { rank: 3, id: 'rk_3', name: 'Jack', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jack', amount: 128900, trend: 'down' },
      { rank: 4, id: 'rk_4', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', amount: 98800, trend: 'up' },
      { rank: 5, id: 'rk_5', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', amount: 88600, trend: 'flat' },
      { rank: 6, id: 'rk_me', name: 'Me', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', amount: 12680, trend: 'up' },
    ];
    return { success: true, data: ranking };
  }

  async withdraw(amount: number, method: WithdrawMethod): Promise<ServiceResult<void>> {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: 'Please provide a valid withdrawal amount' };
    }

    await this.ensureInitialized();
    const overview = await Promise.resolve(this.deps.storage.get<DistributionOverview>(STORAGE_KEYS.overview));
    if (!overview) return { success: false, message: 'Withdraw failed, please retry later' };

    if (amount > overview.withdrawableCommission) {
      return { success: false, message: 'Withdrawal exceeds available balance' };
    }

    const nextOverview: DistributionOverview = {
      ...overview,
      withdrawableCommission: Number((overview.withdrawableCommission - amount).toFixed(2)),
      totalCommission: Number((overview.totalCommission - amount).toFixed(2)),
    };
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.overview, nextOverview));

    const withdrawals = (await Promise.resolve(this.deps.storage.get<CommissionRecord[]>(STORAGE_KEYS.withdrawals))) || [];
    const status: CommissionRecord['status'] = method === 'bank' ? 'processing' : 'success';
    const targetName = method === 'wechat' ? 'WeChat' : method === 'alipay' ? 'Alipay' : 'Bank Card';
    withdrawals.unshift({
      id: this.deps.idGenerator.next('cm_withdraw'),
      type: 'withdraw',
      productName: `Withdraw to ${targetName}`,
      sourceUser: 'System',
      level: 0,
      amount: -amount,
      status,
      createdAt: this.nowIso(),
    });
    await Promise.resolve(this.deps.storage.set(STORAGE_KEYS.withdrawals, withdrawals));

    return { success: true };
  }

  calculateCommission(price: number, rate = 0.15) {
    return Number((price * rate).toFixed(2));
  }
}

export function createDistributionService(_deps?: ServiceFactoryDeps): IDistributionService {
  return new DistributionServiceImpl(_deps);
}

export const distributionService: IDistributionService = createDistributionService();


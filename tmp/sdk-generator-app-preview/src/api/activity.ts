import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { ActivityJoinForm, CheckInMakeUpForm, PlusApiResultActivityDetailVO, PlusApiResultActivityJoinVO, PlusApiResultCheckInMakeUpVO, PlusApiResultCheckInStatusVO, PlusApiResultCheckInVO, PlusApiResultListCheckInRecordVO, PlusApiResultListLotteryActivityVO, PlusApiResultListTaskVO, PlusApiResultLotteryDetailVO, PlusApiResultLotteryDrawVO, PlusApiResultPageActivityRecordVO, PlusApiResultPageActivityVO, PlusApiResultPageLotteryPrizeVO, PlusApiResultPagePointsExchangeRecordVO, PlusApiResultPagePointsGoodsVO, PlusApiResultPointsExchangeVO, PlusApiResultPointsGoodsDetailVO, PlusApiResultPrizeClaimVO, PlusApiResultRankInfoVO, PlusApiResultRankingVO, PlusApiResultTaskRewardVO, PointsExchangeForm } from '../types';


export class ActivityApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 参与活动 */
  async join(activityId: string | number, body: ActivityJoinForm): Promise<PlusApiResultActivityJoinVO> {
    return this.client.post<PlusApiResultActivityJoinVO>(appApiPath(`/activity/${activityId}/join`), body);
  }

/** 领取任务奖励 */
  async claimTaskReward(taskId: string | number): Promise<PlusApiResultTaskRewardVO> {
    return this.client.post<PlusApiResultTaskRewardVO>(appApiPath(`/activity/tasks/${taskId}/claim`));
  }

/** 兑换商品 */
  async exchangeGoods(goodsId: string | number, body: PointsExchangeForm): Promise<PlusApiResultPointsExchangeVO> {
    return this.client.post<PlusApiResultPointsExchangeVO>(appApiPath(`/activity/points-store/goods/${goodsId}/exchange`), body);
  }

/** 抽奖 */
  async drawLottery(lotteryId: string | number): Promise<PlusApiResultLotteryDrawVO> {
    return this.client.post<PlusApiResultLotteryDrawVO>(appApiPath(`/activity/lottery/${lotteryId}/draw`));
  }

/** 领取奖品 */
  async claimPrize(prizeId: string | number): Promise<PlusApiResultPrizeClaimVO> {
    return this.client.post<PlusApiResultPrizeClaimVO>(appApiPath(`/activity/lottery/prizes/${prizeId}/claim`));
  }

/** 每日签到 */
  async checkIn(): Promise<PlusApiResultCheckInVO> {
    return this.client.post<PlusApiResultCheckInVO>(appApiPath(`/activity/check-in`));
  }

/** 补签 */
  async makeUpCheckIn(body: CheckInMakeUpForm): Promise<PlusApiResultCheckInMakeUpVO> {
    return this.client.post<PlusApiResultCheckInMakeUpVO>(appApiPath(`/activity/check-in/make-up`), body);
  }

/** 获取活动详情 */
  async getActivityDetail(activityId: string | number): Promise<PlusApiResultActivityDetailVO> {
    return this.client.get<PlusApiResultActivityDetailVO>(appApiPath(`/activity/${activityId}`));
  }

/** 获取任务列表 */
  async listTasks(params?: QueryParams): Promise<PlusApiResultListTaskVO> {
    return this.client.get<PlusApiResultListTaskVO>(appApiPath(`/activity/tasks`), params);
  }

/** 获取参与记录 */
  async getActivityRecords(params?: QueryParams): Promise<PlusApiResultPageActivityRecordVO> {
    return this.client.get<PlusApiResultPageActivityRecordVO>(appApiPath(`/activity/records`), params);
  }

/** 获取排行榜 */
  async getRanking(type: string | number, params?: QueryParams): Promise<PlusApiResultRankingVO> {
    return this.client.get<PlusApiResultRankingVO>(appApiPath(`/activity/rankings/${type}`), params);
  }

/** 获取我的排名 */
  async getMyRank(type: string | number, params?: QueryParams): Promise<PlusApiResultRankInfoVO> {
    return this.client.get<PlusApiResultRankInfoVO>(appApiPath(`/activity/rankings/${type}/my-rank`), params);
  }

/** 获取积分商品 */
  async listPointsGoods(params?: QueryParams): Promise<PlusApiResultPagePointsGoodsVO> {
    return this.client.get<PlusApiResultPagePointsGoodsVO>(appApiPath(`/activity/points-store/goods`), params);
  }

/** 获取商品详情 */
  async getPointsGoodsDetail(goodsId: string | number): Promise<PlusApiResultPointsGoodsDetailVO> {
    return this.client.get<PlusApiResultPointsGoodsDetailVO>(appApiPath(`/activity/points-store/goods/${goodsId}`));
  }

/** 获取兑换记录 */
  async getExchangeRecords(params?: QueryParams): Promise<PlusApiResultPagePointsExchangeRecordVO> {
    return this.client.get<PlusApiResultPagePointsExchangeRecordVO>(appApiPath(`/activity/points-store/exchange-records`), params);
  }

/** 获取抽奖详情 */
  async getLotteryDetail(lotteryId: string | number): Promise<PlusApiResultLotteryDetailVO> {
    return this.client.get<PlusApiResultLotteryDetailVO>(appApiPath(`/activity/lottery/${lotteryId}`));
  }

/** 获取中奖记录 */
  async getMyPrizes(params?: QueryParams): Promise<PlusApiResultPageLotteryPrizeVO> {
    return this.client.get<PlusApiResultPageLotteryPrizeVO>(appApiPath(`/activity/lottery/my-prizes`), params);
  }

/** 获取抽奖列表 */
  async listLotteryActivities(): Promise<PlusApiResultListLotteryActivityVO> {
    return this.client.get<PlusApiResultListLotteryActivityVO>(appApiPath(`/activity/lottery/list`));
  }

/** 获取活动列表 */
  async listActivities(params?: QueryParams): Promise<PlusApiResultPageActivityVO> {
    return this.client.get<PlusApiResultPageActivityVO>(appApiPath(`/activity/list`), params);
  }

/** 获取签到状态 */
  async getCheckInStatus(): Promise<PlusApiResultCheckInStatusVO> {
    return this.client.get<PlusApiResultCheckInStatusVO>(appApiPath(`/activity/check-in/status`));
  }

/** 获取签到记录 */
  async getCheckInRecords(params?: QueryParams): Promise<PlusApiResultListCheckInRecordVO> {
    return this.client.get<PlusApiResultListCheckInRecordVO>(appApiPath(`/activity/check-in/records`), params);
  }
}

export function createActivityApi(client: HttpClient): ActivityApi {
  return new ActivityApi(client);
}

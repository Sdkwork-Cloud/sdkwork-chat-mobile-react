import React from 'react';
import { CellGroup, CellItem, Page, Toast } from '@sdkwork/react-mobile-commons';
import {
  GROUP_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  createInitialGroupJoinState,
  formatGroupJoinPrice,
  groupJoinService,
  resolveGroupJoinAction,
  type GroupJoinPlan,
  type GroupJoinSource,
} from '../services/GroupJoinService';
import './GroupJoinPage.css';

interface GroupJoinPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
  source?: GroupJoinSource;
  sessionId?: string;
  scanResult?: string;
  scanGroupId?: string;
  scanGroupName?: string;
  onJoinGroup?: (group: GroupJoinPlan) => void;
}

export const GroupJoinPage: React.FC<GroupJoinPageProps> = ({
  t,
  onBack,
  source = 'chat-details',
  sessionId,
  scanResult,
  scanGroupId,
  scanGroupName,
  onJoinGroup,
}) => {
  const [plans, setPlans] = React.useState<GroupJoinPlan[]>([]);
  const [groupJoinState, setGroupJoinState] = React.useState(createInitialGroupJoinState);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (!value || value === key) return fallback;
      return value;
    },
    [t]
  );

  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    const fallback = source === 'scan'
      ? '/scan'
      : (sessionId ? `/chat-details?id=${sessionId}` : '/conversation-list');
    window.history.pushState({}, '', fallback);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [onBack, sessionId, source]);

  React.useEffect(() => {
    let active = true;
    void groupJoinService.listPlans().then((nextPlans) => {
      if (!active) return;
      setPlans(nextPlans);
    });

    return () => {
      active = false;
    };
  }, []);

  const normalizedScanGroupId = (scanGroupId || '').trim().toLowerCase();
  const normalizedScanGroupName = (scanGroupName || '').trim().toLowerCase();

  const displayPlans = React.useMemo(() => {
    if (source !== 'scan') return plans;
    const targetIndex = plans.findIndex((plan) => {
      const byId = normalizedScanGroupId && plan.id.toLowerCase() === normalizedScanGroupId;
      const byName = normalizedScanGroupName && plan.name.trim().toLowerCase() === normalizedScanGroupName;
      return Boolean(byId || byName);
    });
    if (targetIndex <= 0) return plans;
    const target = plans[targetIndex];
    return [target, ...plans.slice(0, targetIndex), ...plans.slice(targetIndex + 1)];
  }, [normalizedScanGroupId, normalizedScanGroupName, plans, source]);

  const hasScanMatchedPlan = React.useMemo(
    () => displayPlans.some((plan) => {
      const byId = normalizedScanGroupId && plan.id.toLowerCase() === normalizedScanGroupId;
      const byName = normalizedScanGroupName && plan.name.trim().toLowerCase() === normalizedScanGroupName;
      return Boolean(byId || byName);
    }),
    [displayPlans, normalizedScanGroupId, normalizedScanGroupName]
  );

  const handleJoin = (groupId: string) => {
    const result = resolveGroupJoinAction(plans, groupJoinState, groupId);
    if (result.status === 'not_found' || result.status === 'already_joined') {
      return;
    }

    setGroupJoinState(result.nextState);

    if (result.status === 'payment_then_joined') {
      Toast.success(tr('chat.group_join_payment_success', '\u652f\u4ed8\u6210\u529f'));
    }

    Toast.success(tr('chat.group_join_success', '\u52a0\u5165\u6210\u529f'));
    if (result.group) {
      onJoinGroup?.(result.group);
    }
  };

  return (
    <Page
      title={tr('chat.group_join_center', '\u52a0\u7fa4\u4e0e\u4ed8\u8d39')}
      showBack
      onBack={handleBack}
      noPadding
      background="var(--bg-body)"
    >
      <div className="group-join-page">
        <div className="group-join-page__summary">
          <div className="group-join-page__summary-title">
            {tr('chat.group_join_summary_title', '\u7fa4\u7ec4\u5165\u7fa4\u4e2d\u5fc3')}
          </div>
          <div className="group-join-page__summary-source">
            {source === 'scan'
              ? tr('chat.group_join_source_scan', '\u6765\u6e90: \u626b\u7801\u8bc6\u522b')
              : tr('chat.group_join_source_chat', '\u6765\u6e90: \u804a\u5929\u8be6\u60c5')}
          </div>
          {scanResult ? (
            <div className="group-join-page__summary-result">
              {tr('chat.group_join_scan_result', '\u4e8c\u7ef4\u7801\u7ed3\u679c')}: {scanResult}
            </div>
          ) : null}
          {source === 'scan' && (scanGroupName || scanGroupId) ? (
            <div className={`group-join-page__summary-target${hasScanMatchedPlan ? '' : ' is-unmatched'}`}>
              {tr('chat.group_join_target', '\u8bc6\u522b\u5230\u7fa4\u7ec4')}: {scanGroupName || scanGroupId}
              {!hasScanMatchedPlan
                ? ` (${tr('chat.group_join_target_unmatched', '\u5f53\u524d\u5217\u8868\u4e2d\u672a\u5339\u914d')})`
                : ''}
            </div>
          ) : null}
        </div>

        <CellGroup>
          {displayPlans.map((group, index) => {
            const isJoined = !!groupJoinState.joinedGroupIds[group.id];
            const isPaid = !!groupJoinState.paidGroupIds[group.id];
            const isScanTarget = source === 'scan' && (
              (normalizedScanGroupId && group.id.toLowerCase() === normalizedScanGroupId)
              || (normalizedScanGroupName && group.name.trim().toLowerCase() === normalizedScanGroupName)
            );
            const paymentLabels = group.paymentMethods.map((method) => PAYMENT_METHOD_LABELS[method]).join(' / ');
            const priceText = group.accessMode === 'paid'
              ? `${tr('chat.group_join_price', '\u5165\u7fa4\u8d39')}: ${formatGroupJoinPrice(group.priceCents)}`
              : tr('chat.group_join_free', '\u514d\u8d39\u52a0\u5165');
            const descriptionText = `${GROUP_TYPE_LABELS[group.groupType]} | ${group.description} | ${tr('chat.group_join_supported_payments', '\u652f\u6301')}: ${paymentLabels}`;
            const actionLabel = isJoined
              ? tr('chat.group_join_joined', '\u5df2\u52a0\u5165')
              : group.accessMode === 'paid' && !isPaid
                ? tr('chat.group_join_pay_and_join', '\u4ed8\u8d39\u52a0\u5165')
                : tr('chat.group_join_join_now', '\u7acb\u5373\u52a0\u5165');

            return (
              <CellItem
                key={group.id}
                title={group.name}
                description={descriptionText}
                value={priceText}
                onClick={() => handleJoin(group.id)}
                noBorder={index === displayPlans.length - 1}
                rightSlot={(
                  <button
                    type="button"
                    className={`group-join-page__action-btn${isJoined ? ' is-joined' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleJoin(group.id);
                    }}
                    disabled={isJoined}
                  >
                    {actionLabel}
                  </button>
                )}
                className={`group-join-page__cell${isScanTarget ? ' group-join-page__cell--scan-target' : ''}`}
              />
            );
          })}
        </CellGroup>

        <div className="group-join-page__footer">
          <div>{tr('chat.group_join_payment_methods', '\u652f\u6301\u652f\u4ed8\u65b9\u5f0f')}: \u5fae\u4fe1\u652f\u4ed8 / \u652f\u4ed8\u5b9d / \u4f59\u989d</div>
          <div>{tr('chat.group_join_notice', '\u652f\u4ed8\u6210\u529f\u540e\u5c06\u81ea\u52a8\u5b8c\u6210\u5165\u7fa4')}</div>
        </div>
      </div>
    </Page>
  );
};

export default GroupJoinPage;

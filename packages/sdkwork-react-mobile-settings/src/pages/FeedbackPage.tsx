import React, { useEffect, useMemo, useState } from 'react';
import { Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useSettings } from '../hooks/useSettings';
import { resolveSettingsTranslation } from '../i18n/resolveSettingsTranslation';
import { feedbackService } from '../services/FeedbackService';
import type { FeedbackRecord, FeedbackStatus, FeedbackType } from '../types';

interface FeedbackPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

const FEEDBACK_TYPES: Array<{ key: FeedbackType; fallback: string }> = [
  { key: 'bug', fallback: 'Bug' },
  { key: 'suggestion', fallback: 'Suggestion' },
  { key: 'complaint', fallback: 'Complaint' },
  { key: 'other', fallback: 'Other' },
];

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  submitted: 'Submitted',
  processing: 'Processing',
  resolved: 'Resolved',
  closed: 'Closed',
};

const formatFeedbackTime = (timestamp: number): string => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '--';
  return new Date(timestamp).toLocaleString();
};

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ t, onBack }) => {
  const { t: settingsT } = useSettings();
  const [type, setType] = useState<FeedbackType>('bug');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [history, setHistory] = useState<FeedbackRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      return resolveSettingsTranslation({ appT: t, settingsT, key, fallback });
    },
    [settingsT, t]
  );

  const loadHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const list = await feedbackService.getFeedbackList();
      setHistory(list.slice(0, 20));
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const canSubmit = useMemo(() => content.trim().length > 0 && !isSubmitting, [content, isSubmitting]);

  const handleSubmit = async () => {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      Toast.info(tr('feedback.content_required', 'Please describe your feedback'));
      return;
    }

    setIsSubmitting(true);
    Toast.loading(tr('feedback.submitting', 'Submitting feedback...'));
    try {
      const record = await feedbackService.submitFeedback({
        type,
        content: normalizedContent,
        contact: contact.trim() || undefined,
      });

      setContent('');
      setHistory((prev) => [record, ...prev.filter((item) => item.id !== record.id)].slice(0, 20));
      Toast.success(tr('feedback.submit_success', 'Feedback submitted successfully'));
    } catch (error) {
      const message = error instanceof Error ? error.message : tr('feedback.submit_failed', 'Feedback submit failed');
      Toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeChip = (option: { key: FeedbackType; fallback: string }) => {
    const selected = option.key === type;
    return (
      <button
        key={option.key}
        type="button"
        onClick={() => setType(option.key)}
        style={{
          border: selected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
          background: selected ? 'rgba(41, 121, 255, 0.12)' : 'var(--bg-card)',
          color: selected ? 'var(--primary-color)' : 'var(--text-primary)',
          borderRadius: '999px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {tr(`feedback.type.${option.key}`, option.fallback)}
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      <Navbar title={tr('feedback.title', 'Feedback')} onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '14px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {tr('feedback.form.title', 'Submit Feedback')}
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {FEEDBACK_TYPES.map((option) => renderTypeChip(option))}
          </div>

          <div style={{ marginTop: '12px' }}>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={tr('feedback.content_placeholder', 'Please describe your issue or suggestion')}
              rows={5}
              style={{
                width: '100%',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '14px',
                resize: 'vertical',
                background: 'var(--bg-body)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder={tr('feedback.contact_placeholder', 'Contact info (optional)')}
              style={{
                width: '100%',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '14px',
                background: 'var(--bg-body)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            style={{
              width: '100%',
              marginTop: '12px',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 12px',
              fontSize: '14px',
              fontWeight: 600,
              background: canSubmit ? 'var(--primary-color)' : 'var(--border-color)',
              color: canSubmit ? '#fff' : 'var(--text-secondary)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting
              ? tr('feedback.submitting', 'Submitting feedback...')
              : tr('feedback.submit_button', 'Submit Feedback')}
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {tr('feedback.history_title', 'Recent Feedback')}
          </div>

          {isLoadingHistory ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '6px 2px' }}>
              {tr('feedback.loading_history', 'Loading...')}
            </div>
          ) : null}

          {!isLoadingHistory && history.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '6px 2px' }}>
              {tr('feedback.empty_history', 'No feedback submitted yet')}
            </div>
          ) : null}

          {!isLoadingHistory && history.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {tr(`feedback.type.${item.type}`, item.type)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {tr(`feedback.status.${item.status}`, STATUS_LABELS[item.status] || item.status)}
                    </div>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {item.content}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatFeedbackTime(item.submitTime)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

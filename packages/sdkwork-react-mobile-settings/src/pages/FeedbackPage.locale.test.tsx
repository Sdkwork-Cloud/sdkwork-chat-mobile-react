import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import zhCN from '../../../../src/core/i18n/locales/zh-CN';
import settingsZh from '../i18n/zh';

const getPathValue = (source: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((current, key) => current?.[key], source);

const translateZh = (key: string) => getPathValue(zhCN as Record<string, any>, key) ?? key;
const translateSettingsZh = (key: string) => getPathValue(settingsZh as Record<string, any>, key) ?? key;
const mockUseSettings = vi.fn();
const toMojibake = (value: string) => Buffer.from(value, 'utf8').toString('latin1');
const FEEDBACK_COPY = {
  title: '\u53cd\u9988',
  formTitle: '\u63d0\u4ea4\u53cd\u9988',
  typeBug: '\u95ee\u9898\u53cd\u9988',
  contentPlaceholder: '\u8bf7\u8f93\u5165\u95ee\u9898\u6216\u5efa\u8bae',
  contactPlaceholder: '\u8054\u7cfb\u65b9\u5f0f\uff08\u9009\u586b\uff09',
  historyTitle: '\u6700\u8fd1\u53cd\u9988',
  loadingHistory: '\u52a0\u8f7d\u4e2d...',
  emptyHistory: '\u6682\u65e0\u53cd\u9988\u8bb0\u5f55',
};

vi.mock('../services/FeedbackService', () => ({
  feedbackService: {
    getFeedbackList: vi.fn().mockResolvedValue([]),
    submitFeedback: vi.fn(),
  },
}));

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => mockUseSettings(),
}));

vi.mock('@sdkwork/react-mobile-commons', () => ({
  Navbar: ({ title }: { title?: string }) => <div data-testid="mock-navbar">{title || ''}</div>,
  Toast: {
    info: vi.fn(),
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FeedbackPage locale rendering', () => {
  it('renders zh-CN feedback copy from app resources', async () => {
    mockUseSettings.mockReturnValue({
      t: (key: string) => key,
    });

    const { FeedbackPage } = await import('./FeedbackPage');
    const html = renderToStaticMarkup(<FeedbackPage t={translateZh} />);

    expect(html).toContain(FEEDBACK_COPY.title);
    expect(html).toContain(FEEDBACK_COPY.formTitle);
    expect(html).toContain(FEEDBACK_COPY.typeBug);
    expect(html).toContain(FEEDBACK_COPY.contentPlaceholder);
    expect(html).toContain(FEEDBACK_COPY.contactPlaceholder);
    expect(html).toContain(FEEDBACK_COPY.historyTitle);
    expect(html).toContain(FEEDBACK_COPY.loadingHistory);
  });

  it('falls back to settings package zh copy when app resources are garbled or missing', async () => {
    mockUseSettings.mockReturnValue({
      t: translateSettingsZh,
    });

    const { FeedbackPage } = await import('./FeedbackPage');
    const html = renderToStaticMarkup(
      <FeedbackPage
        t={(key) => {
          if (key === 'feedback.title') return toMojibake(FEEDBACK_COPY.title);
          if (key === 'feedback.form.title') return toMojibake(FEEDBACK_COPY.formTitle);
          if (key === 'feedback.content_placeholder') return toMojibake(FEEDBACK_COPY.contentPlaceholder);
          if (key === 'feedback.contact_placeholder') return toMojibake(FEEDBACK_COPY.contactPlaceholder);
          if (key === 'feedback.history_title') return toMojibake(FEEDBACK_COPY.historyTitle);
          return key;
        }}
      />
    );

    expect(html).toContain(FEEDBACK_COPY.title);
    expect(html).toContain(FEEDBACK_COPY.formTitle);
    expect(html).toContain(FEEDBACK_COPY.typeBug);
    expect(html).toContain(FEEDBACK_COPY.contentPlaceholder);
    expect(html).toContain(FEEDBACK_COPY.contactPlaceholder);
    expect(html).toContain(FEEDBACK_COPY.historyTitle);
  });
});

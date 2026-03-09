import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InlineFeedback } from './InlineFeedback';

describe('InlineFeedback', () => {
  it('renders accessible and dismissible inline feedback semantics', () => {
    const html = renderToStaticMarkup(
      <InlineFeedback
        message="Saved"
        onDismiss={() => undefined}
        dismissLabel="Dismiss feedback"
        containerClassName="feedback-row"
        textClassName="feedback-text"
        dismissButtonClassName="feedback-close"
      />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('feedback-row');
    expect(html).toContain('feedback-text');
    expect(html).toContain('feedback-close');
    expect(html).toContain('Dismiss feedback');
  });
});

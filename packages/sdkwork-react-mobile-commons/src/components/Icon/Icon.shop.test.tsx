import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon } from './Icon';

describe('Icon shop glyph', () => {
  it('renders shopping-bag semantics instead of warning glyph', () => {
    const html = renderToStaticMarkup(<Icon name="shop" />);

    expect(html).toContain('d="M7 9h10l-1 11H8L7 9z"');
    expect(html).toContain('d="M9 9V7a3 3 0 0 1 6 0v2"');
    expect(html).not.toContain('d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10');
  });
});

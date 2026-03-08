import { describe, expect, it } from 'vitest';
import { resolveChatMessageLayout } from './chatMessageLayout';

describe('resolveChatMessageLayout', () => {
  it('uses full-width container rules when current message has no avatar', () => {
    const layout = resolveChatMessageLayout({
      showAvatar: false,
      isRichMedia: false,
      hasReply: true,
    });

    expect(layout.rowPadding).toBe('2px 6px 0');
    expect(layout.bubbleContainerMaxWidth).toBe('100%');
    expect(layout.bubbleContainerFlex).toBe('1 1 auto');
    expect(layout.bubbleContainerWidth).toBe('100%');
    expect(layout.preferFullReplyWidth).toBe(true);
    expect(layout.avatarSlotSize).toBe(0);
    expect(layout.avatarRenderSize).toBe(0);
    expect(layout.avatarGap).toBe(0);
  });

  it('keeps limited max-width rules when current message shows avatar', () => {
    const textLayout = resolveChatMessageLayout({
      showAvatar: true,
      isRichMedia: false,
      hasReply: true,
    });
    const mediaLayout = resolveChatMessageLayout({
      showAvatar: true,
      isRichMedia: true,
      hasReply: false,
    });

    expect(textLayout.bubbleContainerMaxWidth).toBe('78%');
    expect(mediaLayout.bubbleContainerMaxWidth).toBe('80%');
    expect(textLayout.bubbleContainerFlex).toBe('none');
    expect(textLayout.preferFullReplyWidth).toBe(false);
    expect(textLayout.avatarGap).toBe(10);
    expect(textLayout.avatarSlotSize).toBe(40);
    expect(textLayout.avatarRenderSize).toBe(40);
    expect(textLayout.avatarSlotSize).toBeGreaterThanOrEqual(textLayout.avatarRenderSize);
  });
});

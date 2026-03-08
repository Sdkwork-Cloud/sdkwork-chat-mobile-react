export interface ChatMessageLayoutInput {
  showAvatar: boolean;
  isRichMedia: boolean;
  hasReply: boolean;
}

export interface ChatMessageLayout {
  rowPadding: string;
  bubbleContainerMaxWidth: string;
  bubbleContainerFlex: string;
  bubbleContainerWidth: string;
  bubbleWidth: string;
  preferFullReplyWidth: boolean;
}

export const resolveChatMessageLayout = ({
  showAvatar,
  isRichMedia,
  hasReply,
}: ChatMessageLayoutInput): ChatMessageLayout => {
  if (!showAvatar) {
    return {
      rowPadding: '2px 6px 0',
      bubbleContainerMaxWidth: '100%',
      bubbleContainerFlex: '1 1 auto',
      bubbleContainerWidth: '100%',
      bubbleWidth: 'auto',
      preferFullReplyWidth: hasReply,
    };
  }

  return {
    rowPadding: '2px 12px 0',
    bubbleContainerMaxWidth: isRichMedia ? '80%' : '78%',
    bubbleContainerFlex: 'none',
    bubbleContainerWidth: 'auto',
    bubbleWidth: 'auto',
    preferFullReplyWidth: false,
  };
};


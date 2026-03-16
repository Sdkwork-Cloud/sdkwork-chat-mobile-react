import React from 'react';
import type { TabId } from '../../app/shell/navigation';

export type TabbarIconVariant = 'outline' | 'filled';

interface TabbarIconProps {
  id: TabId;
  variant: TabbarIconVariant;
}

const ICON_NAME_MAP: Record<TabId, string> = {
  chat: 'chat-bubble',
  agents: 'lobster',
  creation: 'spark',
  discover: 'direction',
  me: 'profile',
};

const OutlineIcon: React.FC<{ id: TabId }> = ({ id }) => {
  if (id === 'chat') {
    return (
      <>
        <path
          d="M6.5 7.25h11A3.25 3.25 0 0 1 20.75 10.5v3.9a3.35 3.35 0 0 1-3.35 3.35h-4.2L8.85 20.9v-3.15H6.5a3.25 3.25 0 0 1-3.25-3.25v-4A3.25 3.25 0 0 1 6.5 7.25Z"
          fill="none"
        />
        <path d="M8.2 11.25h7.6M8.2 14.1h4.65" fill="none" />
      </>
    );
  }

  if (id === 'agents') {
    return (
      <>
        <path d="M9.3 8.35 6 6.3l.7-1.55 2.6 1.4" fill="none" />
        <path d="M14.7 8.35 18 6.3l-.7-1.55-2.6 1.4" fill="none" />
        <path d="M11.2 6.8 10.2 4.9M12.8 6.8l1-1.9" fill="none" />
        <path d="M9.55 9.45c.2-1.55 1.12-2.65 2.45-2.65s2.25 1.1 2.45 2.65" fill="none" />
        <path d="M9.45 10.35v4.05c0 2.05 1.16 3.65 2.55 3.65s2.55-1.6 2.55-3.65v-4.05" fill="none" />
        <path d="M10.15 18.05 9.1 20M13.85 18.05 14.9 20" fill="none" />
        <path d="M9.2 12.25 6.9 14.55M14.8 12.25l2.3 2.3" fill="none" />
        <path d="M10.85 12.05h.01M13.15 12.05h.01" />
      </>
    );
  }

  if (id === 'creation') {
    return (
      <path d="m12 4.75 1.55 4.45L18 10.75l-4.45 1.55L12 16.75l-1.55-4.45L6 10.75l4.45-1.55L12 4.75Z" fill="none" />
    );
  }

  if (id === 'discover') {
    return <path d="M18.25 5.75 14.2 18.25l-2.65-5.8-5.8-2.65 12.5-4.05Z" fill="none" />;
  }

  return (
    <>
      <path d="M12 5.4a2.85 2.85 0 1 1 0 5.7 2.85 2.85 0 0 1 0-5.7Z" fill="none" />
      <path d="M6.8 18.45c.78-2.45 2.92-4 5.2-4 2.28 0 4.42 1.55 5.2 4" fill="none" />
    </>
  );
};

const FilledIcon: React.FC<{ id: TabId }> = ({ id }) => {
  if (id === 'chat') {
    return (
      <path
        d="M7 5.75A3.75 3.75 0 0 0 3.25 9.5v4.9A3.85 3.85 0 0 0 7.1 18.25h1.65v2.05c0 .3.17.57.44.7.27.13.59.1.82-.08l3.1-2.67h3.8a3.85 3.85 0 0 0 3.84-3.85V9.5a3.75 3.75 0 0 0-3.75-3.75H7Z"
        fill="currentColor"
      />
    );
  }

  if (id === 'agents') {
    return (
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.3 7.35 6.25 5.55a1 1 0 0 0-1.34.37l-.26.45a1 1 0 0 0 .36 1.36l2.12 1.24c-.36.47-.62 1-.76 1.57l-1.56 1.43a.9.9 0 0 0 .03 1.35l1.52 1.28a.9.9 0 0 0 .99.1l1.44-.8c.17.8.49 1.54.95 2.18L8.9 18.9a.8.8 0 0 0 1.43.67l1.67-2.24 1.67 2.24a.8.8 0 0 0 1.43-.67l-.84-2.57c.46-.64.78-1.38.95-2.18l1.44.8a.9.9 0 0 0 .99-.1l1.52-1.28a.9.9 0 0 0 .03-1.35l-1.56-1.43a4.7 4.7 0 0 0-.76-1.57l2.12-1.24a1 1 0 0 0 .36-1.36l-.26-.45a1 1 0 0 0-1.34-.37L14.7 7.35c-.65-.58-1.45-.9-2.7-.9s-2.05.32-2.7.9Zm1.52 2.55c-.34 0-.62.3-.62.67s.28.68.62.68.61-.3.61-.68c0-.37-.27-.67-.61-.67Zm2.36 0c-.34 0-.61.3-.61.67s.27.68.61.68.62-.3.62-.68c0-.37-.28-.67-.62-.67Zm-1.18 2.1c-1.34 0-2.43 1.1-2.43 2.46 0 .23.19.42.42.42h4.02a.42.42 0 0 0 .42-.42c0-1.36-1.09-2.46-2.43-2.46Z"
      />
    );
  }

  if (id === 'creation') {
    return (
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="m12 4.15 1.92 5.23 5.23 1.92-5.23 1.92L12 18.45l-1.92-5.23-5.23-1.92 5.23-1.92L12 4.15Z"
      />
    );
  }

  if (id === 'discover') {
    return (
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.08 4.92a.75.75 0 0 0-.8-.18L5.25 8.95a.75.75 0 0 0-.08 1.39l5.62 2.56 2.56 5.62a.75.75 0 0 0 1.39-.08l4.21-13.03a.75.75 0 0 0-.18-.8Z"
      />
    );
  }

  return (
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4.6a3.35 3.35 0 1 1 0 6.7 3.35 3.35 0 0 1 0-6.7Zm0 8.95c-3.2 0-5.85 1.95-6.8 4.75a1 1 0 0 0 .95 1.32h11.7a1 1 0 0 0 .95-1.32c-.95-2.8-3.6-4.75-6.8-4.75Z"
    />
  );
};

export const TabbarIcon: React.FC<TabbarIconProps> = ({ id, variant }) => {
  const strokeWidth = variant === 'filled' ? 0 : 1.9;

  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      data-tab-icon-name={ICON_NAME_MAP[id]}
      data-tab-icon-style="glyph"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === 'filled' ? <FilledIcon id={id} /> : <OutlineIcon id={id} />}
    </svg>
  );
};

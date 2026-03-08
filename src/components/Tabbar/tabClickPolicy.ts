import { resolveTabByPath, TabId } from '../../app/shell/navigation';
import type { RoutePath } from '../../router/paths';

export type TabClickAction =
  | { type: 'navigate'; targetPath: RoutePath }
  | { type: 'reselect' };

export interface ResolveTabClickActionInput {
  activeTab: TabId;
  targetTab: TabId;
  targetPath: RoutePath;
  currentPath: string;
}

export const resolveTabClickAction = ({
  activeTab,
  targetTab,
  targetPath,
  currentPath,
}: ResolveTabClickActionInput): TabClickAction => {
  if (activeTab !== targetTab) {
    return { type: 'navigate', targetPath };
  }

  if (currentPath !== targetPath && resolveTabByPath(currentPath) === targetTab) {
    return { type: 'navigate', targetPath };
  }

  return { type: 'reselect' };
};

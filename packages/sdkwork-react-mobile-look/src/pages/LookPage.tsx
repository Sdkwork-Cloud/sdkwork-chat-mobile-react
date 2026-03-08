import React from 'react';
import { ArticlesPage } from '@sdkwork/react-mobile-content';

interface LookPageProps {
  articleId?: string;
  onBack?: () => void;
  onArticleClick?: (id: string) => void;
}

export const LookPage: React.FC<LookPageProps> = (props) => {
  return <ArticlesPage {...props} />;
};

export default LookPage;

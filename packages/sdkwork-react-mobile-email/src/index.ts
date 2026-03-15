export { EmailPage, EmailThreadPage, EmailComposePage } from './pages';
export { useEmailWorkspace } from './hooks/useEmailWorkspace';
export { emailService, createEmailService } from './services/EmailService';
export type {
  EmailComposeInput,
  EmailComposeDraft,
  EmailPrimaryTab,
  EmailThread,
  EmailSpaceCard,
  EmailCategorySummary,
  EmailWorkspaceSnapshot,
  EmailService,
} from './services/EmailService';

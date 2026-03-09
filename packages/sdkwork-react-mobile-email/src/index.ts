export { EmailPage, EmailThreadPage, EmailComposePage } from './pages';
export { useEmailWorkspace } from './hooks/useEmailWorkspace';
export { emailService, createEmailService } from './services/emailService';
export type {
  EmailComposeInput,
  EmailPrimaryTab,
  EmailThread,
  EmailSpaceCard,
  EmailCategorySummary,
  EmailWorkspaceSnapshot,
  EmailService,
} from './services/emailService';

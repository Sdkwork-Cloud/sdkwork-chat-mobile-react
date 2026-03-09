import { describe, expect, it } from 'vitest';
import enUS from './en-US';
import zhCN from './zh-CN';

describe('email and notes locale coverage', () => {
  it('exposes email and notes labels in en-US resources', () => {
    expect(enUS.email.title).toBe('Email');
    expect(enUS.email.tabs.inbox).toBe('Inbox');
    expect(enUS.email.tabs.starred).toBe('Starred');
    expect(enUS.email.tabs.sent).toBe('Sent');
    expect(enUS.email.tabs.spaces).toBe('Spaces');
    expect(enUS.email.thread_title).toBe('Thread');
    expect(enUS.email.compose_title).toBe('Compose');
    expect(enUS.email.send).toBe('Send');
    expect(enUS.email.send_success).toBe('Email sent successfully');
    expect(enUS.email.reply_ready).toBe('Reply draft is ready');
    expect(enUS.email.feedback_close).toBe('Dismiss feedback');
    expect(enUS.email.thread_kicker).toBe('Conversation');
    expect(enUS.email.thread_summary_label).toBe('Latest update');
    expect(enUS.email.overview_subtitle).toBe('Move from triage to follow-up without losing context');
    expect(enUS.email.open_spaces).toBe('Open spaces');
    expect(enUS.email.empty_title).toBe('Nothing in this view yet');
    expect(enUS.email.empty_description).toBe('Switch tabs or start a fresh email to keep work moving.');
    expect(enUS.email.search_placeholder).toBe('Search in mail');
    expect(enUS.email.workbench_kicker).toBe('Mail workbench');
    expect(enUS.email.workbench_title).toBe('Inbox first');
    expect(enUS.email.workbench_subtitle).toBe(
      'Triage priority threads, jump to starred follow-ups, and keep shared spaces within reach.'
    );
    expect(enUS.email.metric_inbox).toBe('Inbox');
    expect(enUS.email.metric_unread).toBe('Unread');
    expect(enUS.email.metric_sent).toBe('Sent');
    expect(enUS.email.metric_spaces).toBe('Spaces');
    expect(enUS.email.priority_title).toBe('Priority inbox');
    expect(enUS.email.spaces_title).toBe('Shared spaces');
    expect(enUS.email.quick_starred).toBe('Review starred');
    expect(enUS.email.compose_kicker).toBe('Draft workspace');
    expect(enUS.email.compose_workspace_title).toBe('Shape the next reply');
    expect(enUS.email.compose_workspace_subtitle).toBe(
      'Keep recipients, context, and follow-up aligned before you send.'
    );

    expect(enUS.notes.title).toBe('Notes');
    expect(enUS.notes.tabs.docs).toBe('Docs');
    expect(enUS.notes.tabs.tasks).toBe('Tasks');
    expect(enUS.notes.tabs.wiki).toBe('Wiki');
    expect(enUS.notes.tabs.activity).toBe('Activity');
    expect(enUS.notes.doc_title).toBe('Document');
    expect(enUS.notes.create_title).toBe('Create note');
    expect(enUS.notes.create_save).toBe('Save');
    expect(enUS.notes.create_success).toBe('Note created successfully');
    expect(enUS.notes.edit_ready).toBe('Editing mode');
    expect(enUS.notes.feedback_close).toBe('Dismiss feedback');
    expect(enUS.notes.workspace_overview).toBe('Plan, document, and coordinate without leaving the workspace');
    expect(enUS.notes.open_tasks).toBe('Open tasks');
    expect(enUS.notes.empty_title).toBe('Nothing to review here yet');
    expect(enUS.notes.empty_description).toBe('Create a new note or switch tabs to keep collaboration moving.');
    expect(enUS.notes.search_placeholder).toBe('Search docs, tasks, or wiki');
    expect(enUS.notes.workbench_kicker).toBe('Collaboration workbench');
    expect(enUS.notes.workbench_title).toBe('Team knowledge base');
    expect(enUS.notes.workbench_subtitle).toBe(
      'Capture decisions, align tasks, and keep docs moving in one shared space.'
    );
    expect(enUS.notes.metric_docs).toBe('Docs');
    expect(enUS.notes.metric_open_tasks).toBe('Open tasks');
    expect(enUS.notes.metric_wiki).toBe('Wiki');
    expect(enUS.notes.metric_activity).toBe('Activity');
    expect(enUS.notes.knowledge_title).toBe('Knowledge in motion');
    expect(enUS.notes.quick_new_doc).toBe('New doc');
    expect(enUS.notes.quick_open_wiki).toBe('Open wiki');
    expect(enUS.notes.doc_kicker).toBe('Team document');
    expect(enUS.notes.doc_summary_label).toBe('Summary');
    expect(enUS.notes.doc_content_label).toBe('Content');
    expect(enUS.notes.create_kicker).toBe('Draft workspace');
    expect(enUS.notes.create_workspace_title).toBe('Shape the next note');
    expect(enUS.notes.create_workspace_subtitle).toBe(
      'Capture the brief first, then turn it into a durable team doc.'
    );
    expect(enUS.notes.create_template_label).toBe('Working from template');
  });

  it('exposes email and notes labels in zh-CN resources', () => {
    expect(zhCN.email.title).toBeTruthy();
    expect(zhCN.email.tabs.inbox).toBeTruthy();
    expect(zhCN.email.tabs.starred).toBeTruthy();
    expect(zhCN.email.tabs.sent).toBeTruthy();
    expect(zhCN.email.tabs.spaces).toBeTruthy();
    expect(zhCN.email.thread_title).toBeTruthy();
    expect(zhCN.email.compose_title).toBeTruthy();
    expect(zhCN.email.send).toBeTruthy();
    expect(zhCN.email.send_success).toBeTruthy();
    expect(zhCN.email.reply_ready).toBeTruthy();
    expect(zhCN.email.feedback_close).toBeTruthy();
    expect(zhCN.email.thread_kicker).toBeTruthy();
    expect(zhCN.email.thread_summary_label).toBeTruthy();
    expect(zhCN.email.overview_subtitle).toBeTruthy();
    expect(zhCN.email.open_spaces).toBeTruthy();
    expect(zhCN.email.empty_title).toBeTruthy();
    expect(zhCN.email.empty_description).toBeTruthy();
    expect(zhCN.email.search_placeholder).toBeTruthy();
    expect(zhCN.email.workbench_kicker).toBeTruthy();
    expect(zhCN.email.workbench_title).toBeTruthy();
    expect(zhCN.email.workbench_subtitle).toBeTruthy();
    expect(zhCN.email.metric_inbox).toBeTruthy();
    expect(zhCN.email.metric_unread).toBeTruthy();
    expect(zhCN.email.metric_sent).toBeTruthy();
    expect(zhCN.email.metric_spaces).toBeTruthy();
    expect(zhCN.email.priority_title).toBeTruthy();
    expect(zhCN.email.spaces_title).toBeTruthy();
    expect(zhCN.email.quick_starred).toBeTruthy();
    expect(zhCN.email.compose_kicker).toBeTruthy();
    expect(zhCN.email.compose_workspace_title).toBeTruthy();
    expect(zhCN.email.compose_workspace_subtitle).toBeTruthy();

    expect(zhCN.notes.title).toBeTruthy();
    expect(zhCN.notes.tabs.docs).toBeTruthy();
    expect(zhCN.notes.tabs.tasks).toBeTruthy();
    expect(zhCN.notes.tabs.wiki).toBeTruthy();
    expect(zhCN.notes.tabs.activity).toBeTruthy();
    expect(zhCN.notes.doc_title).toBeTruthy();
    expect(zhCN.notes.create_title).toBeTruthy();
    expect(zhCN.notes.create_save).toBeTruthy();
    expect(zhCN.notes.create_success).toBeTruthy();
    expect(zhCN.notes.edit_ready).toBeTruthy();
    expect(zhCN.notes.feedback_close).toBeTruthy();
    expect(zhCN.notes.workspace_overview).toBeTruthy();
    expect(zhCN.notes.open_tasks).toBeTruthy();
    expect(zhCN.notes.empty_title).toBeTruthy();
    expect(zhCN.notes.empty_description).toBeTruthy();
    expect(zhCN.notes.search_placeholder).toBeTruthy();
    expect(zhCN.notes.workbench_kicker).toBeTruthy();
    expect(zhCN.notes.workbench_title).toBeTruthy();
    expect(zhCN.notes.workbench_subtitle).toBeTruthy();
    expect(zhCN.notes.metric_docs).toBeTruthy();
    expect(zhCN.notes.metric_open_tasks).toBeTruthy();
    expect(zhCN.notes.metric_wiki).toBeTruthy();
    expect(zhCN.notes.metric_activity).toBeTruthy();
    expect(zhCN.notes.knowledge_title).toBeTruthy();
    expect(zhCN.notes.quick_new_doc).toBeTruthy();
    expect(zhCN.notes.quick_open_wiki).toBeTruthy();
    expect(zhCN.notes.doc_kicker).toBeTruthy();
    expect(zhCN.notes.doc_summary_label).toBeTruthy();
    expect(zhCN.notes.doc_content_label).toBeTruthy();
    expect(zhCN.notes.create_kicker).toBeTruthy();
    expect(zhCN.notes.create_workspace_title).toBeTruthy();
    expect(zhCN.notes.create_workspace_subtitle).toBeTruthy();
    expect(zhCN.notes.create_template_label).toBeTruthy();
  });
});

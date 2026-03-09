import React, { useEffect, useState } from 'react';
import { Page, Avatar, Toast, ActionSheet, Icon } from '@sdkwork/react-mobile-commons';
import { prepareCallMediaSession } from '@sdkwork/react-mobile-core';
import { contactsService } from '../services/ContactsService';
import type { Contact } from '../types';
import './ContactProfilePage.css';

interface ContactProfilePageProps {
  t?: (key: string) => string;
  contactId: string;
  onBack?: () => void;
  onSendMessage?: (contact: Contact) => void;
  onNavigate?: (path: string, params?: Record<string, string>) => void;
}

interface InfoCellProps {
  label: string;
  value?: string;
  isLast?: boolean;
  onClick?: () => void;
}

const InfoCell: React.FC<InfoCellProps> = ({ label, value, onClick, isLast = false }) => (
  <button
    type="button"
    className={`contact-profile-page__cell${isLast ? ' is-last' : ''}`}
    onClick={onClick}
    disabled={!onClick}
  >
    <span>{label}</span>
    <span className="contact-profile-page__cell-value">
      {value || '--'}
      {onClick ? <Icon name="arrow-right" size={16} color="var(--text-secondary)" /> : null}
    </span>
  </button>
);

export const ContactProfilePage: React.FC<ContactProfilePageProps> = ({
  t,
  contactId,
  onBack,
  onSendMessage,
  onNavigate,
}) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);
      const data = await contactsService.getContactById(contactId);
      setContact(data);
      setLoading(false);
    };
    void loadContact();
  }, [contactId]);

  const handleSendMessage = () => {
    if (!contact) return;
    onSendMessage?.(contact);
  };

  const resolveCallFailureMessage = (reason?: string) => {
    if (reason === 'unsupported') {
      return tr('contact_profile.call_not_supported', 'Call media is not supported on this device');
    }

    if (reason === 'microphone_denied' || reason === 'microphone_unsupported') {
      return tr(
        'contact_profile.microphone_permission_required',
        'Microphone permission is required to start a call',
      );
    }

    return tr(
      'contact_profile.call_permission_required',
      'Unable to start call, please check camera and microphone permissions',
    );
  };

  const handleVideoCall = async () => {
    const session = await prepareCallMediaSession({
      preferredMode: 'video',
      allowAudioFallback: true,
    });

    if (!session.ready) {
      Toast.error(resolveCallFailureMessage(session.reason));
      return;
    }

    if (session.mode === 'audio' && session.fallbackApplied) {
      Toast.info(
        tr(
          'contact_profile.video_fallback_audio',
          'Camera permission is unavailable, switched to voice call',
        ),
      );
    }

    onNavigate?.('/communication', { id: contactId, mode: session.mode });
  };

  const handleMoreOptions = async () => {
    const result = await ActionSheet.showActions({
      actions: [
        { text: tr('contact_profile.actions.remark', 'Set Remark'), key: 'remark' },
        { text: tr('contact_profile.actions.share', 'Share Contact'), key: 'share' },
        { text: tr('contact_profile.actions.delete', 'Delete Contact'), key: 'delete', color: '#fa5151' },
      ],
      cancelText: tr('common.cancel', 'Cancel'),
    });

    if (result?.key === 'delete') {
      if (!window.confirm(tr('contact_profile.confirm_delete', 'Delete this contact?'))) return;
      await contactsService.deleteContact(contactId);
      Toast.success(tr('contact_profile.deleted', 'Deleted'));
      onBack?.();
      return;
    }

    if (result?.key === 'remark') {
      onNavigate?.('/general', {
        section: 'generic',
        title: tr('contact_profile.remark_title', 'Set Remark'),
        from: 'contacts',
        detailTitle: contact?.name || tr('contact_profile.contact', 'Contact'),
        detailSource: tr('contact_profile.source_profile', 'Contact Profile'),
        detailType: 'remark',
        detailContent: `${tr('contact_profile.name_label', 'Name')}: ${contact?.name || '--'}\n${tr('contact_profile.wxid_label', 'ID')}: ${contact?.wxid || '--'}\n${tr('contact_profile.region_label', 'Region')}: ${contact?.region || '--'}`,
        detailTime: new Date().toLocaleString(),
      });
      return;
    }

    if (result?.key === 'share') {
      onNavigate?.('/my-qrcode');
    }
  };

  if (loading) {
    return (
      <Page title={tr('contact_profile.title', 'Profile')} showBack onBack={onBack}>
        <div className="contact-profile-page__status">{tr('common.loading', 'Loading...')}</div>
      </Page>
    );
  }

  if (!contact) {
    return (
      <Page title={tr('contact_profile.title', 'Profile')} showBack onBack={onBack}>
        <div className="contact-profile-page__status">{tr('contact_profile.not_found', 'Contact not found')}</div>
      </Page>
    );
  }

  return (
    <Page
      title={tr('contact_profile.title', 'Profile')}
      showBack
      onBack={onBack}
      noPadding
      rightElement={
        <button type="button" className="contact-profile-page__more-btn" onClick={() => void handleMoreOptions()}>
          <Icon name="more" size={20} />
        </button>
      }
    >
      <div className="contact-profile-page">
        <section className="contact-profile-page__header-card">
          <Avatar src={contact.avatar} name={contact.name} size="xl" shape="rounded" />
          <div className="contact-profile-page__header-main">
            <h1>{contact.name}</h1>
            <p>{tr('contact_profile.wxid_label', 'ID')}: {contact.wxid}</p>
            <p>{tr('contact_profile.region_label', 'Region')}: {contact.region}</p>
          </div>
        </section>

        <section className="contact-profile-page__group">
          <InfoCell label={tr('contact_profile.source_label', 'Source')} value={tr('contact_profile.source_value', 'Added by search')} />
          <InfoCell
            label={tr('contact_profile.moments', 'Moments')}
            value={tr('contact_profile.view', 'View')}
            onClick={() => onNavigate?.('/moments')}
          />
          <InfoCell
            label={tr('contact_profile.more_info', 'More Info')}
            value={tr('contact_profile.view', 'View')}
            onClick={() => onNavigate?.('/general', {
              section: 'generic',
              title: tr('contact_profile.more_info_title', 'More Info'),
              from: 'contacts',
              detailTitle: contact.name,
              detailSource: tr('contact_profile.source_profile', 'Contact Profile'),
              detailType: 'profile',
              detailContent: `${tr('contact_profile.wxid_label', 'ID')}: ${contact.wxid}\n${tr('contact_profile.region_label', 'Region')}: ${contact.region}`,
              detailTime: new Date().toLocaleString(),
            })}
            isLast
          />
        </section>

        <section className="contact-profile-page__actions">
          <button type="button" className="contact-profile-page__primary-btn" onClick={handleSendMessage}>
            {tr('contact_profile.send_message', 'Send Message')}
          </button>
          <button type="button" className="contact-profile-page__secondary-btn" onClick={handleVideoCall}>
            {tr('contact_profile.video_call', 'Voice/Video Call')}
          </button>
        </section>
      </div>
    </Page>
  );
};

export default ContactProfilePage;

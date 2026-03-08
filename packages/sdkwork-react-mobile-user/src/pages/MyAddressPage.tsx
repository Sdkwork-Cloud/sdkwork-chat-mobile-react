import React from 'react';
import { ActionSheet, Button, CellGroup, CellItem, Icon, Navbar, Switch, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { Address } from '../types';
import './MyAddressPage.css';

interface MyAddressPageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

interface AddressFormModalProps {
  value: Partial<Address>;
  title: string;
  tr: (key: string, fallback: string) => string;
  onCancel: () => void;
  onSubmit: (value: Partial<Address>) => Promise<void>;
}

const formatAddressLine = (address: Partial<Address>): string => {
  const district = [address.province, address.city, address.district].filter(Boolean).join(' ');
  return `${district} ${address.detail || ''}`.trim();
};

const AddressFormModal: React.FC<AddressFormModalProps> = ({ value, title, tr, onCancel, onSubmit }) => {
  const [form, setForm] = React.useState<Partial<Address>>(value);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm(value);
  }, [value]);

  const submit = async () => {
    if (!form.name?.trim() || !form.phone?.trim() || !form.detail?.trim()) {
      Toast.info(tr('address.errors.required', 'Please complete address information'));
      return;
    }
    setSubmitting(true);
    await onSubmit({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      detail: form.detail.trim(),
      province: form.province?.trim(),
      city: form.city?.trim(),
      district: form.district?.trim(),
      tag: form.tag?.trim(),
    });
    setSubmitting(false);
  };

  return (
    <div className="my-address-page__sheet user-center-sheet">
      <div className="my-address-page__sheet-mask user-center-sheet__mask" onClick={onCancel} />
      <div className="my-address-page__sheet-content user-center-sheet__content">
        <div className="my-address-page__sheet-head user-center-sheet__head">
          <button
            type="button"
            className="user-center-sheet__action user-center-sheet__action--start"
            onClick={onCancel}
          >
            {tr('address.close', 'Close')}
          </button>
          <span className="user-center-sheet__title">{title}</span>
          <button
            type="button"
            className="user-center-sheet__action user-center-sheet__action--primary user-center-sheet__action--end"
            onClick={() => void submit()}
          >
            {tr('common.save', 'Save')}
          </button>
        </div>

        <div className="my-address-page__sheet-form">
          <input
            value={form.name || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={tr('address.contact', 'Contact')}
            className="my-address-page__input user-center-sheet__input"
          />
          <input
            value={form.phone || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder={tr('address.phone', 'Phone')}
            className="my-address-page__input user-center-sheet__input"
          />
          <div className="my-address-page__region-grid">
            <input
              value={form.province || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, province: event.target.value }))}
              placeholder={tr('address.province', 'Province')}
              className="my-address-page__input user-center-sheet__input"
            />
            <input
              value={form.city || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              placeholder={tr('address.city', 'City')}
              className="my-address-page__input user-center-sheet__input"
            />
            <input
              value={form.district || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
              placeholder={tr('address.district', 'District')}
              className="my-address-page__input user-center-sheet__input"
            />
          </div>
          <textarea
            value={form.detail || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, detail: event.target.value }))}
            placeholder={tr('address.detail', 'Address Detail')}
            rows={3}
            className="my-address-page__input my-address-page__textarea user-center-sheet__input"
          />
          <input
            value={form.tag || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}
            placeholder={tr('address.tag_placeholder', 'Tag (Home / Work)')}
            className="my-address-page__input user-center-sheet__input"
          />

          <div className="my-address-page__default-row">
            <span>{tr('address.default', 'Set as Default')}</span>
            <Switch checked={!!form.isDefault} onChange={(checked) => setForm((prev) => ({ ...prev, isDefault: checked }))} />
          </div>

          <Button block loading={submitting} onClick={() => void submit()}>
            {tr('address.save', 'Save Address')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MyAddressPage: React.FC<MyAddressPageProps> = ({ t, onBack }) => {
  const { addresses, isLoading, loadAddresses, saveAddress, deleteAddress, setDefaultAddress } = useUser();
  const [formVisible, setFormVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<Address>>({});

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const openCreateForm = () => {
    setEditing({});
    setFormVisible(true);
  };

  const openEditForm = (address: Address) => {
    setEditing(address);
    setFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    const confirmResult = window.confirm(tr('address.confirm_delete', 'Delete this address?'));
    if (!confirmResult) return;
    await deleteAddress(id);
    Toast.success(tr('address.messages.deleted', 'Address deleted'));
  };

  const handleAddressActions = async (address: Address) => {
    const actions = [
      { text: tr('address.edit', 'Edit Address'), key: 'edit' },
      ...(address.isDefault ? [] : [{ text: tr('address.default', 'Set as Default'), key: 'default' }]),
      { text: tr('address.delete', 'Delete Address'), key: 'delete', color: '#fa5151' },
    ];
    const result = await ActionSheet.showActions({
      title: `${address.name} ${address.phone}`,
      actions,
      variant: 'user-center',
    });
    if (!result?.key) return;

    if (result.key === 'edit') {
      openEditForm(address);
      return;
    }
    if (result.key === 'default') {
      await setDefaultAddress(address.id);
      Toast.success(tr('address.messages.default_set', 'Set as default'));
      return;
    }
    if (result.key === 'delete') {
      await handleDelete(address.id);
    }
  };

  const handleSubmit = async (value: Partial<Address>) => {
    await saveAddress({
      ...value,
      id: editing.id,
    });
    setFormVisible(false);
    Toast.success(tr('address.messages.saved', 'Address saved'));
  };

  return (
    <div className="my-address-page user-center-page">
      <Navbar
        title={tr('address.title', 'My Addresses')}
        onBack={onBack}
        rightElement={(
          <button
            type="button"
            onClick={openCreateForm}
            className="my-address-page__navbar-btn"
          >
            {tr('address.add', 'Add')}
          </button>
        )}
      />

      <div className="my-address-page__scroll user-center-page__scroll">
        {isLoading ? (
          <CellGroup>
            <CellItem title={tr('address.loading', 'Loading addresses...')} noBorder />
          </CellGroup>
        ) : null}

        {!isLoading && addresses.length === 0 ? (
          <CellGroup>
            <CellItem
              title={tr('address.empty', 'No addresses')}
              description={tr('address.empty_desc', 'Tap to add your first address')}
              value={tr('address.add', 'Add')}
              isLink
              onClick={openCreateForm}
              noBorder
            />
          </CellGroup>
        ) : null}

        {!isLoading && addresses.length > 0 ? (
          <CellGroup>
            {addresses.map((address, index) => (
              <CellItem
                key={address.id}
                title={(
                  <span className="my-address-page__title">
                    <span>{address.name}</span>
                    <span className="my-address-page__phone">{address.phone}</span>
                  </span>
                )}
                description={formatAddressLine(address)}
                value={(
                  <span className="my-address-page__badges">
                    {address.isDefault ? (
                      <span className="my-address-page__badge my-address-page__badge--default">
                        {tr('address.default_tag', 'Default')}
                      </span>
                    ) : null}
                    {address.tag ? (
                      <span className="my-address-page__badge my-address-page__badge--tag">
                        {address.tag}
                      </span>
                    ) : null}
                  </span>
                )}
                rightSlot={(
                  <button
                    type="button"
                    className="my-address-page__more-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleAddressActions(address);
                    }}
                    aria-label={`more actions for ${address.name}`}
                  >
                    <Icon name="more" size={18} color="var(--text-secondary)" />
                  </button>
                )}
                onClick={() => openEditForm(address)}
                noBorder={index === addresses.length - 1}
              />
            ))}
          </CellGroup>
        ) : null}
      </div>

      <div className="my-address-page__actions">
        <Button block onClick={openCreateForm}>
          + {tr('address.add', 'Add Address')}
        </Button>
      </div>

      {formVisible ? (
        <AddressFormModal
          value={editing}
          title={editing.id ? tr('address.edit', 'Edit Address') : tr('address.add', 'Add Address')}
          tr={tr}
          onCancel={() => setFormVisible(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

export default MyAddressPage;

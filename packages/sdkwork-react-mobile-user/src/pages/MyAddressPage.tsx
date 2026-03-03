import React from 'react';
import { ActionSheet, Button, Icon, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { Address } from '../types';

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

const AddressFormModal: React.FC<AddressFormModalProps> = ({ value, title, tr, onCancel, onSubmit }) => {
  const [form, setForm] = React.useState<Partial<Address>>(value);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm(value);
  }, [value]);

  const submit = async () => {
    if (!form.name || !form.phone || !form.detail) {
      Toast.info(tr('address.errors.required', 'Please complete address information'));
      return;
    }
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg-card)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{title}</div>
          <button
            type="button"
            onClick={onCancel}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {tr('address.close', 'Close')}
          </button>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            value={form.name || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={tr('address.contact', 'Contact')}
            style={inputStyle}
          />
          <input
            value={form.phone || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder={tr('address.phone', 'Phone')}
            style={inputStyle}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
            <input
              value={form.province || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
              placeholder={tr('address.province', 'Province')}
              style={inputStyle}
            />
            <input
              value={form.city || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder={tr('address.city', 'City')}
              style={inputStyle}
            />
            <input
              value={form.district || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
              placeholder={tr('address.district', 'District')}
              style={inputStyle}
            />
          </div>
          <textarea
            value={form.detail || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, detail: e.target.value }))}
            placeholder={tr('address.detail', 'Address Detail')}
            rows={3}
            style={{ ...inputStyle, resize: 'none', height: '88px', paddingTop: '10px' }}
          />
          <input
            value={form.tag || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))}
            placeholder={tr('address.tag_placeholder', 'Tag (Home / Work)')}
            style={inputStyle}
          />
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
            />
            {tr('address.default', 'Set as Default')}
          </label>
          <Button fullWidth loading={submitting} onClick={submit}>
            {tr('address.save', 'Save Address')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  borderRadius: '10px',
  border: '0.5px solid var(--border-color)',
  background: 'var(--bg-body)',
  color: 'var(--text-primary)',
  padding: '0 10px',
  outline: 'none',
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
      title: `${address.name} · ${address.phone}`,
      actions,
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
    <div style={{ minHeight: '100%', background: 'var(--bg-body)' }}>
      <Navbar
        title={tr('address.title', 'My Addresses')}
        onBack={onBack}
        rightElement={
          <button
            type="button"
            onClick={openCreateForm}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            {tr('address.add', 'Add')}
          </button>
        }
      />

      <div style={{ padding: '12px', paddingBottom: '94px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
            {tr('address.loading', 'Loading addresses...')}
          </div>
        ) : null}

        {!isLoading && addresses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
            <div style={{ marginBottom: '12px' }}>{tr('address.empty', 'No addresses')}</div>
            <Button size="sm" variant="outline" onClick={openCreateForm}>
              {tr('address.add', 'Add Address')}
            </Button>
          </div>
        ) : null}

        {addresses.map((address) => (
          <div
            key={address.id}
            onClick={() => openEditForm(address)}
            style={{
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-color)',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {address.name} <span style={{ fontWeight: 500 }}>{address.phone}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {address.isDefault ? (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#fa5151',
                      borderRadius: '10px',
                      padding: '3px 8px',
                      background: 'rgba(250,81,81,0.1)',
                    }}
                  >
                    {tr('address.default_tag', 'Default')}
                  </span>
                ) : null}
                {address.tag ? (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#2979FF',
                      borderRadius: '10px',
                      padding: '3px 8px',
                      background: 'rgba(41,121,255,0.1)',
                    }}
                  >
                    {address.tag}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleAddressActions(address);
                  }}
                  style={{ border: 0, background: 'transparent', color: 'var(--text-secondary)', padding: '2px', cursor: 'pointer' }}
                  aria-label={`more actions for ${address.name}`}
                >
                  <Icon name="more" size={18} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>
              {[address.province, address.city, address.district].filter(Boolean).join(' ')} {address.detail}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-card)',
          borderTop: '0.5px solid var(--border-color)',
          padding: '12px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
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

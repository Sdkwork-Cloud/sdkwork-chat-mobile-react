import React from 'react';
import { Button, Navbar, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { InvoiceTitle } from '../types';

interface MyInvoiceTitlePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

interface InvoiceModalProps {
  value: Partial<InvoiceTitle>;
  tr: (key: string, fallback: string) => string;
  onCancel: () => void;
  onSubmit: (value: Partial<InvoiceTitle>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '40px',
  borderRadius: '10px',
  border: '0.5px solid var(--border-color)',
  background: 'var(--bg-body)',
  color: 'var(--text-primary)',
  padding: '0 10px',
  outline: 'none',
};

const InvoiceModal: React.FC<InvoiceModalProps> = ({ value, tr, onCancel, onSubmit, onDelete }) => {
  const [form, setForm] = React.useState<Partial<InvoiceTitle>>(value);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setForm(value);
  }, [value]);

  const submit = async () => {
    if (!form.title?.trim()) {
      Toast.info(tr('invoice.errors.title_required', 'Please enter invoice title'));
      return;
    }
    if (form.type === 'company' && !form.taxNo?.trim()) {
      Toast.info(tr('invoice.errors.tax_required', 'Please enter tax number'));
      return;
    }

    setLoading(true);
    await onSubmit({
      ...form,
      title: form.title.trim(),
      taxNo: form.type === 'company' ? form.taxNo?.trim() : undefined,
    });
    setLoading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.46)',
        zIndex: 2200,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          background: 'var(--bg-card)',
          padding: '14px',
          paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button type="button" onClick={onCancel} style={{ border: 0, background: 'transparent', color: 'var(--text-secondary)' }}>
            {tr('common.cancel', 'Cancel')}
          </button>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {value.id ? tr('invoice.edit', 'Edit Title') : tr('invoice.add', 'Add Title')}
          </div>
          <button type="button" onClick={() => void submit()} style={{ border: 0, background: 'transparent', color: 'var(--primary-color)', fontWeight: 600 }}>
            {tr('common.save', 'Save')}
          </button>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: 'company' }))}
              style={{
                height: '36px',
                borderRadius: '10px',
                border: form.type === 'company' ? '1px solid var(--primary-color)' : '0.5px solid var(--border-color)',
                background: form.type === 'company' ? 'rgba(41,121,255,0.1)' : 'var(--bg-body)',
                color: form.type === 'company' ? 'var(--primary-color)' : 'var(--text-secondary)',
              }}
            >
              {tr('invoice.type_company', 'Company')}
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: 'personal', taxNo: undefined }))}
              style={{
                height: '36px',
                borderRadius: '10px',
                border: form.type === 'personal' ? '1px solid var(--primary-color)' : '0.5px solid var(--border-color)',
                background: form.type === 'personal' ? 'rgba(41,121,255,0.1)' : 'var(--bg-body)',
                color: form.type === 'personal' ? 'var(--primary-color)' : 'var(--text-secondary)',
              }}
            >
              {tr('invoice.type_personal', 'Personal')}
            </button>
          </div>
          <input
            value={form.title || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder={tr('invoice.name_placeholder', 'Invoice title')}
            style={inputStyle}
          />
          {form.type === 'company' ? (
            <input
              value={form.taxNo || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, taxNo: event.target.value }))}
              placeholder={tr('invoice.tax_placeholder', 'Tax number')}
              style={inputStyle}
            />
          ) : null}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
            />
            {tr('invoice.default', 'Set as default title')}
          </label>
          <Button block loading={loading} onClick={() => void submit()}>
            {tr('common.save', 'Save')}
          </Button>
          {onDelete ? (
            <Button block variant="danger" onClick={() => void onDelete()}>
              {tr('invoice.delete', 'Delete this title')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const MyInvoiceTitlePage: React.FC<MyInvoiceTitlePageProps> = ({ t, onBack }) => {
  const { invoices, isLoading, loadInvoices, saveInvoice, deleteInvoice } = useUser();
  const [editing, setEditing] = React.useState<Partial<InvoiceTitle> | null>(null);
  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t?.(key);
      if (value && value !== key) return value;
      return fallback;
    },
    [t]
  );

  React.useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const openCreate = () => {
    setEditing({
      type: 'company',
      title: '',
      taxNo: '',
      isDefault: invoices.length === 0,
    });
  };

  const openEdit = (invoice: InvoiceTitle) => {
    setEditing(invoice);
  };

  const handleSubmit = async (value: Partial<InvoiceTitle>) => {
    await saveInvoice({
      ...value,
      id: editing?.id,
      createTime: editing?.createTime,
    });
    setEditing(null);
    Toast.success(tr('invoice.messages.saved', 'Saved successfully'));
  };

  const handleDelete = async () => {
    if (!editing?.id) return;
    const confirmed = window.confirm(tr('invoice.confirm_delete', 'Delete this invoice title?'));
    if (!confirmed) return;
    await deleteInvoice(editing.id);
    setEditing(null);
    Toast.success(tr('invoice.messages.deleted', 'Deleted'));
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
      <Navbar title={tr('invoice.title', 'Invoice Titles')} onBack={onBack} />

      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', paddingBottom: '100px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {tr('common.loading', 'Loading...')}
          </div>
        ) : null}

        {!isLoading && invoices.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '56%', opacity: 0.52 }}>
            <div style={{ fontSize: '46px', marginBottom: '14px' }}>🧾</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{tr('invoice.empty', 'No invoice titles')}</div>
          </div>
        ) : null}

        {!isLoading &&
          invoices.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openEdit(item)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '10px',
                border: '0.5px solid var(--border-color)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>{item.title}</span>
                  {item.isDefault ? (
                    <span style={{ fontSize: '10px', color: '#fa5151', background: 'rgba(250,81,81,0.1)', borderRadius: '4px', padding: '2px 6px' }}>
                      {tr('invoice.default_tag', 'Default')}
                    </span>
                  ) : null}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{tr('common.edit', 'Edit')}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'inline-flex', gap: '10px' }}>
                <span>{item.type === 'company' ? tr('invoice.type_company', 'Company') : tr('invoice.type_personal', 'Personal')}</span>
                {item.type === 'company' && item.taxNo ? <span>{item.taxNo}</span> : null}
              </div>
            </button>
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
        <Button block onClick={openCreate}>
          + {tr('invoice.add', 'Add Title')}
        </Button>
      </div>

      {editing ? (
        <InvoiceModal
          value={editing}
          tr={tr}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
          onDelete={editing.id ? handleDelete : undefined}
        />
      ) : null}
    </div>
  );
};

export default MyInvoiceTitlePage;

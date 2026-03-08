import React from 'react';
import { Button, CellGroup, CellItem, Navbar, Switch, Toast } from '@sdkwork/react-mobile-commons';
import { useUser } from '../hooks/useUser';
import type { InvoiceTitle } from '../types';
import './MyInvoiceTitlePage.css';

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
    <div className="my-invoice-page__sheet user-center-sheet">
      <div className="my-invoice-page__sheet-mask user-center-sheet__mask" onClick={onCancel} />
      <div className="my-invoice-page__sheet-content user-center-sheet__content">
        <div className="my-invoice-page__sheet-head user-center-sheet__head">
          <button
            type="button"
            className="user-center-sheet__action user-center-sheet__action--start"
            onClick={onCancel}
          >
            {tr('common.cancel', 'Cancel')}
          </button>
          <span className="user-center-sheet__title">
            {value.id ? tr('invoice.edit', 'Edit Title') : tr('invoice.add', 'Add Title')}
          </span>
          <button
            type="button"
            className="user-center-sheet__action user-center-sheet__action--primary user-center-sheet__action--end"
            onClick={() => void submit()}
          >
            {tr('common.save', 'Save')}
          </button>
        </div>

        <div className="my-invoice-page__sheet-form">
          <div className="my-invoice-page__type-switch">
            <button
              type="button"
              className={`my-invoice-page__type-btn ${form.type === 'company' ? 'is-active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, type: 'company' }))}
            >
              {tr('invoice.type_company', 'Company')}
            </button>
            <button
              type="button"
              className={`my-invoice-page__type-btn ${form.type === 'personal' ? 'is-active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, type: 'personal', taxNo: undefined }))}
            >
              {tr('invoice.type_personal', 'Personal')}
            </button>
          </div>

          <input
            value={form.title || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder={tr('invoice.name_placeholder', 'Invoice title')}
            className="my-invoice-page__input user-center-sheet__input"
          />

          {form.type === 'company' ? (
            <input
              value={form.taxNo || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, taxNo: event.target.value }))}
              placeholder={tr('invoice.tax_placeholder', 'Tax number')}
              className="my-invoice-page__input user-center-sheet__input"
            />
          ) : null}

          <div className="my-invoice-page__default-row">
            <span>{tr('invoice.default', 'Set as default title')}</span>
            <Switch checked={!!form.isDefault} onChange={(checked) => setForm((prev) => ({ ...prev, isDefault: checked }))} />
          </div>

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

const formatInvoiceDescription = (item: InvoiceTitle, tr: (key: string, fallback: string) => string): string => {
  const typeLabel = item.type === 'company'
    ? tr('invoice.type_company', 'Company')
    : tr('invoice.type_personal', 'Personal');
  return item.type === 'company' && item.taxNo
    ? `${typeLabel} | ${item.taxNo}`
    : typeLabel;
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
    <div className="my-invoice-page user-center-page">
      <Navbar title={tr('invoice.title', 'Invoice Titles')} onBack={onBack} />

      <div className="my-invoice-page__scroll user-center-page__scroll">
        {isLoading ? (
          <CellGroup>
            <CellItem title={tr('common.loading', 'Loading...')} noBorder />
          </CellGroup>
        ) : null}

        {!isLoading && invoices.length === 0 ? (
          <CellGroup>
            <CellItem
              title={tr('invoice.empty', 'No invoice titles')}
              description={tr('invoice.empty_desc', 'Tap to create your first invoice title')}
              value={tr('invoice.add', 'Add')}
              isLink
              onClick={openCreate}
              noBorder
            />
          </CellGroup>
        ) : null}

        {!isLoading && invoices.length > 0 ? (
          <CellGroup>
            {invoices.map((item, index) => (
              <CellItem
                key={item.id}
                title={item.title}
                description={formatInvoiceDescription(item, tr)}
                value={item.isDefault ? (
                  <span className="my-invoice-page__default-tag">{tr('invoice.default_tag', 'Default')}</span>
                ) : undefined}
                isLink
                onClick={() => openEdit(item)}
                noBorder={index === invoices.length - 1}
              />
            ))}
          </CellGroup>
        ) : null}
      </div>

      <div className="my-invoice-page__actions">
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

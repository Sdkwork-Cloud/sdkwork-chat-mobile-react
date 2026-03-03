// 页面翻译键
export type UserPageKeys = 
  | 'pages.profile.title'
  | 'pages.profile.edit'
  | 'pages.profile.save'
  | 'pages.profile.cancel'
  | 'pages.addresses.title'
  | 'pages.addresses.add'
  | 'pages.addresses.edit'
  | 'pages.addresses.empty'
  | 'pages.invoices.title'
  | 'pages.invoices.add'
  | 'pages.invoices.empty';

// 通用翻译键
export type UserCommonKeys = 
  | 'common.name'
  | 'common.nickname'
  | 'common.phone'
  | 'common.email'
  | 'common.address'
  | 'common.gender'
  | 'common.male'
  | 'common.female'
  | 'common.unknown'
  | 'common.region'
  | 'common.bio'
  | 'common.default'
  | 'common.delete'
  | 'common.edit'
  | 'common.save'
  | 'common.cancel'
  | 'common.add'
  | 'common.loading'
  | 'common.notSet';

// 表单字段翻译键
export type UserFormKeys = 
  | 'form.province'
  | 'form.city'
  | 'form.district'
  | 'form.detail'
  | 'form.setDefault'
  | 'form.invoiceTitle'
  | 'form.taxNumber'
  | 'form.companyAddress'
  | 'form.companyPhone'
  | 'form.bankName'
  | 'form.bankAccount';

// 操作翻译键
export type UserActionKeys = 
  | 'actions.confirmDelete'
  | 'actions.confirmDeleteAddress'
  | 'actions.addSuccess'
  | 'actions.updateSuccess'
  | 'actions.deleteSuccess'
  | 'actions.saveSuccess'
  | 'actions.setDefaultSuccess';

// 所有翻译键
export type UserTranslationKeys = UserPageKeys | UserCommonKeys | UserFormKeys | UserActionKeys;

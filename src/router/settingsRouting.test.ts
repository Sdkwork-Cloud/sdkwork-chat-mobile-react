import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('settings routing integration', () => {
  it('routes account entry to dedicated account-security page', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('onAccountClick: () => navigate(ROUTE_PATHS.accountSecurity),');
  });

  it('routes storage entry to dedicated storage section', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('onStorageClick: () => navigate(ROUTE_PATHS.general, {');
    expect(source).toContain("section: 'storage'");
  });

  it('uses explicit chat-background session context and session save callbacks', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("const targetSessionId = (currentParams.id || '').trim() || undefined;");
    expect(source).toContain('sessionId: targetSessionId');
    expect(source).toContain('saveSessionBackground: async (targetSessionId: string, background: string) => {');
    expect(source).toContain('chatService.updateSessionConfig(targetSessionId, {');
  });

  it('keeps explicit return target when opening background from chat details', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('onNavigateToBackground: () => navigate(ROUTE_PATHS.chatBackground, {');
    expect(source).toContain('back: `${ROUTE_PATHS.chatDetails}?id=${sessionId}`');
  });

  it('prefers explicit back target over generic general fallback in chat-background route', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('const explicitBackTarget = resolveBackTarget(currentParams.back);');
    expect(source).toContain('onBack: () => navigateBack(explicitBackTarget || `${ROUTE_PATHS.general}?${fallbackQuery}`),');
  });

  it('preserves source context when navigating between general subsections', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('const target = resolveExternalTarget(rawPath);');
    expect(source).toContain('if (target.path === ROUTE_PATHS.general) {');
    expect(source).toContain('from: (params?.from as string) || generalSource');
  });

  it('allows theme page to honor explicit back target when opened from general', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('if (path === ROUTE_PATHS.theme) {');
    expect(source).toContain('onBack: () => navigateBack(explicitBackTarget || ROUTE_PATHS.settings),');
  });

  it('passes account-security source when opening account sub-pages', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("onProfileInfoClick: () => navigate(ROUTE_PATHS.profileInfo, { from: 'account-security' }),");
    expect(source).toContain("onPasswordClick: () => navigate(ROUTE_PATHS.profileEdit, { from: 'account-security', field: 'password' }),");
    expect(source).toContain("onPhoneClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'phone' }),");
    expect(source).toContain("onEmailClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'email' }),");
    expect(source).toContain("onWechatClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'wechat' }),");
    expect(source).toContain("onQqClick: () => navigate(ROUTE_PATHS.profileBinding, { from: 'account-security', field: 'qq' }),");
    expect(source).toContain("onQRCodeClick: () => navigate(ROUTE_PATHS.myQRCode, { from: 'account-security' }),");
    expect(source).toContain("onActivityHistoryClick: () => navigate(ROUTE_PATHS.myActivityHistory, { from: 'account-security' }),");
    expect(source).toContain("onUserSettingsClick: () => navigate(ROUTE_PATHS.myUserSettings, { from: 'account-security' }),");
    expect(source).toContain("onAddressClick: () => navigate(ROUTE_PATHS.myAddress, { from: 'account-security' }),");
    expect(source).toContain("onInvoiceClick: () => navigate(ROUTE_PATHS.myInvoice, { from: 'account-security' }),");
  });

  it('keeps account-security context for profile and related back-navigation', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("const accountCenterFallback = resolveAccountCenterFallback(currentParams.from);");
    expect(source).toContain("const profileSource = resolveProfileSource(currentParams.from);");
    expect(source).toContain("const profileBackTarget = accountCenterFallback === ROUTE_PATHS.accountSecurity");
    expect(source).toContain('onBack: () => navigateBack(profileBackTarget),');
    expect(source).toContain("onEditNameClick: () => navigate(ROUTE_PATHS.profileEdit, {");
    expect(source).toContain("field: 'name'");
    expect(source).toContain("profileFrom: profileSource");
    expect(source).toContain("onEditRegionClick: () => navigate(ROUTE_PATHS.profileEdit, {");
    expect(source).toContain("field: 'region'");
    expect(source).toContain("onEditSignatureClick: () => navigate(ROUTE_PATHS.profileEdit, {");
    expect(source).toContain("field: 'signature'");
    expect(source).toContain("onEditPasswordClick: () => navigate(ROUTE_PATHS.profileEdit, {");
    expect(source).toContain("field: 'password'");
    expect(source).toContain("onEditPhoneClick: () => navigate(ROUTE_PATHS.profileBinding, {");
    expect(source).toContain("field: 'phone'");
    expect(source).toContain("onEditEmailClick: () => navigate(ROUTE_PATHS.profileBinding, {");
    expect(source).toContain("field: 'email'");
    expect(source).toContain("onEditWechatClick: () => navigate(ROUTE_PATHS.profileBinding, {");
    expect(source).toContain("field: 'wechat'");
    expect(source).toContain("onEditQqClick: () => navigate(ROUTE_PATHS.profileBinding, {");
    expect(source).toContain("field: 'qq'");
    expect(source).toContain("onQRCodeClick: () => navigate(ROUTE_PATHS.myQRCode, { from: profileSource }),");
    expect(source).toContain("onActivityHistoryClick: () => navigate(ROUTE_PATHS.myActivityHistory, { from: profileSource }),");
    expect(source).toContain("onUserSettingsClick: () => navigate(ROUTE_PATHS.myUserSettings, { from: profileSource }),");
    expect(source).toContain("onAddressClick: () => navigate(ROUTE_PATHS.myAddress, { from: profileSource }),");
    expect(source).toContain("onInvoiceClick: () => navigate(ROUTE_PATHS.myInvoice, { from: profileSource }),");
    expect(source).toContain('path === ROUTE_PATHS.myActivityHistory');
    expect(source).toContain('|| path === ROUTE_PATHS.myUserSettings');
    expect(source).toContain('|| path === ROUTE_PATHS.myAddress');
    expect(source).toContain('|| path === ROUTE_PATHS.myInvoice');
    expect(source).toContain('onBack: () => navigateBack(accountCenterFallback),');
  });

  it('routes profile binding page with explicit field and contextual back target', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain('if (path === ROUTE_PATHS.profileBinding) {');
    expect(source).toContain('field: resolveProfileBindingField(currentParams.field),');
    expect(source).toContain("const profileBindingSource = currentParams.from === 'account-security' ? 'account-security' : 'profile-info';");
    expect(source).toContain('onBack: () => navigateBack(profileBindingBackTarget),');
  });

  it('routes scan result to join-group page and exposes join-group route props', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("import { resolveScanRouteIntent } from './scanRouteIntent';");
    expect(source).toContain("const GroupJoinPage = lazyExport(() => import('@sdkwork/react-mobile-chat'), (m) => m.GroupJoinPage);");
    expect(source).toContain('[ROUTE_PATHS.joinGroup]: { component: GroupJoinPage },');
    expect(source).toContain('onNavigateToGroupJoin: () => navigate(ROUTE_PATHS.joinGroup, {');
    expect(source).toContain('onNavigateToQRCode: (payload: { type: \'user\' | \'group\' | \'agent\'; entityId?: string; name?: string }) =>');
    expect(source).toContain("from: 'chat-details'");
    expect(source).toContain('if (path === ROUTE_PATHS.scan) {');
    expect(source).toContain('const intent = resolveScanRouteIntent(result);');
    expect(source).toContain("if (intent.type === 'user') {");
    expect(source).toContain("if (intent.type === 'agent') {");
    expect(source).toContain("navigate(ROUTE_PATHS.agents, {");
    expect(source).toContain('navigate(ROUTE_PATHS.joinGroup, {');
    expect(source).toContain('if (path === ROUTE_PATHS.joinGroup) {');
    expect(source).toContain("const joinSource = currentParams.from === 'scan' ? 'scan' : 'chat-details';");
    expect(source).toContain("const joinBackTarget: RoutePathInput = joinSource === 'scan'");
    expect(source).toContain('scanGroupId: currentParams.groupId || undefined,');
    expect(source).toContain('scanGroupName: currentParams.groupName || undefined,');
    expect(source).toContain('scanResult: currentParams.qr || undefined,');
    expect(source).toContain('onBack: () => navigateBack(joinBackTarget),');
  });

  it('exposes scanned-agent context on agents route', () => {
    const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

    expect(source).toContain("const scannedAgent = currentParams.scanType === 'agent'");
    expect(source).toContain('scannedAgent,');
    expect(source).toContain('onOpenScannedAgent: async (agentId: string) => {');
  });
});

export interface CapacitorRuntimeLike {
  isNativePlatform?: () => boolean;
  isPluginAvailable?: (name: string) => boolean;
  Plugins?: Record<string, unknown>;
  [key: string]: unknown;
}

type FlashlightPluginLike = {
  setEnabled?: (options: { enabled: boolean }) => unknown;
  toggle?: () => unknown;
  turnOn?: () => unknown;
  turnOff?: () => unknown;
  enable?: () => unknown;
  disable?: () => unknown;
};

export interface ScanFlashlightCapability {
  supported: boolean;
  pluginName: string | null;
}

const FLASHLIGHT_PLUGIN_NAMES = ['Flashlight', 'Torch', 'BarcodeScanner'] as const;

const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function';

const hasFlashlightControl = (plugin: unknown): plugin is FlashlightPluginLike => {
  if (!plugin || typeof plugin !== 'object') return false;
  const target = plugin as FlashlightPluginLike;
  return Boolean(
    isFunction(target.setEnabled) ||
      isFunction(target.toggle) ||
      isFunction(target.turnOn) ||
      isFunction(target.turnOff) ||
      isFunction(target.enable) ||
      isFunction(target.disable)
  );
};

const resolvePluginCandidate = (
  runtime: CapacitorRuntimeLike,
  pluginName: string
): FlashlightPluginLike | null => {
  const byPluginsMap = runtime.Plugins?.[pluginName];
  if (hasFlashlightControl(byPluginsMap)) {
    return byPluginsMap;
  }

  const byDirectAccess = runtime[pluginName];
  if (hasFlashlightControl(byDirectAccess)) {
    return byDirectAccess;
  }

  return null;
};

const resolvePlugin = (
  runtime: CapacitorRuntimeLike
): { name: string; plugin: FlashlightPluginLike } | null => {
  for (const pluginName of FLASHLIGHT_PLUGIN_NAMES) {
    const isAvailable = runtime.isPluginAvailable?.(pluginName) ?? false;
    const plugin = resolvePluginCandidate(runtime, pluginName);

    if (plugin) {
      return { name: pluginName, plugin };
    }

    if (isAvailable) {
      // Plugin is declared by runtime but no callable surface is exposed.
      continue;
    }
  }

  return null;
};

export const getCapacitorRuntimeFromWindow = (): CapacitorRuntimeLike | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as { Capacitor?: CapacitorRuntimeLike }).Capacitor;
};

export const resolveScanFlashlightCapability = (
  runtime: CapacitorRuntimeLike | null | undefined
): ScanFlashlightCapability => {
  if (!runtime || !runtime.isNativePlatform?.()) {
    return { supported: false, pluginName: null };
  }

  const resolved = resolvePlugin(runtime);
  if (!resolved) {
    return { supported: false, pluginName: null };
  }

  return {
    supported: true,
    pluginName: resolved.name,
  };
};

export const toggleScanFlashlight = async (
  runtime: CapacitorRuntimeLike | null | undefined,
  currentEnabled: boolean
): Promise<boolean> => {
  if (!runtime || !runtime.isNativePlatform?.()) {
    throw new Error('Flashlight plugin is not available');
  }

  const resolved = resolvePlugin(runtime);
  if (!resolved) {
    throw new Error('Flashlight plugin is not available');
  }

  const nextEnabled = !currentEnabled;
  const { plugin } = resolved;

  if (isFunction(plugin.setEnabled)) {
    await plugin.setEnabled({ enabled: nextEnabled });
    return nextEnabled;
  }

  if (nextEnabled && isFunction(plugin.turnOn)) {
    await plugin.turnOn();
    return true;
  }

  if (!nextEnabled && isFunction(plugin.turnOff)) {
    await plugin.turnOff();
    return false;
  }

  if (nextEnabled && isFunction(plugin.enable)) {
    await plugin.enable();
    return true;
  }

  if (!nextEnabled && isFunction(plugin.disable)) {
    await plugin.disable();
    return false;
  }

  if (isFunction(plugin.toggle)) {
    await plugin.toggle();
    return nextEnabled;
  }

  throw new Error('Flashlight plugin is not available');
};

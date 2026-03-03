/**
 * 简单的密码哈希 - 使用 SHA-256
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = password + salt;
  
  // 使用 SubtleCrypto 如果可用
  if (crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // SubtleCrypto 失败，使用简单哈希
    }
  }
  
  // 简单哈希作为后备
  return simpleHash(data);
}

/**
 * 简单哈希函数（后备方案）
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
}

/**
 * 生成JWT Token
 */
export function generateToken(userId: string, expiresIn = 7 * 24 * 60 * 60 * 1000): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + expiresIn,
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(`${base64Header}.${base64Payload}`);

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * 生成随机盐值
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 计算密码强度
 */
export function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  const strength = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}

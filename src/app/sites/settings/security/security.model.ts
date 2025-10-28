export interface SessionInfo {
  id: string;             // id de sesión
  device: string;         // p.ej. "Windows 11 · Chrome 120"
  ip: string;             // "190.237.XX.YY"
  location?: string;      // "Lima, PE" (mock)
  lastActivity: string;   // "2025-10-28 10:35"
  current: boolean;       // si es la sesión actual
  userAgent?: string;     // opcional
}

export interface NamespaceScope {
  namespace: 'inteligencia_comercial' | 'marketing' | string;
  roles: string[];        // roles dentro de ese namespace
  permissions: string[];  // permisos efectivos visibles
}

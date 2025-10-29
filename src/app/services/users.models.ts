export interface UserView {
  id: number;
  username: string;
  enabled: boolean;
  roles: string[];
  namespaces?: string[];
}

/** Página genérica compatible con Spring Data */
export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;  // pageIndex
  size: number;    // pageSize
  first: boolean;
  last: boolean;
}


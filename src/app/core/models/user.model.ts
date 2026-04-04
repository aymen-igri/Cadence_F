export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  role: Role;
}

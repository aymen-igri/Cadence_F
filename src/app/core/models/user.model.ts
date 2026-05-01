export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  role: Role;
}

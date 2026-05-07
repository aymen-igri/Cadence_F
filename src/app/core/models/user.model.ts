export type Role = 'ROLE_PRE_AUTH' | 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  role: Role;
  profilePic?: string;
  isTotpEnabled?: boolean;
}


export type UserProfile = Omit<User, 'id' | 'username' | 'email' | 'role'>;
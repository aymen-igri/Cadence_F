export type Role = 'ROLE_PRE_AUTH' | 'ROLE_ADMIN' | 'ROLE_GENERAL_USER';

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

export type UpdateUserDataRes = Omit<User, 'username' | 'email' | 'role' | 'profilePic'>;

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
}

export interface ProfilePictureResponse {
  profilePic: string;
}

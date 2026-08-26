export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  exclusiveMember: boolean;
  createdAt: string;
  avatarUrl?: string;
}

export interface StoredUser extends User {
  password: string;
}

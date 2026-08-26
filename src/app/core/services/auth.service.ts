import { Injectable, computed, signal } from '@angular/core';
import { StoredUser, User } from '../models/user.model';

const CURRENT_USER_KEY = 'nexus_current_user';
const USERS_KEY = 'nexus_users';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  exclusiveMember: boolean;
}

export interface AuthResult {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.loadCurrentUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  private users: StoredUser[] = this.loadUsers();

  register(data: RegisterPayload): AuthResult {
    if (!data.name.trim() || !data.email.trim() || data.password.length < 6) {
      return { success: false, message: 'Preencha todos os campos corretamente. A senha deve ter ao menos 6 caracteres.' };
    }
    if (this.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const newUser: StoredUser = {
      id: this.generateId(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim(),
      exclusiveMember: data.exclusiveMember,
      createdAt: new Date().toISOString(),
      password: data.password,
    };

    this.users.push(newUser);
    this.persistUsers();
    this.setCurrentUser(newUser);

    return { success: true, message: 'Cadastro realizado com sucesso! Bem-vindo(a) à Nexus Store.' };
  }

  login(email: string, password: string): AuthResult {
    const found = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!found) {
      return { success: false, message: 'E-mail ou senha inválidos.' };
    }
    this.setCurrentUser(found);
    return { success: true, message: `Bem-vindo(a) de volta, ${found.name.split(' ')[0]}!` };
  }

  logout(): void {
    this._currentUser.set(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(CURRENT_USER_KEY);
  }

  updateExclusiveMember(value: boolean): void {
    const current = this._currentUser();
    if (!current) return;
    const updated: User = { ...current, exclusiveMember: value };
    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, exclusiveMember: value } : u));
    this.persistUsers();
    this.persistCurrentUser(updated);
  }

  updateAvatar(avatarUrl: string): void {
    const current = this._currentUser();
    if (!current) return;
    const updated: User = { ...current, avatarUrl };
    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, avatarUrl } : u));
    this.persistUsers();
    this.persistCurrentUser(updated);
  }

  private setCurrentUser(stored: StoredUser): void {
    const { password: _password, ...user } = stored;
    this._currentUser.set(user);
    this.persistCurrentUser(user);
  }

  private generateId(): string {
    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private loadCurrentUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persistCurrentUser(user: User): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  private loadUsers(): StoredUser[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private persistUsers(): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }
}

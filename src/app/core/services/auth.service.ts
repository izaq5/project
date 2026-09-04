import { Injectable, computed, signal } from '@angular/core';
import { StoredUser, User } from '../models/user.model';

const CURRENT_USER_KEY = 'capute_current_user';
const USERS_KEY = 'capute_users';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: string;
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
  readonly isVip = computed(() => this._currentUser()?.isVip ?? false);
  readonly isPremium = computed(() => (this._currentUser()?.isPremium || this._currentUser()?.isVip) ?? false);

  private users: StoredUser[] = this.loadUsers();

  register(data: RegisterPayload): AuthResult {
    if (!data.name.trim() || !data.email.trim() || data.password.length < 6) {
      return { success: false, message: 'Preencha todos os campos obrigatórios. A senha deve ter ao menos 6 caracteres.' };
    }

    if (!data.cpf || !data.cpf.trim()) {
      return { success: false, message: 'O CPF é obrigatório para cadastro.' };
    }

    if (!data.phone || !data.phone.trim()) {
      return { success: false, message: 'O telefone de contato é obrigatório.' };
    }

    if (!data.birthDate || !data.birthDate.trim()) {
      return { success: false, message: 'A data de nascimento é obrigatória.' };
    }

    const cleanCpf = data.cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return { success: false, message: 'O CPF informado deve conter 11 dígitos válidos.' };
    }

    if (this.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    if (this.users.some((u) => (u.cpf || '').replace(/\D/g, '') === cleanCpf)) {
      return { success: false, message: 'Este CPF já está cadastrado em outra conta.' };
    }

    const newUser: StoredUser = {
      id: this.generateId(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      cpf: data.cpf.trim(),
      birthDate: data.birthDate.trim(),
      exclusiveMember: data.exclusiveMember,
      isVip: data.exclusiveMember,
      isPremium: data.exclusiveMember,
      hasMadeFirstPurchase: false,
      wonCoupons: [],
      createdAt: new Date().toISOString(),
      password: data.password,
    };

    this.users.push(newUser);
    this.persistUsers();
    this.setCurrentUser(newUser);

    return { success: true, message: 'Cadastro realizado com sucesso! Bem-vindo(a) à CaputeStore.' };
  }

  login(email: string, password?: string): AuthResult {
    let found = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      // Auto-create demo user
      found = {
        id: this.generateId(),
        name: email.split('@')[0] || 'Cliente Capute',
        email: email.trim(),
        exclusiveMember: false,
        isVip: false,
        isPremium: false,
        hasMadeFirstPurchase: false,
        wonCoupons: [],
        createdAt: new Date().toISOString(),
        password: password || '123456'
      };
      this.users.push(found);
      this.persistUsers();
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
    const updated: User = { ...current, exclusiveMember: value, isVip: value, isPremium: value };
    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, exclusiveMember: value, isVip: value, isPremium: value } : u));
    this.persistUsers();
    this.persistCurrentUser(updated);
  }

  becomeVip(): AuthResult {
    const current = this._currentUser();
    if (!current) {
      return { success: false, message: 'Você precisa estar conectado para assinar o Plano VIP.' };
    }

    const updated: User = {
      ...current,
      isVip: true,
      isPremium: true,
      exclusiveMember: true
    };

    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, isVip: true, isPremium: true, exclusiveMember: true } : u));
    this.persistUsers();
    this.persistCurrentUser(updated);

    return {
      success: true,
      message: 'Parabéns! Seu Plano VIP (R$ 20,00) foi ativado com sucesso! Você agora tem acesso exclusivo ao Grupo do WhatsApp, parcerias e sorteios.'
    };
  }

  markFirstPurchaseDone(): void {
    const current = this._currentUser();
    if (!current) return;
    const updated: User = { ...current, hasMadeFirstPurchase: true };
    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, hasMadeFirstPurchase: true } : u));
    this.persistUsers();
    this.persistCurrentUser(updated);
  }

  addWonCoupon(couponCode: string): void {
    const current = this._currentUser();
    if (!current) return;
    const list = [...(current.wonCoupons || []), couponCode];
    const updated: User = { ...current, wonCoupons: list };
    this._currentUser.set(updated);
    this.users = this.users.map((u) => (u.id === updated.id ? { ...u, wonCoupons: list } : u));
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

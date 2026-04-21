export const AUTH_STORAGE_KEYS = {
  users: "bm_users",
  currentUser: "bm_current_user",
} as const;

export type UserRole = "admin" | "staff" | "user";

export type StoredUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isLocked: boolean;
};

export type SessionUser = {
  name: string;
  email: string;
  role: UserRole;
  isLocked: boolean;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function emitAuthChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("auth-changed"));
}

export function getUsers(): StoredUser[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.users);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<StoredUser>>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((user) => user.name && user.email && user.password)
      .map((user) => ({
        name: user.name as string,
        email: user.email as string,
        password: user.password as string,
        role:
          user.role === "admin"
            ? "admin"
            : user.role === "staff"
              ? "staff"
              : "user",
        isLocked: Boolean(user.isLocked),
      }));
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.users, JSON.stringify(users));
  emitAuthChanged();
}

export function getCurrentUser(): SessionUser | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.currentUser);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed?.name || !parsed?.email) return null;

    return {
      name: parsed.name,
      email: parsed.email,
      role:
        parsed.role === "admin"
          ? "admin"
          : parsed.role === "staff"
            ? "staff"
            : "user",
      isLocked: Boolean(parsed.isLocked),
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(user: SessionUser) {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.currentUser, JSON.stringify(user));
  emitAuthChanged();
}

export function clearCurrentUser() {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser);
  emitAuthChanged();
}

export function updateUserRole(email: string, role: UserRole): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const updatedUsers = users.map((user) =>
    user.email === normalizedEmail ? { ...user, role } : user
  );

  const hasChanges = users.some(
    (user, index) => user.role !== updatedUsers[index]?.role
  );

  if (!hasChanges) return false;
  saveUsers(updatedUsers);

  const current = getCurrentUser();
  if (current?.email === normalizedEmail) {
    setCurrentUser({ ...current, role });
  }

  return true;
}

export function updateUserLockStatus(email: string, isLocked: boolean): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const updatedUsers = users.map((user) =>
    user.email === normalizedEmail ? { ...user, isLocked } : user
  );

  const hasChanges = users.some(
    (user, index) => user.isLocked !== updatedUsers[index]?.isLocked
  );

  if (!hasChanges) return false;
  saveUsers(updatedUsers);

  const current = getCurrentUser();
  if (current?.email === normalizedEmail) {
    if (isLocked) {
      clearCurrentUser();
    } else {
      setCurrentUser({ ...current, isLocked });
    }
  }

  return true;
}

export function deleteUser(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const updatedUsers = users.filter((user) => user.email !== normalizedEmail);

  if (updatedUsers.length === users.length) return false;
  saveUsers(updatedUsers);

  const current = getCurrentUser();
  if (current?.email === normalizedEmail) {
    clearCurrentUser();
  }

  return true;
}

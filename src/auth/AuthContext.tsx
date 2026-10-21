
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { authApi } from "../api/authApi";
import type {
  LoginRequest,
  MeResponse,
} from "../types/auth";
import {
  getToken,
  setToken,
  clearToken,
} from "./authStorage";

interface AuthContextValue {
  user: MeResponse | null;
  loading: boolean;
  authenticated: boolean;
  login: (payload: LoginRequest) => Promise<MeResponse>;
  refreshMe: () => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/, "").toUpperCase();
}

function normalizeUser(user: MeResponse): MeResponse {
  return {
    ...user,
    roles: (user.roles ?? []).map(normalizeRole),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async (): Promise<void> => {
    if (!getToken()) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await authApi.me();
      setUser(normalizeUser(currentUser));
    } catch (error) {
      clearToken();
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize(): Promise<void> {
      try {
        if (getToken()) {
          const currentUser = await authApi.me();

          if (mounted) {
            setUser(normalizeUser(currentUser));
          }
        }
      } catch {
        clearToken();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginRequest): Promise<MeResponse> => {
      const response = await authApi.login(payload);

      // Save the JWT before requesting the current user's profile.
      setToken(response.accessToken);

      try {
        const currentUser = await authApi.me();
        const normalizedUser = normalizeUser(currentUser);

        setUser(normalizedUser);

        // Return the user so LoginPage can redirect immediately
        // using the correct role without waiting for state updates.
        return normalizedUser;
      } catch (error) {
        clearToken();
        setUser(null);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback((): void => {
    clearToken();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]): boolean => {
      const currentRoles = user?.roles.map(normalizeRole) ?? [];

      return roles.some((role) =>
        currentRoles.includes(normalizeRole(role)),
      );
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authenticated: Boolean(user && getToken()),
      login,
      refreshMe,
      logout,
      hasRole,
    }),
    [user, loading, login, refreshMe, logout, hasRole],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  login as loginApi,
  type LoginResponse,
} from "../api/authApi";

import {
  getToken,
  removeToken,
  setToken,
} from "./authStorage";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  roles: string[];
  isAuthenticated: boolean;

  login: (
    username: string,
    password: string,
  ) => Promise<LoginResponse>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [token, setTokenState] =
    useState<string | null>(() => getToken());

  const [username, setUsername] =
    useState<string | null>(() =>
      localStorage.getItem(
        "suncomputer_username",
      ),
    );

  const [roles, setRoles] =
    useState<string[]>(() => {
      const stored =
        localStorage.getItem(
          "suncomputer_roles",
        );

      if (!stored) {
        return [];
      }

      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    });

  const login = async (
    usernameValue: string,
    password: string,
  ): Promise<LoginResponse> => {
    const response = await loginApi({
      username: usernameValue,
      password,
    });

    console.log(
      "Backend login successful:",
      response,
    );

    // Backend returns accessToken
    setToken(response.accessToken);
    setTokenState(response.accessToken);

    setUsername(response.username);

    localStorage.setItem(
      "suncomputer_username",
      response.username,
    );

    setRoles(response.roles);

    localStorage.setItem(
      "suncomputer_roles",
      JSON.stringify(response.roles),
    );

    return response;
  };

  const logout = () => {
    removeToken();

    localStorage.removeItem(
      "suncomputer_username",
    );

    localStorage.removeItem(
      "suncomputer_roles",
    );

    setTokenState(null);
    setUsername(null);
    setRoles([]);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      username,
      roles,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, username, roles],
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
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
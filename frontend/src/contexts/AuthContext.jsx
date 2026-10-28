import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const queryClient = useQueryClient();
    const { data: user = null, isLoading: loading, refetch: fetchMe } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => (await authApi.getMe()).data.user,
        retry: (failureCount, error) => error.response?.status === 401 ? false : failureCount < 1,
        staleTime: 60_000,
    });

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        queryClient.setQueryData(['auth', 'me'], res.data.user);
        return res.data;
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        queryClient.setQueryData(['auth', 'me'], res.data.user);
        return res.data;
    };

    const logout = async () => {
        await authApi.logout();
        queryClient.setQueryData(['auth', 'me'], null);
    };

    const updateUser = (updatedUser) => queryClient.setQueryData(['auth', 'me'], updatedUser);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, fetchMe, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

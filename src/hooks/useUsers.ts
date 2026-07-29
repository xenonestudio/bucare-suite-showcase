import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export function useUsers() {
  const queryClient = useQueryClient();

  // Obtener un usuario por ID
  const useUser = (id: string) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: async () => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Crear un usuario
  const createUser = useMutation({
    mutationFn: async (userData: { email: string; password: string }) => {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar o actualizar caché local en React Query
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', data.id], data);
    },
  });

  return {
    useUser,
    createUser,
  };
}

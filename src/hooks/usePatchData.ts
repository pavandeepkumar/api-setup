import instance from '@/config/instance';
import {
  UseMutationOptions,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { toast } from 'sonner';

interface PatchDataOptions<TData, TVariables> {
  url: string;
  refetchQueries?: string[];
  headers?: Record<string, string>;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
}

const usePatchData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions
}: PatchDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await instance.patch({ url, data: variables, headers });

      if (response?.statusCode === 200) {
        return response.data;
      }

      const errorMessage = response?.message || 'Failed to update data';
      const error = new Error(errorMessage);

      if (response?.statusCode === 400) {
        throw Object.assign(error, { statusCode: 400 });
      }
      if (response?.statusCode === 401) {
        throw Object.assign(error, {
          statusCode: 401,
          message: 'Unauthorized'
        });
      }

      throw error;
    },
    onSuccess: (data: TData) => {
      refetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );
    },
    onError: (error: Error & { statusCode?: number }) => {
      toast.error(error.message || 'Failed to update data');
    },
    ...mutationOptions
  });
};

export default usePatchData;
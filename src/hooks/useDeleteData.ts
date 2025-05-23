import instance from '@/config/instance';
import {
  UseMutationOptions,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

interface DeleteDataOptions<TData> {
  url: string;
  refetchQueries?: string[];
  mutationOptions?: UseMutationOptions<TData, Error, void>;
}

const useDeleteData = <TData = unknown>({
  url,
  refetchQueries = [],
  mutationOptions
}: DeleteDataOptions<TData>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void>({
    mutationFn: async () => {
      const response = await instance.delete({ url });

      if (response?.statusCode === 200) {
        return response.data;
      }

      const errorMessage = response?.message || 'Failed to delete data';
      if (response?.statusCode === 400) {
        throw Object.assign(new Error(errorMessage), { statusCode: 400 });
      }
      if (response?.statusCode === 401) {
        throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });
      }

      throw new Error(errorMessage);
    },
    onSuccess: (data: TData) => {
      refetchQueries.forEach((query) =>
        queryClient.invalidateQueries({ queryKey: [query] })
      );
    },
    onError: (error: Error & { statusCode?: number }) => {
      console.error(error.message || 'Failed to delete data');
    },
    ...mutationOptions
  });
};

export default useDeleteData;
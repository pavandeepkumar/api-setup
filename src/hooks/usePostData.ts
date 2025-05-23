import instance from '@/config/instance';
import { useToast } from '@/components/ui/use-toast';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient
} from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  error?: boolean;
}

interface UsePostDataProps<TData, TVariables> {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  headers?: Record<string, string>;
  refetchQueries?: string[];
}

const usePostData = <TData = unknown, TVariables = unknown>({
  url,
  mutationOptions,
  headers = {},
  refetchQueries
}: UsePostDataProps<TData, TVariables>) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await instance.post<ApiResponse<TData>>({
        url,
        data: variables,
        headers
      });

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast({
          title: 'Success',
          description: response?.message,
          variant: 'default'
        });
        return response.data;
      }

      toast({
        title: 'Error',
        description: response?.message,
        variant: 'destructive'
      });
      throw new Error(response?.message || 'Failed to post data');
    },
    onSuccess: () => {
      if (refetchQueries) {
        refetchQueries.forEach((queryKey) => {
          queryClient.refetchQueries({ queryKey: [queryKey] });
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'An error occurred',
        variant: 'destructive'
      });
    },
    ...mutationOptions
  });
};

export default usePostData;
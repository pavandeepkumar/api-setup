#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Debug: Log inquirer exports to diagnose issues
console.log(chalk.yellow('Inquirer module exports:'), Object.keys(inquirer));

// Determine the prompt function to use
const prompt = inquirer.prompt || inquirer.default?.prompt || (() => { throw new Error('Inquirer prompt function not found'); });

async function directoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function setupApiStructure(baseUrl) {
  try {
    console.log(chalk.blue('Setting up API structure in src directory...'));

    // Define the folder structure under src
    const folders = [
      'src/config/api',
      'src/config/instance',
      'src/hooks',
      'src/utils'
    ];

    // Check and create directories
    for (const folder of folders) {
      const folderPath = path.join(process.cwd(), folder);
      const exists = await directoryExists(folderPath);

      if (exists) {
        const { action } = await prompt([
          {
            type: 'list',
            name: 'action',
            message: `Directory ${folder} already exists. What would you like to do?`,
            choices: [
              { name: 'Skip and continue', value: 'skip' },
              { name: 'Overwrite (delete and recreate)', value: 'overwrite' },
              { name: 'Create missing files only', value: 'merge' }
            ],
            default: 'merge'
          }
        ]);

        if (action === 'skip') {
          console.log(chalk.yellow(`Skipping directory: ${folderPath}`));
          continue;
        } else if (action === 'overwrite') {
          await fs.rm(folderPath, { recursive: true, force: true });
          console.log(chalk.yellow(`Removed existing directory: ${folderPath}`));
        }
      }

      // Create the directory if it doesn't exist or was overwritten
      if (!(await directoryExists(folderPath))) {
        try {
          await fs.mkdir(folderPath, { recursive: true });
          console.log(chalk.green(`Created directory: ${folderPath}`));
        } catch (error) {
          console.error(chalk.red(`Failed to create directory ${folderPath}:`), error.message);
          throw error;
        }
      }
    }

    // Define the file contents
    const files = [
      {
        path: 'src/config/api/api.ts',
        content: `const API = {
  auth: {
    login: 'auth/login'
  },
};

Object.freeze(API);
export default API;`
      },
      {
        path: 'src/config/instance/instance.ts',
        content: `import { Result, StorageEnum } from '@/types';
import { setItem } from '@/utils/storage';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('token') || '';

const axiosInstance = axios.create({
  baseURL: '${baseUrl}',
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = \`Bearer \${token}\`;
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (config.data) {
      config.headers['Content-Type'] = 'application/json;charset=utf-8';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (!res.data) throw new Error('Error in response');
    const { statusCode, error } = res.data;
    const hasSuccess = (statusCode === 200 || statusCode === 201) && error === false;
    if (hasSuccess) return res?.data;
  },
  (error: AxiosError<Result>) => {
    const { response } = error || {};
    const status = response?.status;
    if (status === 401) {
      setItem(StorageEnum.Token, null);
      window.localStorage.clear();
      Cookies.remove('token');
    }
    return Promise.reject(error);
  }
);

class Instance {
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' });
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' });
  }

  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT' });
  }

  patch<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH' });
  }

  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' });
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      axiosInstance
        .request<any, AxiosResponse<Result>>(config)
        .then((res: AxiosResponse<Result>) => {
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          reject(e);
        });
    });
  }
}

export default new Instance();`
      },
      {
        path: 'src/hooks/useFetchData.ts',
        content: `import instance from '@/config/instance';
import { BASIC_AUTH_CREDENTIALS } from '@/constants/data';
import { buildQueryString } from '@/utils/storage';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    'queryKey' | 'queryFn'
  >;
  enabled?: boolean;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async () => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response = await instance.get({
        url: \`\${url}\${queryString}\`,
        auth: BASIC_AUTH_CREDENTIALS
      });
      if (response?.statusCode === 200) {
        return response.data;
      }
      throw new Error(response?.message || 'Failed to fetch data');
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 0,
    ...queryOptions
  });
};

export default useFetchData;`
      },
      {
        path: 'src/hooks/usePostData.ts',
        content: `import instance from '@/config/instance';
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

export default usePostData;`
      },
      {
        path: 'src/hooks/usePutData.ts',
        content: `import instance from '@/config/instance';
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

const usePutData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions
}: PatchDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await instance.put({ url, data: variables, headers });

      if (response?.statusCode === 200) {
        return response;
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
      toast.success('Data updated successfully');
    },
    onError: (error: Error & { statusCode?: number }) => {
      toast.error(error.message || 'Failed to update data');
    },
    ...mutationOptions
  });
};

export default usePutData;`
      },
      {
        path: 'src/hooks/usePatchData.ts',
        content: `import instance from '@/config/instance';
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

export default usePatchData;`
      },
      {
        path: 'src/hooks/useDeleteData.ts',
        content: `import instance from '@/config/instance';
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

export default useDeleteData;`
      },
      {
        path: 'src/utils/storage.ts',
        content: `import { StorageEnum } from '@/types';

export function buildQueryString(params: Record<string, any>): string {
  // Ensure params is an object and has keys
  if (
    !params ||
    typeof params !== 'object' ||
    Object.keys(params).length === 0
  ) {
    return '';
  }

  // Convert each key-value pair to a URL-encoded string
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      if (value === null || value === undefined) {
        return ''; // Skip null or undefined values
      }
      if (Array.isArray(value)) {
        // Encode array values
        return value
          .map((val) => encodeURIComponent(key) + '=' + encodeURIComponent(val))
          .join('&');
      }
      // Encode normal key-value pairs
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .filter((param) => param) // Remove any empty strings
    .join('&');

  // Prepend '?' if the query string is not empty
  return queryString ? '?' + queryString : '';
}

export const getItem = <T>(key: StorageEnum): T | null => {
  let value = null;
  try {
    const result = window.localStorage.getItem(key);
    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    console.error(error);
  }
  return value;
};

export const getStringItem = (key: StorageEnum): string | null => {
  return localStorage.getItem(key);
};

export const setItem = <T>(key: StorageEnum, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key: StorageEnum): void => {
  localStorage.removeItem(key);
};

export const clearItems = () => {
  localStorage.clear();
};

export function objectToFormData(
  obj: Record<string, any>,
  form?: FormData,
  namespace?: string
): FormData {
  const formData = form || new FormData();

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const formKey = namespace ? namespace + '[' + key + ']' : key;

      if (value instanceof File || value instanceof Blob) {
        // Handle File or Blob
        formData.append(formKey, value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        objectToFormData(value, formData, formKey);
      } else if (value !== undefined && value !== null) {
        // Append primitive values (string, number, boolean)
        formData.append(formKey, String(value));
      }
    }
  }

  return formData;
}`
      }
    ];

    // Write files, handling existing files
    for (const file of files) {
      const filePath = path.join(process.cwd(), file.path);
      const dirPath = path.dirname(filePath);

      // Skip if the directory was skipped
      if (!(await directoryExists(dirPath))) {
        console.log(chalk.yellow(`Skipping file ${filePath} as directory was skipped`));
        continue;
      }

      const exists = await fileExists(filePath);
      if (exists) {
        const { action } = await prompt([
          {
            type: 'list',
            name: 'action',
            message: `File ${file.path} already exists. What would you like to do?`,
            choices: [
              { name: 'Skip', value: 'skip' },
              { name: 'Overwrite', value: 'overwrite' }
            ],
            default: 'skip'
          }
        ]);

        if (action === 'skip') {
          console.log(chalk.yellow(`Skipping file: ${filePath}`));
          continue;
        }
      }

      try {
        await fs.writeFile(filePath, file.content, 'utf-8');
        console.log(chalk.green(`Created file: ${filePath}`));
      } catch (error) {
        console.error(chalk.red(`Failed to write file ${filePath}:`), error.message);
        throw error;
      }
    }

    // Install dependencies
    console.log(chalk.blue('Installing dependencies...'));
    const dependencies = ['axios', '@tanstack/react-query', 'sonner', 'js-cookie'];
    const packageManager = detectPackageManager();
    const installCommand = packageManager === 'yarn' ? 'yarn add' : packageManager === 'pnpm' ? 'pnpm add' : 'npm install';
    try {
      execSync(`${installCommand} ${dependencies.join(' ')}`, { stdio: 'inherit' });
      console.log(chalk.green('Dependencies installed successfully.'));
    } catch (error) {
      console.error(chalk.red('Failed to install dependencies. Please install them manually:'));
      console.log(chalk.yellow(`Run: ${installCommand} ${dependencies.join(' ')}`));
    }

    console.log(chalk.green('API setup completed successfully!'));
    console.log(chalk.yellow('Note: Ensure you have the following utilities in your project:'));
    console.log(chalk.yellow('- StorageEnum and Result (from "@/types")'));
    console.log(chalk.yellow('- useToast (from "@/components/ui/use-toast")'));
    console.log(chalk.yellow('- BASIC_AUTH_CREDENTIALS (from "@/constants/data")'));
    console.log(chalk.cyan('You may need to implement these utilities or remove their references if not needed.'));
  } catch (error) {
    console.error(chalk.red('Error setting up API structure:'), error.message);
    throw error;
  }
}

function detectPackageManager() {
  try {
    if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) return 'pnpm';
    return 'npm';
  } catch (error) {
    console.log(chalk.yellow('Could not detect package manager, defaulting to npm.'));
    return 'npm';
  }
}

program
  .command('init')
  .description('Initialize API setup in the project')
  .action(async () => {
    try {
      const answers = await prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Enter the API base URL:',
          default: 'https://pumpup-api.devstree.in/api/v1',
          validate: (input) => {
            if (!input.trim()) return 'API base URL cannot be empty';
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL (e.g., https://example.com/api)';
            }
          }
        }
      ]);
      await setupApiStructure(answers.baseUrl);
    } catch (error) {
      console.error(chalk.red('Error during prompt:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
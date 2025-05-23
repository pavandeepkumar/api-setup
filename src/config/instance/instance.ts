import { Result, StorageEnum } from '@/types';
import { setItem } from '@/utils/storage';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('token') || '';

const axiosInstance = axios.create({
  baseURL: 'https://pumpup-api.devstree.in/api/v1',
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${token}`;
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

export default new Instance();
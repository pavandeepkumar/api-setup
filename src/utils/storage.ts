import { StorageEnum } from '@/types';

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
}
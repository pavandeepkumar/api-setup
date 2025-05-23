
# @pavandeep/create-api-setup

[![npm version](https://img.shields.io/npm/v/@pavandeep/create-api-setup.svg)](https://www.npmjs.com/package/@pavandeep/create-api-setup)
[![license](https://img.shields.io/npm/l/@pavandeep/create-api-setup.svg)](https://github.com/pavandeepkumar/api-setup/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dt/@pavandeep/create-api-setup.svg)](https://www.npmjs.com/package/@pavandeep/create-api-setup)

A CLI tool to scaffold API call setups for React projects using Axios and Tanstack Query. It generates a modular `src/` directory structure with API configurations, an Axios instance, React Query hooks, and utility functions for local storage and query string building.

---

## 🚀 Quick Start

```bash
npx @pavandeep/create-api-setup init
```

Enter your API base URL, handle existing directories/files, and the CLI sets up everything automatically.

---

## ✨ Features

- **Interactive Setup**: Prompts for API base URL to configure the Axios instance.
- **Modular Structure**: Generates files in `src/` with subdirectories (`config/`, `hooks/`, `utils/`).
- **Smart File Handling**: Options to skip, overwrite, or merge existing directories/files.
- **Utility Functions**: Includes `buildQueryString`, `getItem`, `setItem`, and more.
- **Type-Safe**: Built with TypeScript support.
- **Dependencies Installed**: Installs `axios`, `@tanstack/react-query`, `sonner`, and `js-cookie`.

---

## 🛠️ Installation

```bash
npx @pavandeep/create-api-setup init
```

No global install needed. Works in any Node.js project (Node 16+ recommended).

---

## 📦 Usage

1. **Run CLI**:
    ```bash
    npx @pavandeep/create-api-setup init
    ```

2. **Enter API Base URL**:
    Example: `https://api.example.com/v1`. Default: `https://pumpup-api.devstree.in/api/v1`.

3. **Handle Existing Files/Directories**:
    - **Directories**: Skip, Overwrite, or Merge (default).
    - **Files**: Skip (default) or Overwrite.

4. **Review Output**: CLI creates the `src/` structure and installs dependencies.

---

## 📁 Generated Project Structure

```plaintext
src/
├── config/
│   ├── api/
│   │   └── api.ts
│   └── instance/
│       └── instance.ts
├── hooks/
│   ├── useFetchData.ts
│   ├── usePostData.ts
│   ├── usePutData.ts
│   ├── usePatchData.ts
│   └── useDeleteData.ts
├── utils/
│   └── storage.ts
```

---

## 📄 Example

```tsx
import useFetchData from '@/hooks/useFetchData';
import API from '@/config/api';

const UserList = () => {
  const { data, isLoading, error } = useFetchData({
    url: API.auth.login,
    params: { role: 'admin' },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

export default UserList;
```

---

## 🔧 Requirements

### `src/types/index.ts`

```ts
export enum StorageEnum {
  Token = 'token',
}

export interface Result {
  statusCode: number;
  error: boolean;
  message?: string;
  data?: any;
}
```

### `useToast` (Example with react-toastify)

```ts
import { toast as toastify } from 'react-toastify';

export const useToast = () => ({
  toast: ({ title, description, variant }) => {
    toastify(description, { type: variant === 'destructive' ? 'error' : 'success' });
  },
});
```

### `src/constants/data.ts`

```ts
export const BASIC_AUTH_CREDENTIALS = {
  username: 'your-username',
  password: 'your-password',
};
```

---

## 📦 Dependencies

Installed automatically:
- `axios`
- `@tanstack/react-query`
- `sonner`
- `js-cookie`

If not, run:

```bash
npm install axios @tanstack/react-query sonner js-cookie
```

---

## 🧰 Troubleshooting

- **`v is not defined`**: Fixed in `v1.0.4`.
- **Manual install failed**: Try installing dependencies manually.
- **Missing utilities**: Add `StorageEnum`, `Result`, `useToast`, `BASIC_AUTH_CREDENTIALS`.

---

## 🤝 Contributing

Contributions welcome!

```bash
git clone https://github.com/pavandeepkumar/api-setup
cd api-setup
git checkout -b feature/my-feature
```

Push and open a pull request.

---

## 📄 License

MIT License

---

## 📫 Contact

**Author**: Pavandeep  
**Email**: pavandeepkumarmlk@gmail.com  
**GitHub**: [pavandeepkumar](https://github.com/pavandeepkumar/api-setup)  
**npm**: [@pavandeep/create-api-setup](https://www.npmjs.com/package/@pavandeep/create-api-setup)
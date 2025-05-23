@pavandeep/create-api-setup

A CLI tool to scaffold API call setups for React projects using Axios and Tanstack Query. It generates a structured src/ directory with API configurations, Axios instance, React Query hooks, and utility functions for local storage and query string building.
Features

Prompts for an API base URL to configure the Axios instance.
Generates files in src/ with a modular structure (config/, hooks/, utils/).
Handles existing directories/files with options to skip, overwrite, or merge.
Includes utility functions for local storage (getItem, setItem, etc.) and query string building (buildQueryString).
Installs required dependencies: axios, @tanstack/react-query, sonner, js-cookie.
Supports TypeScript with type-safe Axios and React Query hooks.

Installation
Run the CLI using npx (no global installation required):
npx @pavandeep/create-api-setup init

Usage

Run the CLI:
npx @pavandeep/create-api-setup init


Enter the API base URL when prompted (e.g., https://api.example.com/v1).

Handle existing directories/files (if any):

For existing directories (e.g., src/hooks):
Skip: Preserve the directory and skip its files.
Overwrite: Delete and recreate the directory with CLI files.
Merge (default): Create only missing files in the directory.


For existing files (e.g., src/config/api/api.ts):
Skip (default): Preserve the existing file.
Overwrite: Replace with the CLI-generated file.




Review the generated structure and install dependencies automatically.


Generated Project Structure
The CLI creates the following structure under src/:
src/
├── config/
│   ├── api/
│   │   └── api.ts              # API endpoint definitions
│   └── instance/
│       └── instance.ts         # Axios instance with interceptors
├── hooks/
│   ├── useFetchData.ts         # React Query hook for GET requests
│   ├── usePostData.ts          # React Query hook for POST requests
│   ├── usePutData.ts           # React Query hook for PUT requests
│   ├── usePatchData.ts         # React Query hook for PATCH requests
│   └── useDeleteData.ts        # React Query hook for DELETE requests
├── utils/
│   └── storage.ts              # Utility functions (buildQueryString, getItem, etc.)

Generated Files

src/config/api/api.ts: Defines API endpoints (e.g., auth.login: 'auth/login').
src/config/instance/instance.ts: Configures an Axios instance with the provided base URL, token-based authentication, and interceptors for request/response handling.
src/hooks/useFetchData.ts: A React Query hook for GET requests with query string support.
src/hooks/usePostData.ts: A React Query hook for POST requests with toast notifications.
src/hooks/usePutData.ts: A React Query hook for PUT requests with success/error handling.
src/hooks/usePatchData.ts: A React Query hook for PATCH requests.
src/hooks/useDeleteData.ts: A React Query hook for DELETE requests.
src/utils/storage.ts: Utility functions:
buildQueryString: Builds URL query strings from objects.
getItem: Retrieves and parses items from local storage.
getStringItem: Retrieves raw strings from local storage.
setItem: Stores items in local storage.
removeItem: Removes items from local storage.
clearItems: Clears all local storage.
objectToFormData: Converts objects to FormData for file uploads.



Example
To set up an API client in a new React project:
mkdir my-project
cd my-project
npx @pavandeep/create-api-setup init


Enter https://api.example.com/v1 as the base URL.
Choose “merge” for existing src/ directories to add missing files.
The CLI generates the src/ structure and installs dependencies.

Then, use the generated hooks in your React components:
import useFetchData from '@/hooks/useFetchData';
import API from '@/config/api';

const MyComponent = () => {
  const { data, isLoading, error } = useFetchData({
    url: API.auth.login,
    params: { role: 'admin' },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Data: {JSON.stringify(data)}</div>;
};

Requirements
The generated files depend on the following utilities, which you must implement or remove:

StorageEnum and Result (from @/types):export enum StorageEnum {
  Token = 'token',
}

export interface Result {
  statusCode: number;
  error: boolean;
  message?: string;
  data?: any;
}


useToast (from @/components/ui/use-toast): Used in usePostData.ts, usePutData.ts, and usePatchData.ts for notifications. Replace with your toast library (e.g., react-toastify) or remove toast-related code.
BASIC_AUTH_CREDENTIALS (from @/constants/data): Used in useFetchData.ts for basic authentication:export const BASIC_AUTH_CREDENTIALS = {
  username: 'your-username',
  password: 'your-password',
};



You can create these in src/types/index.ts and src/constants/data.ts or modify the generated files to remove these dependencies.
Dependencies
The CLI installs the following npm packages:

axios: For HTTP requests.
@tanstack/react-query: For data fetching and state management.
sonner: For toast notifications in usePutData.ts and usePatchData.ts.
js-cookie: For token management in instance.ts.

If dependency installation fails, run manually:
npm install axios @tanstack/react-query sonner js-cookie

Troubleshooting

Error: v is not defined:
Ensure you’re using version 1.0.4 or later (npm install @pavandeep/create-api-setup@latest).
Verify src/utils/storage.ts uses string concatenation in buildQueryString.


Existing Directories/Files Not Handled:
Confirm prompts appear for existing directories/files.
Choose “merge” to add missing files or “skip” to preserve existing content.


Dependency Installation Fails:
Run the manual installation command above.
Check your package manager (npm, yarn, or pnpm) and network connection.


Missing Utilities:
Implement StorageEnum, Result, useToast, and BASIC_AUTH_CREDENTIALS as shown in the Requirements section.
Alternatively, remove these dependencies from the generated files.


Command Not Found:
Use npx @pavandeep/create-api-setup init to ensure the latest version.
If running locally, ensure npm link is executed in the CLI directory.



For additional issues, open an issue on GitHub.
Contributing
Contributions are welcome! To contribute:

Fork the repository: https://github.com/pavandeep/create-api-setup.
Create a feature branch (git checkout -b feature/my-feature).
Commit changes (git commit -m 'Add my feature').
Push to the branch (git push origin feature/my-feature).
Open a pull request.

Please include tests and update this README.md for new features.
License
MIT License
Contact

Author: Pavandeep
Email: pavandeep@example.com (replace with your actual email)
GitHub: https://github.com/pavandeep/create-api-setup
npm: https://www.npmjs.com/package/@pavandeep/create-api-setup

For support, open an issue on GitHub or contact the author.

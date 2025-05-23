@pavandeep/create-api-setup

A CLI tool to scaffold API call setups for React projects using Axios and Tanstack Query. It generates a modular src/ directory structure with API configurations, an Axios instance, React Query hooks, and utility functions for local storage and query string building.
Quick Start
Get started in one command:
npx @pavandeep/create-api-setup init

Enter your API base URL, handle existing directories/files, and the CLI sets up everything automatically.
Features

Interactive Setup: Prompts for an API base URL to configure the Axios instance.
Modular Structure: Generates files in src/ with subdirectories (config/, hooks/, utils/).
Smart File Handling: Options to skip, overwrite, or merge existing directories/files.
Utility Functions: Includes buildQueryString, getItem, setItem, and more in src/utils/storage.ts.
Type-Safe: Supports TypeScript with typed Axios and React Query hooks.
Dependencies Installed: Automatically adds axios, @tanstack/react-query, sonner, and js-cookie.

Installation
Run the CLI using npx:
npx @pavandeep/create-api-setup init

No global installation is required. The CLI works in any Node.js project (Node.js v16 or higher recommended).
Usage

Run the CLI:
npx @pavandeep/create-api-setup init


Enter the API Base URL:
Provide your API’s base URL (e.g., https://api.example.com/v1). The default is https://pumpup-api.devstree.in/api/v1.

Handle Existing Directories/Files:
If directories like src/config/ or files like src/hooks/useFetchData.ts exist, you’ll be prompted:

For Directories:
Skip: Preserve the directory and skip its files.
Overwrite: Delete and recreate the directory with CLI files.
Merge (default): Create only missing files in the directory.


For Files:
Skip (default): Keep the existing file.
Overwrite: Replace with the CLI-generated file.




Review Output:
The CLI creates the src/ structure, installs dependencies, and logs required utilities.


Generated Project Structure
The CLI generates the following src/ structure:
src/
├── config/
│   ├── api/
│   │   └── api.ts              # API endpoint definitions
│   └── instance/
│       └── instance.ts         # Axios instance with interceptors
├── hooks/
│   ├── useFetchData.ts         # GET request hook (React Query)
│   ├── usePostData.ts          # POST request hook (React Query)
│   ├── usePutData.ts           # PUT request hook (React Query)
│   ├── usePatchData.ts         # PATCH request hook (React Query)
│   └── useDeleteData.ts        # DELETE request hook (React Query)
├── utils/
│   └── storage.ts              # Utility functions for storage and query strings

Generated Files

src/config/api/api.ts:
Defines API endpoints in a frozen object:
const API = {
  auth: {
    login: 'auth/login'
  },
};
Object.freeze(API);
export default API;


src/config/instance/instance.ts:
Configures an Axios instance with:

Base URL (from user input).
Token-based authentication using js-cookie.
Request/response interceptors for headers and error handling (e.g., clears token on 401 errors).
Methods for GET, POST, PUT, PATCH, and DELETE.


src/hooks/useFetchData.ts:
A React Query hook for GET requests with query string support via buildQueryString.

src/hooks/usePostData.ts:
A React Query hook for POST requests with toast notifications.

src/hooks/usePutData.ts:
A React Query hook for PUT requests with success/error handling.

src/hooks/usePatchData.ts:
A React Query hook for PATCH requests.

src/hooks/useDeleteData.ts:
A React Query hook for DELETE requests.

src/utils/storage.ts:
Utility functions for local storage and form data:

buildQueryString: Converts objects to URL query strings (e.g., { role: 'admin' } → ?role=admin).
getItem: Retrieves and parses items from local storage.
getStringItem: Retrieves raw strings from local storage.
setItem: Stores items in local storage.
removeItem: Removes items from local storage.
clearItems: Clears all local storage.
objectToFormData: Converts objects to FormData for file uploads.



Example
Set up an API client in a React project:
mkdir my-react-app
cd my-react-app
npx @pavandeep/create-api-setup init


Enter https://api.example.com/v1 as the base URL.
Choose “merge” for existing src/ directories to add missing files.
The CLI generates the src/ structure and installs dependencies.

Use the generated hooks in a component:
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

Requirements
The generated files rely on these utilities, which you must implement or remove:

StorageEnum and Result (from @/types):
Create src/types/index.ts:
export enum StorageEnum {
  Token = 'token',
}

export interface Result {
  statusCode: number;
  error: boolean;
  message?: string;
  data?: any;
}


useToast (from @/components/ui/use-toast):
Used in usePostData.ts, usePutData.ts, and usePatchData.ts for notifications. Implement with your toast library (e.g., react-toastify) or remove toast-related code:
// Example with react-toastify
import { toast as toastify } from 'react-toastify';
export const useToast = () => ({
  toast: ({ title, description, variant }) => {
    toastify(description, { type: variant === 'destructive' ? 'error' : 'success' });
  },
});


BASIC_AUTH_CREDENTIALS (from @/constants/data):
Used in useFetchData.ts for basic authentication. Create src/constants/data.ts:
export const BASIC_AUTH_CREDENTIALS = {
  username: 'your-username',
  password: 'your-password',
};



Alternatively, remove these dependencies by editing the generated files (e.g., remove auth: BASIC_AUTH_CREDENTIALS from useFetchData.ts).
Dependencies
The CLI installs these packages automatically:

axios: For HTTP requests.
@tanstack/react-query: For data fetching and state management.
sonner: For toast notifications in usePutData.ts and usePatchData.ts.
js-cookie: For token management in instance.ts.

If installation fails, install manually:
npm install axios @tanstack/react-query sonner js-cookie

Troubleshooting

v is not defined Error:

Fixed in version 1.0.4. Ensure you’re using the latest version:npx @pavandeep/create-api-setup@latest init


If the error persists, verify src/utils/storage.ts uses string concatenation in buildQueryString.


Existing Directories/Files Not Handled:

Ensure prompts appear for existing directories/files.
Use “merge” to add missing files or “skip” to preserve existing content.


Dependency Installation Fails:

Run the manual installation command above.
Check your package manager (npm, yarn, or pnpm) and network connection.


Missing Utilities:

Implement StorageEnum, Result, useToast, and BASIC_AUTH_CREDENTIALS as shown in the Requirements section.
Or, modify generated files to remove these dependencies.


Command Not Found:

Use npx @pavandeep/create-api-setup init to ensure the latest version.
If running locally, run npm link in the CLI directory.



For further issues, open an issue on GitHub.
Contributing
Contributions are welcome! To contribute:

Fork the repository: https://github.com/pavandeepkumar/api-setup.
Create a feature branch: git checkout -b feature/my-feature.
Commit changes: git commit -m 'Add my feature'.
Push to the branch: git push origin feature/my-feature.
Open a pull request.

Please include tests and update this README.md for new features.
License
MIT License
Contact

Author: Pavandeep
Email: pavandeepkumarmlk@gamil.com 
GitHub: https://github.com/pavandeepkumar/api-setup
npm: https://www.npmjs.com/package/@pavandeep/create-api-setup

For support, open an issue on GitHub or contact the author.

# Technical Context: Roxonn Code (VSCode Extension)

## 1. Core Technologies

**Roxonn Code VSCode Extension (Client-Side - based on `kilocode` project):**

- **Programming Language:** TypeScript.
- **Framework/Environment:** VSCode Extension API.
- **UI (Webviews):** HTML, CSS, TypeScript, React (used in `kilocode/webview-ui/`).
- **HTTP Client:** `axios` (used in `src/core/webview/webviewMessageHandler.ts` and `src/utils/roxonnProfileService.ts`).
- **State Management (within extension):** React Context (`ExtensionStateContext`) and component state.
- **Key Utility Files:**
    - `src/utils/roxonnAuth.ts`: Provides `loadRoxonnAuthToken` to load JWT from `SecretStorage`.
    - `src/utils/roxonnProfileService.ts`: Defines `RoxonnProfileService` for backend API calls related to user profile, though `webviewMessageHandler.ts` makes direct `axios` calls for UI-facing profile data.
- **Webview-Extension Communication:** Via `vscode.postMessage` using defined `WebviewMessage` types, including:
    - `fetchProfileDataRequest` / `profileDataResponse`
    - `fetchBalanceDataRequest` / `balanceDataResponse`
    - `requestRoxonnModels` / `roxonnModelsResponse`

**Roxonn Platform Backend (Server-Side Enhancements for Roxonn Code - `app.roxonn.com`):**

- **Programming Language:** TypeScript (consistent with the existing Roxonn backend at `/home/ubuntu/GitHubIdentity/server/`).
- **Framework:** Express.js (consistent with the existing Roxonn backend).
- **AI Model Integration (Proxy Layer):**
    - Initial: Azure OpenAI (via Azure SDK or direct REST API calls from Roxonn backend).
    - Planned: AWS (e.g., Bedrock via AWS SDK), GCP (e.g., Vertex AI via Google Cloud SDK).
- **Authentication:** JWT (`jsonwebtoken` library on backend for issuing and verifying tokens).

## 2. Development Environment & Tooling

**Roxonn Code VSCode Extension (`/home/ubuntu/kilocode/` project):**

- **Version Control:** Git.
- **Package Manager:** pnpm (inferred from `pnpm-lock.yaml` and `pnpm-workspace.yaml` in the `kilocode` directory).
- **Build Tools:**
    - TypeScript Compiler (`tsc`).
    - `vsce` (VSCode Extension Manager) for packaging (`.vsix` files) and publishing.
    - Scripts in `kilocode/package.json` (e.g., `npm run build` or `pnpm build` as per plan).
- **Linters & Formatters:**
    - Prettier (inferred from `.prettierrc.json`, `.prettierignore` in `kilocode`).
    - Knip (inferred from `knip.json` in `kilocode`) for detecting unused files, exports, and dependencies.
- **Testing Frameworks:** To be determined based on the base "Kilo Code" extension's existing test setup.
- **Integrated Development Environment (IDE):** VS Code.

**Roxonn Platform Backend (`/home/ubuntu/GitHubIdentity/` project):**

- (Refer to the main Roxonn platform's `memory-bank/techContext.md` for its full development environment and tooling). Enhancements for Roxonn Code will follow existing patterns.

## 3. Setup & Configuration

**Roxonn Code VSCode Extension:**

- **Configuration:**
    - The extension uses `https://app.roxonn.com` as the base URL for the Roxonn backend API (hardcoded in `RoxonnAzureHandler` and `webviewMessageHandler.ts`).
    - The `RoxonnAzureHandler` uses `options.kilocodeModel` (from `ProviderSettings`) for model selection.
    - No direct AI provider API keys are stored in the extension.
- **Authentication Token Storage:** The JWT received from the Roxonn backend is stored in VSCode's `SecretStorage` API under the key `"roxonnAuthToken"`.
- **Development Setup (for `kilocode` project):**
    - Clone the `kilocode` repository (located at `/home/ubuntu/kilocode/`).
    - Install dependencies using `pnpm install`.
    - Run the extension in a VSCode Extension Development Host (e.g., by pressing F5 in VSCode with the `kilocode` project open).

**Roxonn Platform Backend:**

- Configuration for the new `/api/vscode/ai/completions` endpoint in `server/routes.ts`.
- Secure storage and management of API keys for Azure, AWS, and GCP AI services (via `server/config.ts` sourcing from environment variables or AWS SSM).
- Configuration for JWT signing (secret key - currently `config.sessionSecret`, expiration times) in `server/auth.ts`.
- Environment variables for Azure OpenAI (`AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT_NAME`, `AZURE_OPENAI_API_VERSION`) must be set in `server/.env` or AWS SSM.

## 4. Technical Constraints & Considerations

- **VSCode Extension API Limitations:** Development must adhere to the capabilities and restrictions of the VSCode Extension API.
- **Security of JWT:** Proper handling (secure storage via `SecretStorage`, HTTPS transmission, consideration of expiration/refresh) of the JWT within the VSCode extension is critical.
- **Performance:** API calls from the extension to the Roxonn backend, and subsequently to cloud AI providers, should be optimized to ensure a responsive user experience.
- **Cross-Platform Compatibility:** The VSCode extension must function correctly on all platforms supported by VSCode (Windows, macOS, Linux).
- **Error Handling:** Robust error handling is needed for API communication failures, authentication issues, insufficient AI credits, and errors from AI model providers, providing clear feedback to the user in the VSCode UI.
- **Rate Limiting:** The Roxonn backend API endpoint for the extension should be protected by rate limiting. The extension should also handle rate limit responses gracefully.
- **Monorepo Package Resolution (`kilocode`):** Ensuring correct module resolution for internal packages (like `@kilocode/api-client`) within the pnpm workspace.

## 5. Deployment Process

**Roxonn Code VSCode Extension:**

1.  **Build:** Compile TypeScript, bundle assets (e.g., `pnpm build` in `/home/ubuntu/kilocode/`).
2.  **Package:** Create a `.vsix` file using `vsce package` in `/home/ubuntu/kilocode/`.
3.  **Testing:** Install and test the `.vsix` file locally in VSCode.
4.  **Publish:** Publish the `.vsix` file to the Visual Studio Code Marketplace using `vsce publish` (requires a publisher identity, e.g., "roxonn").

**Roxonn Platform Backend:**

- Deploy updates (new API endpoint in `server/routes.ts`, modified auth logic in `server/auth.ts`) to the existing Roxonn backend server (`app.roxonn.com`) following its established deployment procedures.

## 6. Tool Usage Patterns

**Roxonn Code VSCode Extension:**

- **API Communication:** Use `fetch` or a library like `axios` to make authenticated (Bearer JWT) HTTPS requests to the Roxonn backend.
- **Authentication:** Implement the client-side logic for the GitHub OAuth flow redirection to the Roxonn backend and handle the JWT callback via custom URI scheme (`vscode://roxonn.roxonn-code/auth`).
- **UI Updates:** Dynamically update VSCode webviews or other UI elements based on responses from the backend (AI suggestions, credit balance, error messages).
- **Local State:** Manage local state within the extension (e.g., current user details from JWT, JWT itself, UI state).

---

_This document details the technologies, tools, and processes specific to the Roxonn Code VSCode Extension and its interaction with the Roxonn platform, based on `ROXONN_CODE_IMPLEMENTATION_PLAN.md`. It should be kept up-to-date as the tech stack and development practices evolve._

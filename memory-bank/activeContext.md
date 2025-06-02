# Active Context: Roxonn Code (VSCode Extension) - (Updated 2025-05-31)

## 1. Current Work Focus

- **Immediate Priority:** Finalizing Memory Bank updates based on uncommitted file review. Preparing for build and test of the Roxonn Code VSCode extension.
- **Tasks in Progress:**
    - Reviewing uncommitted files in `kilocode` project.
    - Identifying discrepancies and new features/patterns.
    - Updating `kilocode` Memory Bank (this document, `systemPatterns.md`, `techContext.md`, `progress.md`).

## 2. Recent Changes & Decisions

- **Uncommitted File Review (2025-06-01):**
    - **`src/utils/roxonnAuth.ts` (New):** Introduces `loadRoxonnAuthToken` to proactively load and apply JWT from `SecretStorage` (key: `"roxonnAuthToken"`) to provider settings during extension activation.
    - **`src/utils/roxonnProfileService.ts` (New):** Defines `RoxonnProfileService` for fetching detailed user profile, AI credits, and token/wallet balances from backend endpoints (`/api/auth/user`, `/api/token/balance`, `/api/wallet/info`). Includes adapter methods (`getVSCodeProfile`, `getVSCodeProfileBalance`).
    - **`src/extension.ts` (Modified):** Now calls `loadRoxonnAuthToken` during activation.
    - **`src/activate/handleUri.ts` (Modified):**
        - Stores JWT to `SecretStorage` using key `"roxonnAuthToken"`.
        - Sets a default model `roxonn/gpt-4o` for the "roxonn" provider.
        - Initializes `RoxonnProfileService` with the new token.
        - Rebuilds the current Cline's API handler upon successful authentication.
    - **`src/api/index.ts` (Modified):** Confirms `RoxonnAzureHandler` is registered for the "roxonn" provider.
    - **`src/api/providers/roxonn-azure.ts` (Modified):**
        - Base URL for AI requests is `https://app.roxonn.com/api/vscode/ai` (OpenAI client appends `/chat/completions`).
        - Uses `options.kilocodeModel` for model selection (maps e.g., "roxonn/gpt-4o" to "gpt-4o" for backend).
        - `getModels()` returns a hardcoded list of models (`gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`).
        - Injects JWT `Authorization: Bearer` header into requests.
    - **`webview-ui/src/components/kilocode/profile/ProfileView.tsx` (Modified):**
        - Fetches profile and balance data via `fetchProfileDataRequest` and `fetchBalanceDataRequest` messages to the extension backend.
        - Expects `ProfileData` (user name, email, image) and balance.
        - Links to `https://app.roxonn.com/vscode/wallet` for dashboard.
    - **`webview-ui/src/components/settings/ApiOptions.tsx` (Modified):**
        - For "roxonn" provider, displays token input, Roxonn-specific model picker (using `kilocodeModel` field), and login/logout.
        - Fetches Roxonn models via `requestRoxonnModels` message, expects `roxonnModelsResponse`.
    - **`src/core/webview/webviewMessageHandler.ts` (Modified):**
        - Handles `fetchProfileDataRequest`: GETs `https://app.roxonn.com/api/vscode/profile` (using JWT).
        - Handles `fetchBalanceDataRequest`: GETs `https://app.roxonn.com/api/vscode/profile/balance` (using JWT).
        - Handles `requestRoxonnModels`: Calls `RoxonnAzureHandler.getModels()` and sends hardcoded models back.
- **Type Import Standardization (2025-05-31):** (Previous) Ensured core types are sourced from `src/shared/api.ts`.
- **Backend Readiness Confirmed (2025-05-31):** (Previous) Backend MVP changes appeared implemented.
- **Branding & Auth Handler Status (2025-05-31):** (Previous) Core MVP client-side features largely in place.

## 3. Next Steps

- **Complete `kilocode` Memory Bank Update:** Finish updating `systemPatterns.md`, `techContext.md`, and `progress.md` based on uncommitted file review.
- **Git Integration:** Add updated Memory Bank files and all other reviewed uncommitted changes to git staging.
- **Guide User on Building & Testing:** Provide steps for building the `roxonn-code` extension and testing the authentication, profile display, and AI request flow.
- **Address any remaining TypeScript errors** if they surface during the build/run phase.

## 4. Active Considerations & Questions

- **Backend Endpoint Discrepancy:**
    - `webviewMessageHandler.ts` uses `GET /api/vscode/profile` and `GET /api/vscode/profile/balance`.
    - `RoxonnProfileService.ts` is designed for `GET /api/auth/user`, `GET /api/token/balance`, `GET /api/wallet/info`.
    - The `ROXONN_CODE_IMPLEMENTATION_PLAN.md` and initial memory bank mentioned `/api/vscode/ai/completions` for AI requests, which `RoxonnAzureHandler` targets as `https://app.roxonn.com/api/vscode/ai` (base for OpenAI client).
    - **Clarification needed:** Which set of profile/balance endpoints is canonical for the UI? Is `RoxonnProfileService.ts` used, and if so, where?
- **TypeScript Errors:** Verify if any TypeScript errors persist after these changes.
- **End-to-End Functionality:** Successful testing depends on the `GitHubIdentity` backend (`app.roxonn.com`) correctly serving the `/api/vscode/profile`, `/api/vscode/profile/balance`, and `/api/vscode/ai/chat/completions` (or similar) endpoints.

## 5. Important Patterns & Preferences (Learned So Far)

- **Correct Project Path:** `/home/ubuntu/kilocode/` for extension, `/home/ubuntu/GitHubIdentity/` for backend.
- **Type Sourcing:** Core types from `src/shared/api.ts`.
- **Leverage Existing Infrastructure:** Core principle.
- **Single Backend Proxy & JWT Authentication:** Key architecture.
- **Webview-Extension Communication:** Uses `vscode.postMessage` with defined message types (e.g., `fetchProfileDataRequest`, `roxonnModelsResponse`).
- **Secret Storage for Token:** JWT stored under key `"roxonnAuthToken"`.
- **Hardcoded Models for Roxonn Provider:** `RoxonnAzureHandler.getModels()` returns a static list.

## 6. Learnings & Insights

- The extension has evolved to include more detailed profile fetching and display capabilities.
- Authentication token handling is now more robust with proactive loading from `SecretStorage` via `roxonnAuth.ts` in addition to the callback flow in `handleUri.ts`.
- The UI components for profile and settings are being adapted to specifically support the "roxonn" provider.
- There's a potential redundancy or versioning issue with backend endpoint definitions for profile data (`/api/vscode/*` vs. `/api/auth/*`, etc.).

---

_This document captures the dynamic state of the Roxonn Code VSCode Extension project. It should be updated frequently to reflect the latest progress, decisions, and focus._

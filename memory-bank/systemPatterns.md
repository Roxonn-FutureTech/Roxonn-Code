# System Patterns: Roxonn Code (VSCode Extension)

## 1. System Architecture Overview

- **High-Level Architecture:** Roxonn Code operates on a **client-server model**. The VSCode extension ("Roxonn Code") acts as the client, relying entirely on the existing Roxonn platform backend (`app.roxonn.com`) for core functionalities including authentication, AI processing, and AI credit management. It is an extension of the main Roxonn platform, not a standalone application. The architecture is detailed in `ROXONN_CODE_IMPLEMENTATION_PLAN.md`.

    ```mermaid
    graph TB
        subgraph "Roxonn Code User Environment"
            VSCodeExtension[Roxonn Code VSCode Extension]
        end

        subgraph "Existing Roxonn Platform (app.roxonn.com)"
            RoxonnBackend[Roxonn Backend API]
            AuthService[GitHub OAuth Service]
            CreditService[AI Credit Management System]
            PaymentService[Onramp.money Integration]
            UserModelDB[User Database (PostgreSQL)]
            CloudAIProxy[Cloud AI Model Proxy (Azure, AWS, GCP)]
        end

        subgraph "External Services Dependency"
            GitHub[GitHub API]
            CloudAIProviders[Cloud AI Providers (Azure, AWS, GCP)]
            OnrampMoneyService[Onramp.money Service]
        end

        VSCodeExtension -- HTTPS API Calls (JWT Auth) --> RoxonnBackend
        RoxonnBackend -- Authenticates via --> AuthService
        AuthService -- OAuth Flow --> GitHub
        RoxonnBackend -- Manages Credits via --> CreditService
        CreditService -- Reads/Writes --> UserModelDB
        RoxonnBackend -- Facilitates Payments via --> PaymentService
        PaymentService -- Interacts with --> OnrampMoneyService
        RoxonnBackend -- Proxies AI Requests to --> CloudAIProxy
        CloudAIProxy -- Secure API Calls --> CloudAIProviders
    ```

- **Key Components & Responsibilities:**

    - **Roxonn Code VSCode Extension (Client):**
        - Provides the user interface (UI) and user experience (UX) within the VSCode IDE.
        - Captures user inputs for AI-powered coding assistance (e.g., code snippets, prompts for chat or completion).
        - Initiates the authentication flow by redirecting or communicating with the Roxonn platform's GitHub OAuth service.
        - Securely stores (via `SecretStorage`, key `"roxonnAuthToken"`) and utilizes a JSON Web Token (JWT) received from the Roxonn backend for authenticating subsequent API requests. Proactively loads this token on startup via `src/utils/roxonnAuth.ts`.
        - Sends AI assistance requests to `https://app.roxonn.com/api/vscode/ai` (base path, specific endpoint like `/chat/completions` appended by client).
        - Receives and displays AI-generated responses to the user.
        - Displays the user's AI credit balance and other profile information (name, email, image) fetched via `fetchProfileDataRequest` and `fetchBalanceDataRequest` messages to `src/core/webview/webviewMessageHandler.ts`.
        - Facilitates navigation to the Roxonn platform for credit purchases (dashboard at `https://app.roxonn.com/vscode/wallet`).
        - Allows selection from a hardcoded list of Roxonn models (`gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`) via `requestRoxonnModels` message.
    - **Roxonn Platform Backend (`app.roxonn.com`) (Server-Side Enhancements):**
        - Handles the GitHub OAuth flow initiated by the VSCode extension, identifying the source as 'vscode'.
        - Issues JWTs to successfully authenticated VSCode extension users.
        - Exposes secured API endpoints:
            - `POST /api/vscode/ai/chat/completions` (or similar, actual path formed by `RoxonnAzureHandler` using base `/api/vscode/ai`) for AI requests.
            - `GET /api/vscode/profile` for fetching user profile data.
            - `GET /api/vscode/profile/balance` for fetching AI credits and token balance.
        - Authenticates incoming requests from the extension using the JWT.
        - Interfaces with the existing AI Credit Management system to:
            - Check the user's AI credit balance before processing a request.
            - Estimate and deduct AI credits for services consumed via the extension based on token usage.
        - Proxies AI requests to the appropriate configured cloud AI model (e.g., Azure OpenAI, AWS Bedrock, Google Vertex AI), managing API keys and communication with these external AI services.
        - Leverages the existing Onramp.money integration to allow users to purchase AI credits (via the main platform's UI).

- **Data Flow:**
    1.  **Authentication:** User in VSCode Extension initiates login -> Extension triggers opening Roxonn Backend's GitHub OAuth URL (with `source=vscode`) -> User authenticates with GitHub -> GitHub redirects to Roxonn Backend callback -> Roxonn Backend verifies user, issues JWT -> Backend redirects to a VSCode custom URI (`vscode://roxonn.roxonn-code/auth?token=JWT`) -> VSCode Extension's `handleUri.ts` captures JWT, stores it in `SecretStorage` (key `"roxonnAuthToken"`), updates provider settings to "roxonn", sets default model "roxonn/gpt-4o", and initializes `RoxonnProfileService`.
    2.  **Profile/Balance Display (on UI load/token change):**
        - `ProfileView.tsx` sends `fetchProfileDataRequest` and `fetchBalanceDataRequest` to `webviewMessageHandler.ts`.
        - `webviewMessageHandler.ts` makes authenticated GET requests to `/api/vscode/profile` and `/api/vscode/profile/balance` respectively.
        - Responses (`profileDataResponse`, `balanceDataResponse`) are sent back to `ProfileView.tsx` for display.
    3.  **AI Request:** User makes AI request in VSCode Extension -> Extension (via `RoxonnAzureHandler`) sends request (with JWT in Authorization header) to Roxonn Backend API endpoint (e.g., `/api/vscode/ai/chat/completions`) -> Backend validates JWT, checks user's AI credits -> If sufficient credits, Backend proxies request to the configured Cloud AI Provider (Azure OpenAI) -> Cloud AI Provider responds to Backend -> Backend calculates actual cost, deducts credits, logs usage -> Backend sends AI response to VSCode Extension -> Extension displays response to user.
    4.  **Model List Display (Settings UI):**
        - `ApiOptions.tsx` (when "roxonn" provider selected) sends `requestRoxonnModels` to `webviewMessageHandler.ts`.
        - `webviewMessageHandler.ts` calls `RoxonnAzureHandler.getModels()`, which returns a hardcoded list.
        - `roxonnModelsResponse` is sent back to `ApiOptions.tsx` for display in model picker.
    5.  **Credit Purchase:** User in VSCode Extension needs more credits -> Clicks a link/button in the extension (e.g., to `https://app.roxonn.com/vscode/wallet`) -> User is directed to the main Roxonn Platform's UI for purchasing AI credits (using Onramp.money) -> Roxonn Backend updates user's credit balance upon successful purchase.

## 2. Key Technical Decisions & Rationales (from `ROXONN_CODE_IMPLEMENTATION_PLAN.md`)

- **Decision 1: Leverage Existing Roxonn Backend Infrastructure.**
    - **Rationale:** Significantly reduces development time and cost by reusing established and tested systems for authentication (GitHub OAuth), user management, AI credit system, payment processing (Onramp.money), and existing/planned AI model integrations. Ensures consistency in user experience and data management across the Roxonn ecosystem.
- **Decision 2: Use JWT for VSCode Extension Authentication to Roxonn Backend.**
    - **Rationale:** JWTs are a standard, secure, and stateless mechanism for authenticating client-server API requests, suitable for the VSCode extension to Roxonn backend interaction.
- **Decision 3: Proxy All AI Model Calls Through the Roxonn Backend.**
    - **Rationale:** Centralized control over AI model access, management of AI credits, flexibility to switch/add AI models on the backend without updating the extension, and security of cloud AI provider API keys (kept on backend only).
- **Decision 4: Initial Free Credits and Onramp.money for Top-ups.**
    - **Rationale:** Lowers barrier to entry for new users (free credits). Leverages existing payment gateway (Onramp.money via main Roxonn platform) for a familiar experience for credit purchases.

## 3. Design Patterns in Use

- **Proxy Pattern:** The Roxonn backend acts as a proxy between the VSCode extension and the cloud AI model providers.
- **Facade Pattern:** The new API endpoint on the Roxonn backend provides a simplified interface (facade) for the VSCode extension to access complex underlying services (authentication, credit management, AI model interaction).
- **Token-Based Authentication (JWT):** Used for securing API communication between the VSCode extension and the Roxonn backend.
- **Strategy Pattern (Conceptual on Backend):** The Roxonn backend can internally use a strategy pattern to select and interact with different cloud AI providers (Azure, AWS, GCP) based on configuration or other criteria for the proxied requests.

## 4. Component Relationships & Interactions

- (Refer to the Mermaid diagram in Section 1 and the Data Flow description.)
- **VSCode Extension** interacts primarily with the **Roxonn Backend API** via HTTPS.
- **Roxonn Backend** orchestrates interactions with **GitHub** (OAuth), its **internal User Database & AI Credit System**, **Cloud AI Providers**, and **Onramp.money** (via main platform UI for payment).

## 5. Critical Implementation Paths

- Secure and reliable JWT-based authentication flow:
    - Extension side: `handleUri.ts` for callback, `roxonnAuth.ts` for proactive loading, `SecretStorage` (key `"roxonnAuthToken"`) for JWT.
    - Backend side: Validation of JWT for all `/api/vscode/*` endpoints.
- Robust and secure API endpoints on the Roxonn backend:
    - `/api/vscode/ai/chat/completions` (or similar) for AI requests.
    - `/api/vscode/profile` for user profile data.
    - `/api/vscode/profile/balance` for credit/token balances.
    - All requiring JWT authentication, input validation, credit checks (for AI endpoint), and error handling.
- Efficient and reliable proxying of AI requests from the Roxonn backend to Azure OpenAI (initially), managed by `RoxonnAzureHandler` on the client-side for request formation and the backend for actual proxying.
- Accurate AI credit estimation and deduction logic integrated with the user's account on the Roxonn platform.
- Clear and intuitive UI in the VSCode extension for displaying AI responses, credit balance, and guiding users to the main platform to purchase credits.

## 6. Scalability & Performance Considerations

- **Roxonn Backend API Endpoint:** The new API endpoint must be designed to handle concurrent requests from potentially many VSCode extension users. Standard backend scaling techniques (load balancing, stateless design if possible) applicable to the existing Roxonn platform will be beneficial.
- **Cloud AI Provider Latency:** The perceived performance of the AI assistance will be significantly affected by the latency of the underlying cloud AI models. The backend proxy should minimize additional overhead.
- **Credit System Performance:** The AI credit checking and deduction logic must be highly efficient to avoid noticeably delaying AI responses. Database queries for user credits should be optimized.

## 7. Security Considerations

- **JWT Security:**
    - Secure storage of the JWT within the VSCode extension (using VSCode's `SecretStorage` API, key `"roxonnAuthToken"`).
    - Transmission of JWT exclusively over HTTPS.
    - Consideration of JWT expiration and refresh mechanisms if long-lived sessions are not desired (current plan: 30-day expiry).
    - `RoxonnAzureHandler` injects the JWT as a Bearer token in Authorization headers for AI requests.
- **API Endpoint Security (Roxonn Backend):**
    - Strict authentication (JWT validation) and authorization checks on all `/api/vscode/*` endpoints.
    - Rate limiting to prevent abuse of the endpoint.
    - Thorough input validation for all data received from the VSCode extension to protect against injection attacks or malformed requests.
- **Protection of Cloud AI Provider Keys:** All API keys for Azure, AWS, GCP, etc., must be stored securely on the Roxonn backend (e.g., using AWS SSM or HashiCorp Vault, managed via `server/config.ts`) and never exposed to the VSCode extension.
- **VSCode Extension Security:** Adherence to VSCode extension security best practices to prevent vulnerabilities within the extension itself (e.g., sanitizing data displayed in webviews).
- **Data Privacy:** Clear policies and handling procedures for user code snippets or prompts sent for AI processing, especially concerning what is logged or stored by the Roxonn backend or third-party AI providers.

---

_This document describes the architectural and technical design of the Roxonn Code VSCode Extension and its integration with the main Roxonn platform, based on `ROXONN_CODE_IMPLEMENTATION_PLAN.md`. It should evolve as the system is built and refined._

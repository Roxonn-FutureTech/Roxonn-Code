# Roxonn Code Architecture

```mermaid
graph TD
    A[VSCode Extension] -->|HTTPS API Calls| B(Roxonn Backend)
    A -->|Drizzle ORM| C[(Local SQLite)]
    subgraph Extension[VSCode Extension]
        D[Webview UI] -->|React Components| E[Profile/Settings]
        D --> F[Task Management]
        G[IPC Channels] -->|vscode.postMessage| H[Core Extension]
    end
    subgraph RoxonnBackend[Roxonn Services]
        B --> I[Authentication]
        B --> J[AI Processing]
        B --> K[Billing/Credits]
    end
```

## Key Characteristics

1. **Client-Server Architecture**: Leverages existing Roxonn infrastructure
2. **Secure Communication**: JWT authentication via HTTPS
3. **Local Persistence**: SQLite + Drizzle ORM for session data
4. **React Webview**: Component-based UI with VSCode IPC
5. **Modular Services**: Clear separation between AI processing/auth/billing

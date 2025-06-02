# Product Context: Roxonn Code (VSCode Extension)

## 1. Purpose & Vision

- **Why does this project exist?** To extend the Roxonn platform's AI capabilities directly into the developer's VSCode Integrated Development Environment (IDE). It aims to provide convenient, AI-powered coding assistance by leveraging Roxonn's existing infrastructure and cloud AI model accounts.
- **What problem(s) does it solve?**
    - Provides developers with readily accessible AI coding tools within their primary workspace (VSCode).
    - Offers a new channel for the Roxonn platform to deliver its AI services and increase the utility of its AI credits and (eventually) ROXN token.
    - Simplifies developer access to multiple cloud AI models (e.g., Azure, AWS, GCP) through a single, integrated VSCode extension, managed and proxied by the Roxonn platform.
    - Lowers the barrier to entry for using advanced AI coding tools by offering initial free credits and a familiar payment mechanism (Onramp.money via Roxonn platform) for continued use.
- **What is the long-term vision for Roxonn Code?** To be a premier AI coding assistant within the VSCode ecosystem, tightly integrated with the Roxonn platform, driving adoption of Roxonn's AI services, and potentially serving as a gateway to Roxonn's future decentralized AI compute network.

## 2. Target Audience

- **Primary Users:**
    - Software developers who use VSCode as their primary IDE.
    - Existing users of the Roxonn platform who can benefit from AI coding assistance.
    - New users attracted to the Roxonn ecosystem through the VSCode extension.
- **Key Characteristics and Needs:**
    - Desire for tools that improve coding efficiency and quality.
    - Preference for integrated solutions within their existing development workflow.
    - Openness to using AI-powered assistance for tasks like code generation, explanation, debugging, and refactoring.
    - May be familiar with or interested in cryptocurrency-based payment systems for services (relevant to Roxonn's AI credit and Onramp.money integration).

## 3. Core Functionality & User Experience

- **User Authentication:** Seamless sign-in/up using their existing Roxonn platform account, which leverages GitHub OAuth. The extension will receive a JWT for API communication.
- **AI-Powered Features:** Standard AI coding assistant features such as:
    - Code completion and generation.
    - Code explanation.
    - Bug detection and fixing suggestions.
    - Code refactoring.
    - Answering coding-related questions (AI chat).
- **Credit Management:**
    - Clear display of available AI credits (from their Roxonn account).
    - Transparent information about the credit cost of AI operations.
    - Easy pathway to purchase additional AI credits through the main Roxonn platform (which uses Onramp.money).
- **Initial Experience:** Provision of free initial AI credits (e.g., 1000 credits as per plan) to encourage trial and adoption.
- **Model Access:** Access to various AI models (Azure OpenAI initially, then AWS, GCP) as configured and proxied by the Roxonn backend, without needing to manage individual API keys for these models.
- **Key User Experience Goals:**
    - **Ease of Use:** Intuitive interface, minimal configuration required by the user.
    - **Seamless Integration:** Feels like a natural part of the VSCode environment and the Roxonn ecosystem.
    - **Responsiveness:** Fast and reliable AI-generated suggestions and responses.
    - **Transparency:** Clear understanding of AI credit consumption and how to acquire more.
    - **Value:** Perceived benefit from the AI assistance significantly outweighs the cost (in credits).

## 4. Success Metrics

- **User Adoption:**
    - Number of active daily/monthly users of the Roxonn Code extension.
    - Growth rate of new users.
- **Engagement:**
    - Volume of AI requests (completions, chat messages, etc.) processed through the extension.
    - Frequency and duration of use.
- **Monetization & Platform Integration:**
    - Amount of AI credits consumed by Roxonn Code users.
    - Number of users purchasing AI credits, attributable to Roxonn Code usage.
    - Conversion rate from free initial credits to paid credit usage.
- **User Satisfaction:**
    - Ratings and reviews on the VSCode Marketplace.
    - Direct user feedback (surveys, support channels).
    - Low churn rate.

---

_This document outlines the "why" and "how" of the Roxonn Code VSCode Extension project from a product perspective. It should be updated as understanding of the product and its users evolves, guided by `ROXONN_CODE_IMPLEMENTATION_PLAN.md`._

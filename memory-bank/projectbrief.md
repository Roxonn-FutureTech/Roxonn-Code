# Project Brief: Roxonn Code (VSCode Extension)

## 1. Project Overview

- **Project Name:** Roxonn Code (VSCode Extension)
- **Date Initialized:** 2025-05-31
- **Objective:** To create a VSCode extension ("Roxonn Code") by rebranding/forking an existing AI coding assistant (e.g., "Kilo Code"). This extension will be deeply integrated with the existing Roxonn platform's backend to provide AI-powered coding assistance. Key integrations include leveraging the platform's GitHub OAuth for user authentication, its AI credit system (with an initial free credit offering for users), the Onramp.money payment gateway for users to purchase further AI model access/credits, and utilizing Roxonn's own cloud AI model accounts (e.g., Azure, AWS, GCP) for processing AI requests.
- **Governing Document:** `ROXONN_CODE_IMPLEMENTATION_PLAN.md` (located in the root of the `kilocode` project).

## 2. Core Requirements

- Rebrand the user interface of the base VSCode extension to "Roxonn Code".
- Integrate with the Roxonn platform's existing "Sign in with GitHub" authentication flow.
- Modify the extension to proxy AI requests to a dedicated endpoint on the Roxonn backend (`app.roxonn.com`).
- Utilize the Roxonn platform's existing AI credit system for metering usage.
- Provide a mechanism for users to purchase AI model access/credits, leveraging the Roxonn platform's Onramp.money integration.
- The Roxonn backend must be enhanced to:
    - Handle authenticated requests from the Roxonn Code VSCode extension via JWT.
    - Check and deduct user AI credits.
    - Route AI requests to the appropriate cloud AI models (initially Azure OpenAI, with plans to support AWS and GCP models).
- Offer an initial amount of free AI credits to new users upon signing up/linking their account.

## 3. Key Goals

- Rapidly launch a Roxonn-branded AI coding assistant for VSCode (MVP target: 2-3 hours development post-planning as per implementation plan).
- Maximize reuse of existing Roxonn platform infrastructure (authentication, payment, AI credit system, user base) to minimize new backend development.
- Provide a seamless and integrated user experience for existing and new Roxonn users within the VSCode environment.
- Create a new utility and potential revenue stream for the Roxonn platform by extending its AI services directly into the developer's IDE.
- Drive adoption of the Roxonn platform and its AI credit system.

## 4. Scope

- **In Scope:**
    - Frontend modifications to the chosen base VSCode extension (UI rebranding, API endpoint changes, authentication flow adjustments).
    - Development of a new API endpoint on the existing Roxonn backend (`app.roxonn.com`) to handle AI requests from the VSCode extension.
    - Integration logic on the Roxonn backend for AI credit checking/deduction related to VSCode extension usage.
    - Logic on the Roxonn backend to proxy/route AI requests to configured cloud AI models (Azure, AWS, GCP).
    - Ensuring the Onramp.money payment flow (via main Roxonn platform) can be used for purchasing AI credits applicable to the VSCode extension.
- **Out of Scope:**
    - Building a new, standalone backend system for Roxonn Code.
    - Implementing a new user authentication system (will use existing Roxonn GitHub OAuth).
    - Developing a new payment gateway (will use existing Roxonn Onramp.money integration).
    - Creating a new AI credit management system (will use existing Roxonn system).
    - Direct integration of the VSCode extension with cloud AI model providers (all AI calls will be proxied through the Roxonn backend).

## 5. Stakeholders

- Roxonn Platform Users (existing and new)
- Developers using VSCode
- The Roxonn Team (Product, Engineering, Business Development)

---

_This document is the foundation for the Roxonn Code VSCode Extension project's memory bank. It should be updated as the project evolves._

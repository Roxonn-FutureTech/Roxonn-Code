import * as vscode from "vscode"

import { ClineProvider } from "../core/webview/ClineProvider"

export const handleUri = async (uri: vscode.Uri, context: vscode.ExtensionContext) => {
	// Added context parameter
	const path = uri.path
	const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
	const visibleProvider = ClineProvider.getVisibleInstance()
	if (!visibleProvider) {
		return
	}

	switch (path) {
		case "/glama": {
			const code = query.get("code")
			if (code) {
				await visibleProvider.handleGlamaCallback(code)
			}
			break
		}
		case "/openrouter": {
			const code = query.get("code")
			if (code) {
				await visibleProvider.handleOpenRouterCallback(code)
			}
			break
		}
		case "/kilocode": {
			const token = query.get("token")
			if (token) {
				await visibleProvider.handleKiloCodeCallback(token)
			}
			break
		}
		case "/requesty": {
			const code = query.get("code")
			if (code) {
				await visibleProvider.handleRequestyCallback(code)
			}
			break
		}
		case "/auth": {
			// Handle Roxonn Code auth callback
			const token = query.get("token")
			if (token && visibleProvider) {
				if (context) {
					try {
						console.log("Roxonn Code: Received authentication token, storing securely")
						await context.secrets.store("roxonnAuthToken", token)

						// Update ProviderSettings to use roxonn provider and the new token
						const contextProxy = visibleProvider.contextProxy
						const currentApiConfigName = contextProxy.getValue("currentApiConfigName") || "Roxonn Profile"
						const currentSettings = contextProxy.getProviderSettings()

						// Create new provider settings with the token
						const newProviderSettings = {
							...currentSettings,
							apiProvider: "roxonn" as const,
							kilocodeToken: token, // Use the existing kilocodeToken field for the JWT
							kilocodeModel: "roxonn/gpt-4o", // Set a default model for Roxonn provider
							// Clear other provider-specific tokens/keys if necessary
							openAiApiKey: undefined,
							anthropicApiKey: undefined,
						}

						// Save provider settings to persistent storage first
						await contextProxy.setProviderSettings(newProviderSettings)

						// Upsert and activate this profile
						await visibleProvider.upsertProviderProfile(currentApiConfigName, newProviderSettings, true)

						// Initialize the profile service with the token
						const { getProfileService } = await import("../utils/roxonnProfileService")
						getProfileService(token) // Initialize the profile service with the token

						// Directly update the current Cline's API handler with the new token
						if (visibleProvider.getCurrentCline()) {
							const { buildApiHandler } = await import("../api")
							visibleProvider.getCurrentCline()!.api = buildApiHandler(newProviderSettings)
							console.log("Roxonn Code: Updated API client with new token")
						}

						// Show a success message
						vscode.window.showInformationMessage("Roxonn Code: Successfully authenticated")
					} catch (err) {
						console.error("Roxonn Code: Error during authentication:", err)
						vscode.window.showErrorMessage(
							`Roxonn Code: Authentication failed: ${err instanceof Error ? err.message : String(err)}`,
						)
					}
				} else {
					console.error("Roxonn Code: Cannot store token, context is undefined")
					vscode.window.showErrorMessage(
						"Roxonn Code: Authentication failed. Extension context is not available.",
					)
				}
			} else {
				const errorMessage = !token
					? "Roxonn Code: Authentication failed. No token received."
					: "Roxonn Code: Authentication failed. Provider is not available."
				console.error(errorMessage)
				vscode.window.showErrorMessage(errorMessage)
			}
			break
		}
		default:
			break
	}
}

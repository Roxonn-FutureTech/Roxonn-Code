import * as vscode from "vscode"
import { ContextProxy } from "../core/config/ContextProxy"

/**
 * Loads the Roxonn auth token from SecretStorage and ensures it's configured in provider settings
 * @param context The VSCode extension context
 * @param contextProxy The ContextProxy instance
 */
export async function loadRoxonnAuthToken(context: vscode.ExtensionContext, contextProxy: ContextProxy): Promise<void> {
	try {
		// Get the stored token
		const token = await context.secrets.get("roxonnAuthToken")

		if (token) {
			console.log("Roxonn auth token found in SecretStorage")

			// Get current settings
			const currentApiConfigName = contextProxy.getValue("currentApiConfigName") || "Roxonn Profile"
			const currentSettings = contextProxy.getProviderSettings()

			// Check if settings need to be updated
			if (currentSettings.apiProvider !== "roxonn" || !currentSettings.kilocodeToken) {
				// Update provider settings with the token
				const newProviderSettings = {
					...currentSettings,
					apiProvider: "roxonn" as const,
					kilocodeToken: token,
				}

				// Save updated settings
				await contextProxy.setProviderSettings(newProviderSettings)

				console.log("Roxonn auth configuration loaded from SecretStorage and applied")
			}
		}
	} catch (error) {
		console.error("Failed to load Roxonn auth token:", error)
	}
}

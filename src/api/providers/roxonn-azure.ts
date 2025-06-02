import { ApiHandlerOptions, ModelRecord, ModelInfo } from "../../shared/api" // Added ModelInfo import
import { getModelParams } from "../getModelParams"
import { OpenAiHandler } from "./openai" // Roxonn backend will expose an OpenAI-compatible endpoint

const ROXONN_MODELS_DEFINITION: ModelRecord = {
	"gpt-4o": {
		contextWindow: 128_000,
		maxTokens: 16_384,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.006, // Placeholder per 1K
		outputPrice: 0.018, // Placeholder per 1K
		description: "Roxonn GPT-4o - Most capable model for chat and image understanding",
	},
	"gpt-4o-mini": {
		contextWindow: 128_000,
		maxTokens: 16_384,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.00018,
		outputPrice: 0.00072,
		description: "Roxonn GPT-4o mini (GPT series) - Cost-efficient and vision capable",
	},
	"o4-mini": {
		contextWindow: 200_000,
		maxTokens: 100_000,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.00132,
		outputPrice: 0.00528,
		description: "Roxonn o4-mini (o-series on Azure) - Compact reasoning model",
	},
	"o3-mini": {
		contextWindow: 200_000,
		maxTokens: 100_000,
		supportsImages: false, // o3-mini typically does not have vision
		supportsPromptCache: true,
		inputPrice: 0.00132, // ($1.10/1M * 1.2) = $1.32/1M = $0.00132/1K
		outputPrice: 0.00528, // ($4.40/1M * 1.2) = $5.28/1M = $0.00528/1K
		description: "Roxonn o3-mini (o-series on Azure) - Fast, cost-efficient reasoning model",
	},
	"gpt-4.1": {
		contextWindow: 1_047_576, // Approx 1M
		maxTokens: 32_768, // Default output limit
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 0.0024, // ($2.00/1M base * 1.2 markup) / 1000 for per 1K
		outputPrice: 0.0096, // ($8.00/1M base * 1.2 markup) / 1000 for per 1K
		description: "Roxonn GPT-4.1 (Azure Deployment) - Advanced general-purpose model",
	},
	"ministral-3b": {
		contextWindow: 32_000, // Conservative estimate
		maxTokens: 8_192, // Conservative estimate
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.000048, // ($0.04/1M base * 1.2 markup) / 1000 for per 1K
		outputPrice: 0.000048, // ($0.04/1M base * 1.2 markup) / 1000 for per 1K
		description: "Roxonn Ministral-3B (Azure AI Inference) - Efficient small model",
	},
	"gpt-3.5-turbo": {
		contextWindow: 16_000,
		maxTokens: 4_096,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.0006,
		outputPrice: 0.0012,
		description: "Roxonn GPT-3.5 Turbo - Fast and cost-effective model",
	},
	"deepseek-r1": {
		contextWindow: 128_000,
		maxTokens: 32_768,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.001,
		outputPrice: 0.002,
		description: "Roxonn DeepSeek-R1 - Powerful and efficient model",
	},
}

export class RoxonnAzureHandler extends OpenAiHandler {
	protected models: ModelRecord = {} // Can be empty if models are dynamically fetched or configured (removed override)
	// Track if we've logged the auth warning to avoid spamming console
	private authWarningLogged = false
	// Store the JWT token for authorization headers
	private authToken?: string

	constructor(options: ApiHandlerOptions) {
		console.log("RoxonnAzureHandler constructor received options:", JSON.stringify(options))
		console.log(`RoxonnAzureHandler constructor: options.kilocodeModel = ${options.kilocodeModel}`)
		const baseUrl = "https://app.roxonn.com"

		// Determine the actual model ID to be sent to the backend
		const modelMapping = {
			// This maps UI selection keys to backend model IDs
			"roxonn/gpt-4o": "gpt-4o",
			"roxonn/gpt-4o-mini": "gpt-4o-mini",
			"roxonn/o4-mini": "o4-mini",
			"roxonn/o3-mini": "o3-mini",
			"roxonn/gpt-4.1": "gpt-4.1",
			"roxonn/ministral-3b": "ministral-3b", // Added for Ministral-3B
			"roxonn/deepseek-r1": "deepseek-r1",
		}

		let determinedBackendModelId: string
		const kilocodeModelFromOptions = options.kilocodeModel // This is e.g., "deepseek-r1" as per logs

		if (kilocodeModelFromOptions) {
			// First, check if kilocodeModelFromOptions is one of the UI keys (e.g., "roxonn/deepseek-r1")
			if (modelMapping.hasOwnProperty(kilocodeModelFromOptions)) {
				determinedBackendModelId = modelMapping[kilocodeModelFromOptions as keyof typeof modelMapping]
				console.log(
					`RoxonnAzureHandler: Mapped UI key "${kilocodeModelFromOptions}" to backend ID "${determinedBackendModelId}".`,
				)
			}
			// Else, assume kilocodeModelFromOptions is already the simple backend ID (e.g., "deepseek-r1")
			// and verify it's a known simple ID (i.e., one of the *values* in modelMapping)
			else if (Object.values(modelMapping).includes(kilocodeModelFromOptions)) {
				determinedBackendModelId = kilocodeModelFromOptions
				console.log(
					`RoxonnAzureHandler: Used options.kilocodeModel ("${kilocodeModelFromOptions}") directly as backend model ID.`,
				)
			}
			// Fallback if kilocodeModelFromOptions is neither a known UI key nor a known simple backend ID
			else {
				console.warn(
					`RoxonnAzureHandler: options.kilocodeModel ("${kilocodeModelFromOptions}") is unrecognized. Defaulting to gpt-4o.`,
				)
				determinedBackendModelId = "gpt-4o"
			}
		} else {
			// Fallback if options.kilocodeModel is not provided at all
			console.warn(`RoxonnAzureHandler: options.kilocodeModel is undefined. Defaulting to gpt-4o.`)
			determinedBackendModelId = "gpt-4o"
		}

		const actualModelIdForBackend = determinedBackendModelId

		// Prepare options for the OpenAiHandler (superclass) constructor
		// Crucially, set openAiModelId to the mapped ID the backend expects
		const superOptions: ApiHandlerOptions & {
			openAiModelId?: string
			openAiBaseUrl?: string
			openAiApiKey?: string
		} = {
			...options, // Spread original options
			openAiModelId: actualModelIdForBackend, // Set the model ID for OpenAiHandler to use
			openAiBaseUrl: `${baseUrl}/api/vscode/ai`,
			openAiApiKey: options.kilocodeToken, // Use kilocodeToken field for the JWT
			// stream: false, // Streaming can be enabled if backend and OpenAiHandler support it well
		}

		console.log(`RoxonnAzureHandler: PRE-SUPER - actualModelIdForBackend = ${actualModelIdForBackend}`)
		console.log(`RoxonnAzureHandler: PRE-SUPER - superOptions.openAiModelId = ${superOptions.openAiModelId}`)
		console.log("RoxonnAzureHandler: PRE-SUPER - superOptions object:", JSON.stringify(superOptions))

		super(superOptions) // Call super with the modified options

		// After super(superOptions), this.options within RoxonnAzureHandler
		// (and OpenAiHandler) will be superOptions.
		// So, this.options.openAiModelId will be actualModelIdForBackend.

		// Store the original token for direct use if needed, though it's also in this.options.kilocodeToken
		this.authToken = options.kilocodeToken

		// Configure authentication headers
		this.setupAuthentication()

		// Log whether we have a token for debugging
		// Note: this.options now refers to superOptions
		if (!this.options.kilocodeToken && !this.authWarningLogged) {
			console.warn("RoxonnAzureHandler: JWT token (kilocodeToken) is missing. Authentication will fail.")
			this.authWarningLogged = true
		} else if (this.options.kilocodeToken) {
			console.log("RoxonnAzureHandler: JWT token (kilocodeToken) is present.")
			console.log(
				`RoxonnAzureHandler: Effective modelId for OpenAIHandler (this.options.openAiModelId): ${this.options.openAiModelId}`,
			)
		}
		// This check might be redundant if the one above covers it.
		// if (!this.options.kilocodeToken) {
		// 	console.warn("RoxonnAzureHandler: kilocodeToken (JWT) is missing in this.options post-super.");
		// }
	}

	override getModel() {
		// Kept synchronous
		const actualBackendModelId = this.options.openAiModelId ?? "gpt-4o"
		const modelInfo = this.getModelInfo(actualBackendModelId) // Call synchronous getModelInfo

		return {
			id: actualBackendModelId,
			info: modelInfo,
			...getModelParams({
				options: this.options,
				model: modelInfo,
				defaultTemperature: 0,
			}),
			promptCache: {
				supported: modelInfo.supportsPromptCache ?? false,
			},
		}
	}

	// Provides information about the models this handler supports.
	// This info is used by the UI and for constructing requests.
	private getModelInfo(modelId: string): ModelInfo {
		// Now synchronous
		const modelSpecificInfo = ROXONN_MODELS_DEFINITION[modelId]

		if (modelSpecificInfo) {
			return modelSpecificInfo // Already conforms to ModelInfo
		}

		console.warn(
			`RoxonnAzureHandler.getModelInfo: Info not found for modelId "${modelId}". Returning generic default info.`,
		)
		// Return a generic, minimal ModelInfo object
		return {
			maxTokens: 4096,
			contextWindow: 8192,
			supportsImages: false,
			supportsPromptCache: false,
			inputPrice: 0,
			outputPrice: 0,
			description: "Default/Unknown Model Information",
		}
	}

	/**
	 * Override the request method to add the JWT token to each request
	 * This is done in the constructor to ensure all requests are authenticated
	 */
	setupAuthentication() {
		if (this.authToken && this.client) {
			// Add a pre-processor to the client to attach the Authorization header to all requests
			// Using any here because the OpenAI client type definition doesn't expose this property
			const clientAny = this.client as any

			// If the client supports beforeRequest events
			if (clientAny.requestConfig && clientAny.requestConfig.headers) {
				// Add Authorization header to default headers
				clientAny.requestConfig.headers["Authorization"] = `Bearer ${this.authToken}`
				console.log("Added Authorization header to OpenAI client default headers")
			} else {
				// Fallback method: try to add the header to the defaultHeaders
				console.log("Using fallback method to set Authorization header")
				try {
					if (clientAny.defaultHeaders) {
						clientAny.defaultHeaders["Authorization"] = `Bearer ${this.authToken}`
					}
				} catch (e) {
					console.error("Failed to set Authorization header:", e)
				}
			}
		}
	}

	public async getModels(): Promise<ModelRecord> {
		// The server doesn't have a /api/vscode/ai/models endpoint, so we'll use hardcoded models instead
		console.log("RoxonnAzureHandler: Using hardcoded models since models endpoint is not available")
		// Return a Promise-wrapped copy of the models definition
		return Promise.resolve({ ...ROXONN_MODELS_DEFINITION })
	}
}

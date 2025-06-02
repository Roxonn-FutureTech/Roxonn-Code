import * as vscode from "vscode"
import axios, { AxiosError, AxiosInstance } from "axios"
import { window } from "vscode"

// Interface for the user profile data
export interface RoxonnUserProfile {
	id: number
	username: string
	email?: string
	aiCredits: number
	isProfileComplete: boolean
	githubUsername?: string
	walletAddress?: string
}

// Interface for token balance
export interface TokenBalance {
	balance: string
}

// Interface for wallet info
export interface WalletInfo {
	address: string
	balance: string
	tokenBalance: string // Changed from isRegistered to tokenBalance to match the backend
}

/**
 * Service class to handle all profile-related API calls
 */
export class RoxonnProfileService {
	private client: AxiosInstance
	private baseUrl: string = "https://app.roxonn.com"
	private token: string | undefined

	constructor(token?: string) {
		this.token = token
		this.client = axios.create({
			baseURL: this.baseUrl,
			headers: token
				? {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					}
				: {
						"Content-Type": "application/json",
					},
		})

		// Add response interceptor for logging
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				console.error(`RoxonnProfileService error:`, error.message)
				if (error.response) {
					console.error(`Status: ${error.response.status}, Data:`, error.response.data)
				}
				return Promise.reject(error)
			},
		)
	}

	/**
	 * Update the token used for API calls
	 */
	public setToken(token: string): void {
		this.token = token
		this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`
		console.log("RoxonnProfileService: Token updated")
	}

	/**
	 * Clear the token
	 */
	public clearToken(): void {
		this.token = undefined
		delete this.client.defaults.headers.common["Authorization"]
		console.log("RoxonnProfileService: Token cleared")
	}

	/**
	 * Get the user profile from /api/auth/user endpoint
	 */
	public async getUserProfile(): Promise<RoxonnUserProfile | null> {
		try {
			console.log("Fetching user profile from /api/auth/user")
			const response = await this.client.get("/api/auth/user")

			if (response.status === 200 && response.data) {
				return response.data
			}
			return null
		} catch (error: any) {
			console.error("Error fetching user profile:", error.message)

			// If unauthorized, we might want to prompt for login
			if (error.response?.status === 401) {
				window.showErrorMessage("Roxonn authentication expired. Please sign in again.")
			}

			return null
		}
	}

	/**
	 * Get the token balance from /api/token/balance endpoint
	 */
	public async getTokenBalance(): Promise<TokenBalance | null> {
		try {
			console.log("Fetching token balance from /api/token/balance")
			const response = await this.client.get("/api/token/balance")

			if (response.status === 200 && response.data) {
				return response.data
			}
			return null
		} catch (error: any) {
			console.error("Error fetching token balance:", error.message)
			return null
		}
	}

	/**
	 * Get wallet info from /api/wallet/info endpoint
	 */
	public async getWalletInfo(): Promise<WalletInfo | null> {
		try {
			console.log("Fetching wallet info from /api/wallet/info")
			const response = await this.client.get("/api/wallet/info")

			if (response.status === 200 && response.data) {
				return response.data
			}
			return null
		} catch (error: any) {
			console.error("Error fetching wallet info:", error.message)
			return null
		}
	}

	/**
	 * Adapter method to match the expected /api/vscode/profile endpoint
	 * This combines data from user profile and wallet info into one response
	 */
	public async getVSCodeProfile(): Promise<any> {
		try {
			const [profile, walletInfo] = await Promise.all([this.getUserProfile(), this.getWalletInfo()])

			if (!profile) {
				throw new Error("Could not fetch user profile")
			}

			// Format the response to match what the VSCode extension expects
			return {
				id: profile.id,
				username: profile.username,
				email: profile.email,
				aiCredits: profile.aiCredits,
				isProfileComplete: profile.isProfileComplete,
				githubUsername: profile.githubUsername,
				walletAddress: walletInfo?.address || profile.walletAddress,
				walletBalance: walletInfo?.balance || "0",
				tokenBalance: walletInfo?.tokenBalance || "0", // Add the tokenBalance from backend
			}
		} catch (error: any) {
			console.error("Error in getVSCodeProfile:", error.message)
			throw error
		}
	}

	/**
	 * Adapter method to match the expected /api/vscode/profile/balance endpoint
	 */
	public async getVSCodeProfileBalance(): Promise<any> {
		try {
			const [profile, tokenBalance] = await Promise.all([this.getUserProfile(), this.getTokenBalance()])

			if (!profile) {
				throw new Error("Could not fetch user profile")
			}

			// Format the response to match what the VSCode extension expects
			return {
				aiCredits: profile.aiCredits,
				tokenBalance: tokenBalance?.balance || "0",
			}
		} catch (error: any) {
			console.error("Error in getVSCodeProfileBalance:", error.message)
			throw error
		}
	}
}

// Singleton instance
let profileServiceInstance: RoxonnProfileService | undefined

/**
 * Create or get the profile service instance
 */
export function getProfileService(token?: string): RoxonnProfileService {
	if (!profileServiceInstance) {
		profileServiceInstance = new RoxonnProfileService(token)
	} else if (token) {
		profileServiceInstance.setToken(token)
	}
	return profileServiceInstance
}

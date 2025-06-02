export function getRoxonnBackendAuthUrl(uriScheme: string = "vscode", uiKind: string = "Desktop") {
	const baseUrl = "https://app.roxonn.com"
	const source = uiKind === "Web" ? "web" : uriScheme
	return `${baseUrl}/auth/signin?source=${source}`
}

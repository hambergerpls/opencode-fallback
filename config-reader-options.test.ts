import { describe, test, expect } from "bun:test"
import { getFallbackModelsForSession, readFallbackModels } from "./config-reader"

describe("config-reader agent options fallback_models", () => {
	describe("#given readFallbackModels", () => {
		describe("#when fallback_models is stored in agent options", () => {
			test("#then returns models from options", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						options: {
							fallback_models: [
								"openai/gpt-5.4",
								"kimi-for-coding/k2p5",
							],
						},
					},
				}

				const result = readFallbackModels("review", agents)

				expect(result).toEqual([
					"openai/gpt-5.4",
					"kimi-for-coding/k2p5",
				])
			})
		})

		describe("#when fallback_models is stored in request body", () => {
			test("#then returns models from request body", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						request: {
							body: {
								fallback_models: [
									"openai/gpt-5.4",
									"kimi-for-coding/k2p5",
								],
							},
						},
					},
				}

				const result = readFallbackModels("review", agents)

				expect(result).toEqual([
					"openai/gpt-5.4",
					"kimi-for-coding/k2p5",
				])
			})
		})

		describe("#when fallback_models is stored in options as a string", () => {
			test("#then normalizes to an array", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						options: {
							fallback_models: "openai/gpt-5.4",
						},
					},
				}

				const result = readFallbackModels("review", agents)

				expect(result).toEqual(["openai/gpt-5.4"])
			})
		})

		describe("#when fallback_models exists in multiple locations", () => {
			test("#then direct fallback_models wins over options and request body", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						fallback_models: ["direct/model"],
						options: {
							fallback_models: ["options/model"],
						},
						request: {
							body: {
								fallback_models: ["request-body/model"],
							},
						},
					},
				}

				const result = readFallbackModels("review", agents)

				expect(result).toEqual(["direct/model"])
			})

			test("#then options fallback_models wins over request body", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						options: {
							fallback_models: ["options/model"],
						},
						request: {
							body: {
								fallback_models: ["request-body/model"],
							},
						},
					},
				}

				const result = readFallbackModels("review", agents)

				expect(result).toEqual(["options/model"])
			})
		})
	})

	describe("#given getFallbackModelsForSession", () => {
		describe("#when fallback_models is stored in agent options", () => {
			test("#then returns option models with primary model prepended", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						options: {
							fallback_models: ["openai/gpt-5.4"],
						},
					},
				}

				const result = getFallbackModelsForSession(
					"ses_123",
					"review",
					agents
				)

				expect(result).toEqual([
					"anthropic/claude-sonnet-4-5",
					"openai/gpt-5.4",
				])
			})
		})

		describe("#when nested fallback_models is empty but global exists", () => {
			test("#then falls back to global models", () => {
				const agents = {
					review: {
						model: "anthropic/claude-sonnet-4-5",
						options: {
							fallback_models: [],
						},
					},
				}
				const globalModels = ["openai/gpt-5.4"]

				const result = getFallbackModelsForSession(
					"ses_123",
					"review",
					agents,
					globalModels
				)

				expect(result).toEqual(globalModels)
			})
		})
	})
})

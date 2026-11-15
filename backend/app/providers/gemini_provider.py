"""
Google Gemini Provider Adapter (Gemini 1.5 Pro)
"""

import time
import httpx
from typing import Optional
from .base import BaseLLMProvider, ProviderExecutionResult


class GeminiProvider(BaseLLMProvider):
    INPUT_COST_PER_1K = 0.001250
    OUTPUT_COST_PER_1K = 0.005000
    TYPICAL_LATENCY_MS = 1100

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            model_id="gemini-1-5-pro",
            family="Gemini",
            display_name="Google Gemini 1.5 Pro",
            api_key=api_key,
        )

    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        in_tokens = max(10, token_estimate)
        out_tokens = max(40, int(in_tokens * 0.70))
        cost = (in_tokens / 1000.0) * self.INPUT_COST_PER_1K + (out_tokens / 1000.0) * self.OUTPUT_COST_PER_1K

        simulated_text = (
            f"[SIMULATED GOOGLE GEMINI 1.5 PRO RESPONSE]\n\n"
            f"Processing multi-faceted query ({in_tokens} input tokens). "
            f"Leveraging cross-domain knowledge synthesis and multimodal context.\n\n"
            f"1. Key Insights: Extracted fundamental patterns and contextual nuances.\n"
            f"2. Comprehensive Analysis: Balanced evaluation across factual and analytical dimensions.\n"
            f"3. Practical Recommendations: Actionable next steps formatted for high readability."
        )

        return ProviderExecutionResult(
            model_name=self.display_name,
            provider="Google",
            response_text=simulated_text,
            input_tokens=in_tokens,
            output_tokens=out_tokens,
            total_tokens=in_tokens + out_tokens,
            cost_usd=round(cost, 6),
            latency_ms=self.TYPICAL_LATENCY_MS,
            is_simulated=True,
            status="simulated",
        )

    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> ProviderExecutionResult:
        if not self.is_configured:
            return self.simulate_response(prompt, len(prompt.split()) * 2)

        start_time = time.time()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}

        contents = [{"parts": [{"text": prompt}]}]
        payload = {"contents": contents}
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                latency_ms = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    choice_text = ""
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        choice_text = "".join([p.get("text", "") for p in parts])

                    usage = data.get("usageMetadata", {})
                    in_tok = usage.get("promptTokenCount", len(prompt.split()) * 2)
                    out_tok = usage.get("candidatesTokenCount", len(choice_text.split()) * 2)
                    cost = (in_tok / 1000.0) * self.INPUT_COST_PER_1K + (out_tok / 1000.0) * self.OUTPUT_COST_PER_1K

                    return ProviderExecutionResult(
                        model_name=self.display_name,
                        provider="Google",
                        response_text=choice_text,
                        input_tokens=in_tok,
                        output_tokens=out_tok,
                        total_tokens=in_tok + out_tok,
                        cost_usd=round(cost, 6),
                        latency_ms=latency_ms,
                        is_simulated=False,
                        status="success",
                    )
                else:
                    return ProviderExecutionResult(
                        model_name=self.display_name,
                        provider="Google",
                        response_text=f"Gemini API Error: {res.status_code} - {res.text}",
                        input_tokens=len(prompt.split()) * 2,
                        output_tokens=0,
                        total_tokens=len(prompt.split()) * 2,
                        cost_usd=0.0,
                        latency_ms=latency_ms,
                        is_simulated=False,
                        status="failed",
                        error_message=res.text,
                    )
        except Exception as e:
            return ProviderExecutionResult(
                model_name=self.display_name,
                provider="Google",
                response_text=f"Gemini Connection Exception: {str(e)}",
                input_tokens=len(prompt.split()) * 2,
                output_tokens=0,
                total_tokens=len(prompt.split()) * 2,
                cost_usd=0.0,
                latency_ms=int((time.time() - start_time) * 1000),
                is_simulated=False,
                status="failed",
                error_message=str(e),
            )

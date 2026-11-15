"""
Meta Llama Provider Adapter (Llama 3.3 70B via Groq / OpenAI-compatible API)
"""

import time
import httpx
from typing import Optional
from .base import BaseLLMProvider, ProviderExecutionResult


class LlamaProvider(BaseLLMProvider):
    INPUT_COST_PER_1K = 0.000590
    OUTPUT_COST_PER_1K = 0.000790
    TYPICAL_LATENCY_MS = 380

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            model_id="llama-3-3-70b-versatile",
            family="Llama",
            display_name="Meta Llama 3.3 70B",
            api_key=api_key,
        )

    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        in_tokens = max(10, token_estimate)
        out_tokens = max(35, int(in_tokens * 0.65))
        cost = (in_tokens / 1000.0) * self.INPUT_COST_PER_1K + (out_tokens / 1000.0) * self.OUTPUT_COST_PER_1K

        simulated_text = (
            f"[SIMULATED META LLAMA 3.3 70B RESPONSE]\n\n"
            f"Rapid low-latency throughput execution ({in_tokens} input tokens). "
            f"High-efficiency structured output optimized for cost-effective completion.\n\n"
            f"• Concise Summary: Query processed with minimal latency overhead ({self.TYPICAL_LATENCY_MS} ms).\n"
            f"• Key Findings: Standard operational specifications fulfilled directly.\n"
            f"• Output: Delivered cleanly within target token budget."
        )

        return ProviderExecutionResult(
            model_name=self.display_name,
            provider="Meta / Groq",
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
        # Default to Groq high-speed endpoint if GROQ_API_KEY configured
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                latency_ms = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    choice = data["choices"][0]["message"]["content"]
                    usage = data.get("usage", {})
                    in_tok = usage.get("prompt_tokens", len(prompt.split()) * 2)
                    out_tok = usage.get("completion_tokens", len(choice.split()) * 2)
                    cost = (in_tok / 1000.0) * self.INPUT_COST_PER_1K + (out_tok / 1000.0) * self.OUTPUT_COST_PER_1K

                    return ProviderExecutionResult(
                        model_name=self.display_name,
                        provider="Meta / Groq",
                        response_text=choice,
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
                        provider="Meta / Groq",
                        response_text=f"Llama API Error: {res.status_code} - {res.text}",
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
                provider="Meta / Groq",
                response_text=f"Llama Connection Exception: {str(e)}",
                input_tokens=len(prompt.split()) * 2,
                output_tokens=0,
                total_tokens=len(prompt.split()) * 2,
                cost_usd=0.0,
                latency_ms=int((time.time() - start_time) * 1000),
                is_simulated=False,
                status="failed",
                error_message=str(e),
            )

"""
OpenAI Provider Adapter (GPT-4o)
"""

import time
import httpx
from typing import Optional
from .base import BaseLLMProvider, ProviderExecutionResult


class OpenAIProvider(BaseLLMProvider):
    INPUT_COST_PER_1K = 0.002500
    OUTPUT_COST_PER_1K = 0.010000
    TYPICAL_LATENCY_MS = 1450

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            model_id="gpt-4o",
            family="GPT",
            display_name="OpenAI GPT-4o",
            api_key=api_key,
        )

    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        in_tokens = max(10, token_estimate)
        out_tokens = max(50, int(in_tokens * 0.75))
        cost = (in_tokens / 1000.0) * self.INPUT_COST_PER_1K + (out_tokens / 1000.0) * self.OUTPUT_COST_PER_1K

        simulated_text = (
            f"[SIMULATED OPENAI GPT-4o RESPONSE]\n\n"
            f"Query analysis received ({in_tokens} input tokens). "
            f"Synthesizing structured response prioritizing precision, multi-step clarity, and high factual accuracy.\n\n"
            f"• Systematic Overview: The requested topic requires multi-variable consideration.\n"
            f"• Core Reasoning: Addressing primary constraints while maintaining contextual consistency.\n"
            f"• Execution Summary: Generated optimal resolution with verifiable intermediate steps."
        )

        return ProviderExecutionResult(
            model_name=self.display_name,
            provider="OpenAI",
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
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "gpt-4o",
            "messages": messages,
            "temperature": 0.3,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
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
                        provider="OpenAI",
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
                        provider="OpenAI",
                        response_text=f"OpenAI API Error: {res.status_code} - {res.text}",
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
                provider="OpenAI",
                response_text=f"Connection Exception: {str(e)}",
                input_tokens=len(prompt.split()) * 2,
                output_tokens=0,
                total_tokens=len(prompt.split()) * 2,
                cost_usd=0.0,
                latency_ms=int((time.time() - start_time) * 1000),
                is_simulated=False,
                status="failed",
                error_message=str(e),
            )

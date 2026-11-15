"""
DeepSeek Provider Adapter (DeepSeek V3 / R1)
"""

import time
import httpx
from typing import Optional
from .base import BaseLLMProvider, ProviderExecutionResult


class DeepSeekProvider(BaseLLMProvider):
    INPUT_COST_PER_1K = 0.000140
    OUTPUT_COST_PER_1K = 0.000280
    TYPICAL_LATENCY_MS = 850

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            model_id="deepseek-v3",
            family="DeepSeek",
            display_name="DeepSeek V3 / R1",
            api_key=api_key,
        )

    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        in_tokens = max(10, token_estimate)
        out_tokens = max(55, int(in_tokens * 0.80))
        cost = (in_tokens / 1000.0) * self.INPUT_COST_PER_1K + (out_tokens / 1000.0) * self.OUTPUT_COST_PER_1K

        simulated_text = (
            f"[SIMULATED DEEPSEEK V3 / R1 RESPONSE]\n\n"
            f"<think>\n"
            f"Analyzing problem constraints ({in_tokens} input tokens). "
            f"Formulating optimal algorithmic approach with rigorous cost-efficiency.\n"
            f"Checking edge cases and evaluating mathematical invariants.\n"
            f"</think>\n\n"
            f"• Algorithmic Synthesis: Solution derived through systematic chain-of-thought verification.\n"
            f"• Implementation Notes: Highly optimized for both memory and computational scaling.\n"
            f"• Efficiency Guarantee: Produced under ultra-competitive cost parameters."
        )

        return ProviderExecutionResult(
            model_name=self.display_name,
            provider="DeepSeek",
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
        url = "https://api.deepseek.com/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "deepseek-chat",
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
                        provider="DeepSeek",
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
                        provider="DeepSeek",
                        response_text=f"DeepSeek API Error: {res.status_code} - {res.text}",
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
                provider="DeepSeek",
                response_text=f"DeepSeek Connection Exception: {str(e)}",
                input_tokens=len(prompt.split()) * 2,
                output_tokens=0,
                total_tokens=len(prompt.split()) * 2,
                cost_usd=0.0,
                latency_ms=int((time.time() - start_time) * 1000),
                is_simulated=False,
                status="failed",
                error_message=str(e),
            )

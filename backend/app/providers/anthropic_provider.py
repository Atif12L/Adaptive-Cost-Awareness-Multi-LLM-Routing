"""
Anthropic Provider Adapter (Claude 3.5 Sonnet)
"""

import time
import httpx
from typing import Optional
from .base import BaseLLMProvider, ProviderExecutionResult


class AnthropicProvider(BaseLLMProvider):
    INPUT_COST_PER_1K = 0.003000
    OUTPUT_COST_PER_1K = 0.015000
    TYPICAL_LATENCY_MS = 1650

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            model_id="claude-3-5-sonnet",
            family="Claude",
            display_name="Anthropic Claude 3.5 Sonnet",
            api_key=api_key,
        )

    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        in_tokens = max(10, token_estimate)
        out_tokens = max(60, int(in_tokens * 0.85))
        cost = (in_tokens / 1000.0) * self.INPUT_COST_PER_1K + (out_tokens / 1000.0) * self.OUTPUT_COST_PER_1K

        simulated_text = (
            f"[SIMULATED ANTHROPIC CLAUDE 3.5 SONNET RESPONSE]\n\n"
            f"Analyzing technical and nuanced specifications ({in_tokens} input tokens). "
            f"Delivering articulate, rigorous, and architecturally coherent output.\n\n"
            f"```python\n"
            f"# Modular implementation demonstrating edge-case robustness\n"
            f"def handle_query_workload(workload_data):\n"
            "    return {'status': 'processed', 'fidelity': 'high'}\n"
            f"```\n"
            f"Key Architectural Highlights: Emphasizing modular design principles and verified correctness."
        )

        return ProviderExecutionResult(
            model_name=self.display_name,
            provider="Anthropic",
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
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 1500,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                latency_ms = int((time.time() - start_time) * 1000)

                if res.status_code == 200:
                    data = res.json()
                    content = "".join([c.get("text", "") for c in data.get("content", [])])
                    usage = data.get("usage", {})
                    in_tok = usage.get("input_tokens", len(prompt.split()) * 2)
                    out_tok = usage.get("output_tokens", len(content.split()) * 2)
                    cost = (in_tok / 1000.0) * self.INPUT_COST_PER_1K + (out_tok / 1000.0) * self.OUTPUT_COST_PER_1K

                    return ProviderExecutionResult(
                        model_name=self.display_name,
                        provider="Anthropic",
                        response_text=content,
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
                        provider="Anthropic",
                        response_text=f"Anthropic API Error: {res.status_code} - {res.text}",
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
                provider="Anthropic",
                response_text=f"Anthropic Connection Exception: {str(e)}",
                input_tokens=len(prompt.split()) * 2,
                output_tokens=0,
                total_tokens=len(prompt.split()) * 2,
                cost_usd=0.0,
                latency_ms=int((time.time() - start_time) * 1000),
                is_simulated=False,
                status="failed",
                error_message=str(e),
            )

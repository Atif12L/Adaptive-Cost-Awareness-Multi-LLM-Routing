"""
Supabase PostgreSQL Client with Graceful In-Memory Fallback
"""

import time
import httpx
from typing import Dict, Any, List, Optional
from ..config import settings


class SupabaseClient:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        self.headers = {
            "apikey": self.key or "",
            "Authorization": f"Bearer {self.key or ''}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }
        self.in_memory_requests: List[Dict[str, Any]] = []

    @property
    def is_configured(self) -> bool:
        return bool(self.url and self.key and len(self.key.strip()) > 10)

    async def log_routing_request(self, payload: Dict[str, Any]) -> bool:
        """Logs a routing request to Supabase or local memory."""
        # Always maintain in local memory buffer for fast analytics
        self.in_memory_requests.append({**payload, "timestamp": time.time()})
        if len(self.in_memory_requests) > 1000:
            self.in_memory_requests.pop(0)

        if not self.is_configured:
            return False

        try:
            endpoint = f"{self.url.rstrip('/')}/rest/v1/routing_requests"
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(endpoint, json=payload, headers=self.headers)
                return res.status_code in [200, 201, 204]
        except Exception as e:
            print(f"Supabase logging warning: {e}")
            return False

    def get_recent_requests_sync(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(reversed(self.in_memory_requests[-limit:]))

    async def get_recent_requests(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.is_configured:
            return list(reversed(self.in_memory_requests[-limit:]))

        try:
            endpoint = f"{self.url.rstrip('/')}/rest/v1/routing_requests?order=created_at.desc&limit={limit}"
            async with httpx.AsyncClient(timeout=0.5) as client:
                res = await client.get(endpoint, headers=self.headers)
                if res.status_code == 200:
                    return res.json()
        except Exception:
            pass
        return list(reversed(self.in_memory_requests[-limit:]))


supabase_client = SupabaseClient()

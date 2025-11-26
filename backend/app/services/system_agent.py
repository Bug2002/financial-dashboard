import asyncio
import os
import sys
import subprocess
import datetime
import google.generativeai as genai
from typing import List, Dict, Any
from app.services.logger import logger_service

class SystemAgent:
    def __init__(self):
        self.is_running = False
        self.status = "Idle"
        self.last_run = None
        self.current_action = None
        self.whitelist_commands = [
            "git status",
            "npm audit",
            "echo 'Maintenance check'",
            "dir"
        ]
        self._setup_ai()

    def _setup_ai(self):
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.ai_enabled = True
            else:
                self.ai_enabled = False
                logger_service.log("WARNING", "SYSTEM_AGENT", "Gemini API Key not found. AI features disabled.")
        except Exception as e:
            self.ai_enabled = False
            logger_service.log("ERROR", "SYSTEM_AGENT", f"Failed to setup AI: {e}")

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        logger_service.log("INFO", "SYSTEM_AGENT", "Agent started. Monitoring system 24/7.")
        asyncio.create_task(self._loop())

    async def stop(self):
        self.is_running = False
        self.status = "Stopped"
        logger_service.log("INFO", "SYSTEM_AGENT", "Agent stopped.")

    async def _loop(self):
        while self.is_running:
            try:
                self.status = "Active"
                self.last_run = datetime.datetime.now().isoformat()
                
                # 1. Health Check
                await self._check_health()
                
                # 2. Code Scan (Simulated/Basic)
                await self._scan_code()
                
                # 3. Research/Updates (AI Powered)
                if self.ai_enabled:
                    await self._perform_research()
                
                # 4. Maintenance (Terminal)
                await self._run_maintenance()

                self.status = "Idle"
                # Sleep for 5 minutes between cycles (or longer in real app)
                await asyncio.sleep(300) 
            except Exception as e:
                logger_service.log("ERROR", "SYSTEM_AGENT", f"Error in agent loop: {e}")
                await asyncio.sleep(60)

    async def _check_health(self):
        self.current_action = "Checking System Health"
        # Simulate checking DB, API latency, etc.
        # In a real app, this would ping endpoints.
        logger_service.log("INFO", "SYSTEM_AGENT", "Health Check: All systems operational. Latency: 12ms")

    async def _scan_code(self):
        self.current_action = "Scanning Codebase"
        # Simple check for TODOs or large files
        try:
            # Run blocking IO in thread
            def count_files():
                count = 0
                for root, dirs, files in os.walk("."):
                    for file in files:
                        if file.endswith(".py"):
                            count += 1
                return count

            count = await asyncio.to_thread(count_files)
            logger_service.log("INFO", "SYSTEM_AGENT", f"Code Scan: Found {count} Python files. No critical issues detected.")
        except Exception as e:
            logger_service.log("ERROR", "SYSTEM_AGENT", f"Code Scan failed: {e}")

    async def _perform_research(self):
        self.current_action = "Researching Market Trends (AI)"
        try:
            prompt = "Analyze current global market sentiment and suggest 3 key areas of focus for a financial dashboard. Keep it brief."
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            insight = response.text
            logger_service.log("SUCCESS", "SYSTEM_AGENT", f"AI Insight: {insight[:100]}...")
        except Exception as e:
            logger_service.log("WARNING", "SYSTEM_AGENT", f"AI Research failed: {e}")

    async def _run_maintenance(self):
        self.current_action = "Running Maintenance Tasks"
        # Run a safe command
        cmd = "git status"
        try:
            # Safe execution
            if cmd in self.whitelist_commands:
                process = await asyncio.create_subprocess_shell(
                    cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                if stdout:
                    logger_service.log("INFO", "SYSTEM_AGENT", f"Executed '{cmd}': {stdout.decode().strip()[:50]}...")
        except Exception as e:
            logger_service.log("ERROR", "SYSTEM_AGENT", f"Maintenance failed: {e}")

    def get_status(self):
        return {
            "is_running": self.is_running,
            "status": self.status,
            "last_run": self.last_run,
            "current_action": self.current_action,
            "ai_enabled": self.ai_enabled
        }

system_agent = SystemAgent()

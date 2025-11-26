from typing import Dict, Any
from app.services.llm import llm_service
from app.services.logger import logger_service

class RepairService:
    def analyze_error(self, error_message: str, stack_trace: str) -> Dict[str, Any]:
        """
        Uses the LLM to analyze a backend error and suggest a fix.
        """
        logger_service.log("INFO", "AI_REPAIR", "Starting error analysis", {"error": error_message})
        
        prompt = f"""
        You are an expert backend developer. Analyze the following Python error and stack trace.
        
        Error: {error_message}
        
        Stack Trace:
        {stack_trace}
        
        Provide a JSON response with:
        1. "explanation": A brief explanation of what went wrong.
        2. "suggested_fix": A concrete code snippet or action to fix the issue.
        3. "confidence": High/Medium/Low.
        
        Respond ONLY in JSON.
        """
        
        try:
            # Re-use the existing LLM service (assuming it handles raw prompts or we adapt it)
            # Since LLMService is designed for market data, we might need a raw method.
            # For now, we'll use the OpenAI client directly if available, or mock it.
            
            if llm_service.openai_client:
                response = llm_service._call_openai(prompt) # This method expects JSON output
                
                logger_service.log("INFO", "AI_REPAIR", "Analysis complete", response)
                return response
            
            elif llm_service.gemini_key:
                response = llm_service._call_gemini(prompt)
                logger_service.log("INFO", "AI_REPAIR", "Analysis complete", response)
                return response
                
            else:
                return {
                    "explanation": "LLM not configured.",
                    "suggested_fix": "Check logs manually.",
                    "confidence": "Low"
                }
                
        except Exception as e:
            logger_service.log("ERROR", "AI_REPAIR", "Analysis failed", {"error": str(e)})
            return {
                "explanation": "Failed to analyze error.",
                "suggested_fix": "Check system logs.",
                "confidence": "Low"
            }

repair_service = RepairService()

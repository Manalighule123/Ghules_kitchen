import re
import json
import openai
from app.config import settings
from app.schemas.schemas import NLPResponseOut

def rule_based_nlp_parser(text: str) -> NLPResponseOut:
    """Deterministic regex & keyword parser when LLM key is absent."""
    lower_text = text.lower().strip()

    # Rejection keywords
    reject_keywords = ["not available", "unavailable", "cannot", "can't", "no ", "no,", "no.", "busy", "unable", "reject", "full"]
    is_rejection = any(kw in lower_text for kw in reject_keywords)

    if is_rejection:
        return NLPResponseOut(
            available=False,
            capacity=0,
            intent="REJECT",
            confidence=0.95,
            raw_text=text,
            extracted_notes="Detected rejection intent from cook response."
        )

    # Acceptance / Availability keywords
    accept_keywords = ["yes", "available", "can prepare", "can take", "ready", "accept", "sure", "ok", "okay"]
    is_acceptance = any(kw in lower_text for kw in accept_keywords) or bool(re.search(r'\d+', lower_text))

    # Extract capacity numbers (e.g. "10 meals", "5 orders", "prepare 8")
    numbers = [int(n) for n in re.findall(r'\b\d+\b', lower_text)]
    capacity = numbers[0] if numbers else (5 if is_acceptance else 0)

    intent = "ACCEPT" if (is_acceptance or capacity > 0) else "UNKNOWN"
    available = True if intent == "ACCEPT" else False

    return NLPResponseOut(
        available=available,
        capacity=capacity,
        intent=intent,
        confidence=0.90 if is_acceptance else 0.50,
        raw_text=text,
        extracted_notes=f"Rule-based extracted intent: {intent}, capacity: {capacity}"
    )

def parse_cook_nlp_response(text: str) -> NLPResponseOut:
    """Parses natural language cook input using OpenAI or fallback rule engine."""
    if not settings.OPENAI_API_KEY:
        return rule_based_nlp_parser(text)

    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        system_prompt = (
            "You are an NLP parser for Ghules Kitchen cloud kitchen platform.\n"
            "Analyze the cook's message and output JSON only with keys:\n"
            "available (boolean), capacity (integer), intent ('ACCEPT', 'REJECT', 'UPDATE_CAPACITY', 'UNKNOWN'), confidence (float 0-1), extracted_notes (string)."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        content = json.loads(response.choices[0].message.content)
        return NLPResponseOut(
            available=content.get("available", True),
            capacity=content.get("capacity", 0),
            intent=content.get("intent", "ACCEPT"),
            confidence=content.get("confidence", 0.95),
            raw_text=text,
            extracted_notes=content.get("extracted_notes", "Parsed via OpenAI API")
        )
    except Exception:
        # Fallback if API fails
        return rule_based_nlp_parser(text)

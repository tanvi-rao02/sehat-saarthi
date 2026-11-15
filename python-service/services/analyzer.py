
import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from python-service/.env")

client = Groq(api_key=api_key)

MODEL = "openai/gpt-oss-120b"


def analyze_medical_report(raw_text: str) -> dict:

    if not raw_text or len(raw_text.strip()) < 30:
        return {
            "summary": "Could not extract enough text from this document.",
            "key_findings": [],
            "simplified_terms": [],
            "questions_for_doctor": [
                "Please show this report directly to your doctor."
            ],
            "raw_text": raw_text
        }

    prompt = f"""
You are helping an Indian patient understand their medical report.

Respond with ONLY a valid JSON object containing:
{{
  "summary": "2-3 simple sentences in plain language",
  "key_findings": ["finding 1", "finding 2"],
  "simplified_terms": [
    {{
      "term": "medical term",
      "explanation": "simple explanation"
    }}
  ],
  "questions_for_doctor": ["question 1", "question 2"]
}}

Rules:
- Use simple language.
- If a value is normal, say so.
- If abnormal, explain what it may mean without diagnosing.
- Do not prescribe medicines or treatments.
- Do not invent information not present in the report.
- Recommend discussing the report with a qualified doctor.

Report:
{raw_text[:4000]}
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        response_text = response.choices[0].message.content
        result = json.loads(response_text)

        result["raw_text"] = raw_text

        return result

    except json.JSONDecodeError:
        return {
            "summary": "The report was processed, but the AI response could not be formatted correctly. Please discuss it with your doctor.",
            "key_findings": [
                "Please review the original report with your doctor."
            ],
            "simplified_terms": [],
            "questions_for_doctor": [
                "Could you explain the findings in this report?"
            ],
            "raw_text": raw_text
        }

    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")

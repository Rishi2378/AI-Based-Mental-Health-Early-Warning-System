import re

CRISIS_KEYWORDS = [
    r'\bsuicid(e|al)\b', r'\bkill\s+myself\b', r'\bend\s+my\s+life\b',
    r'\bwant\s+to\s+die\b', r'\bself[\s-]harm\b', r'\bcutting\s+myself\b',
    r'\bcannot\s+go\s+on\b', r'\bno\s+reason\s+to\s+live\b', r'\boverdose\b'
]

CRISIS_RESPONSE = {
    "is_crisis": True,
    "warning_title": "Immediate Support Resources Available",
    "message": "It sounds like you may be going through an extraordinarily difficult time. Please know you do not have to carry this alone. Free, confidential support is available 24/7.",
    "helplines": [
        {"name": "988 Suicide & Crisis Lifeline (US/Canada)", "contact": "Call or Text 988", "url": "https://988lifeline.org"},
        {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "url": "https://www.crisistextline.org"},
        {"name": "International Association for Suicide Prevention (IASP)", "contact": "Find local helpline", "url": "https://www.iasp.info/resources/Crisis_Centres"},
        {"name": "Befrienders Worldwide", "contact": "Support across 32 countries", "url": "https://www.befrienders.org"}
    ],
    "guidance": "If you are in immediate physical danger, please contact your local emergency services (e.g. 911 / 112 / 999) or go to the nearest emergency department right away."
}

def check_crisis_text(text: str) -> dict:
    """
    Scans input text for explicit crisis or self-harm keywords.
    Returns safety details if crisis language is detected, else None.
    """
    if not text:
        return {"is_crisis": False}
        
    text_lower = text.lower()
    for pattern in CRISIS_KEYWORDS:
        if re.search(pattern, text_lower):
            return CRISIS_RESPONSE

    return {"is_crisis": False}

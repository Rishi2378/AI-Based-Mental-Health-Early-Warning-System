QUESTIONNAIRE_SCHEMA = [
    {
        "id": "q1",
        "category": "Overwhelm",
        "text": "How often in the past week have you felt overwhelmed by your daily responsibilities?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q2",
        "category": "Concentration",
        "text": "How often have you had trouble concentrating on work, study, or daily tasks?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q3",
        "category": "Sleep Quality",
        "text": "How frequently have you experienced sleep disturbances or difficulty falling/staying asleep?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q4",
        "category": "Restlessness",
        "text": "How often do you feel restless or unable to sit still and relax?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q5",
        "category": "Irritability",
        "text": "How often have you felt irritable, impatient, or easily frustrated by minor incidents?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q6",
        "category": "Relaxation",
        "text": "How difficult is it for you to unwind or relax during your non-working hours?",
        "options": [
            {"label": "Not at all", "value": 0},
            {"label": "Slightly", "value": 1},
            {"label": "Moderately", "value": 2},
            {"label": "Very", "value": 3},
            {"label": "Extremely", "value": 4}
        ]
    },
    {
        "id": "q7",
        "category": "Work/Study Pressure",
        "text": "How often do you feel your workload or academic deadline pressure is unmanageable?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q8",
        "category": "Emotional Exhaustion",
        "text": "How frequently do you feel emotionally drained or exhausted at the end of the day?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q9",
        "category": "Physical Fatigue",
        "text": "How often do you experience physical tension (e.g., tight shoulders, tension headaches)?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    },
    {
        "id": "q10",
        "category": "Enthusiasm",
        "text": "How often have you noticed a lack of enthusiasm or energy for daily activities you usually enjoy?",
        "options": [
            {"label": "Never", "value": 0},
            {"label": "Rarely", "value": 1},
            {"label": "Sometimes", "value": 2},
            {"label": "Often", "value": 3},
            {"label": "Almost Always", "value": 4}
        ]
    }
]

def analyze_questionnaire(answers: dict) -> dict:
    """
    Calculates normalized stress indicator from structured questionnaire responses.
    answers: dict of { "q1": 2, "q2": 3, ... }
    """
    total_raw = 0
    max_raw = len(QUESTIONNAIRE_SCHEMA) * 4
    category_scores = {}

    for item in QUESTIONNAIRE_SCHEMA:
        qid = item["id"]
        cat = item["category"]
        val = int(answers.get(qid, 0))
        # Ensure clamped between 0 and 4
        val = max(0, min(4, val))
        total_raw += val
        category_scores[cat] = (val / 4.0) * 100.0

    normalized_score = (total_raw / max_raw) * 100.0

    if normalized_score <= 35.0:
        indicator_level = "LOW"
    elif normalized_score <= 65.0:
        indicator_level = "MODERATE"
    else:
        indicator_level = "ELEVATED"

    # Identify top contributing stress categories
    sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    high_impact_categories = [cat for cat, score in sorted_categories if score >= 50.0]

    return {
        "raw_score": total_raw,
        "max_score": max_raw,
        "questionnaire_score": round(normalized_score, 1),
        "indicator_level": indicator_level,
        "category_breakdown": {k: round(v, 1) for k, v in category_scores.items()},
        "high_impact_categories": high_impact_categories,
        "explanation": [
            f"Questionnaire completed with raw score {total_raw}/{max_raw}.",
            f"Normalized self-assessment stress indicator: {round(normalized_score, 1)}/100 ({indicator_level})."
        ] + ([f"Key area of elevated pressure: {c}" for c in high_impact_categories[:3]] if high_impact_categories else ["Self-reported responses indicate balanced overall wellness."])
    }

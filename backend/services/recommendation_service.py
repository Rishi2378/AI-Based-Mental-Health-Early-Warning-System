def generate_recommendations(overall_score: float, category: str, dominant_emotion: str = None, is_crisis: bool = False) -> list:
    """
    Generates non-diagnostic wellness suggestions based on score category and detected emotional patterns.
    """
    if is_crisis:
        return [
            "Reach out immediately to a trusted support person, healthcare professional, or emergency crisis service.",
            "Connect with free confidential 24/7 crisis hotlines like 988 or Crisis Text Line (Text HOME to 741741).",
            "Prioritize your immediate safety and well-being over work or academic pressures."
        ]

    recs = []

    if category == "LOW":
        recs.extend([
            "Maintain a consistent sleep routine aiming for 7-9 hours per night.",
            "Incorporate regular light physical activity, such as a 20-minute daily walk.",
            "Practice mindful breaks during long work or study sessions to maintain mental balance.",
            "Foster positive social connections with family, friends, or supportive peers."
        ])
    elif category == "MODERATE":
        recs.extend([
            "Take short, structured breaks (e.g. 5-10 minutes every hour) to rest your mind.",
            "Try deep diaphragmatic breathing or 4-7-8 breathing exercises when feeling tense.",
            "Evaluate your current workload and consider delegating or postponing non-essential tasks.",
            "Engage in relaxing hobbies or outdoor activities away from digital screens.",
            "Consider tracking your daily stress triggers in a personal wellness journal."
        ])
    else:  # ELEVATED
        recs.extend([
            "Consider consulting a qualified healthcare or mental health professional for personalized guidance if stress persists.",
            "Focus on immediate stress reduction techniques such as progressive muscle relaxation or guided meditation.",
            "Communicate with trusted loved ones, colleagues, or counselors about your current workload or emotional pressure.",
            "Ensure regular nutrition, hydration, and gentle physical movement even during high-pressure periods.",
            "Remember that seeking guidance from a professional is a proactive and healthy approach to personal well-being."
        ])

    # Emotional pattern nuances
    if dominant_emotion:
        dom_lower = dominant_emotion.lower()
        if dom_lower in ['anxiety', 'fear', 'concerned']:
            recs.append("Grounding exercise tip: Name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste to reduce acute worry.")
        elif dom_lower in ['sadness', 'sad']:
            recs.append("Engage in small, comforting routines and allow yourself grace without self-judgment.")
        elif dom_lower in ['anger', 'frustrated']:
            recs.append("Step away from tense situations temporarily and engage in physical movement or music to diffuse tension.")

    return recs

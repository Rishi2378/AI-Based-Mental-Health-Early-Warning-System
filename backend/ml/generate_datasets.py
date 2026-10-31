import os
import pandas as pd
import numpy as np

def generate_nlp_dataset(filepath: str):
    """
    Generates a rich, diverse, clinically informed mental health dataset of 1,800+ entries.
    Categories aligned with non-diagnostic wellness assessment:
    - Neutral / Balanced
    - Positive / Flourishing
    - Sadness / Low Mood
    - Anxiety / Panic
    - Anger / Frustration
    - Stress / Burnout
    """
    core_samples = [
        # --- Neutral / Balanced (Stress: 5 - 25) ---
        ("Today was a steady and productive day at work. Finished all assigned tasks smoothly.", "Neutral", "Positive", 12),
        ("Felt calm and content while spending quiet evening time reading a book.", "Neutral", "Positive", 10),
        ("Studied for two hours and made good progress on my project without feeling rushed.", "Neutral", "Neutral", 15),
        ("Attended class and caught up on assignments. Feeling balanced and clear-headed.", "Neutral", "Positive", 14),
        ("Organized my workspace and went for a light evening jog around the neighborhood.", "Neutral", "Positive", 11),
        ("Simple quiet day at home doing routine errands, laundry, and cooking dinner.", "Neutral", "Neutral", 10),
        ("Reviewed notes for upcoming meetings. Everything feels well-planned and under control.", "Neutral", "Neutral", 13),
        ("Had a regular day at the office. Nothing unusual happened and workflow was manageable.", "Neutral", "Neutral", 16),
        ("Spent time organizing my schedule for the week ahead. Feeling grounded and ready.", "Neutral", "Positive", 12),
        ("Cooked a healthy meal and listened to a podcast. Peaceful mindset tonight.", "Neutral", "Positive", 9),
        ("Woke up on time, enjoyed my morning tea, and went about my routine steadily.", "Neutral", "Positive", 8),
        ("Commute was smooth today. Did some grocery shopping and relaxed on the balcony.", "Neutral", "Neutral", 11),
        ("Finished writing my weekly summary report. Looking forward to an ordinary calm weekend.", "Neutral", "Positive", 13),
        ("Spent an hour organizing my digital files and cleaning up old desktop shortcuts.", "Neutral", "Neutral", 10),
        ("Took a relaxed stroll after lunch. Sun was out and the breeze felt refreshing.", "Neutral", "Positive", 10),
        ("Had a brief team sync that finished early. Tasks are clearly defined and on track.", "Neutral", "Neutral", 12),
        ("Replied to lingering emails without any pressure. Kept a steady, unhurried pace.", "Neutral", "Neutral", 14),
        ("Practiced gentle yoga stretching for twenty minutes before bed. Body feels relaxed.", "Neutral", "Positive", 8),

        # --- Positive / Flourishing (Stress: 2 - 15) ---
        ("Accomplished my major weekly goals and enjoyed a rejuvenating walk in the park.", "Positive", "Positive", 7),
        ("Had a fantastic conversation with an old friend today. Looking forward to our reunion!", "Positive", "Positive", 5),
        ("Everything went according to plan. Grateful for a peaceful, joyful, and productive day.", "Positive", "Positive", 4),
        ("Received great feedback on my project presentation! Feeling confident and motivated.", "Positive", "Positive", 6),
        ("Celebrated a small milestone with family. My heart feels warm, light, and optimistic.", "Positive", "Positive", 4),
        ("Woke up feeling deeply energized, refreshed, and excited about what lies ahead.", "Positive", "Positive", 5),
        ("Successfully resolved a tricky issue at work and felt an amazing sense of triumph.", "Positive", "Positive", 8),
        ("Had an amazing day out in nature. The fresh air restored my spirit completely.", "Positive", "Positive", 3),
        ("Laughed so much today with colleagues. The workplace camaraderie is truly uplifting.", "Positive", "Positive", 6),
        ("Finished reading an inspiring book. Feeling creative, motivated, and inspired to start writing.", "Positive", "Positive", 5),
        ("Shared a heartfelt dinner with loved ones. Feeling deeply supported and thankful.", "Positive", "Positive", 4),
        ("Completed my first 5k run in months and set a personal best! Overjoyed with progress.", "Positive", "Positive", 7),
        ("Found creative flow in my art project today. Time just flew by in pure bliss.", "Positive", "Positive", 4),
        ("Helped a junior colleague solve their problem and their gratitude made my whole afternoon.", "Positive", "Positive", 5),
        ("Slept eight hours straight and woke up smiling. Today is going to be wonderful.", "Positive", "Positive", 3),

        # --- Sadness / Low Mood (Stress: 55 - 85) ---
        ("Feeling down and disconnected today. Hard to find energy or motivation to do anything.", "Sadness", "Negative", 68),
        ("Spent the day feeling lonely and overwhelmed by a sense of quiet melancholy.", "Sadness", "Negative", 72),
        ("Miss my family deeply and feel isolated in this new city. Nothing brings joy right now.", "Sadness", "Negative", 76),
        ("Felt like crying earlier for no specific reason. Exhausted mentally and carrying a heavy mood.", "Sadness", "Negative", 80),
        ("Disappointed with my performance. Feeling inadequate, sluggish, and emotionally heavy inside.", "Sadness", "Negative", 70),
        ("Struggling with low mood and lack of motivation to complete simple daily chores.", "Sadness", "Negative", 65),
        ("Feeling emotionally drained and empty. It feels hard to care about things I used to love.", "Sadness", "Negative", 78),
        ("Staring at the ceiling for hours. Everything feels gloomy, slow, and uninspired.", "Sadness", "Negative", 81),
        ("Felt hopeless about the future today. I feel like no matter how hard I try, things stay dull.", "Sadness", "Negative", 84),
        ("Withdrew from friends and stayed in bed all day. Could not bring myself to reply to texts.", "Sadness", "Negative", 75),
        ("Woke up feeling an immediate wave of sadness and regret about past choices.", "Sadness", "Negative", 73),
        ("Feel invisible and unheard. When I spoke up today, it felt like nobody noticed.", "Sadness", "Negative", 77),
        ("A pervasive sense of numbness took over my day. Just going through empty motions.", "Sadness", "Negative", 74),
        ("Lost all appetite and interest in food. The apartment feels too quiet and cold.", "Sadness", "Negative", 79),
        ("Heavy sighing all afternoon. It feels like an uphill battle just to take a shower.", "Sadness", "Negative", 71),

        # --- Anxiety / Worry / Panic (Stress: 70 - 95) ---
        ("Constant knot of worry in my stomach. Terrified about upcoming exams and uncertain future.", "Anxiety", "Negative", 86),
        ("Heart racing and mind spinning with anxious catastrophic thoughts about what could go wrong.", "Anxiety", "Negative", 89),
        ("Feeling uneasy and hypervigilant. Cannot shake off this persistent feeling of impending trouble.", "Anxiety", "Negative", 91),
        ("Overthinking every small decision. Fearful that I made a critical mistake in my report.", "Anxiety", "Negative", 84),
        ("Dreading tomorrow's presentation. Palms sweating, voice shaking, and panic building up inside.", "Anxiety", "Negative", 88),
        ("Mind won't stop racing with worst-case scenarios. I feel on edge continuously and unable to rest.", "Anxiety", "Negative", 87),
        ("Shortness of breath and tightness in my chest whenever I think about my pile of responsibilities.", "Anxiety", "Negative", 92),
        ("Obsessively checking emails and phone notifications, dreading bad news or criticism.", "Anxiety", "Negative", 83),
        ("Woke up at 3 AM with a pounding heart and rapid breathing. Couldn't fall back asleep.", "Anxiety", "Negative", 90),
        ("Jumpy at every unexpected sound. My nervous system feels dialed up to maximum alert.", "Anxiety", "Negative", 85),
        ("Unable to make simple choices because every option feels loaded with potential disaster.", "Anxiety", "Negative", 82),
        ("Felt lightheaded during the team standup. Kept worrying that someone would notice my anxiety.", "Anxiety", "Negative", 87),
        ("Spiraling into irrational self-doubt. Convinced I will be exposed as a fraud any moment.", "Anxiety", "Negative", 89),
        ("Restless legs and shaking hands throughout the afternoon. Cannot sit still for more than a minute.", "Anxiety", "Negative", 86),

        # --- Anger / Frustration (Stress: 65 - 88) ---
        ("So irritated with the constant interruptions and lack of support from my team.", "Anger", "Negative", 76),
        ("Extremely frustrated with unfair grading and unreasonable last-minute deadlines.", "Anger", "Negative", 82),
        ("Lost my temper today during a disagreement. Feeling heated, resentful, and bitter.", "Anger", "Negative", 84),
        ("Fuming over how rudely I was spoken to today in front of peers. Cannot stop replaying it.", "Anger", "Negative", 79),
        ("Tired of dealing with endless roadblocks, broken promises, and bureaucratic obstacles.", "Anger", "Negative", 74),
        ("Felt betrayed and angry when my contributions were ignored and taken credit for by someone else.", "Anger", "Negative", 81),
        ("Resentment building up over being taken for granted day after day while doing everyone's work.", "Anger", "Negative", 78),
        ("Infuriated by the continuous dishonesty and total lack of respect shown to me.", "Anger", "Negative", 86),
        ("Snapping at minor inconveniences today. Spilled coffee and felt like kicking the desk.", "Anger", "Negative", 75),
        ("Simmering rage about how unfairly resources are distributed across our department.", "Anger", "Negative", 80),
        ("Cut off mid-sentence repeatedly during the call. My blood was boiling the whole hour.", "Anger", "Negative", 83),
        ("Feeling intense frustration at technology failures losing an hour of unsaved work.", "Anger", "Negative", 77),

        # --- Stress / Overload / Burnout (Stress: 78 - 98) ---
        ("Overloaded with work deadlines, late nights, and zero sleep. Feeling completely near burnout.", "Stress", "Negative", 94),
        ("Balancing too many demands at once. Brain feels completely fried, foggy, and exhausted.", "Stress", "Negative", 90),
        ("High pressure from all sides. Cannot catch a breather or relax even for five minutes.", "Stress", "Negative", 87),
        ("Suffocating under endless responsibilities and urgent demands that never stop coming.", "Stress", "Negative", 92),
        ("Exhausted from constant multitasking, demanding clients, and unrealistic expectations.", "Stress", "Negative", 89),
        ("Struggling to manage work, family, and personal health simultaneously. Running entirely on empty.", "Stress", "Negative", 91),
        ("Sleep deprived and overwhelmed by an unmanageable pile of uncompleted urgent tasks.", "Stress", "Negative", 93),
        ("Chronic headaches and tight neck muscles from sitting hunched over typing for twelve hours.", "Stress", "Negative", 88),
        ("Cannot remember the last time I took a full day off without checking work messages.", "Stress", "Negative", 85),
        ("Feeling completely depleted. Even small decisions feel like climbing a steep mountain.", "Stress", "Negative", 91),
        ("Pushed past my limits again this week. Mentally and physically drained beyond words.", "Stress", "Negative", 95),
        ("Multiple overlapping project crises hit at once today. Felt like breaking down from the strain.", "Stress", "Negative", 96)
    ]

    records = []
    np.random.seed(42)

    prefixes = [
        "", "Honestly, ", "Lately, ", "Overall, ", "In general, ", "To be fair, ",
        "I must admit, ", "Looking back at today, ", "Currently, ", "Noticeably, ",
        "To be completely honest, ", "For the past few days, ", "I feel like ",
        "Reflecting on this evening, ", "Truthfully, ", "Deep down, "
    ]
    suffixes = [
        "", " Need some rest.", " Hope tomorrow brings some relief.", " Trying my best to cope.",
        " Just documenting my feelings.", " Taking it one step at a time.", " Hard to stay focused.",
        " Hoping for some peace of mind.", " Need to disconnect tonight.", " Giving myself a moment."
    ]

    for text, emotion, sentiment, base_stress in core_samples:
        # Generate 25 diverse variations per core sample
        for _ in range(25):
            pref = np.random.choice(prefixes)
            suf = np.random.choice(suffixes)
            noise = np.random.randint(-5, 6)
            stress_val = int(np.clip(base_stress + noise, 0, 100))
            full_text = f"{pref}{text}{suf}".strip()
            records.append({
                "text": full_text,
                "emotion": emotion,
                "sentiment": sentiment,
                "stress_indicator": stress_val
            })

    df = pd.DataFrame(records)
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"[Dataset] Enriched NLP Mental Health dataset created at '{filepath}' with {len(df)} samples across {df['emotion'].nunique()} classes.")
    return df

def generate_voice_dataset(filepath: str):
    """
    Generates an acoustic speech feature dataset reflecting authentic psychoacoustic distributions.
    38 acoustic features:
    - 13 MFCC means, 13 MFCC stds
    - ZCR mean, ZCR std
    - RMS energy mean, RMS energy std
    - Spectral Centroid mean, std
    - Spectral Bandwidth mean, std
    - Spectral Rolloff mean, std
    - F0 Pitch mean, Pitch jitter std
    """
    np.random.seed(42)
    emotions = ["Calm", "Happy", "Sadness", "Anger", "Anxiety"]
    n_samples_per_emotion = 360

    rows = []
    for emotion in emotions:
        for _ in range(n_samples_per_emotion):
            if emotion == "Calm":
                pitch_mean = np.random.normal(135, 10)
                pitch_std = np.random.normal(16, 3)
                rms_mean = np.random.normal(0.024, 0.003)
                rms_std = np.random.normal(0.005, 0.001)
                zcr_mean = np.random.normal(0.045, 0.007)
                zcr_std = np.random.normal(0.010, 0.002)
                centroid_mean = np.random.normal(1450, 110)
                centroid_std = np.random.normal(210, 25)
                bandwidth_mean = np.random.normal(1200, 90)
                bandwidth_std = np.random.normal(180, 20)
                rolloff_mean = np.random.normal(3100, 180)
                rolloff_std = np.random.normal(350, 40)
                stress_ind = np.random.normal(15, 6)
            elif emotion == "Happy":
                pitch_mean = np.random.normal(218, 20)
                pitch_std = np.random.normal(32, 6)
                rms_mean = np.random.normal(0.068, 0.010)
                rms_std = np.random.normal(0.014, 0.002)
                zcr_mean = np.random.normal(0.088, 0.012)
                zcr_std = np.random.normal(0.016, 0.003)
                centroid_mean = np.random.normal(2480, 160)
                centroid_std = np.random.normal(360, 35)
                bandwidth_mean = np.random.normal(2050, 140)
                bandwidth_std = np.random.normal(280, 25)
                rolloff_mean = np.random.normal(5150, 260)
                rolloff_std = np.random.normal(480, 45)
                stress_ind = np.random.normal(22, 7)
            elif emotion == "Sadness":
                pitch_mean = np.random.normal(110, 8)
                pitch_std = np.random.normal(12, 2.5)
                rms_mean = np.random.normal(0.012, 0.0025)
                rms_std = np.random.normal(0.003, 0.0008)
                zcr_mean = np.random.normal(0.029, 0.005)
                zcr_std = np.random.normal(0.007, 0.0015)
                centroid_mean = np.random.normal(1120, 85)
                centroid_std = np.random.normal(160, 20)
                bandwidth_mean = np.random.normal(980, 70)
                bandwidth_std = np.random.normal(130, 15)
                rolloff_mean = np.random.normal(2450, 150)
                rolloff_std = np.random.normal(260, 30)
                stress_ind = np.random.normal(72, 7)
            elif emotion == "Anger":
                pitch_mean = np.random.normal(258, 25)
                pitch_std = np.random.normal(42, 8)
                rms_mean = np.random.normal(0.128, 0.016)
                rms_std = np.random.normal(0.025, 0.004)
                zcr_mean = np.random.normal(0.128, 0.016)
                zcr_std = np.random.normal(0.022, 0.004)
                centroid_mean = np.random.normal(3180, 220)
                centroid_std = np.random.normal(440, 45)
                bandwidth_mean = np.random.normal(2580, 190)
                bandwidth_std = np.random.normal(340, 30)
                rolloff_mean = np.random.normal(6400, 320)
                rolloff_std = np.random.normal(580, 50)
                stress_ind = np.random.normal(84, 6)
            else:  # Anxiety
                pitch_mean = np.random.normal(246, 22)
                pitch_std = np.random.normal(38, 7)
                rms_mean = np.random.normal(0.078, 0.012)
                rms_std = np.random.normal(0.018, 0.003)
                zcr_mean = np.random.normal(0.118, 0.015)
                zcr_std = np.random.normal(0.020, 0.003)
                centroid_mean = np.random.normal(2890, 190)
                centroid_std = np.random.normal(410, 40)
                bandwidth_mean = np.random.normal(2380, 170)
                bandwidth_std = np.random.normal(310, 28)
                rolloff_mean = np.random.normal(5850, 290)
                rolloff_std = np.random.normal(520, 45)
                stress_ind = np.random.normal(88, 5)

            # Generate 26 MFCCs (13 means + 13 stds)
            mfcc_means = np.random.normal(0, 1.2, 13) + (pitch_mean / 100.0)
            mfcc_stds = np.abs(np.random.normal(0.55, 0.09, 13))

            feature_vector = np.hstack([
                mfcc_means, mfcc_stds,
                [zcr_mean, zcr_std],
                [rms_mean, rms_std],
                [centroid_mean, centroid_std],
                [bandwidth_mean, bandwidth_std],
                [rolloff_mean, rolloff_std],
                [pitch_mean, pitch_std]
            ])

            row_dict = {f"f_{idx}": float(val) for idx, val in enumerate(feature_vector)}
            row_dict["emotion"] = emotion
            row_dict["stress_indicator"] = float(np.clip(stress_ind, 0, 100))
            rows.append(row_dict)

    df = pd.DataFrame(rows)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"[Dataset] Enriched Voice Feature dataset created at '{filepath}' with {len(df)} samples across {len(emotions)} classes.")
    return df

if __name__ == "__main__":
    raw_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw'))
    nlp_path = os.path.join(raw_dir, 'nlp_mental_health_dataset.csv')
    voice_path = os.path.join(raw_dir, 'voice_emotion_features.csv')
    generate_nlp_dataset(nlp_path)
    generate_voice_dataset(voice_path)

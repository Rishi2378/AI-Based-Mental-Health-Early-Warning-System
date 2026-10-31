import os
import pandas as pd
import numpy as np

def generate_nlp_dataset(filepath: str):
    """
    Generates a realistic, diverse mental health dataset with distinct affective profiles:
    - Neutral / Balanced (Stress: 5 - 25)
    - Positive / Flourishing (Stress: 0 - 20)
    - Sadness / Low Mood (Stress: 55 - 85)
    - Anxiety / Panic (Stress: 70 - 95)
    - Anger / Frustration (Stress: 65 - 88)
    - Stress / Burnout (Stress: 65 - 92)
    """
    core_samples = {
        "Neutral": [
            ("Today was a steady and productive day at work. Finished all assigned tasks smoothly.", "Positive", 12),
            ("Felt calm and content while spending quiet evening time reading a book.", "Positive", 10),
            ("Studied for two hours and made good progress on my project without feeling rushed.", "Neutral", 15),
            ("Attended class and caught up on assignments. Feeling balanced and clear-headed.", "Positive", 14),
            ("Organized my workspace and went for a light evening jog around the neighborhood.", "Positive", 11),
            ("Simple quiet day at home doing routine errands, laundry, and cooking dinner.", "Neutral", 10),
            ("Reviewed notes for upcoming meetings. Everything feels well-planned and under control.", "Neutral", 13),
            ("Had a regular day at the office. Nothing unusual happened and workflow was manageable.", "Neutral", 16),
            ("Spent time organizing my schedule for the week ahead. Feeling grounded and ready.", "Positive", 12),
            ("Cooked a healthy meal and listened to a podcast. Peaceful mindset tonight.", "Positive", 9),
            ("Woke up on time, enjoyed my morning tea, and went about my routine steadily.", "Positive", 8),
            ("Commute was smooth today. Did some grocery shopping and relaxed on the balcony.", "Neutral", 11),
            ("Finished writing my weekly summary report. Looking forward to an ordinary calm weekend.", "Positive", 13),
            ("Spent an hour organizing my digital files and cleaning up old desktop shortcuts.", "Neutral", 10),
            ("Took a relaxed stroll after lunch. Sun was out and the breeze felt refreshing.", "Positive", 10),
            ("Had a brief team sync that finished early. Tasks are clearly defined and on track.", "Neutral", 12),
            ("Replied to lingering emails without any pressure. Kept a steady, unhurried pace.", "Neutral", 14),
            ("Practiced gentle yoga stretching for twenty minutes before bed. Body feels relaxed.", "Positive", 8),
            ("Wrote in my planner, watered the indoor plants, and prepared lunch for tomorrow.", "Neutral", 11),
            ("Browsed articles on history and science. An ordinary, pleasant, peaceful day.", "Positive", 9),
            ("Commuted to the library and worked quietly on research notes for three hours.", "Neutral", 14),
            ("Folded laundry while listening to soft music. Normal quiet afternoon.", "Neutral", 10),
            ("Cleaned the kitchen counters and made a hot cup of chamomile tea.", "Positive", 9),
            ("Walked to the corner grocery store to buy fruit and fresh bread.", "Neutral", 11),
            ("Woke up feeling rested. The morning sun was gentle and the breeze was mild.", "Positive", 10)
        ],
        "Positive": [
            ("Accomplished my major weekly goals and enjoyed a rejuvenating walk in the park.", "Positive", 7),
            ("Had a fantastic conversation with an old friend today. Looking forward to our reunion!", "Positive", 5),
            ("Everything went according to plan. Grateful for a peaceful, joyful, and productive day.", "Positive", 4),
            ("Received great feedback on my project presentation! Feeling confident and motivated.", "Positive", 6),
            ("Celebrated a small milestone with family. My heart feels warm, light, and optimistic.", "Positive", 4),
            ("Woke up feeling deeply energized, refreshed, and excited about what lies ahead.", "Positive", 5),
            ("Successfully resolved a tricky issue at work and felt an amazing sense of triumph.", "Positive", 8),
            ("Had an amazing day out in nature. The fresh air restored my spirit completely.", "Positive", 3),
            ("Laughed so much today with colleagues. The workplace camaraderie is truly uplifting.", "Positive", 6),
            ("Finished reading an inspiring book. Feeling creative, motivated, and inspired to start writing.", "Positive", 5),
            ("Shared a heartfelt dinner with loved ones. Feeling deeply supported and thankful.", "Positive", 4),
            ("Completed my first 5k run in months and set a personal best! Overjoyed with progress.", "Positive", 7),
            ("Found creative flow in my art project today. Time just flew by in pure bliss.", "Positive", 4),
            ("Helped a junior colleague solve their problem and their gratitude made my whole afternoon.", "Positive", 5),
            ("Slept eight hours straight and woke up smiling. Today is going to be wonderful.", "Positive", 3),
            ("Got accepted into the workshop I wanted! Thrilled, honored, and bursting with joy.", "Positive", 4),
            ("Cooking together with my partner was so heartwarming and full of sweet laughter.", "Positive", 4),
            ("Took beautiful photographs of the sunset today. Truly feeling blessed and content.", "Positive", 3),
            ("Everything feels harmonious and joyful today. Life feels vibrant, hopeful, and full.", "Positive", 3),
            ("Feeling a wonderful wave of gratitude for good health, wonderful friends, and loving family.", "Positive", 2),
            ("Proud of my personal growth over the past year. I feel confident and happy.", "Positive", 5),
            ("Sunshine, great acoustic songs, and an encouraging conversation. Beautiful day.", "Positive", 4),
            ("Enjoyed an invigorating bike ride along the riverbank. Feeling radiant and cheerful.", "Positive", 5),
            ("Finished our team launch with flying colors! Everyone is celebrating our accomplishment.", "Positive", 6),
            ("Woke up with excitement in my heart and genuine gratitude for another beautiful day.", "Positive", 3)
        ],
        "Sadness": [
            ("Feeling down and disconnected today. Hard to find energy or motivation to do anything.", "Negative", 68),
            ("Spent the day feeling lonely and overwhelmed by a sense of quiet melancholy.", "Negative", 72),
            ("Miss my family deeply and feel isolated in this new city. Nothing brings joy right now.", "Negative", 76),
            ("Felt like crying earlier for no specific reason. Exhausted mentally and carrying a heavy mood.", "Negative", 80),
            ("Disappointed with my performance. Feeling inadequate, sluggish, and emotionally heavy inside.", "Negative", 70),
            ("Struggling with low mood and lack of motivation to complete simple daily chores.", "Negative", 65),
            ("Feeling emotionally drained and empty. It feels hard to care about things I used to love.", "Negative", 78),
            ("Staring at the ceiling for hours. Everything feels gloomy, slow, and uninspired.", "Negative", 81),
            ("Felt hopeless about the future today. I feel like no matter how hard I try, things stay dull.", "Negative", 84),
            ("Withdrew from friends and stayed in bed all day. Could not bring myself to reply to texts.", "Negative", 75),
            ("Woke up feeling an immediate wave of sadness and regret about past choices.", "Negative", 73),
            ("Feel invisible and unheard. When I spoke up today, it felt like nobody noticed.", "Negative", 77),
            ("A pervasive sense of numbness took over my day. Just going through empty motions.", "Negative", 74),
            ("Lost all appetite and interest in food. The apartment feels too quiet and cold.", "Negative", 79),
            ("Heavy sighing all afternoon. It feels like an uphill battle just to take a shower.", "Negative", 71),
            ("Nobody checked in on me. The loneliness feels palpable and suffocating.", "Negative", 78),
            ("I feel hollowed out, drained, and emotionally exhausted from crying all morning.", "Negative", 82),
            ("Everything is gray and joyless. Even my favorite movies cannot cheer me up.", "Negative", 75),
            ("Carrying an aching sadness in my chest that refuses to lift no matter what I do.", "Negative", 80),
            ("Felt completely forgotten by everyone today. Sitting in the dark alone.", "Negative", 83),
            ("My heart feels fragile and heavy. Struggling to hold back tears in public.", "Negative", 76),
            ("Regret and grief over things I cannot change kept me awake all night.", "Negative", 79),
            ("No energy left to pretend I am okay. Feeling deeply dejected and weary.", "Negative", 82),
            ("Everything reminds me of loss and separation. Deeply sorrowful day.", "Negative", 81),
            ("Felt completely alienated from my peers today. Feeling unwanted and depressed.", "Negative", 85)
        ],
        "Anxiety": [
            ("Constant knot of worry in my stomach. Terrified about upcoming exams and uncertain future.", "Negative", 86),
            ("Heart racing and mind spinning with anxious catastrophic thoughts about what could go wrong.", "Negative", 89),
            ("Feeling uneasy and hypervigilant. Cannot shake off this persistent feeling of impending trouble.", "Negative", 91),
            ("Overthinking every small decision. Fearful that I made a critical mistake in my report.", "Negative", 84),
            ("Dreading tomorrow's presentation. Palms sweating, voice shaking, and panic building up inside.", "Negative", 88),
            ("Mind won't stop racing with worst-case scenarios. I feel on edge continuously and unable to rest.", "Negative", 87),
            ("Shortness of breath and tightness in my chest whenever I think about my pile of responsibilities.", "Negative", 92),
            ("Obsessively checking emails and phone notifications, dreading bad news or criticism.", "Negative", 83),
            ("Woke up at 3 AM with a pounding heart and rapid breathing. Couldn't fall back asleep.", "Negative", 90),
            ("Jumpy at every unexpected sound. My nervous system feels dialed up to maximum alert.", "Negative", 85),
            ("Unable to make simple choices because every option feels loaded with potential disaster.", "Negative", 82),
            ("Felt lightheaded during the team standup. Kept worrying that someone would notice my anxiety.", "Negative", 87),
            ("Spiraling into irrational self-doubt. Convinced I will be exposed as a fraud any moment.", "Negative", 89),
            ("Restless legs and shaking hands throughout the afternoon. Cannot sit still for more than a minute.", "Negative", 86),
            ("Chest feels constricted and throat tight. Anxious thoughts looping over and over uncontrollably.", "Negative", 93),
            ("Paralyzed by fear of failure. Every impending deadline triggers intense waves of panic.", "Negative", 88),
            ("Trembling during my conversation with my manager. I felt on the verge of a panic attack.", "Negative", 91),
            ("Anxious dread that something horrible is about to happen to someone I care about.", "Negative", 87),
            ("Hyperventilating in the restroom trying to calm down before entering the meeting.", "Negative", 94),
            ("Nervous restlessness and insomnia. Tossing and turning with a pounding pulse.", "Negative", 89),
            ("Overwhelmed by sensory overload and social anxiety in crowded spaces.", "Negative", 85),
            ("My thoughts are running at 100 miles an hour and I can't catch my breath.", "Negative", 92),
            ("Constant tension in my jaw and shoulders from clenching them all day in fear.", "Negative", 84),
            ("Terrified that I've ruined everything because of one minor miscommunication.", "Negative", 88),
            ("Nausea and dizziness triggered by severe nervousness about what tomorrow will bring.", "Negative", 90)
        ],
        "Anger": [
            ("So irritated with the constant interruptions and lack of support from my team.", "Negative", 76),
            ("Extremely frustrated with unfair grading and unreasonable last-minute deadlines.", "Negative", 82),
            ("Lost my temper today during a disagreement. Feeling heated, resentful, and bitter.", "Negative", 84),
            ("Fuming over how rudely I was spoken to today in front of peers. Cannot stop replaying it.", "Negative", 79),
            ("Tired of dealing with endless roadblocks, broken promises, and bureaucratic obstacles.", "Negative", 74),
            ("Felt betrayed and angry when my contributions were ignored and taken credit for by someone else.", "Negative", 81),
            ("Resentment building up over being taken for granted day after day while doing everyone's work.", "Negative", 78),
            ("Infuriated by the continuous dishonesty and total lack of respect shown to me.", "Negative", 86),
            ("Snapping at minor inconveniences today. Spilled coffee and felt like kicking the desk.", "Negative", 75),
            ("Simmering rage about how unfairly resources are distributed across our department.", "Negative", 80),
            ("Cut off mid-sentence repeatedly during the call. My blood was boiling the whole hour.", "Negative", 83),
            ("Feeling intense frustration at technology failures losing an hour of unsaved work.", "Negative", 77),
            ("Sick and tired of hypocritical leadership demanding overtime while giving nothing in return.", "Negative", 85),
            ("Outraged by blatant favoritism and disrespectful behavior in the project review.", "Negative", 82),
            ("Clenched fists and grinding teeth. It took everything I had not to lash out verbally.", "Negative", 87),
            ("Furious that promises were completely broken without even an apology.", "Negative", 83),
            ("Deep resentment towards people who dump their mistakes on junior team members.", "Negative", 79),
            ("I am absolutely exasperated by the complete lack of accountability around here.", "Negative", 81),
            ("Boiling with anger over being undermined and lied to directly to my face.", "Negative", 88),
            ("Aggravated by persistent incompetence and constant finger-pointing.", "Negative", 78),
            ("Fed up with having my boundaries continually violated and disregarded.", "Negative", 80),
            ("Fuming at the condescending tone used against me during the presentation.", "Negative", 84),
            ("Irritated beyond words by toxic office politics and constant backstabbing.", "Negative", 86),
            ("I felt like shouting at the top of my lungs because nobody listens to valid concerns.", "Negative", 85),
            ("My blood pressure spiked hearing the defensive excuses made for obvious negligence.", "Negative", 82)
        ],
        "Stress": [
            ("Drowning in an overwhelming mountain of project deadlines and exam preparations.", "Negative", 86),
            ("Burnout is hitting hard. Working fourteen hour days and my mind feels completely fried.", "Negative", 90),
            ("Cannot keep up with all the demands pulling me in every direction simultaneously.", "Negative", 84),
            ("Physical exhaustion and cognitive overload. Juggling five urgent priorities at once.", "Negative", 88),
            ("Too many pressing responsibilities and zero downtime. Operating on fumes and caffeine.", "Negative", 89),
            ("Sleep deprived and overwhelmed by an unmanageable pile of uncompleted urgent tasks.", "Negative", 87),
            ("Brain fog and intense fatigue from back-to-back high stakes project deliverables.", "Negative", 83),
            ("Pressure from management is unbearable this quarter. The expectations are unattainable.", "Negative", 85),
            ("Feeling squeezed between academic expectations and financial responsibilities. So much stress.", "Negative", 88),
            ("Multiple overlapping project crises hit at once today. Felt like breaking down from the strain.", "Negative", 91),
            ("Struggling to stay afloat under extreme workload pressure and impending deadlines.", "Negative", 86),
            ("My head is throbbing from non-stop screen time and chronic deadline stress.", "Negative", 82),
            ("Running on three hours of sleep trying to finish the client proposal. Utter exhaustion.", "Negative", 89),
            ("Total cognitive burnout. Simple decisions feel impossible because my brain is taxed to the limit.", "Negative", 92),
            ("Juggling family duties, exams, and full-time work. There are simply not enough hours in the day.", "Negative", 87),
            ("Constant urgency and firefighting emergencies at work. I have had no weekend in three weeks.", "Negative", 90),
            ("The sheer volume of tasks is insurmountable. I feel suffocated by my to-do list.", "Negative", 88),
            ("Feeling physically unwell from long hours, severe stress, and chronic lack of recovery.", "Negative", 86),
            ("Strained to the absolute breaking point. I need this relentless crunch cycle to end.", "Negative", 93),
            ("Stressed out about upcoming evaluations, performance metrics, and tight deadlines.", "Negative", 85),
            ("Overworked, under-rested, and constantly under pressure to deliver flawless results.", "Negative", 89),
            ("The mental fatigue is so deep that I can barely concentrate on reading a single paragraph.", "Negative", 87),
            ("Relentless pressure from all sides. I feel like an overstretched rubber band about to snap.", "Negative", 91),
            ("High stress levels keeping me awake every night. Exhausted yet unable to turn my brain off.", "Negative", 88),
            ("Swamped with urgent tickets and angry emails. Every minute feels like a high-wire act.", "Negative", 86)
        ]
    }

    # Emotion-specific natural contextual prefixes
    prefixes = {
        "Neutral": ["", "Honestly, ", "Lately, ", "Overall, ", "In general, ", "Looking back at today, ", "Currently, ", "On a routine note, ", "As usual, "],
        "Positive": ["", "So happy to say, ", "Grateful that ", "Truly, ", "Wonderfully, ", "Looking back today, ", "It feels great that ", "Excited because "],
        "Sadness": ["", "Honestly, ", "Deep down, ", "Lately, ", "Sadly, ", "It hurts that ", "Truthfully, ", "Feeling down because ", "In all honesty, "],
        "Anxiety": ["", "I can't stop worrying, ", "My anxiety is peaking, ", "Truthfully, ", "I dread thinking that ", "I'm terrified that ", "Panic sets in because ", "Honestly, "],
        "Anger": ["", "I am so mad that ", "It is infuriating that ", "Honestly, ", "I can't stand that ", "Frankly, ", "Fed up because ", "To be blunt, "],
        "Stress": ["", "Under so much pressure, ", "Completely swamped, ", "Honestly, ", "Burned out because ", "Exhausted because ", "Overwhelmed that ", "Truthfully, "]
    }

    # Emotion-specific contextual suffixes
    suffixes = {
        "Neutral": ["", " An ordinary calm day.", " Keeping steady.", " Moving along smoothly.", " All is peaceful.", " Taking it in stride."],
        "Positive": ["", " What a wonderful feeling!", " Life is good.", " Feeling so grateful and blessed.", " Looking forward to tomorrow!", " Pure joy."],
        "Sadness": ["", " Feeling empty inside.", " Wish things were different.", " It feels so lonely.", " Hard to hold back tears.", " Heavy heart."],
        "Anxiety": ["", " My chest feels tight.", " Can't seem to calm down.", " Terrified of what comes next.", " Mind won't stop racing.", " Need this panic to stop."],
        "Anger": ["", " It is completely unacceptable.", " I've had enough.", " My blood is boiling.", " Sick of this disrespect.", " Totally fed up."],
        "Stress": ["", " Drowning in tasks.", " Running on empty.", " Need a break immediately.", " Can't keep up with this pace.", " So exhausted."]
    }

    records = []
    np.random.seed(42)

    for emotion, samples in core_samples.items():
        pref_list = prefixes[emotion]
        suf_list = suffixes[emotion]

        for text, sentiment, base_stress in samples:
            # Generate 16 distinct variations per sample
            for _ in range(16):
                pref = np.random.choice(pref_list)
                suf = np.random.choice(suf_list)
                noise = np.random.randint(-4, 5)
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
    print(f"[Dataset] Realistic NLP Mental Health dataset created at '{filepath}' with {len(df)} samples across {df['emotion'].nunique()} classes.")
    return df

def generate_voice_dataset(filepath: str):
    """
    Generates an acoustic speech feature dataset reflecting authentic psychoacoustic distributions.
    Calibrated to genuine human speech:
    - Calm / Neutral: F0 120-160 Hz, RMS 0.02 - 0.06, Centroid 1200 - 1800 Hz
    - Happy: F0 180-250 Hz, RMS 0.05 - 0.12, Centroid 2000 - 2800 Hz, elevated pitch var
    - Sadness: F0 95-135 Hz, low RMS 0.01 - 0.035, flat pitch var (monotone), Centroid 900 - 1400 Hz
    - Anger: F0 200-320 Hz, high RMS 0.08 - 0.22, sharp spectral rolloff 4500 - 7000 Hz, high ZCR
    - Anxiety: F0 190-280 Hz, jittery pitch variance, rapid energy modulation, high ZCR
    """
    np.random.seed(42)
    emotions = ["Calm", "Happy", "Sadness", "Anger", "Anxiety"]
    n_samples_per_emotion = 400

    rows = []
    for emotion in emotions:
        for _ in range(n_samples_per_emotion):
            if emotion == "Calm":
                pitch_mean = np.random.normal(138, 14)
                pitch_std = np.random.normal(18, 3)
                rms_mean = np.random.normal(0.038, 0.008)
                rms_std = np.random.normal(0.008, 0.002)
                zcr_mean = np.random.normal(0.046, 0.008)
                zcr_std = np.random.normal(0.010, 0.002)
                centroid_mean = np.random.normal(1480, 120)
                centroid_std = np.random.normal(220, 25)
                bandwidth_mean = np.random.normal(1250, 90)
                bandwidth_std = np.random.normal(180, 20)
                rolloff_mean = np.random.normal(3100, 180)
                rolloff_std = np.random.normal(350, 40)
                stress_ind = np.random.normal(15, 6)
            elif emotion == "Happy":
                pitch_mean = np.random.normal(215, 18)
                pitch_std = np.random.normal(32, 5)
                rms_mean = np.random.normal(0.075, 0.012)
                rms_std = np.random.normal(0.016, 0.003)
                zcr_mean = np.random.normal(0.082, 0.011)
                zcr_std = np.random.normal(0.015, 0.003)
                centroid_mean = np.random.normal(2450, 150)
                centroid_std = np.random.normal(360, 35)
                bandwidth_mean = np.random.normal(2050, 130)
                bandwidth_std = np.random.normal(270, 25)
                rolloff_mean = np.random.normal(5100, 250)
                rolloff_std = np.random.normal(480, 45)
                stress_ind = np.random.normal(20, 6)
            elif emotion == "Sadness":
                pitch_mean = np.random.normal(112, 10)
                pitch_std = np.random.normal(12, 2.5)
                rms_mean = np.random.normal(0.022, 0.005)
                rms_std = np.random.normal(0.004, 0.001)
                zcr_mean = np.random.normal(0.032, 0.006)
                zcr_std = np.random.normal(0.007, 0.0015)
                centroid_mean = np.random.normal(1150, 95)
                centroid_std = np.random.normal(160, 20)
                bandwidth_mean = np.random.normal(1020, 80)
                bandwidth_std = np.random.normal(140, 15)
                rolloff_mean = np.random.normal(2500, 160)
                rolloff_std = np.random.normal(270, 30)
                stress_ind = np.random.normal(74, 6)
            elif emotion == "Anger":
                pitch_mean = np.random.normal(260, 22)
                pitch_std = np.random.normal(42, 7)
                rms_mean = np.random.normal(0.125, 0.018)
                rms_std = np.random.normal(0.024, 0.004)
                zcr_mean = np.random.normal(0.124, 0.015)
                zcr_std = np.random.normal(0.021, 0.004)
                centroid_mean = np.random.normal(3150, 200)
                centroid_std = np.random.normal(430, 45)
                bandwidth_mean = np.random.normal(2550, 180)
                bandwidth_std = np.random.normal(330, 30)
                rolloff_mean = np.random.normal(6350, 300)
                rolloff_std = np.random.normal(560, 50)
                stress_ind = np.random.normal(85, 5)
            else:  # Anxiety
                pitch_mean = np.random.normal(245, 20)
                pitch_std = np.random.normal(38, 6)
                rms_mean = np.random.normal(0.076, 0.012)
                rms_std = np.random.normal(0.018, 0.003)
                zcr_mean = np.random.normal(0.115, 0.014)
                zcr_std = np.random.normal(0.019, 0.003)
                centroid_mean = np.random.normal(2850, 180)
                centroid_std = np.random.normal(400, 40)
                bandwidth_mean = np.random.normal(2350, 160)
                bandwidth_std = np.random.normal(300, 28)
                rolloff_mean = np.random.normal(5800, 280)
                rolloff_std = np.random.normal(510, 45)
                stress_ind = np.random.normal(87, 5)

            # Generate 26 MFCCs (13 means + 13 stds)
            mfcc_means = np.random.normal(0, 1.1, 13) + (pitch_mean / 120.0)
            mfcc_stds = np.abs(np.random.normal(0.55, 0.08, 13))

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

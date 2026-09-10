# backend/app/services/core_cal.py
from typing import Dict
import math
from .scoring_tables import SCORING

# Utilities (unchanged)

def get_points(value: float, ranges: list) -> int:
    for low, high, pts in ranges:
        if low <= value <= high:
            return pts
    return 0


def determine_age_group(age: int) -> str:
    if age < 30:
        return "<29"
    elif age < 40:
        return "30-39"
    elif age < 50:
        return "40-49"
    elif age < 60:
        return "50-59"
    return "60+"


def determine_cardio_type(age: int) -> str:
    return "JOGGING" if age <= 39 else "WALKING"


def compute_bmi(weight_kg: float, height_m: float) -> float:
    if height_m <= 0:
        return 0.0
    return round(weight_kg / (height_m ** 2), 2)


def compute_ideal_weight(height_m: float, gender: str) -> float:
    height_cm = height_m * 100
    base = 50 if gender == "male" else 45.5
    return round(base + 0.91 * (height_cm - 152.4), 1)


# Status evaluation (UPDATED for Lower is better)

def evaluate_status(value, cfg, deficit, excess) -> str:
    cfg_type = cfg["type"]

    if cfg_type == "Cage-based":
        points = get_points(value, cfg["ranges"])
        if points >= 40:
            return "Excellent"
        elif points >= 20:
            return "Good"
        return "Poor"

    if cfg_type == "Closer to ideal":
        low, high = cfg["ideal"]
        if low <= value <= high:
            return "Normal"
        return "Underweight" if value < low else "Overweight"

    ideal = cfg["ideal"]

    # Handle "Lower is better" (e.g., heart rate for step-up test)
    if cfg_type == "Lower is better":
        if value <= ideal:
            return "Excellent"
        # Calculate how much worse (higher) the value is compared to ideal
        ratio = excess / ideal if ideal else 1
        if ratio <= 0.2:
            return "Good"
        elif ratio <= 0.4:
            return "Fair"
        return "Poor"

    # Handle "Higher is better" (e.g., push-ups, sit-ups)
    if cfg_type == "Higher is better":
        if value >= ideal:
            return "Excellent"
        ratio = deficit / ideal if ideal else 1
        if ratio <= 0.2:
            return "Good"
        elif ratio <= 0.4:
            return "Fair"
        return "Poor"

    return "Unknown"


# Component scoring (UPDATED for Lower is better)

def get_component_status(value: float, cfg: dict) -> Dict:
    points = get_points(value, cfg["ranges"])

    ideal = cfg.get("ideal")
    deficit = 0.0
    excess = 0.0

    if cfg["type"] == "Closer to ideal":
        low, high = ideal
        deficit = round(max(0, low - value), 2)
        excess = round(max(0, value - high), 2)

    elif cfg["type"] == "Higher is better":
        deficit = max(0, ideal - value)  # How much below ideal
        excess = max(0, value - ideal)     # How much above ideal

    elif cfg["type"] == "Lower is better":
        # For lower is better (e.g., heart rate):
        # - deficit: how much lower than ideal (good, but track for consistency)
        # - excess: how much higher than ideal (bad - indicates poorer fitness)
        deficit = max(0, ideal - value)    # Value is lower than ideal (good)
        excess = max(0, value - ideal)     # Value is higher than ideal (bad)

    status = evaluate_status(value, cfg, deficit, excess)

    return {
        "value": value,
        "points": points,
        "ideal": ideal,
        "deficit": deficit,
        "excess": excess,
        "status": status,
    }


# Main computation – Updated for JSON columns

def compute_naf_pft(data: dict) -> Dict:
    gender = data.get('sex', '').strip().lower()
    if gender not in ("male", "female"):
        return {"error": "Invalid or missing gender"}

    age = data.get('age')
    if not isinstance(age, (int, float)) or age <= 0:
        return {"error": "Invalid or missing age"}

    age_group = determine_age_group(int(age))

    table = SCORING.get(gender, {}).get(age_group)
    if not table:
        return {"error": "No scoring table found"}

    cardio_type = determine_cardio_type(int(age))

    weight = data.get('weight')
    height = data.get('height')
    cardio_cage = data.get('cardio_cage')

    if not all(isinstance(v, (int, float)) for v in [weight, height, cardio_cage]):
        return {"error": "Missing or invalid required fields: weight, height, cardio_cage"}

    if height <= 0:
        return {"error": "Height must be greater than zero"}

    bmi_value = compute_bmi(weight, height)
    bmi = get_component_status(bmi_value, table["bmi"])

    cardio = get_component_status(cardio_cage, table["cardio"])
    step = get_component_status(data.get('step_up', 0), table["step_up_3min"])
    push = get_component_status(data.get('push_up', 0), table["push_up_1min"])
    sit = get_component_status(data.get('sit_up', 0), table["sit_up_1min"])
    chin = get_component_status(data.get('chin_up', 0), table["chin_up_1min"])
    reach = get_component_status(data.get('sit_reach', 0.0), table["sit_reach_cm"])

    aggregate = sum(x["points"] for x in [bmi, cardio, step, push, sit, chin, reach])
    aggregate = min(100, aggregate)

    if aggregate >= 90:
        grade = "Excellent"
        duration, days = "Maintain routine", "Maintain routine"
        activity = "Maintain your fitness routine: Golf, Volleyball, Weight Training."
    elif aggregate >= 75:
        grade = "Good"
        duration, days = "1–35 minutes", "3–4 days per week"
        activity = "Moderate aerobic activities: Tennis (single), aerobic dance, fast walking."
    elif aggregate >= 70:
        grade = "Marginal"
        duration, days = "36–45 minutes", "3–4 days per week"
        activity = "Strenuous activities: Basketball, soccer, circuit training, hill climbing."
    else:
        grade = "Poor"
        duration, days = "46 minutes and above", "5–6 days per week"
        activity = "Strenuous aerobic activities: Jogging, running, swimming, rope skipping."

    ideal_weight = compute_ideal_weight(height, gender)
    weight_diff = round(weight - ideal_weight, 1)

    return {
        "year": data.get("year"),
        "full_name": data.get("full_name"),
        "title": data.get("title"),
        "participant_id": data.get("participant_id"),
        "unit": data.get("unit"),
        "appointment": data.get("appointment"),
        "age": age,
        "date": data.get("date"),
        "sex": gender.upper(),
        "height": height,
        "weight_current": weight,
        "email": data.get("email"),

        "weight_ideal": ideal_weight,
        "weight_excess": max(0, weight_diff),
        "weight_deficit": max(0, -weight_diff),
        "weight_status": (
            "Normal" if abs(weight_diff) <= 2
            else "Overweight" if weight_diff > 0
            else "Underweight"
        ),

        "bmi_current": bmi["value"],
        "bmi_ideal": list(bmi["ideal"]) if isinstance(bmi["ideal"], (list, tuple)) else bmi["ideal"],
        "bmi_excess": bmi["excess"],
        "bmi_deficit": bmi["deficit"],
        "bmi_status": bmi["status"],
        "bmi_points": bmi["points"],

        "cardio_type": cardio_type,
        "cardio_cage": cardio_cage,
        "cardio_value": cardio["value"],
        "cardio_ideal": [cardio["ideal"]] if isinstance(cardio["ideal"], (int, float)) else list(cardio["ideal"]) if isinstance(cardio["ideal"], (list, tuple)) else cardio["ideal"],
        "cardio_deficit": cardio["deficit"],
        "cardio_excess": cardio["excess"],
        "cardio_status": cardio["status"],
        "cardio_points": cardio["points"],

        "step_up_value": step["value"],
        "step_up_ideal": [step["ideal"]] if isinstance(step["ideal"], (int, float)) else list(step["ideal"]) if isinstance(step["ideal"], (list, tuple)) else step["ideal"],
        "step_up_deficit": step["deficit"],
        "step_up_excess": step["excess"],
        "step_up_status": step["status"],
        "step_up_points": step["points"],

        "push_up_value": push["value"],
        "push_up_ideal": [push["ideal"]] if isinstance(push["ideal"], (int, float)) else list(push["ideal"]) if isinstance(push["ideal"], (list, tuple)) else push["ideal"],
        "push_up_deficit": push["deficit"],
        "push_up_excess": push["excess"],
        "push_up_status": push["status"],
        "push_up_points": push["points"],

        "sit_up_value": sit["value"],
        "sit_up_ideal": [sit["ideal"]] if isinstance(sit["ideal"], (int, float)) else list(sit["ideal"]) if isinstance(sit["ideal"], (list, tuple)) else sit["ideal"],
        "sit_up_deficit": sit["deficit"],
        "sit_up_excess": sit["excess"],
        "sit_up_status": sit["status"],
        "sit_up_points": sit["points"],

        "chin_up_value": chin["value"],
        "chin_up_ideal": [chin["ideal"]] if isinstance(chin["ideal"], (int, float)) else list(chin["ideal"]) if isinstance(chin["ideal"], (list, tuple)) else chin["ideal"],
        "chin_up_deficit": chin["deficit"],
        "chin_up_excess": chin["excess"],
        "chin_up_status": chin["status"],
        "chin_up_points": chin["points"],

        "sit_reach_value": reach["value"],
        "sit_reach_ideal": [reach["ideal"]] if isinstance(reach["ideal"], (int, float)) else list(reach["ideal"]) if isinstance(reach["ideal"], (list, tuple)) else reach["ideal"],
        "sit_reach_deficit": reach["deficit"],
        "sit_reach_excess": reach["excess"],
        "sit_reach_status": reach["status"],
        "sit_reach_points": reach["points"],

        "aggregate": aggregate,
        "grade": grade,

        "prescription_duration": duration,
        "prescription_days": days,
        "recommended_activity": activity,

        "evaluator_name": data.get("evaluator_name"),
        "evaluator_title": data.get("evaluator_title"),
    }



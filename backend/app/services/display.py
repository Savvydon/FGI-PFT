from typing import Dict

def print_result(res: Dict):
    if "error" in res:
        print("\nERROR:", res["error"])
        return

    print("\n" + "═" * 70)
    print("                 NAF PFT RESULT")
    print("═" * 70 + "\n")

    print(f"Year               : {res.get('year', 'NIL')}")
    print(f"Full Name          : {res.get('full_name', 'NIL')}")
    print(f"Title              : {res.get('title', 'NIL')}")
    print(f"Participant ID     : {res.get('participant_id', 'NIL')}")
    print(f"Unit               : {res.get('unit', 'NIL')}")
    print(f"Age                : {res.get('age', 'NIL')}")
    print(f"Appointment        : {res.get('appointment', 'NIL')}")
    print(f"Email              : {res.get('email', 'NIL')}")
    print(f"Sex                : {res.get('sex', 'NIL')}")
    print(f"Date               : {res.get('date', 'NIL')}")
    print(f"Height             : {res.get('height', 'NIL')} m")
    print()

    # BODY WEIGHT
    print("Body Weight Status:")
    print(f"  Current weight   : {res.get('weight_current', 'NIL')} kg")
    print(f"  Ideal weight     : {res.get('weight_ideal', 'NIL')} kg")
    print(f"  Excess weight    : {res.get('weight_excess', 'NIL')} kg")
    print(f"  Weight deficit   : {res.get('weight_deficit', 'NIL')} kg")
    print(f"  Weight status    : {res.get('weight_status', 'NIL')}")
    print()

    # BMI
    print("Body Mass Index (BMI) Status:")
    print(f"  Current BMI      : {res.get('bmi_current', 'NIL')}")
    print(f"  Ideal BMI range  : {res.get('bmi_ideal', 'NIL')}")
    print(f"  Excess BMI       : {res.get('bmi_excess', 'NIL'):.1f}")
    print(f"  BMI deficit      : {res.get('bmi_deficit', 'NIL'):.1f}")
    print(f"  BMI status       : {res.get('bmi_status', 'NIL')}")
    print()

    # CARDIO (CAGE-BASED)
    print("Cardiovascular Endurance Status (Cage-Based):")
    print(f"  Cage achieved    : {res.get('cardio_value', 'NIL')}")
    print(f"  Ideal cage       : {res.get('cardio_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('cardio_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('cardio_excess', 'NIL')}")
    print(f"  Status           : {res.get('cardio_status', 'NIL')}")
    print()

    # STEP-UP
    print("Cardiovascular Endurance 2 Status (Step-Up):")
    print(f"  Reps             : {res.get('step_up_value', 'NIL')}")
    print(f"  Ideal reps       : {res.get('step_up_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('step_up_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('step_up_excess', 'NIL')}")
    print(f"  Status           : {res.get('step_up_status', 'NIL')}")
    print()

    # PUSH-UP
    print("Muscular Strength Status (Push-Up):")
    print(f"  Reps             : {res.get('push_up_value', 'NIL')}")
    print(f"  Ideal reps       : {res.get('push_up_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('push_up_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('push_up_excess', 'NIL')}")
    print(f"  Status           : {res.get('push_up_status', 'NIL')}")
    print()

    # SIT-UP
    print("Muscular Endurance Status (Sit-Up):")
    print(f"  Reps             : {res.get('sit_up_value', 'NIL')}")
    print(f"  Ideal reps       : {res.get('sit_up_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('sit_up_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('sit_up_excess', 'NIL')}")
    print(f"  Status           : {res.get('sit_up_status', 'NIL')}")
    print()

    # CHIN-UP
    print("Muscular Endurance 2 Status (Chin-Up):")
    print(f"  Reps             : {res.get('chin_up_value', 'NIL')}")
    print(f"  Ideal reps       : {res.get('chin_up_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('chin_up_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('chin_up_excess', 'NIL')}")
    print(f"  Status           : {res.get('chin_up_status', 'NIL')}")
    print()

    # SIT & REACH
    print("SRS (Sit & Reach):")
    print(f"  Reach (cm)       : {res.get('sit_reach_value', 'NIL')}")
    print(f"  Ideal reach      : {res.get('sit_reach_ideal', 'NIL')}")
    print(f"  Deficit          : {res.get('sit_reach_deficit', 'NIL')}")
    print(f"  Excess           : {res.get('sit_reach_excess', 'NIL')}")
    print(f"  Status           : {res.get('sit_reach_status', 'NIL')}")
    print()

    # POINTS
    print("Points Breakdown:")
    print(f"  Cardio            : {res.get('cardio_points', 0):2d} pts")
    print(f"  Step-Up           : {res.get('step_up_points', 0):2d} pts")
    print(f"  Push-Up           : {res.get('push_up_points', 0):2d} pts")
    print(f"  Sit-Up            : {res.get('sit_up_points', 0):2d} pts")
    print(f"  Chin-Up           : {res.get('chin_up_points', 0):2d} pts")
    print(f"  Sit & Reach       : {res.get('sit_reach_points', 0):2d} pts")
    print(f"  BMI               : {res.get('bmi_points', 0):2d} pts")
    print()

    # FINAL RESULT
    print(f"Aggregate Score    : {res.get('aggregate', 'NIL')}")
    print(f"Grade              : {res.get('grade', 'NIL')}")
    print(f"Prescription       : Duration → {res.get('prescription_duration', 'NIL')}")
    print(f"                   : Days     → {res.get('prescription_days', 'NIL')}")
    print(f"Recommended Activity : {res.get('recommended_activity', 'NIL')}")
    print(f"Evaluator Name     : {res.get('evaluator_name', 'NIL')}")
    print(f"Evaluator Title    : {res.get('evaluator_title', 'NIL')}")

    print("═" * 70 + "\n")
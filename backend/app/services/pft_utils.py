from typing import Dict
from app.services.models import Evaluation
from app.services.core_cal import compute_naf_pft


def recompute_pft_from_record(record: Evaluation) -> Dict:
    """Re-run the PFT calculation using an evaluation's stored inputs."""
    input_data = {
        "year": record.year,
        "full_name": record.participant_name,
        "title": record.participant_title,
        "participant_id": record.participant.participant_id if record.participant else None,
        "unit": record.participant_unit,
        "appointment": record.participant_appointment,
        "date": record.date,
        "email": record.participant_email,
        "age": record.age,
        "sex": record.sex.capitalize() if record.sex else None,
        "height": record.height,
        "weight": record.weight_current,
        "cardio_cage": record.cardio_cage,
        "step_up": record.step_up_value,
        "push_up": record.push_up_value,
        "sit_up": record.sit_up_value,
        "chin_up": record.chin_up_value,
        "sit_reach": record.sit_reach_value,
    }
    result = compute_naf_pft(input_data)
    if "error" in result:
        raise ValueError(f"PFT recomputation failed: {result['error']}")
    return result


def apply_computed_fields_to_record(record: Evaluation, computed: Dict) -> None:
    field_mapping = {
        "weight_ideal": "weight_ideal", "weight_excess": "weight_excess", "weight_deficit": "weight_deficit", "weight_status": "weight_status",
        "bmi_current": "bmi_current", "bmi_ideal": "bmi_ideal", "bmi_excess": "bmi_excess", "bmi_deficit": "bmi_deficit", "bmi_status": "bmi_status", "bmi_points": "bmi_points",
        "cardio_type": "cardio_type", "cardio_value": "cardio_value", "cardio_ideal": "cardio_ideal", "cardio_deficit": "cardio_deficit", "cardio_excess": "cardio_excess", "cardio_status": "cardio_status", "cardio_points": "cardio_points",
        "step_up_value": "step_up_value", "step_up_ideal": "step_up_ideal", "step_up_deficit": "step_up_deficit", "step_up_excess": "step_up_excess", "step_up_status": "step_up_status", "step_up_points": "step_up_points",
        "push_up_value": "push_up_value", "push_up_ideal": "push_up_ideal", "push_up_deficit": "push_up_deficit", "push_up_excess": "push_up_excess", "push_up_status": "push_up_status", "push_up_points": "push_up_points",
        "sit_up_value": "sit_up_value", "sit_up_ideal": "sit_up_ideal", "sit_up_deficit": "sit_up_deficit", "sit_up_excess": "sit_up_excess", "sit_up_status": "sit_up_status", "sit_up_points": "sit_up_points",
        "chin_up_value": "chin_up_value", "chin_up_ideal": "chin_up_ideal", "chin_up_deficit": "chin_up_deficit", "chin_up_excess": "chin_up_excess", "chin_up_status": "chin_up_status", "chin_up_points": "chin_up_points",
        "sit_reach_value": "sit_reach_value", "sit_reach_ideal": "sit_reach_ideal", "sit_reach_deficit": "sit_reach_deficit", "sit_reach_excess": "sit_reach_excess", "sit_reach_status": "sit_reach_status", "sit_reach_points": "sit_reach_points",
        "aggregate": "aggregate", "grade": "grade", "prescription_duration": "prescription_duration", "prescription_days": "prescription_days", "recommended_activity": "recommended_activity",
    }
    for source, target in field_mapping.items():
        if source in computed and getattr(computed, source, computed.get(source)) is not None:
            setattr(record, target, computed[source])

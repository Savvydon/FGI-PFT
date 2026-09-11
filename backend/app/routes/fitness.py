from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func, text
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.schemas import InputSchema, PFTUpdate
from app.services.database import get_db
from app.services.models import Evaluation, Participant, User
from app.services.auth import require_admin, require_evaluator
from app.services.pft_utils import recompute_pft_from_record, apply_computed_fields_to_record
from app.services.naf_pft import compute_naf_pft

router = APIRouter(prefix="/api", tags=["PFT"])


def evaluation_to_dict(e: Evaluation) -> dict:
    participant = e.participant
    return {
        "id": e.id,
        "evaluation_id": e.id,
        "participant_id": participant.participant_id if participant else None,
        "participant_db_id": participant.id if participant else None,
        "full_name": e.participant_name or (participant.full_name if participant else None),
        "title": e.participant_title or (participant.title if participant else None),
        "unit": e.participant_unit or (participant.unit if participant else None),
        "appointment": e.participant_appointment or (participant.appointment if participant else None),
        "email": e.participant_email or (participant.email if participant else None),
        "year": e.year, "date": e.date, "age": e.age, "sex": e.sex, "height": e.height,
        "weight_current": e.weight_current, "weight_ideal": e.weight_ideal, "weight_excess": e.weight_excess,
        "weight_deficit": e.weight_deficit, "weight_status": e.weight_status,
        "bmi_current": e.bmi_current, "bmi_status": e.bmi_status, "bmi_ideal": e.bmi_ideal,
        "bmi_excess": e.bmi_excess, "bmi_deficit": e.bmi_deficit, "bmi_points": e.bmi_points,
        "cardio_cage": e.cardio_cage, "cardio_type": e.cardio_type, "cardio_value": e.cardio_value,
        "cardio_ideal": e.cardio_ideal, "cardio_status": e.cardio_status, "cardio_points": e.cardio_points,
        "step_up_value": e.step_up_value, "step_up_ideal": e.step_up_ideal, "step_up_status": e.step_up_status,
        "step_up_excess": e.step_up_excess, "step_up_deficit": e.step_up_deficit, "step_up_points": e.step_up_points,
        "push_up_value": e.push_up_value, "push_up_ideal": e.push_up_ideal, "push_up_excess": e.push_up_excess,
        "push_up_deficit": e.push_up_deficit, "push_up_status": e.push_up_status, "push_up_points": e.push_up_points,
        "sit_up_value": e.sit_up_value, "sit_up_ideal": e.sit_up_ideal, "sit_up_excess": e.sit_up_excess,
        "sit_up_deficit": e.sit_up_deficit, "sit_up_status": e.sit_up_status, "sit_up_points": e.sit_up_points,
        "chin_up_value": e.chin_up_value, "chin_up_ideal": e.chin_up_ideal, "chin_up_status": e.chin_up_status,
        "chin_up_excess": e.chin_up_excess, "chin_up_deficit": e.chin_up_deficit, "chin_up_points": e.chin_up_points,
        "sit_reach_value": e.sit_reach_value, "sit_reach_ideal": e.sit_reach_ideal, "sit_reach_status": e.sit_reach_status,
        "sit_reach_excess": e.sit_reach_excess, "sit_reach_deficit": e.sit_reach_deficit, "sit_reach_points": e.sit_reach_points,
        "aggregate": e.aggregate, "grade": e.grade, "prescription_duration": e.prescription_duration,
        "prescription_days": e.prescription_days, "recommended_activity": e.recommended_activity,
        "evaluator_id": e.evaluator_id, "evaluator_name": e.evaluator_name, "evaluator_title": e.evaluator_title,
        "admin_id": e.admin_id,
        "admin_name": e.admin_user.full_name if e.admin_user else None,
        "created_at": e.created_at.isoformat() if e.created_at else None,
        "updated_at": e.updated_at.isoformat() if e.updated_at else None,
        "notes": e.notes,
    }


def can_admin_access_evaluation(user: User, evaluation: Evaluation) -> bool:
    return user.role == "super_admin" or evaluation.admin_id == user.id


def scoped_evaluations(db: Session, user: User):
    q = db.query(Evaluation).options(joinedload(Evaluation.participant), joinedload(Evaluation.admin_user))
    if user.role != "super_admin":
        q = q.filter(Evaluation.admin_id == user.id)
    return q


# PARTICIPANT LIST 
@router.get("/participants", response_model=dict)
def get_participants(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return one row per participant, with latest evaluation summary."""
    q = db.query(Participant).join(Evaluation)
    if current_user.role != "super_admin":
        q = q.filter(Evaluation.admin_id == current_user.id)
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(or_(Participant.participant_id.ilike(term), Participant.full_name.ilike(term), Participant.email.ilike(term)))
    total = q.distinct().count()
    participants = q.distinct().order_by(Participant.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    out = []
    for p in participants:
        eq = db.query(Evaluation).filter(Evaluation.participant_id == p.id)
        if current_user.role != "super_admin": eq = eq.filter(Evaluation.admin_id == current_user.id)
        latest = eq.order_by(Evaluation.created_at.desc()).first()
        count = eq.count()
        out.append({
            "id": p.id, "participant_id": p.participant_id, "full_name": p.full_name, "title": p.title,
            "email": p.email, "unit": p.unit, "appointment": p.appointment, "evaluations_count": count,
            "latest_evaluation_id": latest.id if latest else None,
            "latest_year": latest.year if latest else None, "latest_score": latest.aggregate if latest else None,
            "latest_grade": latest.grade if latest else None,
            "latest_date": latest.date if latest else None,
        })
    return {
        "items": out,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


# PARTICIPANT FULL RECORD
@router.get("/participants/{participant_id}", response_model=dict)
def get_participant_record(participant_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    participant = db.query(Participant).filter(Participant.participant_id == participant_id.strip().upper()).first()
    if not participant:
        raise HTTPException(404, "Participant not found")
    evaluations = scoped_evaluations(db, current_user).filter(Evaluation.participant_id == participant.id).order_by(Evaluation.created_at.desc()).all()
    if not evaluations:
        raise HTTPException(403, "You do not have permission to access this participant")
    return {
        "participant": {"id": participant.id, "participant_id": participant.participant_id, "full_name": participant.full_name,
                        "title": participant.title, "email": participant.email, "unit": participant.unit,
                        "appointment": participant.appointment, "created_at": participant.created_at.isoformat() if participant.created_at else None,
                        "updated_at": participant.updated_at.isoformat() if participant.updated_at else None},
        "evaluations": [evaluation_to_dict(e) for e in evaluations],
        "evaluations_count": len(evaluations),
    }


# EVALUATION DETAIL
@router.get("/pft-results/{result_id}", response_model=dict)
def get_pft_result_by_id(result_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    e = db.query(Evaluation).options(joinedload(Evaluation.participant), joinedload(Evaluation.admin_user)).filter(Evaluation.id == result_id).first()
    if not e:
        raise HTTPException(404, "Evaluation not found")
    if not can_admin_access_evaluation(current_user, e):
        raise HTTPException(403, "You do not have permission to access this evaluation")
    return evaluation_to_dict(e)


# EVALUATIONS FOR A PARTICIPANT 
@router.get("/pft-results/participant/{participant_id}", response_model=List[dict])
def get_pft_results_by_participant_id(participant_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    participant = db.query(Participant).filter(Participant.participant_id == participant_id.strip().upper()).first()
    if not participant:
        raise HTTPException(404, "Participant not found")
    evaluations = scoped_evaluations(db, current_user).filter(Evaluation.participant_id == participant.id).order_by(Evaluation.created_at.desc()).all()
    if not evaluations:
        raise HTTPException(404, f"No evaluations found for participant ID {participant_id}")
    return [evaluation_to_dict(e) for e in evaluations]


# ALL EVALUATIONS (kept for compatibility/reports) 
@router.get("/pft-results", response_model=List[dict])
def get_all_pft_results(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    evaluations = scoped_evaluations(db, current_user).order_by(Evaluation.created_at.desc()).limit(1000).all()
    return [evaluation_to_dict(e) for e in evaluations]


# CREATE EVALUATION 
@router.post("/compute")
def compute_pft(data: InputSchema, db: Session = Depends(get_db), current_user: User = Depends(require_evaluator)):
    if not (2000 <= data.year <= 2100):
        raise HTTPException(422, "Year must be between 2000 and 2100")
    if current_user.assigned_admin_id is not None:
        admin = db.query(User).filter(User.id == current_user.assigned_admin_id, User.role == "admin").first()
        if admin and not admin.is_active:
            raise HTTPException(403, "Your assigned admin is currently ineligible. Contact the Super Admin.")

    pid = data.participant_id.strip().upper() if data.participant_id else None
    if pid:
        participant = db.query(Participant).filter(Participant.participant_id == pid).first()
        if not participant:
            raise HTTPException(404, f"Participant {pid} not found")
    else:
        # Generate the public Participant ID in the backend.
        # PostgreSQL's nextval() is concurrency-safe, so two evaluators
        # creating participants at the same time cannot receive the same ID.
        try:
            next_number = db.execute(
                text("SELECT nextval('participant_number_seq')")
            ).scalar_one()
        except Exception:
            db.rollback()
            raise HTTPException(
                500,
                "Participant ID generation is not configured. "
                "Ensure the participant_number_seq sequence exists in the database."
            )

        generated_participant_id = f"PFT-{int(next_number):06d}"

        participant = Participant(
            participant_id=generated_participant_id,
            full_name=data.full_name.strip(),
            title=data.title.strip(),
            email=(data.email or "").strip() or None,
            unit=data.unit.strip(),
            appointment=data.appointment.strip(),
        )
        db.add(participant)
        db.flush()
        db.refresh(participant)

    # Keep the participant profile current while preserving historical snapshots on evaluations.
    participant.full_name = data.full_name.strip()
    participant.title = data.title.strip()
    participant.email = (data.email or "").strip() or None
    participant.unit = data.unit.strip()
    participant.appointment = data.appointment.strip()

    duplicate = db.query(Evaluation).filter(Evaluation.participant_id == participant.id, Evaluation.year == data.year).first()
    if duplicate:
        db.rollback()
        raise HTTPException(409, f"An evaluation already exists for {participant.participant_id} in {data.year}.")

    data_dict = data.model_dump()
    data_dict["participant_id"] = participant.participant_id
    result = compute_naf_pft(data_dict)
    if "error" in result:
        db.rollback()
        raise HTTPException(400, result["error"])

    db_data = {k: v for k, v in result.items() if v is not None}
    db_data.pop("participant_id", None)
    db_data["participant_id"] = participant.id
    db_data["participant_name"] = result.get("full_name")
    db_data["participant_title"] = result.get("title")
    db_data["participant_unit"] = result.get("unit")
    db_data["participant_appointment"] = result.get("appointment")
    db_data["participant_email"] = result.get("email")
    for k in ["full_name", "title", "unit", "appointment", "email"]: db_data.pop(k, None)
    db_data["evaluator_id"] = current_user.id
    db_data["evaluator_name"] = current_user.full_name
    db_data["evaluator_title"] = current_user.title
    db_data["admin_id"] = current_user.assigned_admin_id

    try:
        evaluation = Evaluation(**{k: v for k, v in db_data.items() if hasattr(Evaluation, k)})
        db.add(evaluation)
        db.commit(); db.refresh(evaluation)
        return {**result, "id": evaluation.id, "evaluation_id": evaluation.id, "participant_id": participant.participant_id,
                "evaluator_name": current_user.full_name, "evaluator_title": current_user.title,
                "message": "PFT evaluation computed and saved successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An evaluation for this participant and year already exists.")
    except Exception as exc:
        db.rollback()
        raise HTTPException(500, f"Database save failed: {exc}")


# UPDATE EVALUATION
@router.put("/pft-results/{result_id}", response_model=dict)
def update_pft_result(result_id: int, update_data: PFTUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    evaluation = db.query(Evaluation).options(joinedload(Evaluation.participant)).filter(Evaluation.id == result_id).first()
    if not evaluation:
        raise HTTPException(404, "Evaluation not found")
    if not can_admin_access_evaluation(current_user, evaluation):
        raise HTTPException(403, "You do not have permission to modify this evaluation")

    updates = update_data.model_dump(exclude_unset=True)
    for protected in ["evaluator_name", "evaluator_title", "participant_id"]: updates.pop(protected, None)
    participant_fields = {"full_name": "participant_name", "title": "participant_title", "unit": "participant_unit", "appointment": "participant_appointment", "email": "participant_email"}
    updated_fields = []
    for key, value in updates.items():
        if value is None: continue
        if key in participant_fields:
            setattr(evaluation, participant_fields[key], value.strip() if isinstance(value, str) else value)
            setattr(evaluation.participant, key, value.strip() if isinstance(value, str) else value)
        elif key == "weight":
            evaluation.weight_current = float(value); updated_fields.append("weight")
        elif key in {"step_up", "push_up", "sit_up", "chin_up"}:
            setattr(evaluation, f"{key}_value", int(value)); updated_fields.append(key)
        elif key == "sit_reach":
            evaluation.sit_reach_value = float(value); updated_fields.append(key)
        elif hasattr(evaluation, key):
            setattr(evaluation, key, value); updated_fields.append(key)

    try:
        if evaluation.sex and evaluation.age and evaluation.height and evaluation.weight_current:
            computed = recompute_pft_from_record(evaluation)
            apply_computed_fields_to_record(evaluation, computed)
        db.commit(); db.refresh(evaluation)
        return {**evaluation_to_dict(evaluation), "updated_fields": updated_fields, "message": "Evaluation updated successfully"}
    except ValueError as exc:
        db.rollback(); raise HTTPException(400, str(exc))
    except Exception as exc:
        db.rollback(); raise HTTPException(500, f"Failed to update evaluation: {exc}")


#  DELETE EVALUATION 
@router.delete("/pft-results/{result_id}")
def delete_pft_result(result_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    evaluation = db.query(Evaluation).filter(Evaluation.id == result_id).first()
    if not evaluation: raise HTTPException(404, "Evaluation not found")
    if not can_admin_access_evaluation(current_user, evaluation): raise HTTPException(403, "You do not have permission to delete this evaluation")
    db.delete(evaluation); db.commit()
    return {"message": f"Evaluation {result_id} deleted successfully"}

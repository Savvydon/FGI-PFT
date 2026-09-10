from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.services.database import get_db
from app.services.models import User, Evaluation
from app.services.auth import require_super_admin, get_password_hash, set_session_cookie
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter(prefix="/superadmin", tags=["superadmin"])

# ---------- CONFIGURATION ----------
SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "").strip().lower()
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "")

if not SUPERADMIN_EMAIL or not SUPERADMIN_PASSWORD:
    raise ValueError("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD environment variables are required")

# ---------- SCHEMAS ----------
class UserCreate(BaseModel):
    email: str
    full_name: str
    title: str
    password: str
    role: str
    assigned_admin_id: Optional[int] = None  # ← NEW: For direct assignment during creation

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    title: str
    role: str
    assigned_admin_id: Optional[int] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class EvaluatorWithCount(BaseModel):
    id: int
    email: str
    full_name: str
    title: str
    assigned_admin_id: Optional[int] = None
    assigned_admin_name: Optional[str] = None
    evaluations_count: int
    is_active: bool = True

class AssignEvaluatorRequest(BaseModel):
    evaluator_id: int
    admin_id: int

# NEW: Schema for updating user details
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

# ---------- HELPER: Convert User to dict with string datetime ----------
def user_to_dict(user: User) -> dict:
    """Convert User model to dict with ISO format datetime string"""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "title": user.title,
        "role": user.role,
        "assigned_admin_id": user.assigned_admin_id,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

# ---------- SUPER ADMIN LOGIN ----------
@router.post("/login")
def superadmin_login(response: Response, credentials: dict, db: Session = Depends(get_db)):
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "")
    if email != SUPERADMIN_EMAIL or password != SUPERADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid super admin credentials")

    super_admin = db.query(User).filter(User.role == "super_admin").first()
    if not super_admin:
        super_admin = User(email=SUPERADMIN_EMAIL, full_name="Super Administrator", title="System Administrator", hashed_password=get_password_hash(SUPERADMIN_PASSWORD), role="super_admin")
        db.add(super_admin)
    else:
        super_admin.email = SUPERADMIN_EMAIL
        super_admin.hashed_password = get_password_hash(SUPERADMIN_PASSWORD)
        super_admin.is_active = True
    db.commit(); db.refresh(super_admin)

    from app.services.auth import create_access_token
    access_token = create_access_token(data={"sub": super_admin.email})
    set_session_cookie(response, access_token)
    return {"access_token": access_token, "token_type": "bearer", "role": "super_admin", "full_name": super_admin.full_name, "title": super_admin.title, "email": super_admin.email}

# ---------- CREATE EVALUATOR (with optional admin assignment) ----------
@router.post("/evaluators", response_model=UserOut)
def create_evaluator(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    if user_data.role != "evaluator":
        raise HTTPException(400, "Role must be 'evaluator' for this endpoint")

    email = user_data.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(409, f"Email address '{email}' already registered as {existing.role}")

    # ← NEW: Validate assigned_admin_id if provided
    if user_data.assigned_admin_id:
        admin = db.query(User).filter(
            User.id == user_data.assigned_admin_id,
            User.role == "admin"
        ).first()
        if not admin:
            raise HTTPException(404, "Selected admin not found")
        if not admin.is_active:
            raise HTTPException(403, "Cannot assign an evaluator to an ineligible admin")

    new_user = User(
        email=email,
        full_name=user_data.full_name.strip(),
        title=user_data.title.strip(),
        hashed_password=get_password_hash(user_data.password),
        role="evaluator",
        assigned_admin_id=user_data.assigned_admin_id  # ← NEW
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return user_to_dict(new_user)

#  UPDATE EVALUATOR 
@router.put("/evaluators/{evaluator_id}", response_model=UserOut)
def update_evaluator(
    evaluator_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Update evaluator details (name, title, email, status)."""
    evaluator = db.query(User).filter(
        User.id == evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    if data.email is not None:
        new_email = data.email.strip().lower()
        existing = db.query(User).filter(User.email == new_email, User.id != evaluator_id).first()
        if existing:
            raise HTTPException(409, "Email address already in use")
        evaluator.email = new_email

    if data.full_name is not None:
        evaluator.full_name = data.full_name.strip()
    if data.title is not None:
        evaluator.title = data.title.strip()
    if data.is_active is not None:
        evaluator.is_active = data.is_active

    db.commit()
    db.refresh(evaluator)
    return user_to_dict(evaluator)

#  TOGGLE EVALUATOR STATUS
@router.post("/evaluators/{evaluator_id}/toggle-status")
def toggle_evaluator_status(
    evaluator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Toggle evaluator eligible / ineligible (is_active)"""
    evaluator = db.query(User).filter(
        User.id == evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    evaluator.is_active = not evaluator.is_active
    db.commit()
    db.refresh(evaluator)

    return {
        "id": evaluator.id,
        "is_active": evaluator.is_active,
        "message": f"Evaluator {'activated' if evaluator.is_active else 'deactivated'} successfully"
    }

# CREATE ADMIN 
@router.post("/admins", response_model=UserOut)
def create_admin(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    if user_data.role != "admin":
        raise HTTPException(400, "Role must be 'admin' for this endpoint")

    email = user_data.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(409, f"Email address '{email}' already registered as {existing.role}")

    new_user = User(
        email=email,
        full_name=user_data.full_name.strip(),
        title=user_data.title.strip(),
        hashed_password=get_password_hash(user_data.password),
        role="admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return user_to_dict(new_user)

# UPDATE ADMIN 
@router.put("/admins/{admin_id}", response_model=UserOut)
def update_admin(
    admin_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Update admin details (name, title, email, status)."""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    if data.email is not None:
        new_email = data.email.strip().lower()
        existing = db.query(User).filter(User.email == new_email, User.id != admin_id).first()
        if existing:
            raise HTTPException(409, "Email address already in use")
        admin.email = new_email

    if data.full_name is not None:
        admin.full_name = data.full_name.strip()
    if data.title is not None:
        admin.title = data.title.strip()
    if data.is_active is not None:
        admin.is_active = data.is_active

    db.commit()
    db.refresh(admin)
    return user_to_dict(admin)

# TOGGLE ADMIN STATUS
@router.post("/admins/{admin_id}/toggle-status")
def toggle_admin_status(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Toggle admin eligible / ineligible (is_active)"""
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    admin.is_active = not admin.is_active
    db.commit()
    db.refresh(admin)

    return {
        "id": admin.id,
        "is_active": admin.is_active,
        "message": f"Admin {'activated' if admin.is_active else 'deactivated'} successfully"
    }

# ASSIGN EVALUATOR TO ADMIN 
@router.post("/assign-evaluator")
def assign_evaluator_to_admin(
    data: AssignEvaluatorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Assign an evaluator to an admin."""
    evaluator = db.query(User).filter(
        User.id == data.evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    admin = db.query(User).filter(
        User.id == data.admin_id,
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    if not admin.is_active:
        raise HTTPException(403, "Cannot assign an evaluator to an ineligible admin")

    # Only the evaluator's CURRENT assignment changes here. Existing PFT
    # results retain their historical admin_id and therefore remain with the
    # previous admin. New evaluations will snapshot this new admin_id.
    evaluator.assigned_admin_id = data.admin_id
    db.commit()
    db.refresh(evaluator)

    return {
        "message": f"Evaluator {evaluator.full_name} assigned to Admin {admin.full_name}",
        "evaluator": user_to_dict(evaluator),
        "admin": user_to_dict(admin)
    }

# REMOVE EVALUATOR FROM ADMIN
@router.post("/unassign-evaluator/{evaluator_id}")
def unassign_evaluator(
    evaluator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Remove evaluator from admin assignment."""
    evaluator = db.query(User).filter(
        User.id == evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    evaluator.assigned_admin_id = None
    db.commit()
    db.refresh(evaluator)

    return {
        "message": f"Evaluator {evaluator.full_name} unassigned",
        "evaluator": user_to_dict(evaluator)
    }

#LIST EVALUATORS WITH EVALUATION COUNTS 
@router.get("/evaluators", response_model=List[EvaluatorWithCount])
def get_evaluators(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    results = db.query(
        User,
        func.count(Evaluation.id).label('eval_count')
    ).outerjoin(
        Evaluation,
        User.id == Evaluation.evaluator_id
    ).filter(
        User.role == "evaluator"
    ).group_by(User.id).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "title": user.title,
            "assigned_admin_id": user.assigned_admin_id,
            "assigned_admin_name": user.admin.full_name if user.admin else None,
            "evaluations_count": eval_count,
            "is_active": user.is_active
        }
        for user, eval_count in results
    ]

# LIST ADMINS WITH CERTIFICATE COUNTS 
@router.get("/admins", response_model=List[dict])
def get_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get all admins with their certificate counts"""
    from app.services.models import Certificate

    admins = db.query(User).filter(User.role == "admin").all()

    result = []
    for admin in admins:
        cert_count = db.query(func.count(Certificate.id)).filter(
            Certificate.issued_by == admin.id
        ).scalar()

        # Count assigned evaluators
        assigned_count = db.query(func.count(User.id)).filter(
            User.assigned_admin_id == admin.id,
            User.role == "evaluator"
        ).scalar()

        admin_dict = user_to_dict(admin)
        admin_dict["certificates_count"] = cert_count
        admin_dict["assigned_evaluators_count"] = assigned_count
        result.append(admin_dict)

    return result

# GET SINGLE EVALUATOR DETAILS (FIXED)
@router.get("/evaluators/{evaluator_id}")
def get_evaluator_details(
    evaluator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    evaluator = db.query(User).filter(
        User.id == evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    evaluations = db.query(Evaluation).filter(
        Evaluation.evaluator_id == evaluator_id
    ).order_by(Evaluation.created_at.desc()).all()

    # FIXED: Manually query the assigned admin instead of relying on lazy relationship
    assigned_admin = None
    if evaluator.assigned_admin_id:
        admin = db.query(User).filter(
            User.id == evaluator.assigned_admin_id,
            User.role == "admin"
        ).first()
        if admin:
            assigned_admin = {
                "id": admin.id,
                "email": admin.email,
                "full_name": admin.full_name,
                "title": admin.title,
                "role": admin.role,
            }

    return {
        "evaluator": user_to_dict(evaluator),
        "assigned_admin": assigned_admin,
        "evaluations_count": len(evaluations),
        "evaluations": [
            {
                "id": eval.id,
                "participant_id": eval.participant.participant_id if eval.participant else None,
                "full_name": eval.participant_name,
                "title": eval.participant_title,
                "unit": eval.participant_unit,
                "year": eval.year,
                "grade": eval.grade,
                "created_at": eval.created_at.isoformat() if eval.created_at else None
            }
            for eval in evaluations
        ]
    }

# GET SINGLE ADMIN DETAILS WITH CERTIFICATES
@router.get("/admins/{admin_id}")
def get_admin_details(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    """Get admin details with certificates issued"""
    from app.services.models import Certificate

    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    # Get certificates issued by this admin
    certificates = db.query(Certificate).filter(
        Certificate.issued_by == admin_id
    ).order_by(Certificate.created_at.desc()).all()

    # Get assigned evaluators
    assigned_evaluators = db.query(User).filter(
        User.assigned_admin_id == admin_id,
        User.role == "evaluator"
    ).all()

    return {
        "admin": user_to_dict(admin),
        "certificates_count": len(certificates),
        "certificates": [
            {
                "id": cert.id,
                "certificate_number": cert.certificate_number,
                "personnel_name": cert.personnel_name,
                "personnel_participant_id": cert.personnel_participant_id,
                "personnel_title": cert.personnel_title,
                "personnel_unit": cert.personnel_unit,
                "status": cert.status,
                "created_at": cert.created_at.isoformat() if cert.created_at else None
            }
            for cert in certificates
        ],
        "assigned_evaluators": [
            {
                "id": ev.id,
                "email": ev.email,
                "full_name": ev.full_name,
                "title": ev.title
            }
            for ev in assigned_evaluators
        ]
    }

# DELETE EVALUATOR
@router.delete("/evaluators/{evaluator_id}")
def delete_evaluator(
    evaluator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    evaluator = db.query(User).filter(
        User.id == evaluator_id,
        User.role == "evaluator"
    ).first()

    if not evaluator:
        raise HTTPException(404, "Evaluator not found")

    # Evaluator IDs are referenced by historical PFT records. Do not allow a
    # delete that would destroy the identity/history relationship. Use the
    # eligibility toggle for suspension/retirement instead.
    historical_count = db.query(func.count(Evaluation.id)).filter(
        Evaluation.evaluator_id == evaluator_id
    ).scalar()
    if historical_count:
        raise HTTPException(
            status_code=409,
            detail=(
                "This evaluator has historical PFT records and cannot be deleted. "
                "Make the evaluator ineligible instead."
            )
        )

    db.delete(evaluator)
    db.commit()
    return {"message": f"Evaluator {evaluator.email} deleted successfully"}

# DELETE ADMIN 
@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(404, "Admin not found")

    historical_results = db.query(func.count(Evaluation.id)).filter(
        Evaluation.admin_id == admin_id
    ).scalar()

    from app.services.models import Certificate
    historical_certificates = db.query(func.count(Certificate.id)).filter(
        Certificate.issued_by == admin_id
    ).scalar()

    if historical_results or historical_certificates:
        raise HTTPException(
            status_code=409,
            detail=(
                "This admin has historical records/certificates and cannot be deleted. "
                "Make the admin ineligible instead so the historical ownership is preserved."
            )
        )

    # No historical data exists, so it is safe to remove the account.
    db.query(User).filter(User.assigned_admin_id == admin_id).update(
        {"assigned_admin_id": None}
    )

    db.delete(admin)
    db.commit()
    return {"message": f"Admin {admin.email} deleted successfully"}

# GET ALL PFT RESULTS 
@router.get("/pft-results")
def get_all_pft_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    from app.routes.fitness import evaluation_to_dict
    results = db.query(Evaluation).order_by(Evaluation.created_at.desc()).limit(1000).all()
    return [evaluation_to_dict(r) for r in results]

# GET SINGLE PFT RESULT
@router.get("/pft-results/{result_id}")
def get_pft_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    from app.routes.fitness import evaluation_to_dict
    result = db.query(Evaluation).filter(Evaluation.id == result_id).first()
    if not result:
        raise HTTPException(404, "Evaluation not found")
    return evaluation_to_dict(result)

# UPDATE PFT RESULT
@router.put("/pft-results/{result_id}")
def update_pft_result(
    result_id: int,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    from app.services.pft_utils import recompute_pft_from_record, apply_computed_fields_to_record
    result = db.query(Evaluation).filter(Evaluation.id == result_id).first()
    if not result:
        raise HTTPException(404, "Evaluation not found")
    participant = result.participant
    updates = {k: v for k, v in update_data.items() if v is not None}
    for protected in ["evaluator_name", "evaluator_title", "evaluator_id", "admin_id", "participant_id", "id", "created_at", "updated_at"]:
        updates.pop(protected, None)
    participant_map = {"full_name": "participant_name", "title": "participant_title", "unit": "participant_unit", "appointment": "participant_appointment", "email": "participant_email"}
    for key, value in updates.items():
        if key in participant_map:
            value = value.strip() if isinstance(value, str) else value
            setattr(result, participant_map[key], value)
            if participant: setattr(participant, key, value)
        elif key == "weight":
            result.weight_current = float(value)
        elif key in {"step_up", "push_up", "sit_up", "chin_up"}:
            setattr(result, f"{key}_value", int(value))
        elif key == "sit_reach":
            result.sit_reach_value = float(value)
        elif hasattr(result, key):
            setattr(result, key, value)
    try:
        if result.sex and result.age and result.height and result.weight_current:
            computed = recompute_pft_from_record(result)
            apply_computed_fields_to_record(result, computed)
        db.commit(); db.refresh(result)
        from app.routes.fitness import evaluation_to_dict
        return evaluation_to_dict(result)
    except ValueError as exc:
        db.rollback(); raise HTTPException(400, str(exc))
    except Exception as exc:
        db.rollback(); raise HTTPException(500, f"Failed to update evaluation: {exc}")

# DELETE PFT RESULT 
@router.delete("/pft-results/{result_id}")
def delete_pft_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = db.query(Evaluation).filter(Evaluation.id == result_id).first()
    if not result:
        raise HTTPException(404, "Result not found")

    # Delete associated certificate first to avoid foreign key violation
    from app.services.models import Certificate
    certificate = db.query(Certificate).filter(
        Certificate.evaluation_id == result_id
    ).first()

    if certificate:
        db.delete(certificate)
        db.flush()  # Flush to execute certificate deletion before PFT result

    db.delete(result)
    db.commit()
    return {"message": f"PFT result {result_id} deleted successfully"}


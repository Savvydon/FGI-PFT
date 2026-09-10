from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime

from app.schemas import CertificateCreate, CertificateUpdate, CertificateOut, CertificateCheckResponse
from app.services.database import get_db
from app.services.models import Certificate, Evaluation, User
from app.services.auth import get_current_user, require_admin, require_super_admin

router = APIRouter(prefix="/certificates", tags=["certificates"])

CERT_PREFIX = "NAF/786/HQ"
STARTING_NUMBER = 54991


def can_admin_access_result(admin_user: User, result: Evaluation, db: Session) -> bool:
    """
    Check whether an admin owns/accesses a PFT result.

    IMPORTANT: admin_id is a historical snapshot captured when the evaluation
    was created. It must be checked before the evaluator's *current*
    assigned_admin_id so that reassigning an evaluator never moves old work
    to the new admin.
    """
    if admin_user.role == "super_admin":
        return True

    # Primary rule: use the admin recorded at creation time.
    if result.admin_id is not None:
        return result.admin_id == admin_user.id

    # Legacy records created before admin_id was populated. These can only be
    # resolved using the evaluator's current assignment.
    if result.evaluator_id:
        evaluator = db.query(User).filter(
            User.id == result.evaluator_id,
            User.role == "evaluator"
        ).first()
        if evaluator and evaluator.assigned_admin_id == admin_user.id:
            return True

    # Last legacy fallback for records without evaluator_id.
    evaluator = db.query(User).filter(
        User.full_name == result.evaluator_name,
        User.title == result.evaluator_title,
        User.role == "evaluator"
    ).first()
    if evaluator and evaluator.assigned_admin_id == admin_user.id:
        return True

    return False


def can_admin_access_certificate(admin_user: User, cert: Certificate, db: Session) -> bool:
    """Check if admin can access a certificate."""
    if admin_user.role == "super_admin":
        return True

    # Admin can access if they issued the certificate
    if cert.issued_by == admin_user.id:
        return True

    # Or if the certificate is for a result from their assigned evaluator
    if cert.evaluation_id:
        result = db.query(Evaluation).filter(Evaluation.id == cert.evaluation_id).first()
        if result and can_admin_access_result(admin_user, result, db):
            return True

    return False


# HELPER: Generate Certificate Number 
def generate_certificate_number(db: Session) -> str:
    """
    Generate next certificate number atomically.
    Uses database query with locking to prevent race conditions.
    """
    # Get the highest existing number with proper parsing
    latest_cert = db.query(Certificate).order_by(Certificate.id.desc()).with_for_update().first()

    if latest_cert:
        try:
            num_part = latest_cert.certificate_number.split("HQ")[-1]
            next_num = int(num_part) + 1
        except (ValueError, AttributeError):
            next_num = STARTING_NUMBER
    else:
        next_num = STARTING_NUMBER

    return f"{CERT_PREFIX}{str(next_num).zfill(6)}"


# CREATE CERTIFICATE 
@router.post("/", response_model=CertificateOut)
def create_certificate(
    cert_data: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new certificate (Admin or Super Admin only)"""

    # Check PFT result exists
    evaluation = db.query(Evaluation).filter(Evaluation.id == cert_data.evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="PFT result not found")

    # Check permission
    if not can_admin_access_result(current_user, evaluation, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create a certificate for this record"
        )

    # Check if certificate already exists for this PFT
    existing = db.query(Certificate).filter(
        Certificate.evaluation_id == cert_data.evaluation_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Certificate already exists: {existing.certificate_number}"
        )

    # Generate certificate number atomically
    try:
        cert_number = generate_certificate_number(db)

        new_cert = Certificate(
            certificate_number=cert_number,
            evaluation_id=cert_data.evaluation_id,
            personnel_name=evaluation.participant_name,
            personnel_title=evaluation.participant_title,
            personnel_participant_id=evaluation.participant.participant_id,
            personnel_unit=evaluation.participant_unit,
            participated_in=cert_data.participated_in,
            status=cert_data.status,
            location=cert_data.location,
            issued_day=cert_data.issued_day,
            issued_month=cert_data.issued_month,
            issued_year=cert_data.issued_year,
            issued_by=current_user.id,
            issuer_name=current_user.full_name,
            issuer_title=current_user.title,
            # Initialize audit fields with creator info
            last_modified_by=current_user.id,
            last_modified_by_name=current_user.full_name,
            last_modified_at=datetime.utcnow()
        )

        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)

        return certificate_to_dict(new_cert)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Certificate number conflict. Please retry."
        )


# UPDATE CERTIFICATE 
@router.put("/{cert_id}", response_model=CertificateOut)
def update_certificate(
    cert_id: int,
    cert_data: CertificateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update certificate - Admin can only update certificates they issued
    or certificates for results from their assigned evaluators.
    """

    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Check permission
    if not can_admin_access_certificate(current_user, cert, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this certificate"
        )

    # Apply updates
    update_data = cert_data.model_dump(exclude_unset=True)

    # Fields that can be updated
    allowed_fields = [
        'participated_in', 'status', 'location', 
        'issued_day', 'issued_month', 'issued_year',
        'aoc_signatory', 'sports_officer_signatory',
        'personnel_name', 'personnel_title', 'personnel_participant_id', 'personnel_unit'
    ]

    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(cert, field, value)

    # Update audit fields
    cert.last_modified_by = current_user.id
    cert.last_modified_by_name = current_user.full_name
    cert.last_modified_at = datetime.utcnow()

    db.commit()
    db.refresh(cert)

    return certificate_to_dict(cert)


# HELPER: Convert Certificate to Dict 
def certificate_to_dict(cert: Certificate) -> dict:
    """Convert Certificate model to dictionary with proper datetime handling"""
    return {
        'id': cert.id,
        'certificate_number': cert.certificate_number,
        'evaluation_id': cert.evaluation_id,
        'personnel_name': cert.personnel_name,
        'personnel_title': cert.personnel_title,
        'personnel_participant_id': cert.personnel_participant_id,
        'personnel_unit': cert.personnel_unit,
        'participated_in': cert.participated_in,
        'status': cert.status,
        'location': cert.location,
        'issued_day': cert.issued_day,
        'issued_month': cert.issued_month,
        'issued_year': cert.issued_year,
        'issued_by': cert.issued_by,
        'issuer_name': cert.issuer_name,
        'issuer_title': cert.issuer_title,
        'aoc_signatory': cert.aoc_signatory,
        'sports_officer_signatory': cert.sports_officer_signatory,
        'last_modified_by': cert.last_modified_by,
        'last_modified_by_name': cert.last_modified_by_name,
        'last_modified_at': cert.last_modified_at.isoformat() if cert.last_modified_at else None,
        'created_at': cert.created_at.isoformat() if cert.created_at else None,
        'updated_at': cert.updated_at.isoformat() if cert.updated_at else None,
    }


# GET ALL CERTIFICATES
@router.get("/", response_model=List[CertificateOut])
def get_all_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    certs = db.query(Certificate).order_by(Certificate.created_at.desc()).all()
    return [certificate_to_dict(cert) for cert in certs]


# GET CERTIFICATE BY PFT RESULT
@router.get("/evaluation/{evaluation_id}", response_model=CertificateOut)
def get_certificate_by_pft(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cert = db.query(Certificate).filter(
        Certificate.evaluation_id == evaluation_id
    ).first()

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found for this PFT result")

    # Check permission
    if not can_admin_access_certificate(current_user, cert, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this certificate"
        )

    return certificate_to_dict(cert)


# CHECK IF CERTIFICATE EXISTS 
@router.get("/check/{evaluation_id}", response_model=CertificateCheckResponse)
def check_certificate_exists(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cert = db.query(Certificate).filter(
        Certificate.evaluation_id == evaluation_id
    ).first()

    if cert:
        return CertificateCheckResponse(
            exists=True,
            certificate_id=cert.id,
            certificate_number=cert.certificate_number
        )

    return CertificateCheckResponse(exists=False)


# GET CERTIFICATES BY ISSUER 
@router.get("/issuer/{admin_id}", response_model=List[CertificateOut])
def get_certificates_by_issuer(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    certs = db.query(Certificate).filter(
        Certificate.issued_by == admin_id
    ).order_by(Certificate.created_at.desc()).all()

    return [certificate_to_dict(cert) for cert in certs]


# GET CERTIFICATE COUNT
@router.get("/count/{admin_id}")
def get_certificate_count(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    count = db.query(func.count(Certificate.id)).filter(
        Certificate.issued_by == admin_id
    ).scalar()

    return {"admin_id": admin_id, "certificates_count": count}

# GET CERTIFICATE BY ID 
@router.get("/{cert_id}", response_model=CertificateOut)
def get_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Check permission
    if not can_admin_access_certificate(current_user, cert, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this certificate"
        )

    return certificate_to_dict(cert)


# DELETE CERTIFICATE 
@router.delete("/{cert_id}")
def delete_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    db.delete(cert)
    db.commit()

    return {"message": f"Certificate {cert.certificate_number} deleted successfully"}



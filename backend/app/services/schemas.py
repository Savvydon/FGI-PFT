from pydantic import BaseModel
from typing import Optional

# PFT INPUT SCHEMA (Evaluator Form Submission)
class InputSchema(BaseModel):
    year: int
    full_name: str
    title: str
    participant_id: Optional[str] = None
    unit: str

    email: Optional[str] = None
    appointment: str
    date: str

    age: int
    sex: str

    height: float
    weight: float

    cardio_cage: int

    step_up: int
    push_up: int
    sit_up: int
    chin_up: int

    sit_reach: int

    # evaluator_name and evaluator_title intentionally excluded
    # backend automatically attaches them from authenticated user

# ADMIN UPDATE SCHEMA
class PFTUpdate(BaseModel):
    year: Optional[int] = None
    full_name: Optional[str] = None
    title: Optional[str] = None
    unit: Optional[str] = None

    email: Optional[str] = None
    appointment: Optional[str] = None
    date: Optional[str] = None

    age: Optional[int] = None
    sex: Optional[str] = None

    height: Optional[float] = None
    weight: Optional[float] = None

    cardio_cage: Optional[int] = None

    step_up: Optional[int] = None
    push_up: Optional[int] = None
    sit_up: Optional[int] = None
    chin_up: Optional[int] = None

    sit_reach: Optional[int] = None

    evaluator_name: Optional[str] = None
    evaluator_title: Optional[str] = None

    notes: Optional[str] = None


# USER REGISTRATION SCHEMA (SELF REGISTRATION)
class UserRegister(BaseModel):
    email: str
    full_name: str
    title: str
    password: str


# AUTHENTICATION SCHEMAS
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    title: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None


# EMAIL LOGIN SCHEMA 
class UserLogin(BaseModel):
    email: str
    password: str


# USER RESPONSE SCHEMA
class UserOut(BaseModel):
    id: int
    full_name: str
    title: str
    role: str
    email: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True


# CERTIFICATE SCHEMAS 

class CertificateCreate(BaseModel):
    evaluation_id: int
    participated_in: str
    status: str  # Fit, Not Fit, Excused
    location: str
    issued_day: str
    issued_month: str
    issued_year: str


class CertificateUpdate(BaseModel):
    participated_in: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    issued_day: Optional[str] = None
    issued_month: Optional[str] = None
    issued_year: Optional[str] = None
    aoc_signatory: Optional[str] = None
    sports_officer_signatory: Optional[str] = None


class CertificateOut(BaseModel):
    id: int
    certificate_number: str
    evaluation_id: int
    personnel_name: str
    personnel_title: str
    personnel_participant_id: str
    personnel_unit: str
    participated_in: str
    status: str
    location: str
    issued_day: str
    issued_month: str
    issued_year: str
    issued_by: int
    issuer_name: str
    issuer_title: str
    aoc_signatory: Optional[str] = None
    sports_officer_signatory: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class CertificateCheckResponse(BaseModel):
    exists: bool
    certificate_id: Optional[int] = None
    certificate_number: Optional[str] = None


class CertificateListItem(BaseModel):
    """Simplified certificate info for list views"""
    id: int
    certificate_number: str
    personnel_name: str
    personnel_participant_id: str
    personnel_title: str
    personnel_unit: str
    status: str
    created_at: Optional[str] = None


class AdminCertificatesResponse(BaseModel):
    """Response for admin details page"""
    admin: UserOut
    certificates_count: int
    certificates: list[CertificateListItem]


# ASSIGNMENT SCHEMAS
class AssignEvaluatorRequest(BaseModel):
    evaluator_id: int
    admin_id: int


class EvaluatorWithAdmin(BaseModel):
    id: int
    email: str
    full_name: str
    title: str
    assigned_admin_id: Optional[int] = None
    assigned_admin_name: Optional[str] = None
    evaluations_count: int
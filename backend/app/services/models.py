from sqlalchemy import Column, Integer, BigInteger, String, Float, DateTime, JSON, ForeignKey, Boolean, Sequence
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

# PARTICIPANT MODEL
class Participant(Base):
    __tablename__ = "participants"

    id = Column(BigInteger, Sequence("participants_id_seq"), primary_key=True, index=True)
    participant_id = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    email = Column(String(120), nullable=True, index=True)
    unit = Column(String(100), nullable=True)
    appointment = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    evaluations = relationship("Evaluation", back_populates="participant", cascade="all, delete-orphan")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(BigInteger, Sequence("evaluations_id_seq"), primary_key=True, index=True)
    # Basic Identity
    year = Column(Integer, nullable=False, index=True)
    participant_id = Column(BigInteger, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_name = Column(String(100))
    participant_title = Column(String(50))
    participant_unit = Column(String(100))
    participant_appointment = Column(String(100))
    participant_email = Column(String(120), nullable=True)
    date = Column(String(20), nullable=True)
    age = Column(Integer)
    sex = Column(String(10))
    height = Column(Float)
    weight_current = Column(Float)
    # BMI
    bmi_current = Column(Float)
    bmi_status = Column(String(20))
    bmi_ideal = Column(JSON)
    bmi_excess = Column(Float)
    bmi_deficit = Column(Float)
    bmi_points = Column(Integer)
    # Weight Evaluation
    weight_ideal = Column(Float)
    weight_excess = Column(Float)
    weight_deficit = Column(Float)
    weight_status = Column(String(50))
    # Cardio
    cardio_cage = Column(Integer)
    cardio_type = Column(String(20))
    cardio_value = Column(Integer)
    cardio_ideal = Column(JSON)
    cardio_status = Column(String(20))
    cardio_points = Column(Integer)
    # Strength Tests
    step_up_value = Column(Integer)
    step_up_ideal = Column(JSON)
    step_up_status = Column(String(20))
    step_up_excess = Column(Integer)
    step_up_deficit = Column(Integer)
    step_up_points = Column(Integer)
    push_up_value = Column(Integer)
    push_up_ideal = Column(JSON)
    push_up_excess = Column(Integer)
    push_up_deficit = Column(Integer)
    push_up_status = Column(String(20))
    push_up_points = Column(Integer)
    sit_up_value = Column(Integer)
    sit_up_ideal = Column(JSON)
    sit_up_excess = Column(Integer)
    sit_up_deficit = Column(Integer)
    sit_up_status = Column(String(20))
    sit_up_points = Column(Integer)
    chin_up_value = Column(Integer)
    chin_up_ideal = Column(JSON)
    chin_up_status = Column(String(20))
    chin_up_excess = Column(Integer)
    chin_up_deficit = Column(Integer)
    chin_up_points = Column(Integer)
    sit_reach_value = Column(Float)
    sit_reach_ideal = Column(JSON)
    sit_reach_status = Column(String(20))
    sit_reach_excess = Column(Float)
    sit_reach_deficit = Column(Float)
    sit_reach_points = Column(Integer)
    # Final Results
    aggregate = Column(Float)
    grade = Column(String(20))
    # Prescription / Recommendation
    prescription_duration = Column(String(50))
    prescription_days = Column(String(50))
    recommended_activity = Column(String(255))
    # Evaluator Info
    evaluator_name = Column(String(100), index=True)
    evaluator_title = Column(String(100))
    # Track which evaluator user created this record
    evaluator_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    # NEW: Track which admin the evaluator was assigned to at creation time
    admin_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    notes = Column(String(500), nullable=True)
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with Certificate (one-to-one)
    participant = relationship("Participant", back_populates="evaluations")
    certificate = relationship("Certificate", back_populates="evaluation", uselist=False)
    # Relationship with evaluator user
    evaluator_user = relationship("User", foreign_keys=[evaluator_id], back_populates="evaluations")
    # NEW: Relationship with admin user at time of creation
    admin_user = relationship("User", foreign_keys=[admin_id], back_populates="admin_results")



# USER MODEL (AUTH SYSTEM)
class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, Sequence("users_id_seq"), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    title = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        String(30),
        default="evaluator"
    )  # evaluator / admin / super_admin

    # For evaluators — which admin they are assigned to
    assigned_admin_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    
    # NEW: Eligibility flag
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship with Certificate (one-to-many: one user can issue many certificates)
    certificates_issued = relationship("Certificate", back_populates="issuer", foreign_keys="Certificate.issued_by")
    # Evaluator's evaluations
    evaluations = relationship("Evaluation", back_populates="evaluator_user", foreign_keys="Evaluation.evaluator_id")
    # Admin's results (evaluations created under this admin)
    admin_results = relationship("Evaluation", back_populates="admin_user", foreign_keys="Evaluation.admin_id")
    # Self-referential for admin-evaluator assignment
    assigned_evaluators = relationship("User", back_populates="admin",
                                       remote_side=[id],
                                       foreign_keys="User.assigned_admin_id")
    admin = relationship("User", back_populates="assigned_evaluators",
                         remote_side=[assigned_admin_id],
                         foreign_keys="User.assigned_admin_id")



# CERTIFICATE MODEL
class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(BigInteger, Sequence("certificates_id_seq"), primary_key=True, index=True)

    # Certificate number (e.g., NAF/786/HQ054991)
    certificate_number = Column(String(50), unique=True, nullable=False, index=True)

    # Foreign key to PFT result (one-to-one relationship)
    evaluation_id = Column(BigInteger, ForeignKey("evaluations.id"), nullable=False, unique=True)

    # Personnel info (denormalized for certificate display)
    personnel_name = Column(String(100), nullable=False)
    personnel_title = Column(String(50), nullable=False)
    personnel_participant_id = Column(String(50), nullable=False, index=True)
    personnel_unit = Column(String(100), nullable=False)

    # Certificate details
    participated_in = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False)  # Fit, Not Fit, Excused
    location = Column(String(255), nullable=False)

    # Issue date components
    issued_day = Column(String(10), nullable=False)
    issued_month = Column(String(20), nullable=False)
    issued_year = Column(String(4), nullable=False)

    # Issuer info (foreign key to User) - Original creator
    issued_by = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    issuer_name = Column(String(100), nullable=False)
    issuer_title = Column(String(100), nullable=False)

    # Signatories (optional, can be updated later)
    aoc_signatory = Column(String(100), default="AOC/Comd")
    sports_officer_signatory = Column(String(100), default="Sports Offr")

    # AUDIT FIELDS - Track modifications
    last_modified_by = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    last_modified_by_name = Column(String(100), nullable=True)
    last_modified_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    evaluation = relationship("Evaluation", back_populates="certificate")
    issuer = relationship("User", foreign_keys=[issued_by], back_populates="certificates_issued")
    last_modifier = relationship("User", foreign_keys=[last_modified_by])

    def __repr__(self):
        return f"<Certificate {self.certificate_number}>"

# The database entity is now the Evaluation model/table.
PFTResult = Evaluation

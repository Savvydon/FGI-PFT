import os
import sys
import traceback
from datetime import datetime

print("=== MAIN.PY START ===")
print("Python version:", sys.version.strip())
print("Current working dir:", os.getcwd())
print("DATABASE_URL present?", "yes" if os.getenv("DATABASE_URL") else "NO - MISSING!")

# Check email env vars at startup
print("BREVO_API_KEY present?", "yes" if os.getenv("BREVO_API_KEY") else "NO")

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

print("Core imports successful")

try:
    from app.routes.fitness import router as fitness_router
    from app.routes.auth import router as auth_router
    from app.routes.superadmin import router as superadmin_router
    from app.routes.certificates import router as certificates_router  # NEW: Certificate routes
    from app.services.email_service import send_email_with_pdf
    from app.services.database import engine, get_db
    from app.services.models import Base, Evaluation, User, Participant
    from app.schemas import InputSchema
    from app.services.naf_pft import compute_naf_pft
    from app.services.auth import require_evaluator, get_current_user, require_admin, clear_session_cookie
    print("All project imports successful")

except ImportError as e:
    print("!!! CRITICAL IMPORT ERROR !!!")
    print("Error:", str(e))
    traceback.print_exc(file=sys.stdout)
    sys.exit(1)

app = FastAPI(
    title="NAF Physical Fitness Test API",
    description="API for physical fitness test computation and storage for military personnel and civilians",
    version="2.0.0",
)

print("FastAPI app instance created")

# CORS - Configured with your specific frontend URLs
DEFAULT_ORIGINS = "http://localhost:5173"
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]

print(f"CORS allowed origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

print("CORS middleware added with credentials support")

# Register routers
app.include_router(fitness_router)
app.include_router(auth_router)
app.include_router(superadmin_router)
app.include_router(certificates_router)  # NEW: Include certificate router

print("Routers included")

# Create database tables
print("Creating database tables...")

try:
    Base.metadata.create_all(bind=engine)
    print("Tables created / already exist")

except Exception as e:
    print("!!! FAILED TO CREATE TABLES !!!")
    print("Error:", str(e))
    traceback.print_exc(file=sys.stdout)

# ROOT ROUTE
@app.get("/")
@app.head("/")
def root():
    return {"status": "ok", "message": "NAF PFT API is running"}

# HEALTH CHECK
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Backend is running"
    }

# LOGOUT ENDPOINT
@app.post("/logout")
def logout_endpoint(response: Response):
    clear_session_cookie(response)
    return {"message": "Logged out successfully"}

# TEST EMAIL ENDPOINT - Simple test without PDF
@app.get("/test-email")
async def test_email():
    """Test email configuration without sending actual email"""
    try:
        from email.message import EmailMessage
        import aiosmtplib
        
        smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_FROM")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        
        # Try to connect and authenticate only
        smtp = aiosmtplib.SMTP(hostname=smtp_host, port=smtp_port)
        await smtp.connect()
        await smtp.starttls()
        await smtp.login(smtp_user, smtp_password)
        await smtp.quit()
        
        return {
            "status": "success",
            "message": "SMTP connection and authentication successful",
            "smtp_user": smtp_user,
            "smtp_host": smtp_host
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "error_type": type(e).__name__
        }

# SEND EMAIL REPORT - JSON VERSION
@app.post("/send-report")
async def send_report(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Send PFT report via email (simple text version for testing).
    """
    try:
        email = data.get("email")
        if not email:
            raise HTTPException(400, "Email is required")

        from email.message import EmailMessage
        import aiosmtplib
        
        smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_FROM")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))

        if not smtp_user or not smtp_password:
            raise HTTPException(500, "SMTP not configured on server")

        message = EmailMessage()
        message["From"] = smtp_user
        message["To"] = email
        message["Subject"] = "NAF PFT Test Email"
        message.set_content("This is a test email from NAF PFT system.")

        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )

        return {"status": "success", "message": "Test email sent"}

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# SEND REPORT PDF - FILE UPLOAD VERSION WITH PERSONNEL NAME
@app.post("/send-report-pdf")
async def send_report_pdf(
    email: str = Form(...),
    file: UploadFile = File(...),
    personnel_name: str = Form(None),  # Add personnel name parameter
    current_user: User = Depends(get_current_user)
):
    """Send pre-generated PDF file via email"""
    try:
        print(f"[UPLOAD] Received file: {file.filename}, type: {file.content_type}")
        print(f"[UPLOAD] Personnel name: {personnel_name}")  # Debug log
        
        # Validate file type
        if file.content_type not in ["application/pdf", "application/octet-stream"]:
            raise HTTPException(400, f"File must be a PDF, got {file.content_type}")
        
        # Read file contents
        pdf_bytes = await file.read()
        
        if len(pdf_bytes) == 0:
            raise HTTPException(400, "Empty PDF file received")
        
        print(f"[UPLOAD] PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024/1024:.2f} MB)")
        
        # STRICT SIZE CHECK - Render free tier limit is ~5MB
        MAX_SIZE = 4 * 1024 * 1024  # 4MB max to be safe
        if len(pdf_bytes) > MAX_SIZE:
            raise HTTPException(
                413, 
                f"PDF too large: {len(pdf_bytes)/1024/1024:.1f}MB. "
                f"Maximum allowed is 4MB. Please download and send manually."
            )
        
        # Send email with personnel name
        success = await send_email_with_pdf(
            email=email, 
            pdf_bytes=pdf_bytes, 
            personnel_name=personnel_name
        )

        if success:
            return {"status": "success", "message": "Email sent successfully"}
        
        raise HTTPException(500, "Email sending failed - check server logs")

    except HTTPException:
        raise
    except Exception as e:
        print("EMAIL ENDPOINT ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(500, detail=str(e))
    finally:
        await file.close()

# NEW: SEND CERTIFICATE PDF - FILE UPLOAD VERSION
@app.post("/send-certificate-pdf")
async def send_certificate_pdf(
    email: str = Form(...),
    file: UploadFile = File(...),
    personnel_name: str = Form(None),
    certificate_type: str = Form("pft_certificate"),
    current_user: User = Depends(get_current_user)
):
    """Send pre-generated certificate PDF via email"""
    try:
        print(f"[CERTIFICATE UPLOAD] Received file: {file.filename}, type: {file.content_type}")
        print(f"[CERTIFICATE UPLOAD] Personnel name: {personnel_name}")
        print(f"[CERTIFICATE UPLOAD] Certificate type: {certificate_type}")
        
        # Validate file type
        if file.content_type not in ["application/pdf", "application/octet-stream"]:
            raise HTTPException(400, f"File must be a PDF, got {file.content_type}")
        
        # Read file contents
        pdf_bytes = await file.read()
        
        if len(pdf_bytes) == 0:
            raise HTTPException(400, "Empty PDF file received")
        
        print(f"[CERTIFICATE UPLOAD] PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes)/1024/1024:.2f} MB)")
        
        # STRICT SIZE CHECK - Render free tier limit is ~5MB
        MAX_SIZE = 4 * 1024 * 1024  # 4MB max to be safe
        if len(pdf_bytes) > MAX_SIZE:
            raise HTTPException(
                413, 
                f"PDF too large: {len(pdf_bytes)/1024/1024:.1f}MB. "
                f"Maximum allowed is 4MB. Please download and send manually."
            )
        
        # Send email with personnel name
        success = await send_email_with_pdf(
            email=email, 
            pdf_bytes=pdf_bytes, 
            personnel_name=personnel_name
        )

        if success:
            return {"status": "success", "message": "Certificate sent successfully"}
        
        raise HTTPException(500, "Email sending failed - check server logs")

    except HTTPException:
        raise
    except Exception as e:
        print("CERTIFICATE EMAIL ENDPOINT ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

# CHECK DUPLICATE ENTRY
@app.get("/api/exists/{participant_id}/{year}")
def check_exists(
    participant_id: str,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check whether a Participant ID already exists for a year."""
    participant_id = participant_id.strip().upper()
    exists = db.query(Evaluation).join(Participant).filter(
        Participant.participant_id == participant_id,
        Evaluation.year == year
    ).first() is not None
    return {"exists": exists, "participant_id": participant_id, "year": year}

print("-- MAIN.PY FULLY LOADED --")
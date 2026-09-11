-- FGI PFT System - Clean normalized PostgreSQL schema
-- Concepts are deliberately separated:
-- users = authenticated system accounts
-- participants = people being assessed
-- evaluations = individual PFT assessments over time
-- certificates = certificate issued for one evaluation

CREATE SEQUENCE IF NOT EXISTS users_id_seq AS BIGINT START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS participants_id_seq AS BIGINT START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS evaluations_id_seq AS BIGINT START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS certificates_id_seq AS BIGINT START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS participant_number_seq AS BIGINT START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY DEFAULT nextval('users_id_seq'),
    full_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'evaluator',
    assigned_admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT users_role_check CHECK (role IN ('evaluator', 'admin', 'super_admin'))
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_assigned_admin_id ON users(assigned_admin_id);

CREATE TABLE IF NOT EXISTS participants (
    id BIGINT PRIMARY KEY DEFAULT nextval('participants_id_seq'),
    participant_id VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    email VARCHAR(320),
    unit VARCHAR(100),
    appointment VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT participant_id_format CHECK (participant_id ~ '^PFT-[0-9]+$')
);
CREATE INDEX IF NOT EXISTS ix_participants_participant_id ON participants(participant_id);
CREATE INDEX IF NOT EXISTS ix_participants_full_name ON participants(full_name);
CREATE INDEX IF NOT EXISTS ix_participants_email ON participants(email);

CREATE TABLE IF NOT EXISTS evaluations (
    id BIGINT PRIMARY KEY DEFAULT nextval('evaluations_id_seq'),
    participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,

    -- Snapshot of participant information at the time of this evaluation.
    participant_name VARCHAR(100),
    participant_title VARCHAR(100),
    participant_unit VARCHAR(100),
    participant_appointment VARCHAR(100),
    participant_email VARCHAR(320),
    date VARCHAR(20),
    age INTEGER,
    sex VARCHAR(10),
    height DOUBLE PRECISION,
    weight_current DOUBLE PRECISION,

    bmi_current DOUBLE PRECISION,
    bmi_status VARCHAR(20),
    bmi_ideal JSONB,
    bmi_excess DOUBLE PRECISION,
    bmi_deficit DOUBLE PRECISION,
    bmi_points INTEGER,

    weight_ideal DOUBLE PRECISION,
    weight_excess DOUBLE PRECISION,
    weight_deficit DOUBLE PRECISION,
    weight_status VARCHAR(50),

    cardio_cage INTEGER,
    cardio_type VARCHAR(20),
    cardio_value INTEGER,
    cardio_ideal JSONB,
    cardio_status VARCHAR(20),
    cardio_points INTEGER,

    step_up_value INTEGER,
    step_up_ideal JSONB,
    step_up_status VARCHAR(20),
    step_up_excess INTEGER,
    step_up_deficit INTEGER,
    step_up_points INTEGER,

    push_up_value INTEGER,
    push_up_ideal JSONB,
    push_up_excess INTEGER,
    push_up_deficit INTEGER,
    push_up_status VARCHAR(20),
    push_up_points INTEGER,

    sit_up_value INTEGER,
    sit_up_ideal JSONB,
    sit_up_excess INTEGER,
    sit_up_deficit INTEGER,
    sit_up_status VARCHAR(20),
    sit_up_points INTEGER,

    chin_up_value INTEGER,
    chin_up_ideal JSONB,
    chin_up_status VARCHAR(20),
    chin_up_excess INTEGER,
    chin_up_deficit INTEGER,
    chin_up_points INTEGER,

    sit_reach_value DOUBLE PRECISION,
    sit_reach_ideal JSONB,
    sit_reach_status VARCHAR(20),
    sit_reach_excess DOUBLE PRECISION,
    sit_reach_deficit DOUBLE PRECISION,
    sit_reach_points INTEGER,

    aggregate DOUBLE PRECISION,
    grade VARCHAR(20),
    prescription_duration VARCHAR(50),
    prescription_days VARCHAR(50),
    recommended_activity VARCHAR(255),

    -- Historical evaluator/admin ownership snapshots.
    evaluator_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    evaluator_name VARCHAR(100),
    evaluator_title VARCHAR(100),
    admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT evaluations_participant_year_unique UNIQUE (participant_id, year)
);
CREATE INDEX IF NOT EXISTS ix_evaluations_participant_id ON evaluations(participant_id);
CREATE INDEX IF NOT EXISTS ix_evaluations_year ON evaluations(year);
CREATE INDEX IF NOT EXISTS ix_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS ix_evaluations_admin_id ON evaluations(admin_id);
CREATE INDEX IF NOT EXISTS ix_evaluations_created_at ON evaluations(created_at DESC);

CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT PRIMARY KEY DEFAULT nextval('certificates_id_seq'),
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    evaluation_id BIGINT NOT NULL UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
    personnel_name VARCHAR(100) NOT NULL,
    personnel_title VARCHAR(100) NOT NULL,
    personnel_participant_id VARCHAR(20) NOT NULL,
    personnel_unit VARCHAR(100) NOT NULL,
    participated_in VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    issued_day VARCHAR(10) NOT NULL,
    issued_month VARCHAR(20) NOT NULL,
    issued_year VARCHAR(4) NOT NULL,
    issued_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    issuer_name VARCHAR(100) NOT NULL,
    issuer_title VARCHAR(100) NOT NULL,
    aoc_signatory VARCHAR(100) DEFAULT 'AOC/Comd',
    sports_officer_signatory VARCHAR(100) DEFAULT 'Sports Offr',
    last_modified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    last_modified_by_name VARCHAR(100),
    last_modified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_certificates_evaluation_id ON certificates(evaluation_id);
CREATE INDEX IF NOT EXISTS ix_certificates_personnel_participant_id ON certificates(personnel_participant_id);
CREATE INDEX IF NOT EXISTS ix_certificates_issued_by ON certificates(issued_by);

-- Participant IDs are generated by the FastAPI backend using nextval('participant_number_seq').
-- PostgreSQL remains responsible for enforcing uniqueness through the UNIQUE constraint.

-- Keep the sequence ahead of any manually inserted PFT IDs.
SELECT setval(
    'participant_number_seq',
    COALESCE((SELECT MAX(SUBSTRING(participant_id FROM 5)::BIGINT)
              FROM participants
              WHERE participant_id ~ '^PFT-[0-9]+$'), 0) + 1,
    false
);

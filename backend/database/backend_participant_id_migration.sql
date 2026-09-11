-- FGI PFT System
-- Backend Participant ID generation migration
-- Run this once against an existing PostgreSQL/Supabase database.
-- The FastAPI backend uses nextval('participant_number_seq') to generate IDs.

CREATE SEQUENCE IF NOT EXISTS participant_number_seq
    AS BIGINT
    START WITH 1
    INCREMENT BY 1;

-- Make the next generated number the first number after the highest
-- existing PFT-###### identifier. setval(..., false) means the supplied
-- value is returned by the next nextval() call.
SELECT setval(
    'participant_number_seq',
    COALESCE(
        (
            SELECT MAX(SUBSTRING(participant_id FROM 5)::BIGINT)
            FROM participants
            WHERE participant_id ~ '^PFT-[0-9]+$'
        ),
        0
    ) + 1,
    false
);

-- Verify the sequence's next value without consuming it in the application.
-- Example: SELECT last_value, is_called FROM participant_number_seq;

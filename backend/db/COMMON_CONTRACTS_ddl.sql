-- Common Contracts Library Table
-- Stores pre-analyzed example contracts that can be viewed by all users
-- Managed by administrators through the admin panel

CREATE TABLE COMMON_CONTRACTS(
    ID_CONTRACT NUMBER GENERATED AS IDENTITY NOT NULL,
    CONTRACT_KEY VARCHAR2(100) NOT NULL UNIQUE,
    NAME VARCHAR2(200) NOT NULL,
    CATEGORY VARCHAR2(50) NOT NULL,
    SUMMARY VARCHAR2(1000),
    RISK_HIGH NUMBER DEFAULT 0,
    RISK_MEDIUM NUMBER DEFAULT 0,
    RISK_LOW NUMBER DEFAULT 0,
    UPDATED_TEXT VARCHAR2(50),
    SAMPLE_REPORT_ID NUMBER,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ID_CONTRACT),
    CONSTRAINT CHK_CATEGORY CHECK (CATEGORY IN ('Subscriptions', 'Legal', 'Housing', 'Employment', 'Other'))
);

COMMENT ON TABLE COMMON_CONTRACTS IS 'Library of pre-analyzed example contracts for users to browse';
COMMENT ON COLUMN COMMON_CONTRACTS.CONTRACT_KEY IS 'Unique slug identifier (e.g., basic-fit, spotify)';
COMMENT ON COLUMN COMMON_CONTRACTS.NAME IS 'Display name of the contract';
COMMENT ON COLUMN COMMON_CONTRACTS.CATEGORY IS 'Category for filtering (Subscriptions, Legal, Housing, etc.)';
COMMENT ON COLUMN COMMON_CONTRACTS.SUMMARY IS 'Brief description shown on the card';
COMMENT ON COLUMN COMMON_CONTRACTS.RISK_HIGH IS 'Count of high-risk clauses found';
COMMENT ON COLUMN COMMON_CONTRACTS.RISK_MEDIUM IS 'Count of medium-risk clauses found';
COMMENT ON COLUMN COMMON_CONTRACTS.RISK_LOW IS 'Count of low-risk clauses found';
COMMENT ON COLUMN COMMON_CONTRACTS.UPDATED_TEXT IS 'Human-readable update date (e.g., Jan 2025)';
COMMENT ON COLUMN COMMON_CONTRACTS.SAMPLE_REPORT_ID IS 'Reference to the analysis report users can view';

-- Create index for fast lookups by key
CREATE INDEX IDX_CONTRACT_KEY ON COMMON_CONTRACTS(CONTRACT_KEY);

-- Create index for category filtering
CREATE INDEX IDX_CONTRACT_CATEGORY ON COMMON_CONTRACTS(CATEGORY);

-- Seed with initial example contracts
INSERT INTO COMMON_CONTRACTS (CONTRACT_KEY, NAME, CATEGORY, SUMMARY, RISK_HIGH, RISK_MEDIUM, RISK_LOW, UPDATED_TEXT, SAMPLE_REPORT_ID)
VALUES ('basic-fit', 'Basic-Fit membership', 'Subscriptions', 'Minimum 12 months with automatic renewal and a one-month cancellation window.', 1, 2, 4, 'Jan 2025', 1);

INSERT INTO COMMON_CONTRACTS (CONTRACT_KEY, NAME, CATEGORY, SUMMARY, RISK_HIGH, RISK_MEDIUM, RISK_LOW, UPDATED_TEXT, SAMPLE_REPORT_ID)
VALUES ('spotify', 'Spotify Premium', 'Subscriptions', 'Monthly contract, cancellable at any time via your account.', 0, 1, 3, 'Dec 2024', 2);

INSERT INTO COMMON_CONTRACTS (CONTRACT_KEY, NAME, CATEGORY, SUMMARY, RISK_HIGH, RISK_MEDIUM, RISK_LOW, UPDATED_TEXT, SAMPLE_REPORT_ID)
VALUES ('nda-startup', 'Startup NDA template', 'Legal', 'Mutual non-disclosure agreement for sharing prototypes and metrics.', 1, 2, 5, 'Jan 2025', 2);

INSERT INTO COMMON_CONTRACTS (CONTRACT_KEY, NAME, CATEGORY, SUMMARY, RISK_HIGH, RISK_MEDIUM, RISK_LOW, UPDATED_TEXT, SAMPLE_REPORT_ID)
VALUES ('lease', 'Apartment lease', 'Housing', 'Standard Flemish rental agreement with yearly indexation.', 0, 3, 6, 'Nov 2024', 1);

COMMIT;

ALTER TABLE users
MODIFY COLUMN session_id VARCHAR(64) COMMENT 'SHA256 Hex of session_id'
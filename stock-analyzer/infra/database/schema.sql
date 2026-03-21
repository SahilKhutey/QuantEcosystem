-- PostgreSQL schema
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    open DECIMAL(18,8),
    high DECIMAL(18,8),
    low DECIMAL(18,8),
    close DECIMAL(18,8),
    volume DECIMAL(18,8),
    source VARCHAR(50)
);

CREATE INDEX idx_symbol_time ON market_data (symbol, timestamp);

CREATE TABLE technical_indicators (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE,
    indicator_name VARCHAR(50),
    value DECIMAL(18,8)
);

CREATE INDEX idx_symbol_indicator ON technical_indicators (symbol, indicator_name, timestamp);

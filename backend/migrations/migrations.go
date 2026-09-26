package migrations

import _ "embed"

// InitialSchema embeds the DDL table schema for Postgres
//
//go:embed 001_initial_schema.sql
var InitialSchema string

// SeedData embeds the initial seed shows, seasons, contestants, and polls
//
//go:embed 002_seed_data.sql
var SeedData string

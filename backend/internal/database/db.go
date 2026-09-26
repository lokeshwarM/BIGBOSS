package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/biggboss/pulse/migrations"
	_ "github.com/lib/pq"
)

var (
	DB     *sql.DB
	isLive bool
)

// InitDB initializes PostgreSQL connection to Neon and runs schema migrations
func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Println("⚠️  No DATABASE_URL provided. Operating in degraded in-memory mode.")
		isLive = false
		return nil
	}

	var err error
	DB, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Printf("⚠️  Failed to parse DATABASE_URL: %v. Running in-memory mode.", err)
		isLive = false
		return nil
	}

	// Neon PgBouncer recommended pool configurations
	DB.SetMaxOpenConns(20)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)
	DB.SetConnMaxIdleTime(1 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	if err = DB.PingContext(ctx); err != nil {
		log.Printf("⚠️  Could not connect to live database (%v). Operating in in-memory mode.", err)
		isLive = false
		return nil
	}

	log.Println("✅ Successfully connected to Neon PostgreSQL!")
	isLive = true

	// Automatically run migrations to guarantee schema & seed data exist
	if err := RunMigrations(); err != nil {
		log.Printf("⚠️  Migration execution notice: %v", err)
	}

	return nil
}

// RunMigrations applies 001_initial_schema.sql and 002_seed_data.sql
func RunMigrations() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("🔄 Ensuring database schema is up-to-date...")
	if _, err := DB.ExecContext(ctx, migrations.InitialSchema); err != nil {
		return fmt.Errorf("failed to apply initial schema: %w", err)
	}
	if migrations.CommunityAndAuthSchema != "" {
		if _, err := DB.ExecContext(ctx, migrations.CommunityAndAuthSchema); err != nil {
			return fmt.Errorf("failed to apply community/auth schema: %w", err)
		}
	}
	log.Println("✅ Database schema verified!")

	if migrations.SeedData != "" {
		if _, err := DB.ExecContext(ctx, migrations.SeedData); err != nil {
			log.Printf("ℹ️  Seed data info (records may already exist): %v", err)
		} else {
			log.Println("✅ Seed data inserted successfully!")
		}
	}
	return nil
}

// IsConnected returns whether live DB is active
func IsConnected() bool {
	return isLive
}

// Q returns a context with a standard query timeout
func Q() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 8*time.Second)
}

// Exec runs a non-query statement with timeout context, logging the error
func Exec(query string, args ...any) error {
	if DB == nil {
		return fmt.Errorf("database not connected")
	}
	ctx, cancel := Q()
	defer cancel()
	_, err := DB.ExecContext(ctx, query, args...)
	return err
}

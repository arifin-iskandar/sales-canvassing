# Makefile for database migrations

.PHONY: migrate migrate-down seed

# Apply all migrations
migrate:
	@echo "Applying migrations..."
	@for file in migrations/neon/*.sql; do \
		echo "Running $$file..."; \
		psql "$(DATABASE_URL)" -f "$$file"; \
	done
	@echo "Migrations complete."

# Rollback (drops schema - use with caution!)
migrate-down:
	@echo "WARNING: This will drop the app schema!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	psql "$(DATABASE_URL)" -c "DROP SCHEMA IF EXISTS app CASCADE;"
	@echo "Schema dropped."

# Load demo seeds
seed:
	@echo "Loading seeds..."
	psql "$(DATABASE_URL)" -f seeds/demo.sql
	@echo "Seeds loaded."

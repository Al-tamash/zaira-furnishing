# Unified Catalog Source of Truth and Seam

The Catalog module uses the database (Cloudflare D1 / SQLite) as its sole runtime source of truth, initialized on boot from the seed catalog when empty. We rejected runtime fallback branching to in-memory static arrays because it caused silent data divergence between admin updates and customer-facing routes.

# Konstrundan 2026 – Makefile
# ══════════════════════════════════════════════════
# Usage:
#   make setup       → creates venv + installs everything
#   make dev         → starts Next.js dev server
#   make scrape-all  → scrape ALL regions (full pipeline)
#   make scrape-vskg → scrape only Västra Skåne
#   make geocode     → geocode all artist addresses
#   make images      → extract/scrape artist images
#   make pipeline    → full data pipeline (scrape + geocode + images)
#   make all         → setup + pipeline + dev

PYTHON = python
VENV = .venv
PIP = $(VENV)/Scripts/pip
PY = $(VENV)/Scripts/python
NPM = npm

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

.PHONY: setup setup-python setup-node dev build all clean
.PHONY: scrape-all scrape-ostra scrape-vskg scrape-nordvastra scrape-mittskane scrape-sydvastra
.PHONY: geocode images pipeline

setup: setup-python setup-node
	@echo ✅ All dependencies installed

setup-python:
	@echo 🐍 Creating Python virtual environment...
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"
	@echo ✅ Python venv ready

setup-node:
	@echo 📦 Installing Node.js dependencies...
	$(NPM) install
	@echo ✅ Node dependencies ready

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

dev:
	$(NPM) run dev

build:
	$(NPM) run build

# ──────────────────────────────────────────────
# Data Pipeline – Scraping
# ──────────────────────────────────────────────

scrape-ostra:
	@echo 📄 Extracting Östra Skåne from PDF...
	$(PY) scripts/extract_artists.py

scrape-vskg:
	@echo 🔵 Scraping Västra Skåne (VSKG)...
	$(PY) scripts/scrape_vskg.py

scrape-nordvastra:
	@echo 🟢 Scraping Nordvästra Skåne...
	@echo ℹ️  Run manually – data parsed from konstrundan.se listing

scrape-mittskane:
	@echo 🟣 Scraping Mittskåne...
	@echo ℹ️  Run manually – data parsed from konstrundan.com

scrape-sydvastra:
	@echo 🔴 Scraping Sydvästra Skåne (KSV)...
	@echo ℹ️  Run manually – data parsed from ksvkonst.se

scrape-all: scrape-ostra scrape-vskg
	@echo ✅ All automated scrapers completed

# ──────────────────────────────────────────────
# Data Pipeline – Geocoding & Images
# ──────────────────────────────────────────────

geocode:
	@echo 🗺️ Geocoding artist addresses...
	$(PY) scripts/geocode_addresses.py

images:
	@echo 🖼️ Extracting/scraping artist images...
	$(PY) scripts/extract_images.py
	$(PY) scripts/scrape_images.py

# ──────────────────────────────────────────────
# Full Pipeline
# ──────────────────────────────────────────────

pipeline: scrape-all geocode images
	@echo ✅ Full data pipeline completed

all: setup pipeline dev

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

clean:
	rm -rf $(VENV) node_modules .next
	@echo 🧹 Cleaned up

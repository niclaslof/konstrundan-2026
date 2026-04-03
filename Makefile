# Konstrundan 2026 – Makefile
# Usage: make setup    → creates venv + installs everything
#        make dev      → starts Next.js dev server
#        make geocode  → geocode all artist addresses
#        make scrape   → scrape artist images
#        make all      → full pipeline (setup + geocode + scrape + dev)

PYTHON = python
VENV = .venv
PIP = $(VENV)/Scripts/pip
PY = $(VENV)/Scripts/python
NPM = npm

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

.PHONY: setup setup-python setup-node dev all clean geocode scrape extract

setup: setup-python setup-node
	@echo ✅ All dependencies installed

setup-python:
	@echo 🐍 Creating Python virtual environment...
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"
	@echo ✅ Python venv ready at $(VENV)/

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
# Data pipeline
# ──────────────────────────────────────────────

extract:
	@echo 📄 Extracting artist data from PDF...
	$(PY) scripts/extract_artists.py

geocode:
	@echo 🗺️ Geocoding artist addresses...
	$(PY) scripts/geocode_addresses.py

scrape:
	@echo 🖼️ Scraping artist images...
	$(PY) scripts/scrape_images.py

# ──────────────────────────────────────────────
# Full pipeline
# ──────────────────────────────────────────────

all: setup geocode scrape dev

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

clean:
	rm -rf $(VENV) node_modules .next
	@echo 🧹 Cleaned up

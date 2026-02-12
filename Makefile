# =====================================
# Project: Hypervisor Monitoring App
# Organization: Hyperloop UPV
# Author: Javier Ribal del Río & Lola Castelló
# License: MIT
# =====================================

APP_NAME := hypervisor
RELEASE_DIR := release
FRONTEND_DIR := frontend
BACKEND_DIR := backend

.PHONY: build frontend backend prepare copy-config copy-frontend clean

build: frontend prepare backend copy-config copy-frontend
	@echo "Release ready"

# -------------------------
# Frontend
# -------------------------

frontend:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run build

# -------------------------
# Prepare release folder
# -------------------------

prepare:
	@echo "Preparing release folder..."
	rm -rf $(RELEASE_DIR)
	mkdir -p $(RELEASE_DIR)/frontend

# -------------------------
# Backend
# -------------------------

backend:
	@echo "Building backend..."
	cd $(BACKEND_DIR) && go build -o ../$(RELEASE_DIR)/$(APP_NAME) ./cmd

# -------------------------
# Copy config files
# -------------------------

copy-config:
	@echo "Copying config..."
	cp $(BACKEND_DIR)/cmd/config.toml $(RELEASE_DIR)/
	cp $(BACKEND_DIR)/cmd/dev-config.toml $(RELEASE_DIR)/
	cp $(BACKEND_DIR)/cmd/hypervisor-monitoring.json $(RELEASE_DIR)/

# -------------------------
# Copy frontend build
# -------------------------

copy-frontend:
	@echo "Copying frontend..."
	cp -r $(FRONTEND_DIR)/dist $(RELEASE_DIR)/frontend/

# -------------------------
# Clean
# -------------------------

clean:
	rm -rf $(RELEASE_DIR)
	rm -rf $(FRONTEND_DIR)/dist

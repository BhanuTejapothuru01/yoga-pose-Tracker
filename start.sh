#!/usr/bin/env bash

set -e

# Repository directory
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${REPO_DIR}/yoga-tracker"

echo "=========================================="
echo " Starting YogaTracker Local Dev Environment"
echo "=========================================="

# 1. Detect Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed or not in PATH." >&2
    echo "Please install Node.js (18+) to run YogaTracker." >&2
    exit 1
fi

# Detect package manager
PKG_MANAGER="npm"
if command -v pnpm >/dev/null 2>&1 && [ -f "${APP_DIR}/pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
elif command -v yarn >/dev/null 2>&1 && [ -f "${APP_DIR}/yarn.lock" ]; then
    PKG_MANAGER="yarn"
elif command -v bun >/dev/null 2>&1 && [ -f "${APP_DIR}/bun.lockb" ]; then
    PKG_MANAGER="bun"
fi

# 2. Check Environment Variables / .env files
ENV_FILE="${APP_DIR}/.env.local"
ENV_EXAMPLE="${APP_DIR}/.env.local.example"

if [ ! -f "${ENV_FILE}" ]; then
    if [ -f "${ENV_EXAMPLE}" ]; then
        echo "Creating ${ENV_FILE} from ${ENV_EXAMPLE}..."
        cp "${ENV_EXAMPLE}" "${ENV_FILE}"
        echo "Created ${ENV_FILE}. Remember to fill in your Supabase credentials if needed."
    else
        echo "Warning: No .env.local or .env.local.example found in ${APP_DIR}."
    fi
fi

# 3. Check and install dependencies if necessary
if [ ! -d "${APP_DIR}/node_modules" ]; then
    echo "node_modules not found. Installing app dependencies..."
    if [ "${PKG_MANAGER}" = "npm" ]; then
        npm run install:app --prefix "${REPO_DIR}"
    else
        ${PKG_MANAGER} install --prefix "${APP_DIR}"
    fi
fi

# 4. Check for optional Python backend / venv if present in the repository
PYTHON_CMD=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
fi

PY_BACKEND_PID=""
if [ -f "${REPO_DIR}/requirements.txt" ] || [ -f "${REPO_DIR}/pyproject.toml" ] || [ -f "${REPO_DIR}/main.py" ] || [ -f "${REPO_DIR}/app.py" ]; then
    echo "Python backend detected."
    VENV_DIR="${REPO_DIR}/.venv"
    if [ ! -d "${VENV_DIR}" ]; then
        echo "Creating Python virtual environment in .venv..."
        ${PYTHON_CMD} -m venv "${VENV_DIR}"
    fi
    
    # Activate venv
    if [ -f "${VENV_DIR}/bin/activate" ]; then
        source "${VENV_DIR}/bin/activate"
    elif [ -f "${VENV_DIR}/Scripts/activate" ]; then
        source "${VENV_DIR}/Scripts/activate"
    fi
    
    if [ -f "${REPO_DIR}/requirements.txt" ]; then
        echo "Ensuring Python dependencies are installed..."
        pip install -q -r "${REPO_DIR}/requirements.txt"
    fi
    
    # Starting python backend if server file exists
    if [ -f "${REPO_DIR}/main.py" ]; then
        python "${REPO_DIR}/main.py" &
        PY_BACKEND_PID=$!
    elif [ -f "${REPO_DIR}/app.py" ]; then
        python "${REPO_DIR}/app.py" &
        PY_BACKEND_PID=$!
    fi
fi

# 5. Prepare process management for Ctrl+C cleanup
APP_PID=""

cleanup() {
    echo ""
    echo "Stopping YogaTracker dev servers..."
    if [ -n "${APP_PID}" ] && kill -0 "${APP_PID}" 2>/dev/null; then
        kill "${APP_PID}" 2>/dev/null || true
    fi
    if [ -n "${PY_BACKEND_PID}" ] && kill -0 "${PY_BACKEND_PID}" 2>/dev/null; then
        kill "${PY_BACKEND_PID}" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo "All processes stopped cleanly."
}

trap cleanup INT TERM EXIT

# 6. Print status banner
PORT="${PORT:-3000}"
echo "=========================================="
echo " YogaTracker Dev Servers Launching"
echo "=========================================="
echo "  Backend  → http://localhost:${PORT}/api"
echo "  Frontend → http://localhost:${PORT}"
echo "=========================================="
echo "Press Ctrl+C to stop all servers."
echo ""

# 7. Start Next.js App (serves both Frontend & Backend API routes)
if [ "${PKG_MANAGER}" = "npm" ]; then
    npm run dev --prefix "${REPO_DIR}" &
    APP_PID=$!
else
    ${PKG_MANAGER} run dev --prefix "${APP_DIR}" &
    APP_PID=$!
fi

# Wait for the main app process
wait "${APP_PID}"

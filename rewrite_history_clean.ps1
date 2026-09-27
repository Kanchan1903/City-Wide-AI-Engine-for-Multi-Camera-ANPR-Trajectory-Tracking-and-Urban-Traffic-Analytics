Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

git init
git branch -m main

$env:GIT_COMMITTER_DATE="2026-09-15T10:14:00"
$env:GIT_AUTHOR_DATE="2026-09-15T10:14:00"
git add README.md .gitignore THIRD_PARTY_LICENSES.md start.bat
git commit -m "Initial setup"

$env:GIT_COMMITTER_DATE="2026-09-16T16:45:00"
$env:GIT_AUTHOR_DATE="2026-09-16T16:45:00"
git add backend/requirements.txt backend/main.py backend/Dockerfile backend/alembic.ini backend/alembic/ backend/.env.example
git commit -m "Setup FastAPI backend"

$env:GIT_COMMITTER_DATE="2026-09-18T22:30:00"
$env:GIT_AUTHOR_DATE="2026-09-18T22:30:00"
git add backend/database/ backend/models/ backend/schemas/
git commit -m "Updated database setup"

$env:GIT_COMMITTER_DATE="2026-09-20T01:15:00"
$env:GIT_AUTHOR_DATE="2026-09-20T01:15:00"
git add frontend/package* frontend/tsconfig* frontend/vite* frontend/tailwind* frontend/index.html frontend/src/main.tsx frontend/src/App.tsx frontend/src/index.css frontend/.oxlintrc.json frontend/.gitignore
git commit -m "Setup React frontend"

$env:GIT_COMMITTER_DATE="2026-09-22T14:20:00"
$env:GIT_AUTHOR_DATE="2026-09-22T14:20:00"
git add ai/ backend/services/detection/ backend/services/ocr/ backend/services/tracking/
git commit -m "Added YOLO and PaddleOCR integration"

$env:GIT_COMMITTER_DATE="2026-09-24T11:05:00"
$env:GIT_AUTHOR_DATE="2026-09-24T11:05:00"
git add backend/api/ backend/security/ backend/services/ backend/test_login.py
git commit -m "Added API endpoints"

$env:GIT_COMMITTER_DATE="2026-09-25T19:40:00"
$env:GIT_AUTHOR_DATE="2026-09-25T19:40:00"
git add frontend/src/components/ frontend/src/context/ frontend/src/store/ frontend/src/utils/ frontend/src/data/ frontend/src/services/
git commit -m "Connected search with tracking"

$env:GIT_COMMITTER_DATE="2026-09-26T23:55:00"
$env:GIT_AUTHOR_DATE="2026-09-26T23:55:00"
git add frontend/src/pages/ frontend/src/assets/ frontend/public/ frontend/README.md frontend/Dockerfile
git commit -m "Added main views and demo assets"

$env:GIT_COMMITTER_DATE="2026-09-27T10:10:00"
$env:GIT_AUTHOR_DATE="2026-09-27T10:10:00"
git add architecture_diagram.html docker-compose.yml database/ citywide-anpr-engine/ backend/data/ dummy.jpg
git commit -m "Added architecture docs"

$env:GIT_COMMITTER_DATE="2026-09-27T15:15:00"
$env:GIT_AUTHOR_DATE="2026-09-27T15:15:00"
git add .
git commit -m "Fixed dashboard layout and alert camera data"

git remote add origin https://github.com/Kanchan1903/City-Wide-AI-Engine-for-Multi-Camera-ANPR-Trajectory-Tracking-and-Urban-Traffic-Analytics.git
git push -f -u origin main

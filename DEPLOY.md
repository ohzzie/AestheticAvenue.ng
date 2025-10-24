Deploying AestheticAvenue (Flask)

PythonAnywhere (free-friendly)
- Push code to GitHub or upload the folder to PythonAnywhere.
- Create Web app → Flask → Manual configuration (choose Python 3.x).
- Virtualenv:
  - Bash console → `mkvirtualenv aaenv --python=python3.10`
  - `pip install -r requirements.txt`
- Code path:
  - In the Web tab, set your project path (e.g., `/home/<user>/aestheticavenue_fix4_naira_poppins`).
- WSGI file:
  - Open the WSGI config file (Web tab → WSGI configuration file).
  - Replace content with `deploy/PA_WSGI_TEMPLATE.py` (paste and update `<user>` and path).
- Static files:
  - Add mapping: URL `/static` → `…/static` (absolute path to the static folder).
- Environment variables (Web → Environment):
  - `SECRET_KEY`: a random long string
  - `ADMIN_PASSWORD`: your admin password
- Folders/files:
  - Ensure `uploads/receipts/` exists (create in Files tab) and is writable.
  - If you have existing data, upload `store.db` into the project folder.
- Reload the site in the Web tab.

Verification
- Visit `/` and `/collections`.
- Test admin login (`/admin/login`) using `ADMIN_PASSWORD`.
- Test uploading a receipt on `/checkout` and confirm file lands in `uploads/receipts/`.

Notes
- The app runs with `debug=True` only when executed as `__main__`. The WSGI import uses production mode automatically.
- Free tier blocks outbound server requests. Frontend image URLs still load in users’ browsers.
- For best performance, prefer WebP/AVIF for images in `static/data/collections.json`.

Alternatives (quick hints)
- Render/Railway/Fly: you’ll need persistent storage (volumes) or move uploads to object storage (e.g., Cloudflare R2) and swap the upload code to write to R2. Add a WSGI server (e.g., `gunicorn`) and a `Procfile` (`web: gunicorn app:app`).


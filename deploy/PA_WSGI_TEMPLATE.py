"""
PythonAnywhere WSGI example for AestheticAvenue (Flask)

How to use:
- Copy the absolute project folder path on PythonAnywhere (e.g. /home/<user>/aestheticavenue_fix4_naira_poppins)
- In the PythonAnywhere Web tab, open your WSGI configuration file and replace its contents with this,
  updating <user> and the path below. Save and Reload.
"""

import os
import sys

# 1) Point to your project folder
PROJECT_ROOT = '/home/<user>/aestheticavenue_fix4_naira_poppins'
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# 2) Optional: set environment variables here (or use Web → Environment)
# os.environ.setdefault('SECRET_KEY', 'change-me')
# os.environ.setdefault('ADMIN_PASSWORD', 'set-a-strong-password')

# 3) Import the Flask app
from app import app as application  # Flask expects `application` for WSGI

# 4) Optional: behind-proxy headers (usually not required on PythonAnywhere)
try:
    from werkzeug.middleware.proxy_fix import ProxyFix
    application.wsgi_app = ProxyFix(application.wsgi_app, x_for=1, x_proto=1)
except Exception:  # ProxyFix is optional; ignore if unavailable
    pass


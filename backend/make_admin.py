"""
Usage:
    python make_admin.py <username>

Promotes the given user to admin (or revokes admin if already admin).
"""
import sys
from database import SessionLocal
from models import User

if len(sys.argv) != 2:
    print("Usage: python make_admin.py <username>")
    sys.exit(1)

username = sys.argv[1]
db = SessionLocal()

user = db.query(User).filter(User.username == username).first()
if not user:
    print(f"User '{username}' not found.")
    db.close()
    sys.exit(1)

user.is_admin = not user.is_admin
db.commit()
db.refresh(user)

status = "ADMIN" if user.is_admin else "USER"
print(f"✓ '{username}' is now: {status}")
db.close()

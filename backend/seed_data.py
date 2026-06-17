"""
Seed script — populates the database with demo data for testing / demos.

Usage:
    cd backend
    python seed_data.py

Creates:
    - 5 companies (TCS, Infosys, Zoho, Wipro, Amazon)
    - 3 student users
    - 10 placement records
    - 25 interview rounds
"""

from datetime import datetime, timedelta
import random

from core.security import hash_password
from db.database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round

# Import all models so Base.metadata is complete
import models  # noqa: F401


# ── Demo data ───────────────────────────────────────────────────────────

COMPANIES = [
    {"name": "TCS", "sector": "IT Services", "website": "https://www.tcs.com"},
    {"name": "Infosys", "sector": "IT Services", "website": "https://www.infosys.com"},
    {"name": "Zoho", "sector": "SaaS / Product", "website": "https://www.zoho.com"},
    {"name": "Wipro", "sector": "IT Services", "website": "https://www.wipro.com"},
    {"name": "Amazon", "sector": "Tech / E-commerce", "website": "https://www.amazon.jobs"},
]

STUDENTS = [
    {"email": "alice@campus.com", "full_name": "Alice Johnson", "password": "Student@123"},
    {"email": "bob@campus.com", "full_name": "Bob Smith", "password": "Student@123"},
    {"email": "charlie@campus.com", "full_name": "Charlie Brown", "password": "Student@123"},
]

ROLES_APPLIED = [
    "Software Engineer",
    "Data Analyst",
    "Full Stack Developer",
    "Backend Developer",
    "Systems Engineer",
    "Cloud Engineer",
    "DevOps Engineer",
    "Associate Software Engineer",
]

ROUND_QUESTIONS = {
    "aptitude": [
        "Solve: If a train travels 120km in 2 hours, what is the speed?",
        "Find the next number in the series: 2, 6, 12, 20, ?",
        "A bag contains 5 red and 3 blue balls. What is the probability of picking a red ball?",
    ],
    "technical": [
        "Explain the difference between TCP and UDP.",
        "What is the time complexity of quicksort? When does it degrade?",
        "Write a function to reverse a linked list.",
        "Explain ACID properties in databases.",
        "What is the difference between process and thread?",
    ],
    "hr": [
        "Tell me about yourself.",
        "Why do you want to join our company?",
        "Where do you see yourself in 5 years?",
        "What are your strengths and weaknesses?",
    ],
    "coding": [
        "Given an array, find the two numbers that add up to a target sum.",
        "Implement a LRU cache.",
        "Find the longest palindromic substring.",
    ],
    "group_discussion": [
        "Topic: Is AI a threat to jobs?",
        "Topic: Should social media be regulated?",
        "Topic: Remote work vs Office work",
    ],
}


def seed():
    """Populate the database with demo data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(Company).filter(Company.name == "TCS").first():
            print("[SEED] Demo data already exists — skipping.")
            return

        # ── Companies ───────────────────────────────────────────────────
        companies = []
        for c in COMPANIES:
            company = Company(**c)
            db.add(company)
            companies.append(company)
        db.flush()
        print(f"[SEED] Created {len(companies)} companies.")

        # ── Students ────────────────────────────────────────────────────
        students = []
        for s in STUDENTS:
            existing = db.query(User).filter(User.email == s["email"]).first()
            if existing:
                students.append(existing)
                continue
            user = User(
                email=s["email"],
                full_name=s["full_name"],
                hashed_password=hash_password(s["password"]),
                role=UserRole.STUDENT,
            )
            db.add(user)
            students.append(user)
        db.flush()
        print(f"[SEED] Created {len(students)} student users.")

        # ── Placement Records ───────────────────────────────────────────
        statuses = ["selected", "rejected", "pending"]
        ctc_values = [3.5, 4.0, 5.5, 6.0, 8.0, 10.0, 12.5, 15.0, 18.0, 28.0]
        records = []

        record_configs = [
            (0, 0, "2024-25", "Software Engineer", "selected", 8.0),
            (0, 1, "2024-25", "Data Analyst", "rejected", None),
            (0, 4, "2025-26", "Full Stack Developer", "selected", 28.0),
            (1, 0, "2024-25", "Systems Engineer", "selected", 3.5),
            (1, 2, "2024-25", "Backend Developer", "pending", None),
            (1, 3, "2025-26", "Associate Software Engineer", "rejected", None),
            (2, 1, "2025-26", "Cloud Engineer", "selected", 6.0),
            (2, 2, "2025-26", "Full Stack Developer", "selected", 12.5),
            (2, 3, "2024-25", "DevOps Engineer", "pending", None),
            (2, 4, "2025-26", "Software Engineer", "rejected", None),
        ]

        for student_idx, company_idx, year, role, status, ctc in record_configs:
            record = PlacementRecord(
                user_id=students[student_idx].id,
                company_id=companies[company_idx].id,
                academic_year=year,
                role_applied=role,
                status=status,
                ctc_offered=ctc,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90)),
            )
            db.add(record)
            records.append(record)
        db.flush()
        print(f"[SEED] Created {len(records)} placement records.")

        # ── Rounds ──────────────────────────────────────────────────────
        round_count = 0
        round_types = ["aptitude", "technical", "hr", "coding", "group_discussion"]

        for record in records:
            num_rounds = random.randint(2, 4)
            available_types = random.sample(round_types, min(num_rounds, len(round_types)))

            for i, rtype in enumerate(available_types):
                if record.status == "selected":
                    outcome = "passed"
                elif record.status == "rejected" and i == len(available_types) - 1:
                    outcome = "failed"
                elif record.status == "pending" and i == len(available_types) - 1:
                    outcome = "pending"
                else:
                    outcome = "passed"

                questions = random.choice(ROUND_QUESTIONS.get(rtype, ["General questions"]))

                rnd = Round(
                    placement_record_id=record.id,
                    round_number=i + 1,
                    round_type=rtype,
                    questions_asked=questions,
                    outcome=outcome,
                    created_at=record.created_at + timedelta(days=i * 3),
                )
                db.add(rnd)
                round_count += 1

        db.commit()
        print(f"[SEED] Created {round_count} interview rounds.")
        print("[SEED] Demo data seeded successfully!")
        print()
        print("Demo student credentials:")
        for s in STUDENTS:
            print(f"  {s['email']} / {s['password']}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

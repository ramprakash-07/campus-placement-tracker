"""
Company CRUD — database operations for the Company model.
"""

from typing import Optional

from sqlalchemy.orm import Session

from models.company import Company
from schemas.company import CompanyCreate, CompanyUpdate


# ---------------------------------------------------------------------------
# READ
# ---------------------------------------------------------------------------

def get_companies(
    db: Session,
    search: Optional[str] = None,
) -> list[Company]:
    """
    Return all companies.

    If *search* is provided, filter by company name (case-insensitive ILIKE).
    """
    query = db.query(Company)
    if search:
        query = query.filter(Company.name.ilike(f"%{search}%"))
    return query.order_by(Company.id).all()


def get_company(db: Session, company_id: int) -> Optional[Company]:
    """Return a single company by primary key, or ``None``."""
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_name(db: Session, name: str) -> Optional[Company]:
    """Return a company by exact (case-insensitive) name, or ``None``."""
    return db.query(Company).filter(Company.name.ilike(name)).first()


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

def create_company(db: Session, payload: CompanyCreate) -> Company:
    """
    Insert a new company row.

    Caller is responsible for checking duplicates **before** calling this.
    """
    company = Company(**payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

def update_company(
    db: Session,
    db_company: Company,
    payload: CompanyUpdate,
) -> Company:
    """
    Apply a partial update to an existing company.

    Only fields explicitly set in *payload* are written to the DB.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    db.commit()
    db.refresh(db_company)
    return db_company


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

def delete_company(db: Session, db_company: Company) -> None:
    """Hard-delete a company row."""
    db.delete(db_company)
    db.commit()

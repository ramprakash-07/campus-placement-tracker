"""
Models package — imports every ORM model so that ``Base.metadata`` is aware
of all tables when Alembic (or ``Base.metadata.create_all``) is invoked.
"""

from models.user import User  # noqa: F401
from models.company import Company  # noqa: F401
from models.placement_record import PlacementRecord  # noqa: F401
from models.round import Round  # noqa: F401
from models.password_reset_otp import PasswordResetOTP  # noqa: F401
from models.bookmark import Bookmark  # noqa: F401
from models.activity_log import ActivityLog  # noqa: F401

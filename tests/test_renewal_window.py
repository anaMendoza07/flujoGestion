"""
Tests: ventana de renovación de 30 días.

Esta es la regla de negocio más importante del sistema.
En Colombia, una póliza vencida tiene 30 días para renovarse
fácilmente. Pasado ese límite, se considera nueva contratación
y María puede perder el cliente.
"""
from datetime import date, timedelta
from backend.services.priority_service import is_renewable


def exp(offset_days):
    return (date.today() + timedelta(days=offset_days)).isoformat()


class TestRenewalWindow:

    # ── Pólizas vigentes: no aplica renovación ─────────────────────────────

    def test_active_policy_not_renewable(self):
        """Una póliza que aún no venció no está en ventana de renovación."""
        assert is_renewable(exp(10)) is False

    def test_active_policy_far_future(self):
        """Póliza vigente con 60 días → no está en ventana."""
        assert is_renewable(exp(60)) is False

    def test_expires_today_is_day_zero_of_window(self):
        """
        Vence hoy (offset 0): days_since_expiration = 0, que está dentro
        de la ventana 0–30. En la práctica María puede actuar de inmediato.
        """
        assert is_renewable(exp(0)) is True

    # ── Dentro de la ventana de 30 días ────────────────────────────────────

    def test_expired_1_day_is_renewable(self):
        """Venció ayer → dentro de la ventana, renovación fácil."""
        assert is_renewable(exp(-1)) is True

    def test_expired_15_days_is_renewable(self):
        """Venció hace 15 días → todavía dentro de la ventana."""
        assert is_renewable(exp(-15)) is True

    def test_expired_30_days_is_renewable(self):
        """Venció hace exactamente 30 días → último día de la ventana."""
        assert is_renewable(exp(-30)) is True

    # ── Fuera de la ventana ────────────────────────────────────────────────

    def test_expired_31_days_not_renewable(self):
        """Venció hace 31 días → un día fuera de ventana, nueva contratación."""
        assert is_renewable(exp(-31)) is False

    def test_expired_45_days_not_renewable(self):
        """Venció hace 45 días → perdida, nueva contratación requerida."""
        assert is_renewable(exp(-45)) is False

    def test_expired_90_days_not_renewable(self):
        """Venció hace 90 días → definitivamente perdida."""
        assert is_renewable(exp(-90)) is False

    # ── El límite es exactamente 30, no 29 ni 31 ──────────────────────────

    def test_boundary_is_exactly_30_days(self):
        """Confirma que el límite es 30 días, no más, no menos."""
        assert is_renewable(exp(-30)) is True   # último día válido
        assert is_renewable(exp(-31)) is False  # primer día inválido
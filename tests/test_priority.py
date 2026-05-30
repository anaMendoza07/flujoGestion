"""
Tests: cálculo de prioridad.

Valida que cada nivel se asigne correctamente según los días
al vencimiento, incluyendo los bordes exactos de cada rango.
"""
from datetime import date, timedelta
from backend.services.priority_service import calculate_priority


def exp(offset_days):
    """Devuelve una fecha ISO a N días desde hoy."""
    return (date.today() + timedelta(days=offset_days)).isoformat()


class TestCalculatePriority:

    # ── Casos principales ──────────────────────────────────────────────────

    def test_low_far_future(self):
        """Vence en 60 días → prioridad baja."""
        assert calculate_priority(exp(60)) == "low"

    def test_low_boundary(self):
        """Vence en exactamente 16 días → todavía low."""
        assert calculate_priority(exp(16)) == "low"

    def test_medium_15_days(self):
        """Vence en 15 días → entra en zona de atención."""
        assert calculate_priority(exp(15)) == "medium"

    def test_medium_8_days(self):
        """Vence en 8 días → medium."""
        assert calculate_priority(exp(8)) == "medium"

    def test_high_7_days(self):
        """Vence en 7 días → urgente."""
        assert calculate_priority(exp(7)) == "high"

    def test_high_today(self):
        """Vence hoy → máxima urgencia antes de vencer."""
        assert calculate_priority(exp(0)) == "high"

    def test_high_1_day(self):
        """Vence mañana → high."""
        assert calculate_priority(exp(1)) == "high"

    # ── Zona crítica: ventana de 30 días ───────────────────────────────────

    def test_critical_1_day_expired(self):
        """Venció ayer → critical (ventana activa)."""
        assert calculate_priority(exp(-1)) == "critical"

    def test_critical_15_days_expired(self):
        """Venció hace 15 días → critical."""
        assert calculate_priority(exp(-15)) == "critical"

    def test_critical_30_days_expired(self):
        """Venció hace exactamente 30 días → todavía critical (límite incluido)."""
        assert calculate_priority(exp(-30)) == "critical"

    # ── Zona perdida: más de 30 días vencida ───────────────────────────────

    def test_lost_31_days_expired(self):
        """Venció hace 31 días → lost (fuera de ventana, nueva contratación)."""
        assert calculate_priority(exp(-31)) == "lost"

    def test_lost_far_past(self):
        """Venció hace 90 días → lost."""
        assert calculate_priority(exp(-90)) == "lost"

    # ── Borde exacto entre medium y high ──────────────────────────────────

    def test_boundary_medium_to_high(self):
        """7 días es high, 8 días es medium. El borde es exacto."""
        assert calculate_priority(exp(7)) == "high"
        assert calculate_priority(exp(8)) == "medium"

    # ── Borde exacto entre critical y lost ────────────────────────────────

    def test_boundary_critical_to_lost(self):
        """30 días vencida es critical, 31 días es lost. Regla colombiana."""
        assert calculate_priority(exp(-30)) == "critical"
        assert calculate_priority(exp(-31)) == "lost"
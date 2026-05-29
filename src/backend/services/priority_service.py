from datetime import date


def calculate_priority(expiration_date_str):
    """
    Calcula la prioridad de una póliza según su fecha de vencimiento.

    Reglas de negocio:
    - vence en más de 15 días  -> low
    - vence en 8–15 días       -> medium  (zona de atención)
    - vence en 0–7 días        -> high    (urgente)
    - vencida hace 1–30 días   -> critical (ventana de renovación activa)
    - vencida hace más de 30 días -> lost (nueva contratación requerida)
    """
    today = date.today()
    expiration = date.fromisoformat(expiration_date_str)
    days_diff = (expiration - today).days  # positivo = futuro, negativo = pasado

    if days_diff > 15:
        return "low"
    elif days_diff > 7:
        return "medium"
    elif days_diff >= 0:
        return "high"
    elif days_diff >= -30:
        return "critical"
    else:
        return "lost"


def calculate_status(expiration_date_str, current_status):
    """
    Determina el estado de la póliza basado en vencimiento.
    No sobreescribe estados terminales como 'renewed'.
    """
    if current_status == "renewed":
        return "renewed"

    today = date.today()
    expiration = date.fromisoformat(expiration_date_str)
    days_diff = (expiration - today).days

    if days_diff > 30:
        return "active"
    elif days_diff > 0:
        return "upcoming"
    elif days_diff >= -30:
        return "expired"
    else:
        return "lost"


def is_renewable(expiration_date_str):
    """
    Regla crítica de negocio colombiana:
    Una póliza vencida puede renovarse fácilmente si venció hace <= 30 días.
    Después de 30 días se considera nueva contratación.
    """
    today = date.today()
    expiration = date.fromisoformat(expiration_date_str)
    days_since_expiration = (today - expiration).days
    return 0 <= days_since_expiration <= 30
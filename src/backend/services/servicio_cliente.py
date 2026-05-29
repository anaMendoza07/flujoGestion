"""
Servicio de clientes.
Toda la lógica de negocio de clientes vive aquí.
Los routers solo llaman funciones de este módulo.
"""
from database import get_connection
from models.client import client_to_dict


def _validate_client_data(data: dict, require_full_name: bool = True) -> list[str]:
    """Retorna lista de errores de validación."""
    errors = []
    full_name = (data.get("full_name") or "").strip()
    if require_full_name and not full_name:
        errors.append("full_name es requerido")
    email = (data.get("email") or "").strip()
    if email and "@" not in email:
        errors.append("email no tiene formato válido")
    return errors


def get_all_clients() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM clients ORDER BY full_name COLLATE NOCASE"
    ).fetchall()
    conn.close()
    return [client_to_dict(r) for r in rows]


def get_client_by_id(client_id: int) -> dict | None:
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM clients WHERE id = ?", (client_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    return client_to_dict(row)


def create_client(data: dict) -> tuple[dict | None, list[str]]:
    """Retorna (client_dict, errors). Si errors no está vacío, client_dict es None."""
    errors = _validate_client_data(data, require_full_name=True)
    if errors:
        return None, errors

    conn = get_connection()
    cursor = conn.execute(
        """INSERT INTO clients (full_name, phone, email, document_number, notes)
           VALUES (?, ?, ?, ?, ?)""",
        (
            data["full_name"].strip(),
            (data.get("phone") or "").strip() or None,
            (data.get("email") or "").strip() or None,
            (data.get("document_number") or "").strip() or None,
            (data.get("notes") or "").strip() or None,
        ),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM clients WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    conn.close()
    return client_to_dict(row), []


def update_client(client_id: int, data: dict) -> tuple[dict | None, list[str]]:
    """Retorna (client_dict, errors). client_dict es None si no existe."""
    errors = _validate_client_data(data, require_full_name=True)
    if errors:
        return None, errors

    conn = get_connection()
    existing = conn.execute(
        "SELECT id FROM clients WHERE id = ?", (client_id,)
    ).fetchone()
    if not existing:
        conn.close()
        return None, ["Cliente no encontrado"]

    conn.execute(
        """UPDATE clients
           SET full_name = ?, phone = ?, email = ?, document_number = ?, notes = ?
           WHERE id = ?""",
        (
            data["full_name"].strip(),
            (data.get("phone") or "").strip() or None,
            (data.get("email") or "").strip() or None,
            (data.get("document_number") or "").strip() or None,
            (data.get("notes") or "").strip() or None,
            client_id,
        ),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM clients WHERE id = ?", (client_id,)
    ).fetchone()
    conn.close()
    return client_to_dict(row), []


def delete_client(client_id: int) -> tuple[bool, str]:
    """Retorna (success, error_message)."""
    conn = get_connection()
    existing = conn.execute(
        "SELECT id FROM clients WHERE id = ?", (client_id,)
    ).fetchone()
    if not existing:
        conn.close()
        return False, "Cliente no encontrado"

    # Verifica si tiene pólizas activas
    policy_count = conn.execute(
        "SELECT COUNT(*) as cnt FROM policies WHERE client_id = ?", (client_id,)
    ).fetchone()["cnt"]
    if policy_count > 0:
        conn.close()
        return False, f"No se puede eliminar: el cliente tiene {policy_count} póliza(s) registrada(s)"

    conn.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    conn.commit()
    conn.close()
    return True, ""


def get_client_policies(client_id: int) -> list[dict] | None:
    """Retorna las pólizas de un cliente, o None si el cliente no existe."""
    conn = get_connection()
    exists = conn.execute(
        "SELECT id FROM clients WHERE id = ?", (client_id,)
    ).fetchone()
    if not exists:
        conn.close()
        return None

    rows = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone, c.notes as client_notes
           FROM policies p
           JOIN clients c ON p.client_id = c.id
           WHERE p.client_id = ?
           ORDER BY p.expiration_date ASC""",
        (client_id,),
    ).fetchall()
    conn.close()

    from models.policy import policy_to_dict
    result = []
    for row in rows:
        p = policy_to_dict(row)
        p["client_name"] = row["client_name"]
        p["client_phone"] = row["client_phone"]
        p["client_notes"] = row["client_notes"]
        result.append(p)
    return result
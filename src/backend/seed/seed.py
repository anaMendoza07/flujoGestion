"""
Seed realista para Agentemotor.
Genera clientes y pólizas en todos los estados de prioridad
para que María pueda ver la aplicación funcionando desde el primer día.
"""
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import get_connection, init_db


def days_from_today(delta):
    return (date.today() + timedelta(days=delta)).isoformat()


def run():
    init_db()
    conn = get_connection()

    # Limpia datos anteriores
    conn.execute("DELETE FROM policy_activities")
    conn.execute("DELETE FROM policies")
    conn.execute("DELETE FROM clients")
    conn.execute("DELETE FROM sqlite_sequence")
    conn.commit()

    # ── Clientes ────────────────────────────────────────────────────────────
    clients = [
        ("Carlos Ramírez",    "3001234567", "carlos@email.com"),
        ("Laura Gómez",       "3109876543", "laura@email.com"),
        ("Andrés Torres",     "3157654321", "andres@email.com"),
        ("Valentina Herrera", "3201112233", "vale@email.com"),
        ("Jorge Castillo",    "3004445566", "jorge@email.com"),
        ("Natalia Parra",     "3118887766", "natalia@email.com"),
    ]

    client_ids = []
    for name, phone, email in clients:
        cur = conn.execute(
            "INSERT INTO clients (full_name, phone, email) VALUES (?, ?, ?)",
            (name, phone, email)
        )
        client_ids.append(cur.lastrowid)
    conn.commit()

    # ── Pólizas — un escenario por cada nivel de prioridad ─────────────────
    policies = [
        # (client_idx, type, insurer, expiration_offset_days, premium)
        (0, "auto",   "Sura",      60,   890_000),   # low       — vence en 60 días
        (1, "auto",   "Bolívar",   12,   750_000),   # medium    — vence en 12 días
        (2, "auto",   "Mapfre",    3,    680_000),   # high      — vence en 3 días
        (3, "auto",   "Allianz",  -10,   920_000),   # critical  — venció hace 10 días
        (4, "auto",   "Axa",      -25,   600_000),   # critical  — venció hace 25 días (límite ventana)
        (5, "auto",   "Sura",     -45,   710_000),   # lost      — venció hace 45 días
        (0, "hogar",  "Bolívar",  45,    430_000),   # low       — segundo seguro de Carlos
    ]

    policy_ids = []
    for client_idx, ptype, insurer, offset, premium in policies:
        expiration = days_from_today(offset)
        cur = conn.execute(
            """INSERT INTO policies (client_id, policy_type, insurer, expiration_date, premium_amount)
               VALUES (?, ?, ?, ?, ?)""",
            (client_ids[client_idx], ptype, insurer, expiration, premium)
        )
        policy_ids.append(cur.lastrowid)
    conn.commit()

    # ── Actividades de ejemplo ──────────────────────────────────────────────
    activities = [
        (policy_ids[1], "contact", "Llamé a Laura, dice que quiere renovar pero necesita cotización primero."),
        (policy_ids[2], "reminder", "Póliza de Andrés vence en 3 días. Llamar hoy."),
        (policy_ids[3], "contact", "Contacté a Valentina. Póliza vencida hace 10 días, confirmó interés en renovar."),
        (policy_ids[4], "contact", "Jorge no contesta el celular. Intentar por WhatsApp."),
        (policy_ids[5], "note",    "Natalia dijo que está evaluando otras aseguradoras. Póliza perdida."),
    ]

    for policy_id, atype, note in activities:
        conn.execute(
            "INSERT INTO policy_activities (policy_id, activity_type, note) VALUES (?, ?, ?)",
            (policy_id, atype, note)
        )
    conn.commit()
    conn.close()

    print("✅ Seed completado:")
    print(f"   {len(clients)} clientes")
    print(f"   {len(policies)} pólizas (todos los niveles de prioridad)")
    print(f"   {len(activities)} actividades de ejemplo")


if __name__ == "__main__":
    run()
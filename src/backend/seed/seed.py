"""
Seed realista para Agentemotor — versión extendida.
Genera 15 clientes y ~35 pólizas cubriendo todos los tipos (auto, vida, hogar,
salud, soat, pyme, viaje, accidentes) y todos los estados de prioridad,
con actividades de ejemplo en cada una.
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

    conn.execute("DELETE FROM policy_activities")
    conn.execute("DELETE FROM policies")
    conn.execute("DELETE FROM clients")
    conn.execute("DELETE FROM sqlite_sequence")
    conn.commit()

    # ── Clientes ────────────────────────────────────────────────────────────
    clients_data = [
        ("Carlos Ramírez",       "3001234567", "carlos.ramirez@gmail.com"),
        ("Laura Gómez",          "3109876543", "laurita.gomez@hotmail.com"),
        ("Andrés Torres",        "3157654321", "andres.torres@empresa.co"),
        ("Valentina Herrera",    "3201112233", "vale.herrera@gmail.com"),
        ("Jorge Castillo",       "3004445566", "jorge.castillo@yahoo.com"),
        ("Natalia Parra",        "3118887766", "natalia.parra@outlook.com"),
        ("Miguel Ángel Rojas",   "3205556677", "miguelangel.rojas@gmail.com"),
        ("Daniela Moreno",       "3123334455", "dani.moreno@empresa.co"),
        ("Felipe Sánchez",       "3006667788", "felipe.sanchez@gmail.com"),
        ("Isabella Vargas",      "3178889900", "isabella.vargas@hotmail.com"),
        ("Camilo Ospina",        "3209990011", "camilo.ospina@gmail.com"),
        ("Sofía Mendoza",        "3141122334", "sofia.mendoza@outlook.com"),
        ("Rodrigo Peña",         "3002233445", "rodrigo.pena@empresa.co"),
        ("Alejandra Castro",     "3183344556", "ale.castro@gmail.com"),
        ("Sebastián Jiménez",    "3214455667", "sebas.jimenez@yahoo.com"),
    ]

    client_ids = []
    for name, phone, email in clients_data:
        cur = conn.execute(
            "INSERT INTO clients (full_name, phone, email) VALUES (?, ?, ?)",
            (name, phone, email)
        )
        client_ids.append(cur.lastrowid)
    conn.commit()

    # ── Pólizas ─────────────────────────────────────────────────────────────
    # (client_idx, type, insurer, expiration_offset_days, premium)
    policies_data = [
        # ── AUTO ──
        (0,  "auto",       "Sura",         60,   890_000),   # low — 60 días
        (1,  "auto",       "Bolívar",       12,   750_000),   # medium — 12 días
        (2,  "auto",       "Mapfre",         3,   680_000),   # high — 3 días
        (3,  "auto",       "Allianz",       -8,   920_000),   # critical — vencida 8 días
        (4,  "auto",       "Axa",          -22,   600_000),   # critical — vencida 22 días
        (5,  "auto",       "Sura",         -50,   710_000),   # lost — fuera de ventana
        (6,  "auto",       "HDI",           45,   830_000),   # low
        (7,  "auto",       "Bolívar",        7,   695_000),   # high — 7 días

        # ── VIDA ──
        (0,  "vida",       "Sura",         180, 1_250_000),   # low
        (8,  "vida",       "MetLife",       20,   980_000),   # medium
        (9,  "vida",       "Bolívar",        5,   870_000),   # high
        (10, "vida",       "Allianz",      -15, 1_100_000),   # critical
        (11, "vida",       "Suramericana", -55,   950_000),   # lost

        # ── HOGAR ──
        (0,  "hogar",      "Bolívar",       45,   430_000),   # low
        (1,  "hogar",      "Sura",          14,   390_000),   # medium
        (12, "hogar",      "Mapfre",         2,   510_000),   # high
        (13, "hogar",      "HDI",          -12,   465_000),   # critical
        (6,  "hogar",      "Axa",          120,   420_000),   # low

        # ── SALUD ──
        (2,  "salud",      "Compensar",     90,   780_000),   # low
        (3,  "salud",      "Sura",          10,   850_000),   # medium
        (4,  "salud",      "Coomeva",        4,   720_000),   # high
        (14, "salud",      "Colmédica",    -18,   900_000),   # critical
        (5,  "salud",      "Nueva EPS",    -60,   660_000),   # lost

        # ── SOAT ──
        (7,  "soat",       "Sura",          30,   160_000),   # low
        (8,  "soat",       "Bolívar",        8,   155_000),   # medium
        (9,  "soat",       "Mapfre",         1,   162_000),   # high — 1 día!
        (10, "soat",       "Allianz",       -5,   158_000),   # critical

        # ── PYME ──
        (11, "pyme",       "Suramericana",  75, 2_400_000),   # low
        (12, "pyme",       "HDI",           11, 1_900_000),   # medium
        (13, "pyme",       "Mapfre",        -9, 2_100_000),   # critical

        # ── VIAJE ──
        (14, "viaje",      "Assist Card",   25,   320_000),   # low
        (0,  "viaje",      "Allianz",        6,   295_000),   # high

        # ── ACCIDENTES ──
        (1,  "accidentes", "Sura",          50,   270_000),   # low
        (2,  "accidentes", "Bolívar",       15,   255_000),   # medium
        (3,  "accidentes", "AXA",          -20,   280_000),   # critical
    ]

    policy_ids = []
    for client_idx, ptype, insurer, offset, premium in policies_data:
        expiration = days_from_today(offset)
        cur = conn.execute(
            """INSERT INTO policies (client_id, policy_type, insurer, expiration_date, premium_amount)
               VALUES (?, ?, ?, ?, ?)""",
            (client_ids[client_idx], ptype, insurer, expiration, premium)
        )
        policy_ids.append(cur.lastrowid)
    conn.commit()

    # ── Actividades ──────────────────────────────────────────────────────────
    activities = [
        # Auto
        (policy_ids[1],  "contact",  "Llamé a Laura. Quiere renovar pero pide cotización primero con Mapfre."),
        (policy_ids[2],  "reminder", "Póliza de Andrés vence en 3 días. Confirmar renovación hoy."),
        (policy_ids[3],  "contact",  "Valentina confirmó interés en renovar. Envié propuesta por WhatsApp."),
        (policy_ids[4],  "contact",  "Jorge no contesta. Segundo intento mañana."),
        (policy_ids[5],  "note",     "Natalia prefirió otra aseguradora. Póliza marcada como perdida."),
        # Vida
        (policy_ids[9],  "contact",  "Isabella pregunta si puede cambiar beneficiarios. Le expliqué el proceso."),
        (policy_ids[10], "contact",  "Camilo póliza vencida 15 días. Interesado en renovar si bajan prima."),
        (policy_ids[11], "note",     "Sofía canceló póliza de vida. No quiso renovar."),
        # Hogar
        (policy_ids[14], "reminder", "Póliza hogar Laura vence en 14 días. Contactar esta semana."),
        (policy_ids[15], "contact",  "Felipe confirmó renovación de hogar. Esperando pago."),
        (policy_ids[16], "contact",  "Alejandra: póliza vencida hace 12 días. Dice que fue robo en casa, quiere hablar."),
        # Salud
        (policy_ids[19], "contact",  "Jorge quiere mejorar plan de salud al renovar. Envié opciones Sura y Compensar."),
        (policy_ids[20], "contact",  "Sebastián confirma renovación de salud. Fecha acordada para la próxima semana."),
        (policy_ids[21], "note",     "No se pudo contactar a Sebastián después de 3 intentos. Póliza por vencer en 1 día."),
        (policy_ids[22], "note",     "Natalia canceló plan de salud Nueva EPS. Evalúa otras opciones."),
        # SOAT
        (policy_ids[25], "reminder", "SOAT de Camilo vence mañana. ¡Urgente! Llamar de inmediato."),
        (policy_ids[26], "contact",  "SOAT de Camilo renovado. Muy satisfecho con el proceso rápido."),
        # Pyme
        (policy_ids[27], "contact",  "Sofía (pyme) necesita ampliar cobertura por nuevo local. Cotizando."),
        (policy_ids[28], "contact",  "Felipe pyme: póliza por vencer en 11 días. Envió doc actualización de inventario."),
        (policy_ids[29], "contact",  "Alejandra: póliza pyme vencida. No responde correos. Intentar celular."),
        # Viaje
        (policy_ids[30], "note",     "Sebastián viaja a Europa en 3 semanas. Póliza de viaje contratada."),
        # Accidentes
        (policy_ids[31], "contact",  "Carlos póliza accidentes próxima a vencer en 50 días. Recordatorio preventivo."),
        (policy_ids[33], "contact",  "Valentina reportó accidente leve. Ya iniciado proceso de reclamación."),
    ]

    for policy_id, atype, note in activities:
        conn.execute(
            "INSERT INTO policy_activities (policy_id, activity_type, note) VALUES (?, ?, ?)",
            (policy_id, atype, note)
        )
    conn.commit()
    conn.close()

    print("✅ Seed extendido completado:")
    print(f"   {len(clients_data)} clientes")
    print(f"   {len(policies_data)} pólizas (auto, vida, hogar, salud, soat, pyme, viaje, accidentes)")
    print(f"   {len(activities)} actividades de ejemplo")


if __name__ == "__main__":
    run()
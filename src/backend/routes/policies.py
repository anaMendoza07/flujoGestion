from flask import Blueprint, request, jsonify
from database import get_connection
from models.policy import policy_to_dict
from models.client import client_to_dict
from services.priority_service import calculate_priority, calculate_status, is_renewable

policies_bp = Blueprint("policies", __name__)


def _enrich_policy(row):
    """Agrega prioridad y estado calculados dinámicamente."""
    policy = policy_to_dict(row)
    policy["priority_level"] = calculate_priority(policy["expiration_date"])
    policy["status"] = calculate_status(policy["expiration_date"], policy["status"])
    policy["is_renewable"] = is_renewable(policy["expiration_date"])
    return policy


@policies_bp.route("/policies", methods=["GET"])
def list_policies():
    conn = get_connection()

    query = """
        SELECT p.*, c.full_name as client_name, c.phone as client_phone
        FROM policies p
        JOIN clients c ON p.client_id = c.id
        ORDER BY p.expiration_date ASC
    """
    rows = conn.execute(query).fetchall()
    conn.close()

    policies = []
    for row in rows:
        policy = _enrich_policy(row)
        policy["client_name"] = row["client_name"]
        policy["client_phone"] = row["client_phone"]
        policies.append(policy)

    # Filtros opcionales por query params
    status    = request.args.get("status")
    priority  = request.args.get("priority")
    insurer   = request.args.get("insurer")
    client_id = request.args.get("client_id")

    if status:
        policies = [p for p in policies if p["status"] == status]
    if priority:
        policies = [p for p in policies if p["priority_level"] == priority]
    if insurer:
        policies = [p for p in policies if p["insurer"].lower() == insurer.lower()]
    if client_id:
        policies = [p for p in policies if str(p["client_id"]) == client_id]

    return jsonify(policies)


@policies_bp.route("/policies/<int:policy_id>", methods=["GET"])
def get_policy(policy_id):
    conn = get_connection()
    row = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.id = ?""",
        (policy_id,)
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Póliza no encontrada"}), 404

    policy = _enrich_policy(row)
    policy["client_name"] = row["client_name"]
    policy["client_phone"] = row["client_phone"]
    return jsonify(policy)


@policies_bp.route("/policies", methods=["POST"])
def create_policy():
    data = request.get_json()
    required = ["client_id", "policy_type", "insurer", "expiration_date"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} es requerido"}), 400

    expiration_date = data["expiration_date"]
    priority = calculate_priority(expiration_date)
    status   = calculate_status(expiration_date, "active")

    conn = get_connection()
    cursor = conn.execute(
        """INSERT INTO policies
           (client_id, policy_type, insurer, expiration_date, status, priority_level, premium_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            data["client_id"],
            data["policy_type"],
            data["insurer"],
            expiration_date,
            status,
            priority,
            data.get("premium_amount"),
        ),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.id = ?""",
        (cursor.lastrowid,)
    ).fetchone()
    conn.close()

    policy = _enrich_policy(row)
    policy["client_name"] = row["client_name"]
    policy["client_phone"] = row["client_phone"]
    return jsonify(policy), 201


@policies_bp.route("/policies/<int:policy_id>", methods=["PUT"])
def update_policy(policy_id):
    data = request.get_json()
    conn = get_connection()
    existing = conn.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Póliza no encontrada"}), 404

    expiration_date = data.get("expiration_date", existing["expiration_date"])
    priority = calculate_priority(expiration_date)
    status   = calculate_status(expiration_date, data.get("status", existing["status"]))

    conn.execute(
        """UPDATE policies SET
           client_id = ?, policy_type = ?, insurer = ?, expiration_date = ?,
           status = ?, priority_level = ?, premium_amount = ?
           WHERE id = ?""",
        (
            data.get("client_id",       existing["client_id"]),
            data.get("policy_type",     existing["policy_type"]),
            data.get("insurer",         existing["insurer"]),
            expiration_date,
            status,
            priority,
            data.get("premium_amount",  existing["premium_amount"]),
            policy_id,
        ),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.id = ?""",
        (policy_id,)
    ).fetchone()
    conn.close()

    policy = _enrich_policy(row)
    policy["client_name"] = row["client_name"]
    policy["client_phone"] = row["client_phone"]
    return jsonify(policy)


@policies_bp.route("/policies/<int:policy_id>", methods=["DELETE"])
def delete_policy(policy_id):
    conn = get_connection()
    existing = conn.execute("SELECT id FROM policies WHERE id = ?", (policy_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Póliza no encontrada"}), 404

    conn.execute("DELETE FROM policies WHERE id = ?", (policy_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Póliza eliminada"}), 200


@policies_bp.route("/policies/<int:policy_id>/renew", methods=["POST"])
def renew_policy(policy_id):
    """
    Acción de renovación. Solo permitida dentro de la ventana de 30 días.
    Requiere nueva fecha de vencimiento en el body.
    """
    conn = get_connection()
    existing = conn.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Póliza no encontrada"}), 404

    if not is_renewable(existing["expiration_date"]):
        conn.close()
        return jsonify({
            "error": "Póliza fuera de ventana de renovación. Han pasado más de 30 días desde el vencimiento."
        }), 400

    data = request.get_json() or {}
    new_expiration = data.get("new_expiration_date")
    if not new_expiration:
        conn.close()
        return jsonify({"error": "new_expiration_date es requerido"}), 400

    new_priority = calculate_priority(new_expiration)

    conn.execute(
        "UPDATE policies SET status = 'renewed', expiration_date = ?, priority_level = ? WHERE id = ?",
        (new_expiration, new_priority, policy_id),
    )
    # Registra actividad automáticamente
    conn.execute(
        "INSERT INTO policy_activities (policy_id, activity_type, note) VALUES (?, ?, ?)",
        (policy_id, "renewal", f"Póliza renovada. Nueva fecha de vencimiento: {new_expiration}"),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.id = ?""",
        (policy_id,)
    ).fetchone()
    conn.close()

    policy = _enrich_policy(row)
    policy["client_name"] = row["client_name"]
    policy["client_phone"] = row["client_phone"]
    return jsonify(policy)


# ── Reportes simples ────────────────────────────────────────────────────────

@policies_bp.route("/reports/critical", methods=["GET"])
def report_critical():
    """Pólizas críticas: vencidas dentro de la ventana de 30 días."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.status != 'renewed'
           ORDER BY p.expiration_date ASC"""
    ).fetchall()
    conn.close()

    critical = []
    for row in rows:
        policy = _enrich_policy(row)
        policy["client_name"] = row["client_name"]
        policy["client_phone"] = row["client_phone"]
        if policy["priority_level"] == "critical":
            critical.append(policy)

    return jsonify(critical)


@policies_bp.route("/reports/renewals-this-month", methods=["GET"])
def report_renewals_month():
    """Pólizas que vencen este mes calendario."""
    from datetime import date
    today = date.today()
    first_day = today.replace(day=1).isoformat()
    # Último día del mes
    if today.month == 12:
        last_day = today.replace(year=today.year + 1, month=1, day=1)
    else:
        last_day = today.replace(month=today.month + 1, day=1)
    last_day = last_day.isoformat()

    conn = get_connection()
    rows = conn.execute(
        """SELECT p.*, c.full_name as client_name, c.phone as client_phone
           FROM policies p JOIN clients c ON p.client_id = c.id
           WHERE p.expiration_date >= ? AND p.expiration_date < ?
             AND p.status != 'renewed'
           ORDER BY p.expiration_date ASC""",
        (first_day, last_day),
    ).fetchall()
    conn.close()

    policies = []
    for row in rows:
        policy = _enrich_policy(row)
        policy["client_name"] = row["client_name"]
        policy["client_phone"] = row["client_phone"]
        policies.append(policy)

    return jsonify(policies)
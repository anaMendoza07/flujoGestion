from flask import Blueprint, request, jsonify
from database import get_connection
from models.activity import activity_to_dict

activities_bp = Blueprint("activities", __name__)

VALID_TYPES = {"contact", "note", "renewal", "reminder", "other"}


@activities_bp.route("/policies/<int:policy_id>/activities", methods=["GET"])
def list_activities(policy_id):
    conn = get_connection()
    policy = conn.execute("SELECT id FROM policies WHERE id = ?", (policy_id,)).fetchone()
    if not policy:
        conn.close()
        return jsonify({"error": "Póliza no encontrada"}), 404

    rows = conn.execute(
        "SELECT * FROM policy_activities WHERE policy_id = ? ORDER BY created_at DESC",
        (policy_id,)
    ).fetchall()
    conn.close()
    return jsonify([activity_to_dict(r) for r in rows])


@activities_bp.route("/policies/<int:policy_id>/activities", methods=["POST"])
def create_activity(policy_id):
    conn = get_connection()
    policy = conn.execute("SELECT id FROM policies WHERE id = ?", (policy_id,)).fetchone()
    if not policy:
        conn.close()
        return jsonify({"error": "Póliza no encontrada"}), 404

    data = request.get_json()
    activity_type = data.get("activity_type", "other")
    if activity_type not in VALID_TYPES:
        conn.close()
        return jsonify({"error": f"Tipo inválido. Usa: {', '.join(VALID_TYPES)}"}), 400

    cursor = conn.execute(
        "INSERT INTO policy_activities (policy_id, activity_type, note) VALUES (?, ?, ?)",
        (policy_id, activity_type, data.get("note")),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM policy_activities WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    conn.close()
    return jsonify(activity_to_dict(row)), 201
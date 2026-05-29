from flask import Blueprint, request, jsonify
from database import get_connection
from models.client import client_to_dict

clients_bp = Blueprint("clients", __name__)


@clients_bp.route("/clients", methods=["GET"])
def list_clients():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM clients ORDER BY full_name").fetchall()
    conn.close()
    return jsonify([client_to_dict(r) for r in rows])


@clients_bp.route("/clients/<int:client_id>", methods=["GET"])
def get_client(client_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM clients WHERE id = ?", (client_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Cliente no encontrado"}), 404
    return jsonify(client_to_dict(row))


@clients_bp.route("/clients", methods=["POST"])
def create_client():
    data = request.get_json()
    full_name = (data.get("full_name") or "").strip()
    if not full_name:
        return jsonify({"error": "full_name es requerido"}), 400

    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO clients (full_name, phone, email) VALUES (?, ?, ?)",
        (full_name, data.get("phone"), data.get("email")),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM clients WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return jsonify(client_to_dict(row)), 201


@clients_bp.route("/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    data = request.get_json()
    conn = get_connection()
    existing = conn.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Cliente no encontrado"}), 404

    conn.execute(
        "UPDATE clients SET full_name = ?, phone = ?, email = ? WHERE id = ?",
        (data.get("full_name"), data.get("phone"), data.get("email"), client_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM clients WHERE id = ?", (client_id,)).fetchone()
    conn.close()
    return jsonify(client_to_dict(row))


@clients_bp.route("/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    conn = get_connection()
    existing = conn.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Cliente no encontrado"}), 404

    conn.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Cliente eliminado"}), 200
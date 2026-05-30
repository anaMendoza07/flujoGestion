"""
Tests: renovación de póliza vía endpoint.

Valida el flujo completo: cliente → póliza → renovación.
Usa la DB en memoria del fixture para no contaminar datos reales.
"""
import json
from datetime import date, timedelta


def exp(offset_days):
    return (date.today() + timedelta(days=offset_days)).isoformat()


def create_client(client, name="Test Cliente"):
    """Helper: crea un cliente y devuelve su id."""
    res = client.post("/api/clients", json={"full_name": name, "phone": "3001234567"})
    return res.get_json()["id"]


def create_policy(client, client_id, expiration_offset):
    """Helper: crea una póliza y devuelve el objeto completo."""
    res = client.post("/api/policies", json={
        "client_id":       client_id,
        "policy_type":     "auto",
        "insurer":         "Sura",
        "expiration_date": exp(expiration_offset),
        "premium_amount":  800_000,
    })
    return res.get_json()


class TestPolicyRenewal:

    # ── Renovación exitosa ─────────────────────────────────────────────────

    def test_renew_recently_expired_policy(self, client):
        """Póliza vencida hace 10 días → renovación exitosa."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-10)

        new_expiration = exp(365)
        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": new_expiration})

        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "renewed"
        assert data["expiration_date"] == new_expiration

    def test_renew_updates_expiration_date(self, client):
        """Al renovar, la fecha de vencimiento debe actualizarse."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-5)

        new_expiration = exp(365)
        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": new_expiration})

        assert res.get_json()["expiration_date"] == new_expiration

    def test_renew_recalculates_priority(self, client):
        """Al renovar con fecha futura lejana, la prioridad debe bajar a low."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-10)

        # Venció hace 10 días → critical antes de renovar
        assert policy["priority_level"] == "critical"

        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": exp(365)})

        assert res.get_json()["priority_level"] == "low"

    def test_renew_on_last_day_of_window(self, client):
        """Renovar en el día 30 exacto → debe funcionar (límite incluido)."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-30)

        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": exp(365)})

        assert res.status_code == 200
        assert res.get_json()["status"] == "renewed"

    def test_renew_creates_activity_log(self, client):
        """Al renovar, debe quedar un registro en el historial de actividades."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-5)

        client.post(f"/api/policies/{policy['id']}/renew",
                    json={"new_expiration_date": exp(365)})

        activities_res = client.get(f"/api/policies/{policy['id']}/activities")
        activities = activities_res.get_json()

        renewal_activities = [a for a in activities if a["activity_type"] == "renewal"]
        assert len(renewal_activities) == 1
        assert exp(365) in renewal_activities[0]["note"]

    # ── Renovación bloqueada ───────────────────────────────────────────────

    def test_cannot_renew_outside_window(self, client):
        """Póliza vencida hace 31 días → renovación bloqueada (400)."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-31)

        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": exp(365)})

        assert res.status_code == 400
        assert "30 días" in res.get_json()["error"]

    def test_cannot_renew_active_policy(self, client):
        """Póliza vigente (no vencida) → no está en ventana de renovación."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=30)

        res = client.post(f"/api/policies/{policy['id']}/renew",
                          json={"new_expiration_date": exp(365)})

        assert res.status_code == 400

    def test_renew_requires_new_expiration_date(self, client):
        """Renovar sin enviar nueva fecha → error 400."""
        cid = create_client(client)
        policy = create_policy(client, cid, expiration_offset=-5)

        res = client.post(f"/api/policies/{policy['id']}/renew", json={})

        assert res.status_code == 400
        assert "new_expiration_date" in res.get_json()["error"]

    def test_renew_nonexistent_policy(self, client):
        """Renovar una póliza que no existe → 404."""
        res = client.post("/api/policies/9999/renew",
                          json={"new_expiration_date": exp(365)})
        assert res.status_code == 404
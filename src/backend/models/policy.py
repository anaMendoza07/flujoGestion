def policy_to_dict(row):
    return {
        "id":              row["id"],
        "client_id":       row["client_id"],
        "policy_type":     row["policy_type"],
        "insurer":         row["insurer"],
        "expiration_date": row["expiration_date"],
        "status":          row["status"],
        "priority_level":  row["priority_level"],
        "premium_amount":  row["premium_amount"],
        "created_at":      row["created_at"],
    }
 
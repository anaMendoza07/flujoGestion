def activity_to_dict(row):
    return {
        "id":            row["id"],
        "policy_id":     row["policy_id"],
        "activity_type": row["activity_type"],
        "note":          row["note"],
        "created_at":    row["created_at"],
    }
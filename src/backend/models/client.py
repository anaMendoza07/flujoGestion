def client_to_dict(row):
    return {
        "id":              row["id"],
        "full_name":       row["full_name"],
        "phone":           row["phone"],
        "email":           row["email"],
        "document_number": row["document_number"],
        "notes":           row["notes"],
        "created_at":      row["created_at"],
    }
 
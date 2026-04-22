from pathlib import Path

from app import load_directory, search_records


records, metadata = load_directory()
summary = [
    f"workbook={metadata.workbook_name}",
    f"sheet={metadata.sheet_name}",
    f"total_records={metadata.total_records}",
    f"display_columns={metadata.display_columns}",
    f"query_a_results={len(search_records(records, 'a'))}",
    f"first_record={(records[0]['_display_name'] if records else 'NONE')}",
]
Path("validation.txt").write_text("\n".join(summary) + "\n")
print("validation complete")
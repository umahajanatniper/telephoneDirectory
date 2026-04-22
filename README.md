# Telephone Directory Web App

Professional Flask web app for searching the attached Excel-based telephone directory by name, department, extension, mobile number, or other visible fields.

## Features

- Reads the Excel workbook directly from the project folder
- Detects the header row automatically
- Supports live search as users type
- Ranks name matches ahead of broader field matches
- Presents results in a polished, mobile-friendly interface

## Run locally

```bash
./.venv/bin/pip install -r requirements.txt
./.venv/bin/python app.py
```

Then open http://127.0.0.1:5000

## VS Code tasks

- `Install telephone directory dependencies`
- `Run telephone directory app`
- `Run telephone directory smoke test in venv`

## Workbook notes

The app automatically uses the first `.xlsx` file in the project root and ignores temporary Excel lock files starting with `~$`.
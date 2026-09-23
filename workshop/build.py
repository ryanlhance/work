#!/usr/bin/env python3
"""Generate workshop/data.js from the real input files in ./inputs.

Nothing is retyped: every table on the page is sliced out of the source file,
so the page cannot drift from the artifacts.

Copy is deliberately short. Someone should be able to move through this page in
under a minute and spend their time in the dashboard.
"""
import csv, json, pathlib, zipfile, xml.etree.ElementTree as ET

HERE = pathlib.Path(__file__).parent
IN = HERE / "inputs"
N = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# The use case is paraphrased from the conversation that set it up. Nobody is
# named and nothing is quoted. The strategy is in Ryan's own words.
USE_CASE = {
    "situation": [
        "Every Friday someone in client services spends half a day turning four files "
        "into a one page email for leadership. The files overlap, they do not always "
        "agree, and the worry is pasting a wrong number into something the COO reads.",
    ],
    "asked_for": [
        "Headline numbers against benchmarks",
        "Notable movements, including client money in or out",
        "What changed versus last week",
        "A few lines of commentary",
    ],
    "constraints": [
        "Weekly, not daily",
        "Performance Extract wins when files disagree",
        "The commentary stays theirs to write",
    ],
}

STRATEGY = [
    {"decision": "Read the Files Myself First",
     "why": "I don't think Claude is as smart as it thinks it is. Reading them first is "
            "how I found the gap: 1.42% in one file, 1.24% in another."},
    {"decision": "Set the Boundaries Before Building",
     "bullets": [
         "Assume the Performance Extract numbers are the most accurate and up to date.",
         "If you see a gap, alert me of what it is before making any decisions related to it.",
         "Do not create an output without my approval.",
     ]},
    {"decision": "Make It Check Itself Before I Check It",
     "why": "To create more secure gates while reading files that came from other "
            "sources, I had it ensure that what it expected to come in was what it was "
            "reading and that the output it built was the output I had expected from the "
            "beginning. This aims to ensure any prompt injections can at least be "
            "identified in a process like this."},
    {"decision": "Tell It Not to Over-Architect",
     "why": "Claude loves to do too much. If I ask for a summary, instead of three "
            "sentences, I'll get a three heading structure with paragraphs. If I am "
            "asking for bullets, I need to specify 5-7 words or 7-10 words or it will "
            "write a whole paragraph and put a bullet point in front of it. I know I am "
            "likely going to have to rewrite something, but calling it out on "
            "over-architecting and over-articulating ahead of time helps it pay "
            "attention to the decisions it is making so I can do less fixing on the "
            "back end."},
    {"decision": "Leave the Writing to a Person",
     "why": "Since Claude also over-condenses until sentences stop sounding human, I "
            "told it not to write the summary so the user could. The tool was still "
            "requested to lay out ideas that might be worth mentioning based on the "
            "data provided."},
    {"decision": "Build a Second Output",
     "why": "I come from a design background, so I like adding a little joy and ease "
            "where I can. I also think that if I can build what I am being asked to "
            "build and also build something that I think might be even more helpful in "
            "the same amount of time or in less than another hour on top of what we are "
            "currently doing, then it is worth exploring to see if the user will want to "
            "use it. The original output was simply an email. I thought maybe we could "
            "build a dashboard that essentially auto-updates weekly so that a link could "
            "be shared with the right stakeholders."},
]

GATES = [
    ("1", "Intake Security", "gate1_intake.py",
     "Right files, columns, funds and dates. No macros, no hidden code, no instruction "
     "text inside a file. Fingerprints everything."),
    ("2", "Reconciliation", "analyze.py",
     "Finds numbers that disagree across files and applies the Performance Extract rule."),
    ("3", "Self-Check", "gate3_self_check.py",
     "Re-derives every number from the raw files, independently of the first pass."),
    ("4", "Release Security", "gate4_release.py",
     "No account numbers, no links, right recipient, inputs unchanged since intake."),
]


def read_csv(name):
    with open(IN / name, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.reader(f) if any(c.strip() for c in r)]
    return {"head": rows[0], "rows": rows[1:]}


def read_sheet(z, idx):
    def cell(c):
        if c.get("t") == "inlineStr":
            t = c.find(f"{N}is/{N}t")
            return t.text if t is not None else ""
        v = c.find(f"{N}v")
        return v.text if v is not None else ""

    root = ET.fromstring(z.read(f"xl/worksheets/sheet{idx}.xml"))
    rows = [[cell(c) for c in row] for row in root.iter(f"{N}row")]
    rows = [r for r in rows if any(x.strip() for x in r)]
    return {"head": rows[0], "rows": rows[1:]}


def mask_accounts(table):
    """Account numbers are what Gate 4 exists to keep out of the email. They are
    fictional, but there is no reason to publish a column of them."""
    try:
        col = table["head"].index("Account Number")
    except ValueError:
        return table
    for r in table["rows"]:
        if len(r) > col and r[col]:
            r[col] = r[col][:4] + "•" * max(len(r[col]) - 4, 0)
    return table


def trim(table, n):
    """Show the first n rows and say how many there are."""
    total = len(table["rows"])
    if total > n:
        table["rows"] = table["rows"][:n]
        table["more"] = total
    return table


def read_pdf_paras(name):
    import fitz
    doc = fitz.open(IN / name)
    out = []
    for page in doc:
        for block in page.get_text("blocks"):
            text = " ".join(block[4].split()).strip()
            if text:
                out.append(text)
    return out


def main():
    z = zipfile.ZipFile(IN / "AI Interview Flows Report.xlsx")
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    sheet_names = [s.get("name") for s in wb.iter(f"{N}sheet")]

    data = {
        "use_case": USE_CASE,
        "strategy": STRATEGY,
        "gates": [{"n": n, "name": nm, "script": sc, "protects": pr}
                  for n, nm, sc, pr in GATES],
        "inputs": [
            {"file": "AI Interview Performance Extract.csv", "kind": "CSV",
             "role": "Source of record",
             "table": read_csv("AI Interview Performance Extract.csv")},
            {"file": "AI Interview Prior Week Performance.csv", "kind": "CSV",
             "role": "Last week",
             "table": read_csv("AI Interview Prior Week Performance.csv")},
            {"file": "AI Interview Flows Report.xlsx", "kind": "XLSX",
             "role": "Client flows",
             "sheets": [
                 # the log runs to ten rows; the top few make the point
                 {"name": sheet_names[0], "table": trim(mask_accounts(read_sheet(z, 1)), 5)},
                 {"name": sheet_names[1], "table": read_sheet(z, 2)},
             ]},
            {"file": "AI Interview Market Commentary.pdf", "kind": "PDF",
             "role": "Context",
             # the note runs longer; the opening is what the brief checks against
             "paras": read_pdf_paras("AI Interview Market Commentary.pdf")[:3]},
        ],
        "output": {
            "dashboard": {
                "href": "dashboard/",
                "shot": "../shots/dashboard.png",
                "label": "The Dashboard",
                "note": "This was the bonus effort that I thought might be more useful "
                        "to the user and their stakeholders.",
            },
            "email": {
                "label": "The Email",
                "note": "The first output based on the user's requests was a "
                        "pre-written email with all of the data, visualized for "
                        "stakeholder consumption. The first page is notes for the user "
                        "to review, an approval gate on the second page, the main body "
                        "of the email on the third page, then the summary "
                        "recommendations on the fourth page.",
            },
            "gates_label": "Built in Security Layer",
            "gates_note": "Each of four gates catches possible mistakes that a human who "
                          "is moving fast and assuming the best out of an AI agent might "
                          "not notice.",
            "skill": {
                "label": "The Skill",
                "note": "All of it is packaged as a skill. Drop the week's files in the "
                        "folder, ask Claude to run the Friday brief, and it runs the "
                        "gates, builds the email, and holds it until someone approves the "
                        "review code. Download it to read the instructions and the gate "
                        "scripts.",
                "file": "weekly-performance-brief.skill",
                "contents": [
                    "SKILL.md", "config.json", "references/writing-guide.md",
                    "scripts/gate1_intake.py", "scripts/analyze.py",
                    "scripts/gate3_self_check.py", "scripts/render.py",
                    "scripts/gate4_release.py",
                ],
            },
            "pdf": "DRAFT_Weekly_Performance_Brief_2026-08-07.pdf",
            "pages": [
                {"src": "brief/p1.png", "label": "Review sheet"},
                {"src": "brief/p2.png", "label": "How to release"},
                {"src": "brief/p3.png", "label": "Headlines and movements"},
                {"src": "brief/p4.png", "label": "Flows and summary"},
            ],
        },
    }

    out = HERE / "data.js"
    out.write_text("window.WORKSHOP = " + json.dumps(data, indent=2) + ";\n", encoding="utf-8")
    print(f"wrote {out.name} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()

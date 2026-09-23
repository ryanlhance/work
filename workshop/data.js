window.WORKSHOP = {
  "use_case": {
    "situation": [
      "Every Friday someone in client services spends half a day turning four files into a one page email for leadership. The files overlap, they do not always agree, and the worry is pasting a wrong number into something the COO reads."
    ],
    "asked_for": [
      "Headline numbers against benchmarks",
      "Notable movements, including client money in or out",
      "What changed versus last week",
      "A few lines of commentary"
    ],
    "constraints": [
      "Weekly, not daily",
      "Performance Extract wins when files disagree",
      "The commentary stays theirs to write"
    ]
  },
  "strategy": [
    {
      "decision": "Read the Files Myself First",
      "why": "I don't think Claude is as smart as it thinks it is. Reading them first is how I found the gap: 1.42% in one file, 1.24% in another."
    },
    {
      "decision": "Set the Boundaries Before Building",
      "bullets": [
        "Assume the Performance Extract numbers are the most accurate and up to date.",
        "If you see a gap, alert me of what it is before making any decisions related to it.",
        "Do not create an output without my approval."
      ]
    },
    {
      "decision": "Make It Check Itself Before I Check It",
      "why": "To create more secure gates while reading files that came from other sources, I had it ensure that what it expected to come in was what it was reading and that the output it built was the output I had expected from the beginning. This aims to ensure any prompt injections can at least be identified in a process like this."
    },
    {
      "decision": "Tell It Not to Over-Architect",
      "why": "Claude loves to do too much. If I ask for a summary, instead of three sentences, I'll get a three heading structure with paragraphs. If I am asking for bullets, I need to specify 5-7 words or 7-10 words or it will write a whole paragraph and put a bullet point in front of it. I know I am likely going to have to rewrite something, but calling it out on over-architecting and over-articulating ahead of time helps it pay attention to the decisions it is making so I can do less fixing on the back end."
    },
    {
      "decision": "Leave the Writing to a Person",
      "why": "Since Claude also over-condenses until sentences stop sounding human, I told it not to write the summary so the user could. The tool was still requested to lay out ideas that might be worth mentioning based on the data provided."
    },
    {
      "decision": "Build a Second Output",
      "why": "I come from a design background, so I like adding a little joy and ease where I can. I also think that if I can build what I am being asked to build and also build something that I think might be even more helpful in the same amount of time or in less than another hour on top of what we are currently doing, then it is worth exploring to see if the user will want to use it. The original output was simply an email. I thought maybe we could build a dashboard that essentially auto-updates weekly so that a link could be shared with the right stakeholders."
    }
  ],
  "gates": [
    {
      "n": "1",
      "name": "Intake Security",
      "script": "gate1_intake.py",
      "protects": "Right files, columns, funds and dates. No macros, no hidden code, no instruction text inside a file. Fingerprints everything."
    },
    {
      "n": "2",
      "name": "Reconciliation",
      "script": "analyze.py",
      "protects": "Finds numbers that disagree across files and applies the Performance Extract rule."
    },
    {
      "n": "3",
      "name": "Self-Check",
      "script": "gate3_self_check.py",
      "protects": "Re-derives every number from the raw files, independently of the first pass."
    },
    {
      "n": "4",
      "name": "Release Security",
      "script": "gate4_release.py",
      "protects": "No account numbers, no links, right recipient, inputs unchanged since intake."
    }
  ],
  "inputs": [
    {
      "file": "AI Interview Performance Extract.csv",
      "kind": "CSV",
      "role": "Source of record",
      "table": {
        "head": [
          "Fund",
          "Week Ending",
          "1W Return (%)",
          "MTD Return (%)",
          "YTD Return (%)",
          "Benchmark 1W (%)"
        ],
        "rows": [
          [
            "Multi-Asset Fund",
            "2026-08-07",
            "0.38",
            "0.38",
            "6.84",
            "0.35"
          ],
          [
            "Global Equity Fund",
            "2026-08-07",
            "1.42",
            "1.42",
            "11.22",
            "0.31"
          ],
          [
            "Core Fixed Income Fund",
            "2026-08-07",
            "-0.12",
            "-0.12",
            "3.18",
            "-0.10"
          ],
          [
            "Diversified Alternatives Fund",
            "2026-08-07",
            "0.21",
            "0.21",
            "4.02",
            "0.18"
          ],
          [
            "Short-Term Reserves Fund",
            "2026-08-07",
            "0.09",
            "0.09",
            "2.61",
            "0.09"
          ],
          [
            "Private Markets Access Fund",
            "2026-08-07",
            "0.00",
            "0.00",
            "5.90",
            "0.00"
          ]
        ]
      }
    },
    {
      "file": "AI Interview Prior Week Performance.csv",
      "kind": "CSV",
      "role": "Last week",
      "table": {
        "head": [
          "Fund",
          "Week Ending",
          "1W Return (%)",
          "MTD Return (%)",
          "YTD Return (%)",
          "Benchmark 1W (%)"
        ],
        "rows": [
          [
            "Multi-Asset Fund",
            "2026-07-31",
            "0.22",
            "1.05",
            "6.46",
            "0.20"
          ],
          [
            "Global Equity Fund",
            "2026-07-31",
            "0.35",
            "2.10",
            "9.80",
            "0.33"
          ],
          [
            "Core Fixed Income Fund",
            "2026-07-31",
            "0.05",
            "0.30",
            "3.30",
            "0.06"
          ],
          [
            "Diversified Alternatives Fund",
            "2026-07-31",
            "0.14",
            "0.65",
            "3.81",
            "0.12"
          ],
          [
            "Short-Term Reserves Fund",
            "2026-07-31",
            "0.10",
            "0.41",
            "2.52",
            "0.10"
          ],
          [
            "Private Markets Access Fund",
            "2026-07-31",
            "0.00",
            "0.00",
            "5.90",
            "0.00"
          ]
        ]
      }
    },
    {
      "file": "AI Interview Flows Report.xlsx",
      "kind": "XLSX",
      "role": "Client flows",
      "sheets": [
        {
          "name": "Client Flows",
          "table": {
            "head": [
              "Client Name",
              "Account Number",
              "Fund",
              "Flow Type",
              "Amount (USD)",
              "Trade Date"
            ],
            "rows": [
              [
                "Riverbend Community Foundation",
                "ACC-\u2022\u2022\u2022\u2022\u2022",
                "Multi-Asset Fund",
                "Contribution",
                "2500000",
                "2026-08-04"
              ],
              [
                "Lakeshore University Endowment",
                "ACC-\u2022\u2022\u2022\u2022\u2022",
                "Global Equity Fund",
                "Contribution",
                "6750000",
                "2026-08-03"
              ],
              [
                "Harborview Children's Trust",
                "ACC-\u2022\u2022\u2022\u2022\u2022",
                "Multi-Asset Fund",
                "Redemption",
                "-18500000",
                "2026-08-05"
              ],
              [
                "St. Aldwyn College",
                "ACC-\u2022\u2022\u2022\u2022\u2022",
                "Core Fixed Income Fund",
                "Contribution",
                "1200000",
                "2026-08-06"
              ],
              [
                "Prairie Health Foundation",
                "ACC-\u2022\u2022\u2022\u2022\u2022",
                "Short-Term Reserves Fund",
                "Contribution",
                "4300000",
                "2026-08-03"
              ]
            ],
            "more": 10
          }
        },
        {
          "name": "Fund Summary",
          "table": {
            "head": [
              "Fund",
              "WTD Perf (%)",
              "Net Flow (USD)"
            ],
            "rows": [
              [
                "Multi-Asset Fund",
                "0.38",
                "-14900000"
              ],
              [
                "Global Equity Fund",
                "1.24",
                "5850000"
              ],
              [
                "Core Fixed Income Fund",
                "-0.12",
                "600000"
              ],
              [
                "Diversified Alternatives Fund",
                "0.21",
                "750000"
              ],
              [
                "Short-Term Reserves Fund",
                "0.09",
                "2200000"
              ],
              [
                "Private Markets Access Fund",
                "0",
                "0"
              ]
            ]
          }
        }
      ]
    },
    {
      "file": "AI Interview Market Commentary.pdf",
      "kind": "PDF",
      "role": "Context",
      "paras": [
        "Weekly Market Commentary",
        "Investment Team \u00b7 Week ending August 7, 2026 \u00b7 Internal",
        "Global equity markets extended their advance this week, supported by a stronger than expected earnings season and continued resilience in consumer spending. Developed markets led, with technology and industrials contributing most of the gain, while emerging markets were broadly flat. Our global equity exposure participated fully in the rally and finished the week well ahead of its benchmark."
      ]
    }
  ],
  "output": {
    "dashboard": {
      "href": "dashboard/",
      "shot": "../shots/dashboard.png",
      "label": "The Dashboard",
      "note": "This was the bonus effort that I thought might be more useful to the user and their stakeholders."
    },
    "email": {
      "label": "The Email",
      "note": "The first output based on the user's requests was a pre-written email with all of the data, visualized for stakeholder consumption. The first page is notes for the user to review, an approval gate on the second page, the main body of the email on the third page, then the summary recommendations on the fourth page."
    },
    "gates_label": "Built in Security Layer",
    "gates_note": "Each of four gates catches possible mistakes that a human who is moving fast and assuming the best out of an AI agent might not notice.",
    "skill": {
      "label": "The Skill",
      "note": "All of it is packaged as a skill. Drop the week's files in the folder, ask Claude to run the Friday brief, and it runs the gates, builds the email, and holds it until someone approves the review code. Download it to read the instructions and the gate scripts.",
      "file": "weekly-performance-brief.skill",
      "contents": [
        "SKILL.md",
        "config.json",
        "references/writing-guide.md",
        "scripts/gate1_intake.py",
        "scripts/analyze.py",
        "scripts/gate3_self_check.py",
        "scripts/render.py",
        "scripts/gate4_release.py"
      ]
    },
    "pdf": "DRAFT_Weekly_Performance_Brief_2026-08-07.pdf",
    "pages": [
      {
        "src": "brief/p1.png",
        "label": "Review sheet"
      },
      {
        "src": "brief/p2.png",
        "label": "How to release"
      },
      {
        "src": "brief/p3.png",
        "label": "Headlines and movements"
      },
      {
        "src": "brief/p4.png",
        "label": "Flows and summary"
      }
    ]
  }
};

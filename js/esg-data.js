/* The ESG Questionnaire's content: the 77 questions in their nine sections and their groups,
   each with the help note under its (i), and what ALMA finds for it in the demo documents —
   her answer, how sure she is, why, and the passage she read it from; or why she left it to
   you. Generated from the supplier_chain prototype's questionnaire pages and plans. */
window.ESG_DATA = {
 "sections": [
  {
   "id": "governance",
   "title": "Governance",
   "questions": [
    {
     "t": "Does the company have a Code of Ethics and Conduct or formal procedures in place?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Code of Ethics and Conduct, corporate policy or formal procedures setting out principles, values, standards of behaviour and guidelines for the ethical conduct of employees, directors, third parties and other stakeholders. If yes, attach the Code of Ethics and Conduct.",
     "g": "Ethics and compliance",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The Code of Ethics sets out the principles and standards of behaviour outright, and the Supplier Code extends them to third parties in writing. Both point the same way, so I answered Yes.",
      "src": "Code-of-Ethics-and-Conduct-2026.pdf",
      "cite": [
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 3 · 1.2 Purpose and scope",
        "quote": "This Code of Ethics and Conduct establishes the principles, values and standards of behaviour required of all employees, officers, directors and third parties acting on behalf of the Company, and applies without exception across every site and subsidiary.",
        "match": "principles, values and standards of behaviour required of all employees"
       },
       {
        "src": "Supplier-Code-of-Conduct.pdf",
        "loc": "Page 2 · 1.1 Application",
        "quote": "Third parties acting on behalf of the Company are bound by the Code of Ethics and Conduct and must acknowledge it in writing before any engagement begins.",
        "match": "bound by the Code of Ethics and Conduct and must acknowledge it in writing"
       }
      ]
     },
     "subs": [
      {
       "t": "In which year was the Code last reviewed and approved?",
       "ty": "text",
       "val": "year",
       "a": {
        "by": "alma",
        "v": "2025",
        "conf": "high",
        "why": "The revision history on the cover gives the year and the approval date outright.",
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "cite": [
         {
          "src": "Code-of-Ethics-and-Conduct-2026.pdf",
          "loc": "Cover · Revision history",
          "quote": "Revision 4 — approved by the Board of Directors on 12 March 2025 and effective from 1 April 2025.",
          "match": "approved by the Board of Directors on 12 March 2025"
         }
        ]
       }
      },
      {
       "t": "Is the Code published externally, on the company website or a supplier portal?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The Code names both places it is published, which is what the question asks.",
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "cite": [
         {
          "src": "Code-of-Ethics-and-Conduct-2026.pdf",
          "loc": "Page 4 · 1.4 Publication",
          "quote": "This Code is published on the Company's website and on the supplier portal, and is provided to every third party before engagement begins.",
          "match": "published on the Company's website and on the supplier portal"
         }
        ]
       }
      },
      {
       "t": "Who signs off changes to it?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "The Board of Directors, on the Ethics Committee's recommendation.",
        "conf": "medium",
        "why": "The Code names the Board as the approver; the Committee's part in it comes from the Responsibility Manual rather than from this document, so I put it at medium.",
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "cite": [
         {
          "src": "Code-of-Ethics-and-Conduct-2026.pdf",
          "loc": "Page 4 · 1.5 Review and approval",
          "quote": "Amendments to this Code are approved by the Board of Directors following a recommendation from the Ethics Committee.",
          "match": "approved by the Board of Directors following a recommendation"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company have an Anti-Corruption, Bribery and Extortion Policy?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has a formally established Anti-Corruption, Bribery and Extortion Policy, containing guidelines to prevent and combat unlawful practices, and setting out the expected conduct of employees, directors and third parties If yes, attach the anti-corruption, bribery and extortion policy.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "There is a formally established Anti-Corruption policy with the prohibited conduct spelled out, which is exactly what the question asks for.",
      "src": "Anti-Corruption-and-Bribery-Policy.pdf",
      "cite": [
       {
        "src": "Anti-Corruption-and-Bribery-Policy.pdf",
        "loc": "Page 2 · 2.1 Prohibited conduct",
        "quote": "The Company prohibits, in any form, the offering, promising, giving, soliciting or accepting of any undue advantage, whether directly or through third parties, to or from any public official or private counterparty.",
        "match": "prohibits, in any form, the offering, promising, giving, soliciting or accepting of any undue advantage"
       }
      ]
     }
    },
    {
     "t": "Does the company have a policy for the protection of the personal data of its employees, third parties and stakeholders (suppliers, customers, shareholders, etc.)?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "The Personal Data Protection Policy sets out the company's guidelines and rules for collecting, storing, using, sharing, protecting and disposing of personal data relating to employees, service providers, suppliers, customers and other stakeholders, in accordance with applicable legislation such as the General Data Protection Act (LGPD – Law No. 13.709/2018). If yes, attach the Data Protection Policy/LGPD or a declaration of compliance with the LGPD.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The Data Privacy policy covers employees, suppliers, customers and other stakeholders, and cites the LGPD — the full scope the question asks about.",
      "src": "Data-Privacy-and-GDPR-Policy.docx",
      "cite": [
       {
        "src": "Data-Privacy-and-GDPR-Policy.docx",
        "loc": "Section 4 · Personal data of third parties",
        "quote": "This Policy governs the collection, storage, use, sharing, protection and disposal of personal data relating to employees, service providers, suppliers, customers and other stakeholders, in accordance with Law No. 13.709/2018 (LGPD).",
        "match": "personal data relating to employees, service providers, suppliers, customers and other stakeholders"
       }
      ]
     }
    },
    {
     "t": "Does the company provide regular training for employees on information security, data privacy or data protection?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "These are regular training sessions on information security, privacy and data protection. They are designed to inform staff about best practices, incident prevention and the secure use of information, as well as ensuring compliance with applicable legislation and standards. If yes, please provide evidence such as the training attendance register, learning path and/or training matrix covering the relevant training.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The training matrix shows the awareness course as mandatory for all staff with an annual refresh and 96% completion. That evidences the training, though not the underlying policy, so I put this at medium.",
      "src": "Information-Security-Training-Matrix.xlsx",
      "cite": [
       {
        "src": "Information-Security-Training-Matrix.xlsx",
        "loc": "Sheet “Annual plan” · rows 12–34",
        "quote": "Information Security & Data Privacy Awareness — mandatory, all staff, annual refresh; 2025 completion 96% (312 of 325 employees). Records retained in the LMS.",
        "match": "mandatory, all staff, annual refresh"
       }
      ]
     }
    },
    {
     "t": "Does the company have a formal corporate governance structure, with a clear definition of the composition, roles and responsibilities of the governance bodies?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has a formal corporate governance structure. Corporate governance comprises the bodies, responsibilities, processes and mechanisms established by the company to direct, monitor and control the management of its business, ensuring transparency, ethics, compliance and accountability to its stakeholders. Examples of corporate governance elements include the Board of Directors, Executive Management, Advisory Boards and Committees. If yes, please attach the corporate organizational chart, Articles of Association or Internal Regulations governing the corporate governance bodies.",
     "na": true,
     "g": "Governance and risk",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The Responsibility Manual names the Board, the Executive Board and three committees, and the Code of Ethics adds the Ethics Committee's reporting line. Composition and remit are both covered.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 8 · 3. Governance structure",
        "quote": "Governance is exercised through the Board of Directors, the Executive Board and three advisory committees (Audit & Risk, People, and Sustainability), whose composition, mandates and responsibilities are set out in the Internal Regulations.",
        "match": "the Board of Directors, the Executive Board and three advisory committees"
       },
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 11 · 7. Ethics Committee",
        "quote": "The Ethics Committee reports to the Board of Directors, meets quarterly, and its composition and remit are recorded in the Internal Regulations.",
        "match": "reports to the Board of Directors, meets quarterly"
       }
      ]
     }
    },
    {
     "t": "Does the company carry out Risk Management and Internal Controls?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company manages risks and internal controls through formal processes, tools or procedures designed to identify, assess, monitor and mitigate risks relevant to the business, thereby ensuring greater compliance, security and operational efficiency. If yes, attach the Risk and Control Matrix, Risk Management Policy and Internal Controls Policy.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "Risks are identified and monitored quarterly through a Risk and Control Matrix with named owners. Internal controls are implied by that process rather than described separately, hence medium.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 14 · 5.2 Risk and internal control",
        "quote": "Risks are identified, assessed and monitored quarterly through the Risk and Control Matrix, which assigns an owner and a mitigating control to every risk rated medium or above.",
        "match": "identified, assessed and monitored quarterly through the Risk and Control Matrix"
       }
      ]
     }
    },
    {
     "t": "Does the company have a formal process for the pre-qualification of suppliers?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has a formal process in place for assessing and pre-qualifying suppliers prior to contracting them, taking into account requirements relating to technical capacity, legal compliance, financial aspects, ESG and other criteria applicable to the business. If yes, attach the procedure.",
     "g": "Supply chain",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "The Supplier Code says no supplier may be contracted before a pre-qualification assessment, but I found no procedure describing how it is run. That single line is thin evidence, so please confirm this one.",
      "src": "Supplier-Code-of-Conduct.pdf",
      "cite": [
       {
        "src": "Supplier-Code-of-Conduct.pdf",
        "loc": "Page 5 · 4.1 Pre-qualification",
        "quote": "No supplier may be contracted before completing the pre-qualification assessment, which covers technical capacity, legal and tax standing, financial health and ESG criteria.",
        "match": "before completing the pre-qualification assessment"
       }
      ]
     },
     "subs": [
      {
       "t": "How many suppliers were pre-qualified in the last 12 months?",
       "ty": "text",
       "val": "count",
       "a": {
        "by": "alma",
        "v": "48",
        "conf": "low",
        "why": "The manual describes the process but the only figure is in an annex table for 2025, which may not be the last twelve months — please check it.",
        "src": "Responsibility-Manual.pdf",
        "cite": [
         {
          "src": "Responsibility-Manual.pdf",
          "loc": "Annex IV · Supplier pre-qualification 2025",
          "quote": "Suppliers pre-qualified in 2025: 48 (of 61 assessed).",
          "match": "Suppliers pre-qualified in 2025: 48"
         }
        ]
       }
      },
      {
       "t": "Does the pre-qualification include ESG criteria?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The manual lists ESG among the criteria the process covers.",
        "src": "Responsibility-Manual.pdf",
        "cite": [
         {
          "src": "Responsibility-Manual.pdf",
          "loc": "Page 5 · 4.1 Pre-qualification",
          "quote": "Pre-qualification covers financial standing, technical capability and ESG criteria, including labour practices and environmental licensing.",
          "match": "ESG criteria, including labour practices and environmental licensing"
         }
        ]
       }
      },
      {
       "t": "How often is a qualified supplier re-assessed?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "Every two years, or sooner on a material change.",
        "conf": "medium",
        "why": "The interval is stated; what counts as a material change is not, so this is close but not complete.",
        "src": "Responsibility-Manual.pdf",
        "cite": [
         {
          "src": "Responsibility-Manual.pdf",
          "loc": "Page 6 · 4.3 Re-assessment",
          "quote": "A qualified supplier is re-assessed every two years, or earlier where there is a material change in its operations.",
          "match": "re-assessed every two years"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company require its suppliers and partners to commit to respecting human rights (e.g. prohibition of child labour, slave labour, forced labour, minimum working conditions, etc.) and labour standards?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company requires its suppliers and partners to make commitments regarding respect for human rights, including the prohibition of child labour, slave-like labour and forced labour, and the guarantee of adequate working conditions. If yes, attach policies, procedures and contractual clauses.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Three documents agree here: the Human Rights Policy requires written commitments, the Supplier Code sets the prohibitions, and the Manual makes the clauses contractual.",
      "src": "Human-Rights-Policy.pdf",
      "cite": [
       {
        "src": "Human-Rights-Policy.pdf",
        "loc": "Page 4 · 2.3 Supply chain commitments",
        "quote": "Suppliers and partners are required to commit in writing to the prohibition of child labour, forced labour and labour analogous to slavery, and to guarantee decent working conditions throughout the relationship.",
        "match": "prohibition of child labour, forced labour and labour analogous to slavery"
       },
       {
        "src": "Supplier-Code-of-Conduct.pdf",
        "loc": "Page 4 · 3. Labour standards",
        "quote": "Suppliers shall not use child labour, forced labour or labour analogous to slavery, and shall guarantee freedom of association and decent working conditions.",
        "match": "shall not use child labour, forced labour or labour analogous to slavery"
       },
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 30 · 9.2 Contractual commitments",
        "quote": "Human rights clauses are incorporated into every supply agreement and their observance is a condition of continuing the relationship.",
        "match": "incorporated into every supply agreement"
       }
      ]
     }
    },
    {
     "t": "Do you have a system in place that enables you to identify your most critical suppliers in terms of social risks and human rights compliance?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has a structured process in place to classify and monitor suppliers according to their social risks. Examples of social risks include inadequate working conditions, child labour, forced labour or slavery-like labour practices, discrimination, harassment, disrespect for indigenous peoples and traditional communities, lack of adequate accommodation conditions or negative impacts on local communities.",
     "a": {
      "by": "flag",
      "why": "I couldn't find anything about how critical suppliers are identified."
     }
    },
    {
     "t": "Does the company require its suppliers, either contractually or through other formal instruments, to adhere to ESG policies and standards in contracts or other instruments?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company requires its suppliers to comply with ESG (environmental, social and governance) requirements through contracts, codes of conduct, policies, commitment agreements, supplier qualification questionnaires, or other formal instruments. These instruments should outline expectations and responsibilities concerning sustainability, ethics, human rights, health and safety, legal compliance and environmental protection. They should also stipulate that these requirements must be adhered to throughout the commercial relationship. Attach a template of the adopted contractual clause and/or relevant communication.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "Contracts incorporate the ESG annexe by reference, which meets the question. I could not see the clause template itself, so medium.",
      "src": "Supplier-Code-of-Conduct.pdf",
      "cite": [
       {
        "src": "Supplier-Code-of-Conduct.pdf",
        "loc": "Page 9 · 6. Contractual clauses",
        "quote": "Every contract incorporates the ESG annexe by reference, obliging the counterparty to observe the Company's environmental, social and governance requirements for the duration of the agreement.",
        "match": "obliging the counterparty to observe the Company's environmental, social and governance requirements"
       }
      ]
     }
    },
    {
     "t": "Is the company located in, does it supply products/services to, or does it use in its supply chain items originating from regions classified as CAHRAs (Conflict-Affected or High-Risk Areas)?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company is based in, operates in, or supplies products or services to conflict or high-risk areas (i.e. regions associated with human rights violations, the financing of armed conflict, corruption, forced labour, community exploitation, or similar practices). Attach a declaration of non-involvement with CAHRAs or a mapping of origins with a geopolitical risk analysis.",
     "g": "Sanctions and exposure",
     "a": {
      "by": "flag",
      "why": "This is a declaration about your own operations — it isn't in the documents."
     }
    },
    {
     "t": "Is the company considered a “Sanctioned Person”, understood as any entity or individual listed on official sanctions lists, including - but not limited to - lists published by agencies of the United States, the United Kingdom, the European Union and its Member States, the United Nations, or other jurisdictions relevant to the organisation's relationship with CBMM?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company is included on any official national or international sanctions lists and that it carries out checks or controls to identify whether it may be classified as a sanctioned person or entity. Attach a statement signed by the legal representative + a screenshot of the search results from sanctions lists (OFAC, EU, UN).",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "Is the company headquartered, registered, incorporated or directly or indirectly controlled by any entity or government located in countries or regions subject to international sanctions or embargoes - such as Cuba, Russia, Iran, North Korea, Syria, the Crimea region of Ukraine, or the so-called Donetsk and Luhansk People's Republics - nor is it included on sanctions lists issued by authorities such as the United States, the United Kingdom, the European Union, its Member States, the United Nations or other jurisdictions applicable to the relationship with CBMM?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has any corporate links, control or operations in countries or regions subject to international sanctions, and whether it is included on official lists of sanctioned persons or entities issued by relevant international authorities and organisations. Attach a declaration regarding the company’s registered office and shareholding structure",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "How often is Code of Ethics training delivered to employees?",
     "ty": "choice",
     "opts": [
      [
       "on-joining-only",
       "On joining only"
      ],
      [
       "once-a-year",
       "Once a year"
      ],
      [
       "every-two-years",
       "Every two years"
      ],
      [
       "it-is-not-delivered",
       "It is not delivered"
      ]
     ],
     "g": "Ways of working",
     "a": {
      "by": "alma",
      "v": "once-a-year",
      "conf": "high",
      "why": "The Code says the training is taken on joining and every year after that, which is the middle option here.",
      "src": "Code-of-Ethics-and-Conduct-2026.pdf",
      "cite": [
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 12 · 8.1 Training",
        "quote": "All employees complete Code of Ethics training on joining and annually thereafter; completion is recorded in the LMS.",
        "match": "on joining and annually thereafter"
       }
      ]
     }
    },
    {
     "t": "Who is accountable for the compliance programme?",
     "ty": "choice",
     "opts": [
      [
       "the-board",
       "The board"
      ],
      [
       "a-compliance-officer",
       "A compliance officer"
      ],
      [
       "the-legal-department",
       "The legal department"
      ],
      [
       "no-one-formally",
       "No one formally"
      ]
     ],
     "a": {
      "by": "alma",
      "v": "a-compliance-officer",
      "conf": "medium",
      "why": "The manual names a Compliance Officer as accountable and the Audit Committee as the reporting line — so the officer, though the Board holds the ultimate duty.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 15 · 6.2 Compliance programme",
        "quote": "The Compliance Officer reports to the Audit Committee and is accountable for the programme and its annual plan.",
        "match": "accountable for the programme"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "social",
   "title": "Social",
   "questions": [
    {
     "t": "Does the company have a Corporate Policy or similar formally established document setting out guidelines relating to the defence of human rights?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Indicate whether the company has a policy, standard, code of conduct, or equivalent formal document that establishes commitments related to the respect, promotion, and protection of human rights, addressing topics such as non-discrimination, diversity and inclusion, the prohibition of child labor, forced labor or labor analogous to slavery, harassment, and respect for human dignity.​ The document must explicitly prohibit: Child labor (individuals under 16 years of age, or under 14 years of age if not employed as apprentices); Forced labor or labor analogous to slavery (forced labor, degrading working conditions, or excessive working hours); Retention of workers' personal documents; Restriction of freedom of movement; Coercion, threats, or intimidation; Debt bondage (abusive deductions that effectively bind workers to their employment).​ The document must also guarantee: Freedom of association and the right to join labor unions; Prevention of workplace harassment, sexual harassment, and discrimination; Protection of children and adolescents against exploitation and abuse; Respect for diversity (gender, race, sexual orientation, and disability).",
     "g": "Human rights",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The Human Rights Policy prohibits child, forced and slavery-like labour explicitly, and the Code of Ethics and Manual add the dignity and oversight commitments. Comfortably a Yes.",
      "src": "Human-Rights-Policy.pdf",
      "cite": [
       {
        "src": "Human-Rights-Policy.pdf",
        "loc": "Page 2 · 1. Commitment",
        "quote": "The Company respects, promotes and protects internationally recognised human rights, and expressly prohibits child labour, forced labour or labour analogous to slavery, the retention of personal documents, restrictions on freedom of movement, and any form of harassment or discrimination.",
        "match": "expressly prohibits child labour, forced labour or labour analogous to slavery"
       },
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 5 · 3. Respect for people",
        "quote": "Every employee, director and third party is required to treat others with dignity, and any conduct amounting to harassment or discrimination is a disciplinary matter.",
        "match": "required to treat others with dignity"
       },
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 12 · 4.3 Human rights governance",
        "quote": "Oversight of the human rights commitments sits with the Sustainability Committee, which reviews performance and grievances twice a year.",
        "match": "sits with the Sustainability Committee"
       }
      ]
     },
     "subs": [
      {
       "t": "When was the policy last reviewed?",
       "ty": "text",
       "val": "when",
       "a": {
        "by": "alma",
        "v": "February 2025",
        "conf": "high",
        "why": "The document control page carries the issue and the review date.",
        "src": "Human-Rights-Policy.pdf",
        "cite": [
         {
          "src": "Human-Rights-Policy.pdf",
          "loc": "Page 2 · Document control",
          "quote": "Issue 3 — reviewed and approved February 2025; next review February 2027.",
          "match": "reviewed and approved February 2025"
         }
        ]
       }
      },
      {
       "t": "Does it cover the supply chain as well as the company's own operations?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The scope clause names suppliers, contractors and partners alongside its own operations.",
        "src": "Human-Rights-Policy.pdf",
        "cite": [
         {
          "src": "Human-Rights-Policy.pdf",
          "loc": "Page 3 · 2. Scope",
          "quote": "This Policy applies to the Company's own operations and to its suppliers, contractors and business partners.",
          "match": "own operations and to its suppliers, contractors and business partners"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company provide awareness-raising initiatives, training, skills development or engagement activities for its employees on issues relating to human rights?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company promotes initiatives to raise awareness and engage employees on human rights, such as training, campaigns, internal communications or other initiatives related to the topic. If yes, attach evidence of training/educational measures (e.g. talks, campaigns and dialogues, face-to-face or online training, team-building activities, displays on the management noticeboard, email marketing and others) on the subject of human rights for employees.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "Awareness is delivered at induction, in manager training and in quarterly dialogues. Well evidenced as activity, though attendance records were not in what you gave me.",
      "src": "Human-Rights-Policy.pdf",
      "cite": [
       {
        "src": "Human-Rights-Policy.pdf",
        "loc": "Page 11 · Annex II — Awareness programme",
        "quote": "Human rights awareness is delivered annually to all employees through induction, targeted training for managers, and quarterly dialogue sessions on the shop floor.",
        "match": "delivered annually to all employees through induction"
       }
      ]
     }
    },
    {
     "t": "Does the company have a human rights risk assessment that it considers relevant to its business?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company carries out the identification and periodic assessment of human rights risks that may be associated with its operations, activities, products, services or value chain, taking into account issues such as discrimination, harassment, child labour, forced labour, health and safety, working conditions and impacts on communities, amongst other aspects relevant to the business. If yes, attach evidence of the most recent assessment of social and human rights risks and impacts carried out by the company as part of its risk management framework.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The Manual describes a human rights and social impact assessment refreshed every two years, last done in November 2024. That satisfies the question, if slightly dated.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 16 · 5.4 Social risk assessment",
        "quote": "The human rights and social impact assessment is refreshed every two years and feeds the corporate risk register; the most recent review was concluded in November 2024.",
        "match": "refreshed every two years and feeds the corporate risk register"
       }
      ]
     }
    },
    {
     "t": "Does the company fully comply with labour legislation and the applicable collective agreements (Collective Labour Agreement – CCT or Collective Bargaining Agreement – ACT) relating to working hours, including limits on normal and overtime hours, time banks and statutory breaks?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company complies with legal and collective requirements relating to working hours, covering normal and overtime hours, time banks, statutory breaks and the relevant controls and records. If yes, provide the company’s recruitment procedure and working hours control procedure.",
     "na": true,
     "g": "Labour and working conditions",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Working hours, overtime, the time bank and breaks all follow the collective agreement and are recorded electronically — the question's full list.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 21 · 7.1 Working hours",
        "quote": "Working hours, overtime limits, the time bank and statutory rest periods follow the applicable collective agreement, and are recorded electronically for every employee.",
        "match": "follow the applicable collective agreement"
       }
      ]
     }
    },
    {
     "t": "Explain how the legislation is fully complied with.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "alma",
      "v": "Working hours, overtime limits, the time bank and statutory breaks follow the applicable collective agreement; compliance is checked monthly by HR and audited annually.",
      "conf": "medium",
      "why": "I drafted this from the Manual's working-hours section: monthly HR checks against electronic records, audited annually. Please put it in your own words if you would rather.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 21 · 7.1 Working hours",
        "quote": "Compliance with working-hour limits is verified monthly by Human Resources against electronic time records, and audited annually by an independent firm.",
        "match": "verified monthly by Human Resources against electronic time records"
       }
      ]
     }
    },
    {
     "t": "Do the company's employees have the right to freedom of association and the right to collective bargaining?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company ensures employees’ freedom of association and their right to collective bargaining and collective labor agreements, without interference, discrimination, or retaliation.​ If yes, please attach evidence of the communication of the Collective Bargaining Agreement, including the format and channels used to communicate it to workers.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The policy states freedom of association and collective bargaining without interference, discrimination or retaliation — the exact wording the question looks for.",
      "src": "Human-Rights-Policy.pdf",
      "cite": [
       {
        "src": "Human-Rights-Policy.pdf",
        "loc": "Page 6 · 3.1 Freedom of association",
        "quote": "Employees are free to associate, to join a trade union and to bargain collectively, without interference, discrimination or retaliation of any kind.",
        "match": "free to associate, to join a trade union and to bargain collectively"
       }
      ]
     }
    },
    {
     "t": "Describe how the company communicates with, advises and ensures that employees are able to exercise this right.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "alma",
      "v": "Freedom of association and collective bargaining are set out in the Human Rights Policy, communicated at induction and in annual training, and union representatives have access to the workplace.",
      "conf": "medium",
      "why": "Drafted from the freedom-of-association section: communicated at induction, on the noticeboard and the portal, with union access to the workplace.",
      "src": "Human-Rights-Policy.pdf",
      "cite": [
       {
        "src": "Human-Rights-Policy.pdf",
        "loc": "Page 6 · 3.1 Freedom of association",
        "quote": "The collective agreement is communicated at induction, published on the management noticeboard and made available in full on the employee portal; union representatives have access to the workplace.",
        "match": "communicated at induction, published on the management noticeboard"
       }
      ]
     }
    },
    {
     "t": "Does the company comply with current legislation regarding child labour and forced labour?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company fully complies with the applicable legislation relating to the prevention and combating of child labour and slave-like labour, by adopting controls and practices that prevent such practices from occurring within its operations, as well as, where applicable, monitoring suppliers and third parties to mitigate these risks. Attach: Internal policy on combating forced and child labour.",
     "a": {
      "by": "user",
      "v": "yes"
     }
    },
    {
     "t": "Does the company have a policy to prevent or mitigate risks of harassment - including psychological, sexual and electoral harassment, amongst others - at all hierarchical levels of the workplace?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has a formal policy or procedure to prevent and address workplace bullying, sexual harassment, election-related harassment, and other forms of harassment, applicable to all employees, regardless of their position in the hierarchy. If yes, attach the policy and/or formal guidelines on workplace bullying, sexual harassment, election-related harassment, and other forms of harassment.",
     "na": true,
     "g": "Harassment and discrimination",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Moral, sexual and electoral harassment are prohibited at every level, with an anonymous channel and protection from retaliation.",
      "src": "Code-of-Ethics-and-Conduct-2026.pdf",
      "cite": [
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 7 · 4.2 Harassment",
        "quote": "Moral, sexual and electoral harassment are prohibited at every level of the hierarchy, and reports may be made anonymously through the whistleblowing channel with protection against retaliation.",
        "match": "prohibited at every level of the hierarchy"
       }
      ]
     }
    },
    {
     "t": "Does the company adopt policies and practices to prevent and curb any form of discrimination against employees, customers, third parties or other stakeholders?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has policies and practices in place to prevent, identify and combat all forms of discrimination, whilst promoting equal opportunities, respect for diversity and fair treatment of employees and other stakeholders. Discrimination is defined as any unjustified distinction based on characteristics such as race, colour, ethnicity, nationality, gender, gender identity, sexual orientation, age, disability, religion, political opinion, social status or any other characteristic protected by law. If yes, attach the policy and/or formal guidelines on discrimination.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The Code of Ethics lists the protected grounds in full, which covers the question's definition of discrimination.",
      "src": "Code-of-Ethics-and-Conduct-2026.pdf",
      "cite": [
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 6 · 4.1 Non-discrimination",
        "quote": "No distinction may be made on the grounds of race, colour, ethnicity, nationality, gender, gender identity, sexual orientation, age, disability, religion, political opinion or social status.",
        "match": "No distinction may be made on the grounds of race, colour, ethnicity, nationality, gender"
       }
      ]
     }
    },
    {
     "t": "Describe the policies and practices adopted by the company.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "alma",
      "v": "The Code of Ethics prohibits discrimination on any ground, with mandatory annual training and a confidential reporting channel handled by the Ethics Committee.",
      "conf": "medium",
      "why": "Drafted from the non-discrimination section — Code of Ethics, mandatory annual training and a confidential channel reviewed by the Ethics Committee.",
      "src": "Code-of-Ethics-and-Conduct-2026.pdf",
      "cite": [
       {
        "src": "Code-of-Ethics-and-Conduct-2026.pdf",
        "loc": "Page 6 · 4.1 Non-discrimination",
        "quote": "Equal opportunity is enforced through the Code of Ethics, mandatory annual training and a confidential reporting channel reviewed by the Ethics Committee.",
        "match": "mandatory annual training and a confidential reporting channel"
       }
      ]
     }
    },
    {
     "t": "Does the company have diversity and inclusion programmes in place for its employees?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has programmes or initiatives aimed at promoting diversity, equity and inclusion (DE&I) in the workplace. The aim is to identify whether the company adopts measures to ensure equal opportunities, the valuing of differences and respectful treatment of all employees, regardless of characteristics such as gender, race, ethnicity, age, disability, sexual orientation, religion, nationality or social status. If yes, attach evidence of the commitments and targets set.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "The Manual sets public representation targets for 2027. Targets are not quite the programmes the question asks about, so this is worth a check.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 24 · 7.5 Diversity and inclusion",
        "quote": "The diversity, equity and inclusion programme sets public targets for the representation of women and of black employees in leadership by 2027, reported annually.",
        "match": "sets public targets for the representation of women and of black employees in leadership"
       }
      ]
     }
    },
    {
     "t": "Describe the programme adopted by the company.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "flag",
      "why": "The documents mention diversity programmes but don't describe them — this needs your words."
     }
    },
    {
     "t": "Does the company have facilities or carry out activities that may have an impact on local communities, or the involvement of traditional groups or those in socially vulnerable situations?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has facilities, operations, projects or activities that may impact local communities, traditional peoples and communities (such as indigenous peoples, Quilombolas, riverine communities, amongst others) or socially vulnerable groups. Consider the social, economic, environmental or cultural impacts arising from its activities, as well as the existence of relationships, dialogue or mechanisms for managing these impacts.",
     "g": "Local communities",
     "a": {
      "by": "flag",
      "why": "Whether your sites affect local communities is a declaration about your own operations."
     }
    },
    {
     "t": "Please describe these activities that may have an impact on local communities",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "flag",
      "why": "Depends on the answer above."
     }
    },
    {
     "t": "Does the company support or carry out social projects in local communities?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company develops or supports initiatives that generate social benefits for communities, such as initiatives in the areas of education, health, skills development, social inclusion, culture, sport, volunteering or donations.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "The Manual says social projects are supported in education, training, health and sport, but names none of them. Thin for a Yes, so I have flagged it.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 28 · 8.2 Community investment",
        "quote": "The Company supports social projects in the communities where it operates, in education, vocational training, health and sport, through its own programmes and matched employee volunteering.",
        "match": "supports social projects in the communities where it operates"
       }
      ]
     }
    },
    {
     "t": "Describe the projects supported or carried out by the company.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "user",
      "v": "Three projects are supported directly: a technical scholarship programme with the local SENAI school (32 students in 2025), the Escola Segura road-safety education programme in four municipal schools, and the sponsorship of the community sports centre. Together they received R$ 1.2 million in 2025, as reported in the annual sustainability report."
     }
    },
    {
     "t": "Does the company have a Health and Safety policy or practical rules in place?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has policies, procedures or practices in place to protect the health and safety of employees, including the prevention of accidents and occupational illnesses, and compliance with applicable legal requirements. If yes, a formal, documented Occupational Health and Safety (OHS) Plan containing: OSH objectives and targets; Hazard identification and risk assessment; Preventive programmes (e.g. risk control, ergonomics); Designated responsible persons; Action schedule / status. Mandatory programmes (Brazil): PGR (Risk Management Programme); PCMSO (Occupational Health Medical Control Programme); integration between programmes. Implementation records: inspection reports; action plans; OSH indicators; DDS/operational documents; evidence of periodic review of the plan.",
     "g": "Health and safety",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The HSE Manual has a documented OHS plan with objectives, hazard assessment, preventive programmes and named owners, and the Manual makes it a line responsibility.",
      "src": "Health-Safety-and-Environment-Manual.pdf",
      "cite": [
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 4 · 2. OHS policy",
        "quote": "The Occupational Health and Safety Plan defines objectives and targets, hazard identification and risk assessment, preventive programmes and named responsible persons, and is reviewed annually.",
        "match": "defines objectives and targets, hazard identification and risk assessment"
       },
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 26 · 8.1 Health and safety",
        "quote": "Health and safety is managed as a line responsibility, with objectives cascaded to every site manager and reviewed in the monthly operations meeting.",
        "match": "managed as a line responsibility"
       }
      ]
     },
     "subs": [
      {
       "t": "Is there a named person or committee accountable for health and safety?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The manual names both an accountable director and the works committee.",
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "cite": [
         {
          "src": "Health-Safety-and-Environment-Manual.pdf",
          "loc": "Page 7 · 3.2 Accountability",
          "quote": "The HSE Director is accountable for occupational health and safety, supported by the Internal Accident Prevention Committee (CIPA).",
          "match": "HSE Director is accountable for occupational health and safety"
         }
        ]
       }
      },
      {
       "t": "How often are the rules reviewed with employees?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "Once a year, and at every ordinary CIPA meeting.",
        "conf": "medium",
        "why": "The manual gives the cadence; whether every site keeps to it is not evidenced here.",
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "cite": [
         {
          "src": "Health-Safety-and-Environment-Manual.pdf",
          "loc": "Page 9 · 3.6 Consultation",
          "quote": "The rules are reviewed with employees annually and at every ordinary meeting of the CIPA.",
          "match": "reviewed with employees annually"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company comply with current Occupational Health and Safety legislation?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company complies with the legal requirements for Health and Safety at Work applicable to its activities, including mandatory programmes, training, risk management, the provision and control of Personal Protective Equipment (PPE), occupational health checks and other requirements set out in current legislation. Attach up-to-date certificates of legal compliance (NRs), PPRA/PGR and PCMSO.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "PGR and PCMSO are maintained, PPE is controlled and occupational health checks run on schedule — the legal requirements the question lists.",
      "src": "Health-Safety-and-Environment-Manual.pdf",
      "cite": [
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 12 · 4.1 Legal compliance",
        "quote": "The Company maintains the mandatory PGR and PCMSO programmes, controls the issue and replacement of personal protective equipment, and carries out occupational health examinations on the statutory schedule.",
        "match": "maintains the mandatory PGR and PCMSO programmes"
       }
      ]
     }
    },
    {
     "t": "Does the company provide regular health and safety training for employees?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company conducts regular Occupational Health and Safety (OHS) training for its employees, with the aim of raising their awareness of the risks associated with their activities, preventive measures, the correct use of PPE, emergency procedures and other safety requirements applicable to their roles. Attach: records of compulsory training (signed or digital attendance list); training management platform (LMS or similar); document handover forms / acknowledgement of procedures; signed acknowledgement of OHS regulations; safety induction; records of new employee induction; evidence of periodic refresher training.",
     "a": {
      "by": "user",
      "v": "yes"
     }
    },
    {
     "t": "Has the company, in the last 5 years, been found guilty in any legal proceedings involving human rights violations, or received a notice of infringement, a fine, a suspension order, an embargo or any other sanction related to human rights issues?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has, in the last 5 years, received convictions, fines, administrative penalties or other sanctions arising from human rights violations, such as child labour, slave-like labour, discrimination, harassment or inadequate working conditions. If yes, attach the Notice of Infringement, Conduct Adjustment Agreement (CAA), etc.",
     "g": "Legal proceedings",
     "a": {
      "by": "alma",
      "v": "no",
      "conf": "medium",
      "why": "The Manual records no convictions, fines or sanctions on human rights in the five years to December 2025. I can only evidence an absence, so medium.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 33 · 10. Legal proceedings",
        "quote": "There are no convictions, fines or administrative sanctions relating to human rights matters recorded against the Company in the five years to 31 December 2025.",
        "match": "no convictions, fines or administrative sanctions relating to human rights matters"
       }
      ]
     }
    },
    {
     "t": "Please state the reason and the corrective measures taken by the company following the incident.",
     "ty": "text",
     "val": "text",
     "help": "Provide a detailed description of the reason for the incident and the corrective measures implemented (action plan, deadlines, responsible parties).",
     "a": {
      "by": "flag",
      "why": "Only needed if the answer above is Yes."
     }
    },
    {
     "t": "How are health and safety incidents recorded?",
     "ty": "choice",
     "opts": [
      [
       "on-paper-forms",
       "On paper forms"
      ],
      [
       "in-a-shared-spreadsheet",
       "In a shared spreadsheet"
      ],
      [
       "in-a-dedicated-system",
       "In a dedicated system"
      ],
      [
       "they-are-not-formally-recorded",
       "They are not formally recorded"
      ]
     ],
     "g": "Ways of working",
     "a": {
      "by": "alma",
      "v": "in-a-dedicated-system",
      "conf": "medium",
      "why": "The manual requires incidents in the HSE system within 24 hours; whether every site uses it rather than paper is not evidenced.",
      "src": "Health-Safety-and-Environment-Manual.pdf",
      "cite": [
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 21 · 8.4 Incident reporting",
        "quote": "Incidents are recorded in the HSE management system within 24 hours and investigated by the CIPA.",
        "match": "recorded in the HSE management system"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "environment",
   "title": "Environment",
   "questions": [
    {
     "t": "Does the company hold a valid environmental operating licence and comply with all the legal environmental requirements applicable to the activity?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company holds a valid environmental licence, where required, and it complies with all legal and regulatory environmental requirements applicable to its activities, including compliance with the conditions and obligations imposed by the relevant authorities. Attach the licence or exemption from licensing for the conduct of the activity.",
     "g": "Licensing and training",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The ISO 14001 certificate covers all licensed activities and is valid to September 2027, and the HSE Manual keeps a register of licence conditions reviewed quarterly.",
      "src": "ISO-14001-Certificate.pdf",
      "cite": [
       {
        "src": "ISO-14001-Certificate.pdf",
        "loc": "Certificate 14001/2024 · Scope",
        "quote": "The environmental management system of the certified unit conforms to ISO 14001:2015 and covers all licensed activities at the site; valid until 30 September 2027.",
        "match": "conforms to ISO 14001:2015 and covers all licensed activities at the site"
       },
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 17 · 6.1 Legal requirements",
        "quote": "A register of applicable environmental legislation and licence conditions is maintained and reviewed quarterly against the operating permits held.",
        "match": "register of applicable environmental legislation and licence conditions"
       }
      ]
     },
     "subs": [
      {
       "t": "Which authority issued the licence, and when does it run to?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "IBAMA — licence LO-1187/2023, valid to 31 March 2027.",
        "conf": "high",
        "why": "The annex reproduces the licence with its number, issuer and expiry.",
        "src": "Environmental-Impact-Assessment-2024.pdf",
        "cite": [
         {
          "src": "Environmental-Impact-Assessment-2024.pdf",
          "loc": "Annex I · Operating licence",
          "quote": "Licença de Operação LO-1187/2023, issued by IBAMA, valid until 31 March 2027.",
          "match": "issued by IBAMA, valid until 31 March 2027"
         }
        ]
       }
      },
      {
       "t": "Are the licence conditions monitored and reported internally?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "medium",
        "why": "Quarterly monitoring and an internal report are described; I saw no record of the reports themselves.",
        "src": "Environmental-Impact-Assessment-2024.pdf",
        "cite": [
         {
          "src": "Environmental-Impact-Assessment-2024.pdf",
          "loc": "Section 6 · Conditions and monitoring",
          "quote": "Compliance with each licence condition is monitored quarterly and reported to the Environmental Committee.",
          "match": "monitored quarterly and reported to the Environmental Committee"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company carry out internal environmental education initiatives and provide regular training for employees on topics related to the environment?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Examples of internal environmental education initiatives include: environmental training, group activities and campaigns. Attach environmental training materials, attendance lists and photos of campaigns.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "Environmental training runs at induction and annually, with quarterly campaigns. Evidenced as activity; the materials themselves were not included, so medium.",
      "src": "Health-Safety-and-Environment-Manual.pdf",
      "cite": [
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 19 · 6.3 Environmental education",
        "quote": "Environmental training is delivered to all employees on induction and refreshed annually, complemented by waste, water and energy campaigns run each quarter.",
        "match": "delivered to all employees on induction and refreshed annually"
       }
      ]
     }
    },
    {
     "t": "Has the company, in the last 5 years, been found liable in any legal proceedings involving a breach of environmental legislation, or received a notice of infringement, a fine, a cease-and-desist order, an embargo or any other sanction relating to environmental issues?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "State whether the company has, in the last 5 years, received convictions, fines, notices of infringement, injunctions or other sanctions relating to breaches of environmental legislation, including cases of pollution, illegal deforestation or other environmental impacts arising from its activities. Attach notices of infringement, Conduct Adjustment Agreements (TAC), fines, notifications, etc.",
     "g": "Legal proceedings",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "Describe the corrective measures adopted.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "flag",
      "why": "Only needed if there were findings to correct."
     }
    },
    {
     "t": "Describe the incident and the penalty imposed.",
     "ty": "text",
     "val": "text",
     "a": {
      "by": "flag",
      "why": "Only needed if the answer above is Yes."
     }
    }
   ]
  },
  {
   "id": "climate",
   "title": "Climate & energy",
   "questions": [
    {
     "t": "Does the company measure and record its greenhouse gas emissions (Scope 1 and Scope 2)?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Direct emissions from sources the company owns or controls (Scope 1) and indirect emissions from the energy it buys (Scope 2), measured in tonnes of CO2 equivalent. Attach the inventory or the report it is published in.",
     "g": "Emissions",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The inventory reports Scope 1 and Scope 2 for the full year, in tonnes of CO2 equivalent, with the method stated. That is exactly what the question asks for.",
      "src": "GHG-Inventory-2025.xlsx",
      "cite": [
       {
        "src": "GHG-Inventory-2025.xlsx",
        "loc": "Sheet “Summary” · rows 8–19",
        "quote": "Scope 1: 412,800 tCO2e; Scope 2 (market-based): 96,400 tCO2e — 2025, all sites.",
        "match": "Scope 1: 412,800 tCO2e; Scope 2 (market-based): 96,400 tCO2e"
       }
      ]
     },
     "subs": [
      {
       "t": "Which baseline year do the figures start from?",
       "ty": "text",
       "val": "year",
       "a": {
        "by": "alma",
        "v": "2019",
        "conf": "high",
        "why": "The summary sheet states the base year and the reason it was recalculated.",
        "src": "GHG-Inventory-2025.xlsx",
        "cite": [
         {
          "src": "GHG-Inventory-2025.xlsx",
          "loc": "Sheet “Summary” · row 3",
          "quote": "Base year: 2019 (recalculated in 2023 for the Serra plant acquisition).",
          "match": "Base year: 2019"
         }
        ]
       }
      },
      {
       "t": "Are the figures verified by a third party?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The assurance sheet names the accredited verifier and the scopes covered.",
        "src": "GHG-Inventory-2025.xlsx",
        "cite": [
         {
          "src": "GHG-Inventory-2025.xlsx",
          "loc": "Sheet “Assurance” · rows 2–6",
          "quote": "Limited assurance provided by an accredited third party over Scope 1 and Scope 2 emissions for 2025.",
          "match": "Limited assurance provided by an accredited third party"
         }
        ]
       }
      },
      {
       "t": "Does the inventory also cover Scope 3?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "no",
        "conf": "low",
        "why": "Scope 3 is listed as planned rather than reported, so I read this as a No — but a screening may exist outside this file.",
        "src": "GHG-Inventory-2025.xlsx",
        "cite": [
         {
          "src": "GHG-Inventory-2025.xlsx",
          "loc": "Sheet “Scope 3” · note",
          "quote": "Scope 3 screening planned for 2026; no categories reported for 2025.",
          "match": "Scope 3 screening planned for 2026"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company have a published target to reduce its greenhouse gas emissions?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A reduction target that has been made public, with a baseline year and a target year. Say whether it is absolute or by unit of production.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The Manual states a reduction commitment with a baseline year, and it is published. I could not see whether it is absolute or by unit of production, so medium.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 22 · 9.1 Climate commitments",
        "quote": "The Company has committed publicly to a 30% reduction in Scope 1 and 2 emissions by 2030, against a 2019 base year.",
        "match": "30% reduction in Scope 1 and 2 emissions by 2030"
       }
      ]
     }
    },
    {
     "t": "Describe the target, its baseline year and the reduction achieved so far.",
     "ty": "text",
     "val": "text",
     "help": "State the target, the baseline year, the target year and the reduction achieved to date against that baseline.",
     "a": {
      "by": "alma",
      "v": "The company has committed to a 30% reduction in absolute Scope 1 and Scope 2 emissions by 2030 against a 2019 baseline. A 12% reduction had been achieved by the end of 2024, driven mainly by the switch of the Araxá site to contracted renewable electricity.",
      "conf": "medium",
      "why": "Drafted from the commitment in the Manual. Check the figure for the reduction achieved: the Manual gives it to the end of 2024, not 2025.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 23 · 9.2 Progress",
        "quote": "Progress to date: an 11% reduction against the 2019 base year, reported annually in the sustainability report.",
        "match": "11% reduction against the 2019 base year"
       }
      ]
     }
    },
    {
     "t": "Does the company monitor its total energy consumption and the share that comes from renewable sources?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Total energy consumed across the company's operations, and how much of it comes from renewable sources, whether generated on site or bought.",
     "na": true,
     "g": "Energy",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Total energy is reported alongside the renewable share, broken down by source, which answers both halves of the question.",
      "src": "Energy-and-Emissions-Report-2025.pdf",
      "cite": [
       {
        "src": "Energy-and-Emissions-Report-2025.pdf",
        "loc": "Page 6 · 2.1 Energy consumption",
        "quote": "Total energy consumption in 2025 was 1,942 TJ, of which 38% came from renewable sources.",
        "match": "1,942 TJ, of which 38% came from renewable sources"
       }
      ]
     }
    },
    {
     "t": "Does the company have an energy efficiency programme covering its main processes or facilities?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A programme with defined actions and owners aimed at reducing energy use in the main processes, buildings or fleet.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "The report mentions efficiency measures at two sites, but I found no programme with defined actions and owners. That is thin for a Yes, so please confirm it.",
      "src": "Energy-and-Emissions-Report-2025.pdf",
      "cite": [
       {
        "src": "Energy-and-Emissions-Report-2025.pdf",
        "loc": "Page 14 · 4.3 Efficiency projects",
        "quote": "Four efficiency projects were under way in 2025, covering compressed air, kiln insulation and two motor replacements.",
        "match": "Four efficiency projects were under way in 2025"
       }
      ]
     }
    },
    {
     "t": "Has the company assessed the physical and transition risks that climate change poses to its operations?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "An assessment of how climate change could affect the business, covering both physical risks such as drought or flooding and transition risks such as carbon pricing.",
     "g": "Climate risk",
     "a": {
      "by": "flag",
      "why": "I found no climate risk assessment in the documents you gave me."
     }
    },
    {
     "t": "Which greenhouse gas inventory standard does the company follow?",
     "ty": "choice",
     "opts": [
      [
       "the-ghg-protocol",
       "The GHG Protocol"
      ],
      [
       "iso-14064",
       "ISO 14064"
      ],
      [
       "a-national-methodology",
       "A national methodology"
      ],
      [
       "none-of-these",
       "None of these"
      ]
     ],
     "g": "Ways of working",
     "a": {
      "by": "alma",
      "v": "the-ghg-protocol",
      "conf": "high",
      "why": "The method sheet names the standard the inventory follows.",
      "src": "GHG-Inventory-2025.xlsx",
      "cite": [
       {
        "src": "GHG-Inventory-2025.xlsx",
        "loc": "Sheet “Method” · row 2",
        "quote": "Prepared in accordance with the GHG Protocol Corporate Accounting and Reporting Standard.",
        "match": "in accordance with the GHG Protocol"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "water",
   "title": "Water & effluents",
   "questions": [
    {
     "t": "Does the company measure its total water withdrawal and identify the sources it draws from?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Total volume withdrawn over the reporting period, broken down by source: surface water, groundwater, municipal supply or other.",
     "g": "Withdrawal",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Withdrawal is measured and broken down by source, with the volumes for the year.",
      "src": "Water-Management-Plan.pdf",
      "cite": [
       {
        "src": "Water-Management-Plan.pdf",
        "loc": "Page 6 · 3.1 Withdrawal",
        "quote": "Total withdrawal in 2025 was 2.41 million m³, from two surface intakes and one deep well, each separately metered.",
        "match": "two surface intakes and one deep well, each separately metered"
       }
      ]
     }
    },
    {
     "t": "Does the company operate in, or draw water from, an area classified as water-stressed?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Water stress is measured against recognised indices such as the WRI Aqueduct tool. Name the sites concerned if the answer is yes.",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "Does the company treat its effluents before discharge, in line with the conditions of its licence?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Treatment of process water and sanitary effluent before it is returned to the environment, and the monitoring that shows it meets the licensed limits.",
     "na": true,
     "g": "Discharge and reuse",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Effluent is treated before discharge and monitored against the licence limits, with the results recorded monthly.",
      "src": "Water-Management-Plan.pdf",
      "cite": [
       {
        "src": "Water-Management-Plan.pdf",
        "loc": "Page 11 · 5.1 Treatment",
        "quote": "All effluent passes through the industrial treatment plant before discharge, within the limits set by the operating licence.",
        "match": "before discharge, within the limits set by the operating licence"
       }
      ]
     },
     "subs": [
      {
       "t": "Which parameters are monitored before discharge?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "pH, COD, total suspended solids, oils and greases, and dissolved metals.",
        "conf": "high",
        "why": "The plan lists the parameters for every discharge point.",
        "src": "Water-Management-Plan.pdf",
        "cite": [
         {
          "src": "Water-Management-Plan.pdf",
          "loc": "Page 12 · 5.2 Discharge monitoring",
          "quote": "Effluent is monitored for pH, COD, total suspended solids, oils and greases and dissolved metals before discharge.",
          "match": "pH, COD, total suspended solids, oils and greases"
         }
        ]
       }
      },
      {
       "t": "Are the results reported to the environmental authority?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "medium",
        "why": "Quarterly reporting is stated; the submissions themselves are not attached.",
        "src": "Water-Management-Plan.pdf",
        "cite": [
         {
          "src": "Water-Management-Plan.pdf",
          "loc": "Page 13 · 5.4 Reporting",
          "quote": "Results are reported to the state environmental authority every quarter.",
          "match": "reported to the state environmental authority every quarter"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company reuse or recycle water in its processes?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Water recirculated within the process or reused elsewhere on site rather than withdrawn again.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The plan describes recirculation in the process. It does not give the share of total demand, which the follow-up asks for.",
      "src": "Water-Management-Plan.pdf",
      "cite": [
       {
        "src": "Water-Management-Plan.pdf",
        "loc": "Page 15 · 6.1 Reuse",
        "quote": "Treated effluent is returned to the process circuit; reuse covered 22% of total demand in 2025.",
        "match": "reuse covered 22% of total demand in 2025"
       }
      ]
     }
    },
    {
     "t": "Describe the water reuse or recycling in place and the share of total water it covers.",
     "ty": "text",
     "val": "text",
     "help": "Describe the reuse or recycling system and give the proportion of total water demand it meets.",
     "a": {
      "by": "alma",
      "v": "Process water is recirculated through a closed clarification circuit and returned to the concentration plant. Recirculated water covers roughly 78% of total process demand, with fresh withdrawal used mainly for make-up and for sanitary supply.",
      "conf": "medium",
      "why": "Drafted from the recirculation section. The proportion is my reading of the volumes given; please check it.",
      "src": "Water-Management-Plan.pdf",
      "cite": [
       {
        "src": "Water-Management-Plan.pdf",
        "loc": "Page 15 · 6.2 Reuse figures",
        "quote": "Closed-circuit cooling and the return of treated effluent together accounted for 22% of total water demand in 2025.",
        "match": "accounted for 22% of total water demand in 2025"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "waste",
   "title": "Waste & materials",
   "questions": [
    {
     "t": "Does the company classify, segregate and record the waste it generates, including hazardous waste?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Classification by type and hazard, separate collection, and records of the volumes generated and where each stream goes.",
     "g": "Waste management",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Waste is classified, segregated and recorded by stream, hazardous waste included, with the destination of each stream logged.",
      "src": "Waste-Management-Plan.pdf",
      "cite": [
       {
        "src": "Waste-Management-Plan.pdf",
        "loc": "Page 5 · 3.1 Classification",
        "quote": "Waste is classified to ABNT NBR 10004, segregated at source and recorded in the waste inventory, hazardous streams included.",
        "match": "classified to ABNT NBR 10004, segregated at source and recorded"
       }
      ]
     },
     "subs": [
      {
       "t": "Who is the licensed operator that receives the hazardous waste?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "Ambipar Environmental Services, under state licence 4471/2024.",
        "conf": "medium",
        "why": "The plan names the operator and its licence; whether the licence is still current I cannot tell from this document.",
        "src": "Waste-Management-Plan.pdf",
        "cite": [
         {
          "src": "Waste-Management-Plan.pdf",
          "loc": "Page 8 · 4.1 Contracted operators",
          "quote": "Hazardous waste is collected and treated by Ambipar Environmental Services under state licence 4471/2024.",
          "match": "Ambipar Environmental Services under state licence 4471/2024"
         }
        ]
       }
      },
      {
       "t": "Are disposal certificates kept for every consignment?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The plan requires a certificate per consignment and gives the retention period.",
        "src": "Waste-Management-Plan.pdf",
        "cite": [
         {
          "src": "Waste-Management-Plan.pdf",
          "loc": "Page 9 · 4.3 Manifests and certificates",
          "quote": "A disposal certificate (CDF) is filed for every consignment and retained for five years.",
          "match": "disposal certificate (CDF) is filed for every consignment"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company send any waste to landfill or to another form of final disposal?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Final disposal covers landfill, incineration without energy recovery and any other route where the material is not recovered.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The plan records a residual fraction going to a licensed landfill. The volumes are given for 2024 rather than 2025, so medium.",
      "src": "Waste-Management-Plan.pdf",
      "cite": [
       {
        "src": "Waste-Management-Plan.pdf",
        "loc": "Page 7 · 3.5 Final disposal",
        "quote": "Non-recoverable waste is sent to a licensed industrial landfill: 4,120 t in 2025.",
        "match": "sent to a licensed industrial landfill: 4,120 t in 2025"
       }
      ]
     }
    },
    {
     "t": "Describe the waste streams sent to final disposal and the volumes involved.",
     "ty": "text",
     "val": "text",
     "help": "List the streams, their classification and the volumes sent for final disposal over the reporting period.",
     "a": {
      "by": "flag",
      "why": "The plan names the streams but not the volumes for this period — this needs your figures."
     }
    },
    {
     "t": "Does the company have targets or initiatives to reduce waste generation or to increase recycling?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Targets or programmes aimed at generating less waste, or at sending a greater share for recycling, reuse or recovery.",
     "g": "Reduction and residues",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "There is a recycling target and a set of initiatives behind it. The baseline it is measured against is not stated.",
      "src": "Waste-Management-Plan.pdf",
      "cite": [
       {
        "src": "Waste-Management-Plan.pdf",
        "loc": "Page 14 · 6.1 Targets",
        "quote": "Target: a 15% reduction in waste sent to landfill by 2028, with recycling held above 70%.",
        "match": "15% reduction in waste sent to landfill by 2028"
       }
      ]
     }
    },
    {
     "t": "Does the company control and monitor the storage of tailings, slag or other process residues?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Applies where the process produces tailings, slag or similar residues: the containment in use, its inspection regime and who is accountable for it.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "Tailings and slag storage is covered by the HSE Manual, with an inspection regime and a named owner for each structure.",
      "src": "Health-Safety-and-Environment-Manual.pdf",
      "cite": [
       {
        "src": "Health-Safety-and-Environment-Manual.pdf",
        "loc": "Page 31 · 11.2 Tailings and residues",
        "quote": "Tailings and slag storage areas are inspected weekly and instrumented, with readings reviewed monthly by the engineering team.",
        "match": "inspected weekly and instrumented"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "biodiversity",
   "title": "Biodiversity & land",
   "questions": [
    {
     "t": "Are any of the company's operations located in, or next to, a protected area or an area of high biodiversity value?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Protected areas are those designated by law or by international convention. Areas of high biodiversity value include recognised habitats outside formal protection.",
     "g": "Protected areas",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "Describe the area and the controls the company applies there.",
     "ty": "text",
     "val": "text",
     "help": "Name the area, its designation, and the measures the company applies to limit its impact on it.",
     "a": {
      "by": "flag",
      "why": "Only needed if the answer above is Yes."
     }
    },
    {
     "t": "Does the company carry out an environmental impact assessment before opening or expanding a site?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A formal assessment of environmental impact, carried out and submitted to the licensing authority before work begins.",
     "g": "Impact and rehabilitation",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The assessment was carried out and submitted to the licensing authority before the last expansion, which is what the question asks for.",
      "src": "Environmental-Impact-Assessment-2024.pdf",
      "cite": [
       {
        "src": "Environmental-Impact-Assessment-2024.pdf",
        "loc": "Section 1 · Purpose",
        "quote": "This assessment was prepared before the expansion of the Araxá site, as required for every new or extended operation.",
        "match": "prepared before the expansion"
       }
      ]
     },
     "subs": [
      {
       "t": "Which body reviews the assessment before work starts?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "The state environmental agency, with internal sign-off by the Environmental Committee.",
        "conf": "medium",
        "why": "Both reviewers are named, though the order and the timing are not spelled out.",
        "src": "Environmental-Impact-Assessment-2024.pdf",
        "cite": [
         {
          "src": "Environmental-Impact-Assessment-2024.pdf",
          "loc": "Section 2 · Review and approval",
          "quote": "Each assessment is reviewed by the state environmental agency and signed off internally by the Environmental Committee before work begins.",
          "match": "reviewed by the state environmental agency"
         }
        ]
       }
      },
      {
       "t": "Is a monitoring programme kept in place afterwards?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "The assessment commits to monitoring for the life of the operation, with annual reporting.",
        "src": "Environmental-Impact-Assessment-2024.pdf",
        "cite": [
         {
          "src": "Environmental-Impact-Assessment-2024.pdf",
          "loc": "Section 9 · Monitoring programme",
          "quote": "A monitoring programme runs for the life of the operation, with annual reports on flora, fauna and water quality.",
          "match": "monitoring programme runs for the life of the operation"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company have a land rehabilitation or closure plan for the areas it uses?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A plan setting out how the land will be restored when operations end, with the commitments and provisions behind it.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "The Manual refers to rehabilitation commitments but I found no closure plan with provisions behind it. Please confirm before this stands.",
      "src": "Responsibility-Manual.pdf",
      "cite": [
       {
        "src": "Responsibility-Manual.pdf",
        "loc": "Page 27 · 10.4 Closure and rehabilitation",
        "quote": "A closure and rehabilitation plan is maintained for each operating area and reviewed every five years.",
        "match": "closure and rehabilitation plan is maintained"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "infosec",
   "title": "Information security",
   "questions": [
    {
     "t": "Does the company have a formally established Information Security Policy?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A policy approved by management setting out how information is classified, protected, accessed and retained.",
     "g": "Policy and certification",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "There is an approved Information Security Policy covering classification, access, protection and retention.",
      "src": "Information-Security-Policy.pdf",
      "cite": [
       {
        "src": "Information-Security-Policy.pdf",
        "loc": "Page 2 · 1. Purpose and status",
        "quote": "This Information Security Policy is formally established and approved by the Information Security Committee, and applies to all information assets.",
        "match": "formally established and approved by the Information Security Committee"
       }
      ]
     },
     "subs": [
      {
       "t": "When was the policy last approved?",
       "ty": "text",
       "val": "when",
       "a": {
        "by": "alma",
        "v": "July 2025",
        "conf": "high",
        "why": "The document control block carries the version and the approval date.",
        "src": "Information-Security-Policy.pdf",
        "cite": [
         {
          "src": "Information-Security-Policy.pdf",
          "loc": "Page 1 · Document control",
          "quote": "Version 5 — approved 9 July 2025 by the Information Security Committee.",
          "match": "approved 9 July 2025"
         }
        ]
       }
      },
      {
       "t": "Is every employee required to acknowledge it?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "Acknowledgement is required on joining and at each annual refresh.",
        "src": "Information-Security-Policy.pdf",
        "cite": [
         {
          "src": "Information-Security-Policy.pdf",
          "loc": "Page 3 · 2.3 Acceptance",
          "quote": "Every employee and contractor must acknowledge this Policy on joining and at each annual refresh.",
          "match": "must acknowledge this Policy on joining"
         }
        ]
       }
      },
      {
       "t": "Where is the policy published?",
       "ty": "choice",
       "opts": [
        [
         "on-the-intranet",
         "On the intranet"
        ],
        [
         "on-the-supplier-portal",
         "On the supplier portal"
        ],
        [
         "on-the-public-website",
         "On the public website"
        ],
        [
         "it-is-not-published",
         "It is not published"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "on-the-intranet",
        "conf": "medium",
        "why": "The intranet is named; whether it also sits on the supplier portal is not said either way.",
        "src": "Information-Security-Policy.pdf",
        "cite": [
         {
          "src": "Information-Security-Policy.pdf",
          "loc": "Page 3 · 2.4 Publication",
          "quote": "The Policy is published on the intranet and issued with the onboarding pack.",
          "match": "published on the intranet"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Is the company's information security management system certified to ISO/IEC 27001 or an equivalent standard?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Certification by an accredited body, with the certificate number and the scope it covers. Attach the certificate if you hold one.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The certificate is current and names the scope it covers, so this is a straightforward Yes.",
      "src": "ISO-27001-Certificate.pdf",
      "cite": [
       {
        "src": "ISO-27001-Certificate.pdf",
        "loc": "Certificate · Scope",
        "quote": "ISO/IEC 27001:2022 — certificate 0192/2024, covering the information security management system for corporate and plant IT services; valid to 4 October 2027.",
        "match": "ISO/IEC 27001:2022 — certificate 0192/2024"
       }
      ]
     }
    },
    {
     "t": "Does the company have a documented procedure for responding to information security incidents?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A written procedure covering detection, containment, notification of those affected and of the authorities, and review after the event.",
     "g": "Incidents",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The policy sets out detection, containment and notification. The review step after an incident is implied rather than written down.",
      "src": "Information-Security-Policy.pdf",
      "cite": [
       {
        "src": "Information-Security-Policy.pdf",
        "loc": "Page 10 · 7.1 Incident response",
        "quote": "A documented incident response procedure sets out detection, containment, eradication and recovery, with named roles for each stage.",
        "match": "documented incident response procedure"
       }
      ]
     },
     "subs": [
      {
       "t": "Within how many hours must an incident be reported internally?",
       "ty": "text",
       "val": "count",
       "a": {
        "by": "alma",
        "v": "24",
        "conf": "high",
        "why": "The procedure states the window from detection.",
        "src": "Information-Security-Policy.pdf",
        "cite": [
         {
          "src": "Information-Security-Policy.pdf",
          "loc": "Page 11 · 7.2 Reporting",
          "quote": "Suspected incidents must be reported to the Security Operations team within 24 hours of detection.",
          "match": "within 24 hours of detection"
         }
        ]
       }
      },
      {
       "t": "Has the procedure been tested in the last 12 months?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "low",
        "why": "An annual exercise is required, but the last one recorded here is dated November 2024 — that may be outside the twelve months, so please confirm.",
        "src": "Information-Security-Policy.pdf",
        "cite": [
         {
          "src": "Information-Security-Policy.pdf",
          "loc": "Page 12 · 7.5 Testing",
          "quote": "The response procedure is exercised annually; last completed exercise November 2024.",
          "match": "last completed exercise November 2024"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Has the company suffered a data breach or an information security incident in the last 3 years?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Any incident that compromised the confidentiality, integrity or availability of information, whether or not it had to be notified.",
     "a": {
      "by": "user",
      "v": "no"
     }
    },
    {
     "t": "Describe the incident and the measures taken afterwards.",
     "ty": "text",
     "val": "text",
     "help": "State what happened, how it was contained, who was notified and what was changed as a result.",
     "a": {
      "by": "flag",
      "why": "Only needed if there was an incident to describe."
     }
    },
    {
     "t": "Does the company have a business continuity or disaster recovery plan covering its critical systems?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A tested plan for keeping critical systems running, or restoring them, after a disruption, with recovery time objectives.",
     "g": "Continuity",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "low",
      "why": "Continuity is mentioned for the main data centre, but I found no recovery time objectives and no record of a test. Thin for a Yes.",
      "src": "Information-Security-Policy.pdf",
      "cite": [
       {
        "src": "Information-Security-Policy.pdf",
        "loc": "Page 13 · 8.2 Continuity",
        "quote": "Business continuity and disaster recovery plans cover the critical systems listed in Annex B, with a recovery objective set for each.",
        "match": "Business continuity and disaster recovery plans cover the critical systems"
       }
      ]
     }
    },
    {
     "t": "How often are user access rights reviewed?",
     "ty": "choice",
     "opts": [
      [
       "monthly",
       "Monthly"
      ],
      [
       "quarterly",
       "Quarterly"
      ],
      [
       "once-a-year",
       "Once a year"
      ],
      [
       "only-when-someone-leaves",
       "Only when someone leaves"
      ]
     ],
     "na": true,
     "g": "Ways of working",
     "a": {
      "by": "alma",
      "v": "quarterly",
      "conf": "medium",
      "why": "The policy sets a quarterly review by system owners; I found no record of the last one, so medium.",
      "src": "Information-Security-Policy.pdf",
      "cite": [
       {
        "src": "Information-Security-Policy.pdf",
        "loc": "Page 8 · 5.3 Access review",
        "quote": "Access rights are reviewed quarterly by system owners, and removed within one working day of a leaver's last day.",
        "match": "reviewed quarterly by system owners"
       }
      ]
     }
    }
   ]
  },
  {
   "id": "product",
   "title": "Product & traceability",
   "questions": [
    {
     "t": "Can the company trace the origin of the raw materials used in the products it supplies?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Traceability back to the mine, smelter or other point of origin, evidenced by records that can be followed through the chain.",
     "g": "Traceability",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The procedure traces material back to the mine and through each processing step, with the records that evidence it.",
      "src": "Chain-of-Custody-Procedure.pdf",
      "cite": [
       {
        "src": "Chain-of-Custody-Procedure.pdf",
        "loc": "Page 3 · 2. Purpose",
        "quote": "This procedure establishes the traceability of raw material from the mine of origin to the finished product despatched to the customer.",
        "match": "traceability of raw material from the mine of origin"
       }
      ]
     },
     "subs": [
      {
       "t": "How far back can the material be traced — mine, smelter or first processor?",
       "ty": "text",
       "val": "text",
       "a": {
        "by": "alma",
        "v": "To the mine of origin, through the smelter's own records.",
        "conf": "medium",
        "why": "Custody runs from the mine on paper; how far the smelter's records are independently checked is not covered.",
        "src": "Chain-of-Custody-Procedure.pdf",
        "cite": [
         {
          "src": "Chain-of-Custody-Procedure.pdf",
          "loc": "Page 4 · 3.1 Scope of custody",
          "quote": "Custody records run from the mine of origin, through the smelter, to despatch from the warehouse.",
          "match": "from the mine of origin, through the smelter"
         }
        ]
       }
      },
      {
       "t": "Is the trace recorded batch by batch?",
       "ty": "choice",
       "opts": [
        [
         "yes",
         "Yes"
        ],
        [
         "no",
         "No"
        ]
       ],
       "a": {
        "by": "alma",
        "v": "yes",
        "conf": "high",
        "why": "Each batch carries an identifier tied to its origin declaration.",
        "src": "Chain-of-Custody-Procedure.pdf",
        "cite": [
         {
          "src": "Chain-of-Custody-Procedure.pdf",
          "loc": "Page 5 · 3.3 Batch records",
          "quote": "Each batch carries a unique identifier linked to its origin declaration and to the despatch note.",
          "match": "Each batch carries a unique identifier"
         }
        ]
       }
      }
     ]
    },
    {
     "t": "Does the company have a policy on conflict minerals or on responsibly sourced minerals?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A policy addressing minerals from conflict-affected and high-risk areas, aligned with the OECD Due Diligence Guidance or an equivalent framework.",
     "na": true,
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "high",
      "why": "The policy addresses minerals from conflict-affected and high-risk areas and states that it follows the OECD guidance.",
      "src": "Responsible-Sourcing-Policy.pdf",
      "cite": [
       {
        "src": "Responsible-Sourcing-Policy.pdf",
        "loc": "Page 2 · 2. Commitments",
        "quote": "The Company sources no conflict minerals and requires its suppliers to observe the OECD Due Diligence Guidance for minerals from conflict-affected areas.",
        "match": "requires its suppliers to observe the OECD Due Diligence Guidance"
       }
      ]
     }
    },
    {
     "t": "Does the company require its own suppliers to declare the origin of the materials they provide?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "A contractual requirement or a declaration collected from suppliers stating where the material they supply comes from.",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The Supplier Code requires a declaration of origin. I could not see the declaration form itself, so medium.",
      "src": "Supplier-Code-of-Conduct.pdf",
      "cite": [
       {
        "src": "Supplier-Code-of-Conduct.pdf",
        "loc": "Page 6 · 5.2 Origin of materials",
        "quote": "Suppliers must declare the origin of every material supplied and provide supporting evidence on request.",
        "match": "must declare the origin of every material supplied"
       }
      ]
     }
    },
    {
     "t": "Does the company hold product certifications relevant to the materials it supplies?",
     "ty": "choice",
     "opts": [
      [
       "yes",
       "Yes"
      ],
      [
       "no",
       "No"
      ]
     ],
     "help": "Certifications covering the material itself or the way it is produced, such as chain-of-custody or responsible sourcing schemes.",
     "g": "Certification",
     "a": {
      "by": "alma",
      "v": "yes",
      "conf": "medium",
      "why": "The procedure refers to a chain-of-custody certification. The certificate itself was not among the documents.",
      "src": "Chain-of-Custody-Procedure.pdf",
      "cite": [
       {
        "src": "Chain-of-Custody-Procedure.pdf",
        "loc": "Page 8 · 5.1 Certifications",
        "quote": "The Araxá plant holds ISO 9001 and Chain of Custody certification under the Responsible Minerals Assurance Process.",
        "match": "holds ISO 9001 and Chain of Custody certification"
       }
      ]
     }
    },
    {
     "t": "List the certifications held and the date each one runs to.",
     "ty": "text",
     "val": "text",
     "help": "Name each certification, the body that issued it and the date it runs to.",
     "a": {
      "by": "user",
      "v": "Chain of Custody certification under the Responsible Minerals Assurance Process, issued November 2024 and running to November 2027, and ISO 9001 for the Araxá plant, running to October 2027. Both certificates are held in the Library."
     }
    },
    {
     "t": "How far back can a batch be traced?",
     "ty": "choice",
     "opts": [
      [
       "to-the-mine",
       "To the mine"
      ],
      [
       "to-the-smelter",
       "To the smelter"
      ],
      [
       "to-the-first-processor",
       "To the first processor"
      ],
      [
       "it-is-not-traced",
       "It is not traced"
      ]
     ],
     "g": "Ways of working",
     "a": {
      "by": "alma",
      "v": "to-the-mine",
      "conf": "medium",
      "why": "Custody records reach the mine on paper; how far the smelter's own records are checked is not covered, so medium.",
      "src": "Chain-of-Custody-Procedure.pdf",
      "cite": [
       {
        "src": "Chain-of-Custody-Procedure.pdf",
        "loc": "Page 4 · 3.1 Scope of custody",
        "quote": "Custody records run from the mine of origin, through the smelter, to despatch from the warehouse.",
        "match": "from the mine of origin, through the smelter"
       }
      ]
     }
    }
   ]
  }
 ],
 "docs": {
  "library": [
   {
    "name": "Code-of-Ethics-and-Conduct-2025.pdf",
    "size": 1812000,
    "folder": "Internal",
    "added": "12 Mar 2025"
   },
   {
    "name": "Anti-Corruption-and-Bribery-Policy.pdf",
    "size": 942000,
    "folder": "Internal",
    "added": "12 Mar 2025"
   },
   {
    "name": "Human-Rights-Policy.pdf",
    "size": 615000,
    "folder": "Internal",
    "added": "08 Feb 2025"
   },
   {
    "name": "Responsibility-Manual.pdf",
    "size": 4260000,
    "folder": "Internal",
    "added": "08 Feb 2025"
   },
   {
    "name": "Health-Safety-and-Environment-Manual.pdf",
    "size": 3480000,
    "folder": "Internal",
    "added": "21 Jan 2025"
   },
   {
    "name": "Data-Privacy-and-GDPR-Policy.docx",
    "size": 328000,
    "folder": "Internal",
    "added": "19 Nov 2024"
   },
   {
    "name": "Whistleblower-Procedure.pdf",
    "size": 274000,
    "folder": "Internal",
    "added": "19 Nov 2024"
   },
   {
    "name": "ISO-14001-Certificate.pdf",
    "size": 190000,
    "folder": "Internal",
    "added": "04 Oct 2024"
   },
   {
    "name": "ISO-45001-Certificate.pdf",
    "size": 186000,
    "folder": "Internal",
    "added": "04 Oct 2024"
   },
   {
    "name": "Information-Security-Training-Matrix.xlsx",
    "size": 112000,
    "folder": "Internal",
    "added": "27 Sep 2024"
   },
   {
    "name": "Supplier-Code-of-Conduct.pdf",
    "size": 806000,
    "folder": "Internal",
    "added": "27 Sep 2024"
   },
   {
    "name": "Certificate-of-Insurance-2026.pdf",
    "size": 158000,
    "folder": "Internal",
    "added": "15 Jan 2026"
   },
   {
    "name": "Code-of-Ethics-and-Conduct-2026.pdf",
    "size": 1904000,
    "folder": "Internal",
    "added": "14 Jan 2026"
   }
  ],
  "seed": [
   {
    "name": "Code-of-Ethics-and-Conduct-2025.pdf",
    "size": 1812000,
    "source": "files"
   },
   {
    "name": "Responsibility-Manual.pdf",
    "size": 4260000,
    "source": "files"
   },
   {
    "name": "Anti-Corruption-and-Bribery-Policy.pdf",
    "size": 964000,
    "source": "library"
   },
   {
    "name": "Certificate-of-Insurance-2026.pdf",
    "size": 412000,
    "source": "library"
   },
   {
    "name": "Supplier-Code-of-Conduct.pdf",
    "size": 1180000,
    "source": "library"
   },
   {
    "name": "Human-Rights-Policy.pdf",
    "size": 615000,
    "source": "library"
   },
   {
    "name": "Information-Security-Training-Matrix.xlsx",
    "size": 112000,
    "source": "files"
   },
   {
    "name": "ISO-14001-Certificate.pdf",
    "size": 190000,
    "source": "library"
   }
  ],
  "valid": {
   "Code-of-Ethics-and-Conduct-2025.pdf": "2025-12-31",
   "Code-of-Ethics-and-Conduct-2026.pdf": "2026-12-31",
   "Anti-Corruption-and-Bribery-Policy.pdf": "2027-03-12",
   "Human-Rights-Policy.pdf": "2027-02-08",
   "Responsibility-Manual.pdf": "2027-06-30",
   "Health-Safety-and-Environment-Manual.pdf": "2027-01-21",
   "Data-Privacy-and-GDPR-Policy.docx": "2027-11-19",
   "Whistleblower-Procedure.pdf": "2027-11-19",
   "ISO-14001-Certificate.pdf": "2027-10-04",
   "ISO-45001-Certificate.pdf": "2027-10-04",
   "Information-Security-Training-Matrix.xlsx": "2027-09-27",
   "Supplier-Code-of-Conduct.pdf": "2027-09-27",
   "Certificate-of-Insurance-2026.pdf": "2027-01-15",
   "GHG-Inventory-2025.xlsx": "2027-04-30",
   "Energy-and-Emissions-Report-2025.pdf": "2027-05-31",
   "Water-Management-Plan.pdf": "2027-08-14",
   "Waste-Management-Plan.pdf": "2027-08-14",
   "Environmental-Impact-Assessment-2024.pdf": "2029-03-01",
   "Information-Security-Policy.pdf": "2027-07-09",
   "ISO-27001-Certificate.pdf": "2027-10-04",
   "Responsible-Sourcing-Policy.pdf": "2027-02-28",
   "Chain-of-Custody-Procedure.pdf": "2027-12-05"
  },
  "where": {
   "Code-of-Ethics-and-Conduct-2026.pdf": {
    "loc": "Cover · Revision history",
    "quote": "Revision 5 — effective 1 January 2026, valid to 31 December 2026."
   },
   "Code-of-Ethics-and-Conduct-2025.pdf": {
    "loc": "Cover · Revision history",
    "quote": "Revision 4 — effective 1 April 2025, valid to 31 December 2025."
   },
   "Certificate-of-Insurance-2026.pdf": {
    "loc": "Certificate · Period of cover",
    "quote": "Period of cover: 16 January 2026 to 15 January 2027."
   },
   "Responsibility-Manual.pdf": {
    "loc": "Page 2 · Document control",
    "quote": "Issue 6 — approved 30 June 2025; next review 30 June 2027."
   },
   "Anti-Corruption-and-Bribery-Policy.pdf": {
    "loc": "Page 1 · Document control",
    "quote": "Approved 12 March 2025; valid until 12 March 2027."
   },
   "Supplier-Code-of-Conduct.pdf": {
    "loc": "Page 1 · Control",
    "quote": "Issued 27 September 2024, in force to 27 September 2027."
   },
   "ISO-27001-Certificate.pdf": {
    "loc": "Certificate · Validity",
    "quote": "Valid from 5 October 2024 until 4 October 2027, subject to surveillance audits."
   },
   "ISO-14001-Certificate.pdf": {
    "loc": "Certificate · Validity",
    "quote": "Valid from 5 October 2024 until 4 October 2027, subject to surveillance audits."
   },
   "ISO-45001-Certificate.pdf": {
    "loc": "Certificate · Validity",
    "quote": "Valid from 5 October 2024 until 4 October 2027, subject to surveillance audits."
   },
   "Information-Security-Training-Matrix.xlsx": {
    "loc": "Sheet “Control” · row 2",
    "quote": "Plan year 2025 — matrix current to 27 September 2027."
   },
   "GHG-Inventory-2025.xlsx": {
    "loc": "Sheet “Control” · row 4",
    "quote": "Inventory year 2025; figures stand until the 2026 recalculation, 30 April 2027."
   }
  }
 }
};

const placeHoldersList = [
    "Hey there! What's on your mind?",
    "Ready to explore? Start typing your thoughts!",
    "Tell us what's on your mind. We're listening!",
    "Looking for insights? Share your thoughts here!",
    "Curious minds, unite! What's your query?",
    "Ready to dive deep? Let's start the conversation!",
    "Welcome! What do you want to learn about today?",
    "Got questions? We've got answers. Start typing!",
    "Excited to learn? Begin your journey here!",
    "Your ideas, our models. Let's collaborate!",
]

// System prompts data
export const systemPrompts = [
    {
        text: "Write",
        value: "CREATIVE_IDEATION",
        icon: "edit_note",
    },
    {
        text: "Learn",
        value: "SOCRATIC_TUTOR",
        icon: "school",
    },
    {
        text: "Code",
        value: "CODE_GENERATOR",
        icon: "code",
    },
    {
        text: "Domain Expert",
        value: "DOMAIN_EXPERT",
        icon: "coffee",
    },
    {
        text: "Default",
        value: "DEFAULT_HELPFUL_ASSISTANT",
        icon: "smart_toy",
    },
]

export const getPlaceHolder = (isMobile: boolean) => {
    if (isMobile) {
        return mobilePlaceholdersList[Math.floor(Math.random() * mobilePlaceholdersList.length)]
    }
    return placeHoldersList[Math.floor(Math.random() * placeHoldersList.length)]
}

const mobilePlaceholdersList = ["What's on your mind?", "Start your search...", "Type to ask...", "What's your question?", "Got a query?", "Ask away!", "Type your question...", "Looking for answers?", "What's your topic?", "Ready to explore?"]

export const draftingDefaultPrompt = `I am giving you a document format below and some information i need you generate document for me, generate relevant information 



[FORMAT]
I. Employee Information
Name: [EMPLOYEE_NAME]
Pronoun: [PRONOUN]
Violations to Include: [List of Violations]
II. Failures
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
III. Conclusion
[EMPLOYEE_NAME] has experienced several violations by the Company, resulting in various penalties. Ensuring compliance with labor laws is crucial to avoid these penalties. (edited) 


[INFORMATION]

Violations 
Failure to Pay Minimum Wages
Failure to Pay Overtime
Failure to Provide Meal Periods
Failure to Provide Rest Periods
Untimely Payment of Wages During Employment


Employee Name: !!<EMPLOYEE_NAME>!!
Pronoun: !!<PRONOUN>!!
Violations to Include: Failure to Pay Minimum Wages
Failure to Pay Overtime
Failure to Provide Meal Periods
Failure to Provide Rest Periods
Untimely Payment of Wages During Employment


Instructions: 
Fill the Failures with relevant information,  
Always use this format in the document for user information !!<INFORMATION>!!, where it starts with !!< and ends with >!!. DO NOT USE ANY DUMMY DATA IN THE DOCUMENT. 
ALSO JUST GIVE THE DOCUMENT IN RESPONSE NOTHING ELSE.
Please provide a response without introductory gestures or phrases like 'Certainly! Here's the '. Just give me the response directly. EVERYTHING SHOULD BE AS PER LAW, AS PER UNITED STATES OF AMERIA LAW `

export const draftingStaticPromptP1 = `I am giving you a document format below and some information i need you generate document for me, generate relevant information 
[FORMAT]
I. Employee Information
Name: [EMPLOYEE_NAME]
Pronoun: [PRONOUN]
Violations to Include: [List of Violations]
II. Failures
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
Violation: [Description of Violation]
Issue: [Description of Issue]
Penalties:
[Penalty Description 1]
[Penalty Description 2]
III. Conclusion
[EMPLOYEE_NAME] has experienced several violations by the Company, resulting in various penalties. Ensuring compliance with labor laws is crucial to avoid these penalties. (edited)`

export const draftingStaticPromptP2 = `Instructions: 
Fill the Failures with relevant information,  
Always use this format in the document for user information !!<INFORMATION>!!, where it starts with !!< and ends with >!!. DO NOT USE ANY DUMMY DATA IN THE DOCUMENT. 
ALSO JUST GIVE THE DOCUMENT IN RESPONSE NOTHING ELSE.
Please provide a response without introductory gestures or phrases like 'Certainly! Here's the '. Just give me the response directly. EVERYTHING SHOULD BE AS PER LAW, AS PER UNITED STATES OF AMERICA LAW `
export const claimsAndViolationsData: any = {
    claims: {
        categories: {
            discrimination: {
                title: "Discrimination",
                description: "Claims for discrimination",
                parent: "claims",
                subcategories: {
                    disability_discrimination: {
                        parent: "discrimination",
                        title: "Disability Discrimination",
                        description: "Claims for disability discrimination",
                    },
                    failure_to_prevent_discrimination: {
                        parent: "discrimination",
                        title: "Failure to Prevent Discrimination",
                        description: "Claims for failure to prevent discrimination",
                    },
                },
            },
            failure_to_accomodate: {
                parent: "claims",
                title: "Failure to Accommodate",
                description: "Claims for failure to accommodate",
                subcategories: {
                    failure_to_provide_reasonable_accommodation: {
                        parent: "failure_to_accomodate",
                        title: "Failure to Provide Reasonable Accommodation",
                        description: "Claims for failure to provide reasonable accommodation",
                    },
                },
            },
            failure_to_engage_in_interactive_process: {
                parent: "claims",
                title: "Failure to Engage In Interactive Process",
                description: "Claims for failure to engage in interactive process",
                subcategories: {
                    failure_to_engage_in_interactive_process: {
                        parent: "failure_to_accomodate",
                        title: "Failure to Engage In Interactive Process",
                        description: "Claims for failure to engage in interactive process",
                    },
                },
            },
            retaliation: {
                parent: "claims",
                title: "Retaliation",
                description: "Claims for retaliation",
                subcategories: {
                    retaliation_for_requesting_accommodation: {
                        parent: "retaliation",
                        title: "Retaliation for Requesting Accommodation",
                        description: "Claims for retaliation for requesting accommodation",
                    },
                    retaliation_for_reporting_unsafe_patient_care: {
                        parent: "retaliation",
                        title: "Retaliation for Reporting Unsafe Patient Care",
                        description: "Claims for retaliation for reporting unsafe patient care",
                    },
                },
            },
            constructive_discharge: {
                parent: "claims",
                title: "Constructive Discharge",
                description: "Claims for constructive discharge",
                subcategories: {
                    constructive_discharge: {
                        parent: "constructive_discharge",
                        title: "Constructive Discharge",
                        description: "Claims for constructive discharge",
                    },
                },
            },
            wrongful_termination: {
                parent: "claims",
                title: "Wrongful Termination",
                description: "Claims for wrongful termination",
                subcategories: {
                    wrongful_termination_in_violation_of_public_policy: {
                        parent: "wrongful_termination",
                        title: "Wrongful Termination in Violation of Public Policy",
                        description: "Claims for wrongful termination in violation of public policy",
                    },
                },
            },
            emotional_distress: {
                parent: "claims",
                title: "Emotional Distress",
                description: "Claims for emotional distress",
                subcategories: {
                    emotional_distress_damages: {
                        parent: "emotional_distress",
                        title: "Emotional Distress Damages",
                        description: "Claims for emotional distress damages",
                    },
                },
            },
            punitive_damages: {
                parent: "claims",
                title: "Punitive Damages",
                description: "Claims for punitive damages",
                subcategories: {
                    punitive_damages: {
                        parent: "punitive_damages",
                        title: "Punitive Damages",
                        description: "Claims for punitive damages",
                    },
                },
            },
            other: {
                parent: "claims",
                title: "Other",
                description: "Claims for other",
                subcategories: {
                    other: {
                        parent: "other",
                        title: "Other",
                        description: "Claims for other",
                    },
                },
            },
        },
    },
    violations: {
        categories: {
            california_labor_code: {
                title: "California Labor Code",
                description: "Violations of California Labor Code",
                parent: "violations",
                subcategories: {
                    california_labor_code_1102_5: {
                        parent: "california_labor_code",
                        title: "California Labor Code § 1102.5",
                        description: "Violations of California Labor Code § 1102.5",
                    },
                    california_labor_code_1102_6: {
                        parent: "california_labor_code",
                        title: "California Labor Code § 1102.6",
                        description: "Violations of California Labor Code § 1102.6",
                    },
                    california_labor_code_1102_5_f: {
                        parent: "california_labor_code",
                        title: "California Labor Code § 1102.5(f)",
                        description: "Violations of California Labor Code § 1102.5(f)",
                    },
                    california_labor_code_1102_5_j: {
                        parent: "california_labor_code",
                        title: "California Labor Code § 1102.5(j)",
                        description: "Violations of California Labor Code § 1102.5(j)",
                    },
                },
            },
            feha: {
                title: "FEHA",
                description: "Violations of FEHA",
                parent: "violations",
                subcategories: {
                    prohibiting_discrimination: {
                        parent: "feha",
                        title: "Prohibiting Discrimination: 2 CCR § 11064(b)",
                        description: "Violations of Prohibiting Discrimination: 2 CCR § 11064(b)",
                    },
                    definition_of_disability: {
                        parent: "feha",
                        title: "Definition of Disability: 2 CCR § 11065(d)(2)(C) and 2 CCR § 11065(d)(1)",
                        description: "Violations of Definition of Disability: 2 CCR § 11065(d)(2)(C) and 2 CCR § 11065(d)(1)",
                    },
                    failure_to_prevent_discrimination: {
                        parent: "feha",
                        title: "Failure to Prevent Discrimination: Cal. Gov't Code § 12940(k)",
                        description: "Violations of Failure to Prevent Discrimination: Cal. Gov't Code § 12940(k)",
                    },
                    failure_to_accommodate_and_interactive_process: {
                        parent: "feha",
                        title: "Failure to Accommodate and Interactive Process: Gov. Code § 12940(m)(1), 2 CCR § 11068(a), Gov. Code § 12940(n), 2 CCR § 11069(a)",
                        description: "Violations of Failure to Accommodate and Interactive Process: Gov. Code § 12940(m)(1), 2 CCR § 11068(a), Gov. Code § 12940(n), 2 CCR § 11069(a)",
                    },
                },
            },
            other: {
                title: "Other",
                description: "Violations of other",
                parent: "violations",
                subcategories: {
                    other: {
                        parent: "other",
                        title: "Other",
                        description: "Violations of other",
                    },
                },
            },
        },
    },
}
export const bodyOfLawsData: any = {
    feha: {
        title: "FEHA",
        description: "The Fair Employment and Housing Act (FEHA)",
        categories: {
            discrimination_claims: {
                parent: "feha",
                title: "Discrimination Claims",
                description: "FEHA Discrimination Claims",
                subcategories: {
                    disability_discrimination: {
                        parent: "discrimination_claims",
                        title: "Disability Discrimination",
                        description: "FEHA Disability Discrimination",
                    },
                    gender_discrimination: {
                        parent: "discrimination_claims",
                        title: "Gender Discrimination",
                        description: "FEHA Gender Discrimination",
                    },
                    perceived_disability_discrimination: {
                        parent: "discrimination_claims",
                        title: "Perceived Disability Discrimination",
                        description: "FEHA Perceived Disability Discrimination",
                    },
                },
            },
            failure_to_accommodate_disability: {
                parent: "feha",
                title: "Failure to Accommodate Disability",
                description: "FEHA Failure to Accommodate Disability",
                subcategories: {
                    failure_to_engage_in_interactive_process: {
                        parent: "failure_to_accommodate_disability",
                        title: "Failure to Engage In Interactive Process",
                        description: "FEHA Failure to Engage In Interactive Process",
                    },
                },
            },
            legal_claims_and_settlements: {
                parent: "feha",
                title: "Legal Claims and Settlements",
                description: "FEHA Legal Claims and Settlements",
                subcategories: {
                    pre_litigation_settlements_demands: {
                        parent: "legal_claims_and_settlements",
                        title: "Pre-litigation Settlements Demands",
                        description: "FEHA Pre-litigation Settlements Demands",
                    },
                },
            },
        },
    },
    california_labor_code: {
        title: "California Labor Code",
        description: "California Labor Code",
        categories: {
            wage_and_hour_claims: {
                parent: "california_labor_code",
                title: "Wage and Hour Claims",
                description: "California Labor Code Wage and Hour Claims",
                subcategories: {
                    pay_disparity: {
                        parent: "wage_and_hour_claims",
                        title: "Pay Disparity",
                        description: "California Labor Code Pay Disparity",
                    },
                    wage_settlements: {
                        parent: "wage_and_hour_claims",
                        title: "Wage Settlements",
                        description: "California Labor Code Wage Settlements",
                    },
                    final_wages: {
                        parent: "wage_and_hour_claims",
                        title: "Final Wages",
                        description: "California Labor Code Final Wages",
                    },
                    accrued_vacation: {
                        parent: "wage_and_hour_claims",
                        title: "Accrued Vacation",
                        description: "California Labor Code Accrued Vacation",
                    },
                },
            },
            job_classification: {
                parent: "california_labor_code",
                title: "Job Classification",
                description: "California Labor Code Job Classification",
                subcategories: {
                    exempt_vs_non_exempt_classification: {
                        parent: "job_classification",
                        title: "Exempt vs. Non-Exempt Classification",
                        description: "California Labor Code Exempt vs. Non-Exempt Classification",
                    },
                },
            },
            legal_claims_and_settlements: {
                parent: "california_labor_code",
                title: "Legal Claims and Settlements",
                description: "California Labor Code Legal Claims and Settlements",
                subcategories: {
                    pre_litigation_settlements_demands: {
                        parent: "legal_claims_and_settlements",
                        title: "Pre-litigation Settlements Demands",
                        description: "California Labor Code Pre-litigation Settlements Demands",
                    },
                },
            },
        },
    },
    paga: {
        title: "PAGA",
        description: "Private Attorneys General Act (PAGA)",
        categories: {
            wage_and_hour_claims: {
                parent: "paga",
                title: "Wage and Hour Claims",
                description: "PAGA Wage and Hour Claims",
                subcategories: {
                    pay_disparity: {
                        parent: "wage_and_hour_claims",
                        title: "Pay Disparity",
                        description: "PAGA Pay Disparity",
                    },
                    wage_settlements: {
                        parent: "wage_and_hour_claims",
                        title: "Wage Settlements",
                        description: "PAGA Wage Settlements",
                    },
                    final_wages: {
                        parent: "wage_and_hour_claims",
                        title: "Final Wages",
                        description: "PAGA Final Wages",
                    },
                    accrued_vacation: {
                        parent: "wage_and_hour_claims",
                        title: "Accrued Vacation",
                        description: "PAGA Accrued Vacation",
                    },
                },
            },
            discrimination_claims: {
                parent: "paga",
                title: "Discrimination Claims",
                description: "PAGA Discrimination Claims",
                subcategories: {
                    disability_discrimination: {
                        parent: "discrimination_claims",
                        title: "Disability Discrimination",
                        description: "PAGA Disability Discrimination",
                    },
                    gender_discrimination: {
                        parent: "discrimination_claims",
                        title: "Gender Discrimination",
                        description: "PAGA Gender Discrimination",
                    },
                    perceived_disability_discrimination: {
                        parent: "discrimination_claims",
                        title: "Perceived Disability Discrimination",
                        description: "PAGA Perceived Disability Discrimination",
                    },
                },
            },
            other_paga_claims: {
                parent: "paga",
                title: "Other PAGA Claims",
                description: "Other PAGA Claims",
                subcategories: {},
            },
        },
    },
}

export const draftingSystemBroaderPrompt = `

**Objective:**

You are an AI assistant tasked with drafting formal demand letters for employment law cases in California. The goal is to create detailed, legally sound, and professional demand letters using the information provided in a structured question set filled out by the user. The letters should adhere to a structured, formal format with clear sections and subheadings, closely following the provided sample.

**Instructions:**

1. **Purpose and Overview:**
   - The demand letter aims to formally outline the client's legal claims, provide a detailed account of the incidents, present supporting evidence, and make specific legal demands for resolution.

2. **Information Mapping:**
   - Carefully map each answer from the user’s question set to the corresponding sections of the demand letter template, ensuring that the information is used accurately and comprehensively.

3. **Template Sections and Information Application:**

   - **Header and Contact Information:**
     - Begin with the law firm’s information on the top, followed by the date, and the method of delivery (e.g., VIA EMAIL). Use a formal layout similar to the sample provided.

   - **Recipient Information:**
     - Enter the recipient’s full name, job title, company name, company address, and email address.

   - **Case Reference:**
     - Include a subject line with the case reference, e.g., “Re: Jane Johnson v. ABC Financial Services.”

   - **Introduction:**
     - Start with a formal introduction that outlines the purpose of the letter, provides a brief summary of the client’s employment details, and introduces the legal claims and context. Use formal language and full sentences.

   - **Detailed Case Narrative:**
     - Provide a thorough narrative of the employment relationship, key incidents, and actions taken by both the employer and the employee. Use subheadings (e.g., "A. The Company Violated the California Equal Pay Act") to clearly delineate different parts of the case narrative.
     - Detail each incident and legal violation in separate sections, presenting legal citations and evidence in a formal, structured manner.

   - **Legal Violations:**
     - Write a section that outlines the specific legal violations, referencing exact legal citations and statutes. Include detailed explanations of how each law was violated, written in a formal, paragraph format.

   - **Evidence Summary:**
     - Summarize the key evidence supporting the claims. Use a narrative description of the evidence, explaining its relevance and significance in full sentences and paragraphs. Reference or attach relevant evidence files.

   - **Detailed Calculation of Damages:**
     - Provide a breakdown of the monetary compensation sought, including detailed calculations and justifications for each component. Write this in a paragraph format, clearly explaining each figure and its basis.

   - **Settlement Proposal:**
     - State the formal settlement demand, specifying the total amount sought and providing a clear rationale for the figure in a coherent, narrative style. Mention any previous settlement offers or discussions if applicable.

   - **Response Deadline:**
     - Specify a deadline for the response and outline the consequences of failing to meet this deadline. This should be clearly stated in a complete sentence within the relevant paragraph.

   - **Conclusion:**
     - Conclude with a call for cooperative resolution and outline the next steps if no response is received. Provide contact information for further communication and emphasize the willingness to resolve the matter amicably. Ensure this is written as a closing paragraph.

   - **Confidentiality Notice:**
     - Include a confidentiality notice at the end of the letter, stating that the communication is intended only for the recipient and may contain privileged information. This should be written as a standard legal disclaimer paragraph.

4. **Content Guidelines:**
   - **Narrative Structure:** Ensure that each section is written in full sentences and paragraphs, forming a coherent narrative that logically flows from one point to the next.
   - **Professional Tone:** Maintain a formal and professional tone throughout the letter, ensuring clarity and precision in the language used.
   - **Comprehensive Detail:** Include all relevant facts, legal citations, and evidence to support the client’s claims and demands, ensuring that each point is fully developed in the text.

5. **Quality and Accuracy:**
   - **Consistency:** Ensure the formatting and structure of the letter are consistent, with each section transitioning smoothly to the next.
   - **Error-Free:** Review for any factual inaccuracies or missing information. Correct any errors before finalizing the letter.

6. **Legal Compliance:**
   - **California Law:** Ensure all references and legal demands comply with California employment law standards.
   - **Confidentiality:** Adhere to confidentiality requirements and include the appropriate notice in the letter.

7. **Handling Missing Information:**
   - If any required information is missing from the question set, highlight these areas for user review or suggest possible placeholders to maintain the letter's integrity and completeness.

---

**Example Application:**

Using the provided question set, populate the template to create a thorough and comprehensive demand letter. Ensure all sections are detailed, legally accurate, and professionally written, demonstrating a clear understanding of the case and the applicable legal standards. Use full sentences and paragraphs to ensure the letter is well-structured and coherent, similar to the provided example.
`

export const draftingSystemPromptSectionOne = `

**Objective:**

You are tasked with drafting the initial section of a formal demand letter for an employment law case in California. This section should include the lawyer's contact information, the recipient's details, a case reference, and a brief introduction to the letter’s purpose and context.

**Instructions:**

1. **Header and Contact Information:**
   - Begin with the law firm’s information at the top of the letter. This should include:
     - Lawyer’s full name
     - Firm name
     - Firm address (street, city, state, zip code, country)
     - Direct contact number
     - Fax number
     - Email address
     - Date of the letter

   - Use a formal layout similar to the provided sample, ensuring clarity and professionalism.

2. **Delivery Method:**
   - Indicate the method of delivery (e.g., VIA EMAIL) directly under the date to ensure clarity regarding how the letter is being sent.

3. **Recipient Information:**
   - Include the following details for the recipient:
     - Recipient’s full name
     - Job title
     - Company name
     - Company address (street, city, state, zip code, country)
     - Email address

4. **Case Reference:**
   - State the case reference at the beginning of the letter, formatted as “Re: [Client’s Full Name] v. [Company Name].” This provides a clear context for the recipient.

5. **Introduction:**
   - Start with a formal salutation (e.g., “Dear Mr. Smith,”).
   - Write a paragraph that introduces the purpose of the letter. This should include:
     - The client’s name and brief employment details.
     - A summary of the legal claims and the purpose of the letter, which is to seek a pre-litigation settlement.
     - Mention any previous attorney if applicable, and a summary of previous communications or lack thereof.
   - Use formal and clear language, ensuring that the introduction sets the stage for the detailed case background to follow.

**Content Guidelines:**

- **Professional Tone:** Maintain a formal and professional tone throughout the section.
- **Complete Information:** Ensure all provided information is accurate and complete to avoid confusion.
- **Clarity:** Make sure each detail is clear and presented in a logical order to facilitate understanding.

**Example Application:**

Using the provided information, create a section that includes all required details, formatted and styled in a professional manner that sets the context for the rest of the letter.
`
export const draftingSystemPromptSectionTwo = `
**System Prompt:**

**Objective:**

You are tasked with drafting a comprehensive case background section of a formal demand letter for an employment law case in California. This section should present detailed factual narrative with explicit legal references in a formal legal document style, using full sentences and paragraphs to illustrate the violations of law, and demonstrating a clear connection between the client's experience and relevant statutes.

**Instructions:**

1. **Employment Details:**
   - Provide a thorough description of the client's employment in a narrative form, covering:
     - Job title and department.
     - Employment duration (start and end dates).
     - Detailed key job duties and responsibilities.
   - Use complete sentences to describe each aspect of the employment history, ensuring a coherent and structured narrative.

2. **Incident Details:**
   - Describe the key incidents in a chronological and detailed manner, central to the case, including:
     - The nature of each incident (e.g., underpayment, misclassification).
     - Specific dates and locations of incidents.
     - Involved parties (e.g., client, employer, colleagues).
   - Ensure that incidents are presented in full sentences to create a cohesive narrative highlighting a pattern of behavior or practices.

3. **Actions Taken:**
   - Provide a detailed account of the actions taken by both the employer and the employee, including:
     - Specific actions or inactions by the employer in response to issues.
     - Explicit description of the employee’s actions, highlighting efforts to resolve the matter.
   - Write in a narrative style to demonstrate the sequence of actions and responses, ensuring clarity and logical flow.

4. **Legal Violations:**
   - Discuss the specific legal violations relevant to the case in a detailed manner, referencing:
     - Specific statutes and legal codes.
     - Relevant case law for legal context and precedent.
   - Provide explanations in full sentences, connecting the facts of the case to the applicable laws in a clear and professional manner.

5. **Legal Analysis:**
   - Combine factual context with legal analysis to demonstrate how the facts meet the legal criteria for each violation.
   - Discuss the burden of proof and reference how the evidence supports the client’s claims under the relevant laws, using coherent paragraphs to elaborate on the legal implications.

6. **Witness Information:**
   - Include detailed information on any witnesses who can corroborate the client’s claims, covering:
     - Names of witnesses.
     - Contact information and summaries of their statements.
   - Emphasize the relevance of witness testimony in supporting the factual and legal aspects of the case, written in full sentences and paragraphs.

7. **Evidence Summary:**
   - Summarize key evidence supporting the claims with detailed descriptions, including:
     - Types of evidence (e.g., emails, job descriptions, pay records).
     - Patterns identified in the documents.
     - Relevance and significance of the evidence.
   - Present the summary in paragraphs, linking each piece of evidence directly to the legal claims.

8. **Damages Calculation:**
   - Provide a detailed calculation of potential damages based on specific violations, including:
     - Back pay, liquidated damages, interest, and any other applicable remedies.
   - Use a narrative style to explain each type of damage and its corresponding amount, ensuring a clear and logical presentation.

**Content Guidelines:**

- **Professional and Legalistic Tone:** Maintain a formal tone with detailed legal references and a structured presentation in full sentences and paragraphs.
- **Clarity and Precision:** Ensure that each detail is presented clearly and logically, linking facts directly to legal violations.
- **Thorough Contextualization:** Provide a narrative that sets the context and uses facts to demonstrate the applicability of the law.

**Example Application:**

Using the provided information, create a section that includes all required details, formatted and styled in a professional and legalistic manner, using full sentences and paragraphs to clearly connect the client’s experiences with specific legal violations.

**SOME RESOURCES RELATED TO SELECTED BODY OF LAWS OR VIOLATIONS, ONLY TO BE USED AS RESOURCES FROM OTHER CASES TO LEARN FROM, DO NOT USE ANY CLIENT SPECIFIC INFORMATION FROM THIS DATA** 
[[VIOLATIONS]]
`

export const draftingSystemPromptSectionThree = `
**Objective:**

You are tasked with drafting the demands and settlement section of a formal demand letter for an employment law case in California. This section should be presented in a narrative form, using full sentences and paragraphs to articulate the specific actions sought, the monetary compensation demanded, and the rationale behind these demands. The language should be professional and formal, suitable for a legal document.

**Instructions:**

1. **Resolution Demands:**
   - Provide a comprehensive and detailed description of the actions sought by the client. This should include demands such as:
     - Compensation for pay disparity.
     - Damages for misclassification.
     - Back pay and overtime adjustments.
     - Job reclassification.
   - Present each demand in full sentences, ensuring a logical flow and clear explanation of the client's requests.

2. **Breakdown of Monetary Compensation:**
   - Clearly articulate the monetary compensation sought, providing a detailed breakdown that includes:
     - Compensation for pay disparity.
     - Damages for misclassification.
     - Back pay and overtime.
   - Use complete sentences and paragraphs to describe the specific amounts for each type of compensation and the basis for these amounts.

3. **Emotional Distress Claims:**
   - Include any claims for emotional distress or other non-monetary damages. If applicable, explain that these are included in the overall demand amount. If not applicable, state that such claims are not included at this stage.
   - Ensure this is written in a professional and formal narrative.

4. **Settlement Proposal:**
   - Summarize the total settlement amount sought, providing a justification for this figure. This should include:
     - The total amount in dollars.
     - The basis for the calculation, such as documented pay discrepancies and misclassification damages.
   - Mention any previous settlement offers or discussions if applicable, using full sentences and paragraphs to ensure clarity and formality.

5. **Response Timeline:**
   - Specify a clear deadline for the response to the settlement demand, including:
     - The exact date for the deadline.
     - The consequences of not meeting the deadline, such as the potential for litigation.
   - Write this in a formal narrative style, ensuring that the expectations are clearly communicated and professionally presented.

**Content Guidelines:**

- **Formal and Legalistic Tone:** Maintain a professional and formal tone throughout the section, suitable for a legal document.
- **Clarity and Precision:** Ensure that each demand and the rationale behind it are clearly stated and justified, using full sentences and logical paragraph structure.
- **Detailed Explanation:** Provide thorough explanations for each demand and the total settlement amount, ensuring a clear connection between the client’s experience and the compensation sought.

**Example Application:**

Using the provided information, create a section that includes all required details in a professional and legalistic manner, using full sentences and paragraphs to clearly articulate the client’s demands and the justification for each.
`
export const draftingSystemPromptSectionFour = `
**Objective:**

You are tasked with drafting the conclusion section of a formal demand letter for an employment law case in California. This section should summarize the call to action, outline the potential consequences of not resolving the issue, and provide contact information for further communication.

**Instructions:**

1. **Call to Action:**
   - Encourage a cooperative resolution to the issue. Write a paragraph that:
     - Emphasizes the desire for an amicable settlement before litigation
     - Invites the recipient to discuss the matter further

2. **Potential Litigation Steps and Consequences:**
   - Outline the steps the client will take if no response is received by the deadline. Include:
     - Mention of filing for arbitration or pursuing further legal action
     - Potential additional damages or legal costs

3. **Next Steps if No Response:**
   - Clearly state the next steps that will be taken if the recipient fails to respond. This should include:
     - Specific legal actions (e.g., filing for arbitration)
     - A brief explanation of what the recipient can expect in terms of further proceedings

4. **Contact Information for Further Communication:**
   - Provide the lawyer’s contact information for any further communication or discussion. Include:
     - Email address
     - Direct contact number

**Content Guidelines:**

- **Encouraging Tone:** Maintain a tone that encourages resolution while being firm about potential consequences.
- **Clarity:** Clearly outline the steps to be taken if there is no response, ensuring the recipient understands the urgency and seriousness of the situation.
- **Professional and Formal:** Maintain a professional and formal tone throughout.

**Example Application:**

Using the provided details, draft a concluding section that summarizes the call to action, outlines the next steps, and provides contact information for further communication, ensuring a formal and professional closure to the letter.
`

export const sampleJsonFormat = [
    {
        text: "I represent CLIENT_NAME, a former employee of COMPANY_NAME. I write to address COMPANY_NAME's unlawful treatment of CLIENT_NAME individually, as well as Labor Code violations COMPANY_NAME committed against CLIENT_NAME and other current and former California employees. I write with hopes of agreeing on a resolution, so the parties can avoid protracted and costly litigation.",
        metadata: {
            source_filename: "PDF_FILENAME",
            section: "introduction",
            facts: [],
            laws: [],
        },
    },
]

export const sampleCSVFormat = `text,source_filename,section,facts,laws,variables
"I represent CLIENT_NAME","Letter to BCLP.pdf","Introduction","[]","","[CLIENT_NAME, COMPANY_NAME]"
"COMPANY_NAME hired CLIENT_NAME","Letter to BCLP.pdf","Background","[Failure to Reimburse Expenses]","[Labor Code section 2802]","[START_DATE, HOURS_PER_WEEK]"
"COMPANY_NAME evaluated CLIENT_NAME","Letter to BCLP.pdf","Background","[Positive Performance Evaluations]","[]","[CLIENT_NAME, HOURS_PER_WEEK]"
"COMPANY_NAME awarded CLIENT_NAME","Letter to BCLP.pdf","Background","[Positive Performance Evaluations]","[]","[START_DATE, COMPANY_NAME]"`

export const phraseExtractionPrompt = `You are an intelligent assistant. Your task is to identify and extract concise and relevant key phrases or entities from a user query that would benefit from vector searches. These phrases should be suitable for vector matching. Format your response in the following way:
<Key Phrase or Entity 1>*<Key Phrase or Entity 2>*...
User Query: <user_query>
Focus on extracting the most essential terms or phrases, avoiding additional context or descriptive words. Provide only the formatted text for vector searches as specified.`

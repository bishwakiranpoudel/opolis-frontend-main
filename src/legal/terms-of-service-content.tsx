import { LEGAL_PRIVACY_POLICY_PDF_URL } from "@/lib/constants";

/**
 * Static Terms of Service (Employment Commons LCA) — exact copy as provided.
 * Headings follow document hierarchy for accessibility and SEO.
 */
export function TermsOfServiceContent() {
  return (
    <article className="legal-html legal-tos wrap" style={{ maxWidth: 900 }}>
      <header className="legal-tos-header">
        <h1>Terms of Service</h1>
        <p className="legal-tos-entity">Employment Commons LCA</p>
        <p className="legal-tos-title-line">Terms of Service</p>
        <p>
          <strong>Last Updated: October 1, 2024</strong>
        </p>
      </header>

      <p>
        {`These Terms of Service (the "Terms"), each Member's Membership Agreement, the Bylaws, and Articles of Incorporation, as such may be amended from time to time, constitute the entire agreement by and between the Employment Commons LCA, a Colorado public benefit limited cooperative association (the "Commons" or "we") and each Employee Member or Coalition Member, which includes authorized users representing each such respective Member, or other persons using or accessing the services provided by us (each, a "User" and collectively, the "Member").`}
      </p>
      <p>
        {`These Terms contain the terms and conditions that govern the use of the Commons technology platform (the "Platform") and/or the Services (defined below). The Commons directly, and through its website (www.opolis.co) and the associated domains thereof (the "Site"), offers Members the products and services listed on the Platform (as such list may be updated, modified, or otherwise changed from time to time, collectively, the "Services").`}
      </p>
      <p>
        {`The Commons engages Opolis, Inc., a Delaware corporation (the "Trustee") to perform certain administrative services on its behalf. The Trustee handles all employer of record and other services provided by the Commons with respect to its Members.`}
      </p>

      <h2>1. Acknowledge and Acceptance of Terms.</h2>
      <p>
        {`By accessing and using the Platform and the Services, you confirm (a) that you have received, read, and comprehended these Terms, and that these Terms form a valid and binding agreement between us, (b) your commitment to abide by all conditions, rules, regulations, or policies of the Commons, inclusive of its Bylaws, Articles of Organization and respective Membership Agreement for each Membership class, understanding that these may be updated or supplemented from time to time at our discretion, and (c) your use of the Platform and the Services will adhere to all relevant federal, state, and local laws, rules, or regulations, with the understanding that you bear sole responsibility for your compliance with, familiarity with, and understanding of any such laws, rules, or regulations applicable to your use of the Platform.`}
      </p>
      <p>
        {`By using or accessing the Platform and the Services, you represent and warrant to us that you: (a) are eighteen (18) years of age or older, (b) are not currently restricted from using the Platform or the Services, or otherwise prohibited from having an Account (defined below), (c) are not using the Platform or the Services for any reason that may be in competition with the Commons or any other product or service offered by the Commons, (d) have full power and authority to enter into and perform these Terms, and doing so will not violate any other agreement to which you are a party, (e) will not violate any rights of the Commons, including, without limitation, intellectual property rights such as patent, copyright or trademark rights, and (f) agree to provide, operate and maintain, at your sole risk, cost and expense, all equipment, software, and internet access necessary to use the Platform.`}
      </p>
      <p>
        {`The Commons Privacy Policy, as may be updated from time to time, located here: `}
        <a
          href={LEGAL_PRIVACY_POLICY_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          https://commons.opolis.co/legal/privacy-policy
        </a>
        {` sets forth how the Commons collects, uses and discloses its Member's personal information.`}
      </p>
      <p>
        <strong>
          THESE TERMS CONTAIN AN AGREEMENT TO ARBITRATE ALL CLAIMS AND CONTAINS DISCLAIMERS
          OF WARRANTIES AND LIABILITY.
        </strong>
      </p>
      <p>
        <strong>
          IF YOU DO NOT AGREE WITH ANY PORTION OF THESE TERMS, YOU ARE PROHIBITED FROM
          USING OR ACCESSING THE PLATFORM OR THE SERVICES.
        </strong>
      </p>

      <h2>2. Member Accounts and $WORK Allocations.</h2>
      <p>
        {`To access the Platform, the Services, and receive $WORK, each Member must register for an account with the Commons ("Account"). Member authorizes the Commons to obtain and store such Member's Account information as may only be necessary to make the Platform and the Services available to Member.`}
      </p>
      <p>
        {`Each Member gives the Commons permission to obtain, verify, and record information that identifies the individual who creates an Account, is the intended user of an Account, or accesses the Services. The Commons may ask for a User's name, address, date of birth, social security number, and other identifying information or documents that will allow the Commons to identify Members only as may be necessary to provide the Services.`}
      </p>
      <p>
        {`Only Members are eligible to receive $WORK. Members may receive $WORK by consuming Services offered by the Commons, staking $WORK to earn staking rewards in the form of additional $WORK, and/or referring new Employee Members, as applicable to each membership class in accordance with the Bylaws and Membership Agreement, or as otherwise determined in the sole discretion of the Board of Stewards. $WORK rewards will be deposited to each Member's Account in the Platform.`}
      </p>
      <p>
        {`Each Member understands and agrees that the Commons has no control over, and no duty to take any action regarding: failures, disruptions, errors, or delays in processing $WORK that you may experience while using the Services or the Platform; the risk of failure of hardware, software, and Internet connections; the risk of malicious software being introduced or found in the software underlying $WORK; the risk that third parties may obtain unauthorized access to information stored within your Account, including, but not limited to any wallet address, private key, and mnemonic (backup) phrase; and the risk of unknown vulnerabilities in or unanticipated changes to the Ethereum Network or any other blockchain network or protocol.`}
      </p>

      <h2>3. Coalition Member Benefits.</h2>
      <p>
        {`Following acceptance into the Commons and the creation of a Coalition Member's Account, such Member will have exclusive access to the Opolist Job Board.`}
      </p>
      <p>
        {`By referring Employee Members to the Commons and staking $WORK, Coalition Members will be eligible for additional $WORK to be deposited into their Accounts.`}
      </p>

      <h2>4. Employee Member Onboarding.</h2>
      <p>
        {`In connection with the initial creation of your Account, you will also complete our onboarding process ("Onboarding") as an Employee Member. During Onboarding, Employee Members will select the desired Services through the Platform and pay to the Commons a one (1) month non-refundable deposit for select Services, as such amount is determined by the Commons in its sole discretion (the "Deposit").`}
      </p>
      <p>
        {`Each Employee Member may designate and authorize either itself and/or one or more individuals with authority to (i) act on such Member's behalf, (ii) provide information on such Member's behalf, and (iii) bind such Member with respect to the Services (each such individual, an "Account Administrator"). An Account Administrator is authorized by each Employee Member to access the Services by entering a confidential user ID and password. This access will entitle the Account Administrator, depending on their designation and the permissions given by such Member, to input information and access, review, modify, and/or provide approvals on such Member's behalf.`}
      </p>
      <p>
        {`Each Employee Member is solely responsible for all actions taken under any Account. Any actions taken under an Account, whether taken by such Member, a User, or an Account administrator, will be deemed authorized by the Employee Member, regardless of such Member's knowledge of such actions (the "Authorized Actions").`}
      </p>
      <p>
        {`Each Member has sole responsibility for adequately securing, and keeping confidential, any Account passwords or credentials, and any information accessible via the Account. If a Member believes or suspects that an Account or passwords or credentials for such Account have been disclosed to, accessed by, or compromised by unauthorized persons, Member must immediately notify the Commons. The Commons reserves the right to prevent access to the Services if the Commons has reason to believe that a User's Account or passwords or credentials for a User's Account have been compromised.`}
      </p>
      <p>
        {`Each Employee Member is responsible for the accuracy and completeness of information provided to the Commons for purposes of the Services. Furthermore, each Employee Member represents and warrants to the Commons that for any information that such Member shares with the Commons, whether directly, via a User or an Account Administrator, that such Member has the authority to share such information and the accuracy and completeness of such information is maintained on an ongoing basis.`}
      </p>
      <p>
        {`Each Member is obligated to promptly notify the Commons of any third-party notices that a User receives which could reasonably affect the Commons' ability to effectively provide the Services or increase the likelihood that a Claim (as defined below) is brought against such Member or the Commons in connection with the Services. Examples include notices from the Internal Revenue Service or other government agencies regarding penalties or errors relating to the Services, and notices from insurance carriers regarding eligibility, enrollment, payment, or any other communications affecting the contract of services with that insurance carrier.`}
      </p>
      <p>
        {`Each Employee Member agrees that, to the fullest extent permitted by law, when such Member, a User, or an Account Administrator provides Account login credentials (e.g., username and password) or identity verification credentials to the Commons by such a Member, User or an Account Administrator, and subsequently or simultaneously authorizes any action via the Platform (e.g., clicking the "Submit Payroll" or other buttons) or otherwise (e.g., verbally telling an authorized Commons representative to take an action), it will have the same effect as such parties providing a written signature authorizing electronic payments, filings, or any other actions in connection with the Services.`}
      </p>

      <h2>5. Employer of Record Services.</h2>
      <p>
        {`If selected, the Commons will provide each Employee Member employer of record services (the "EOR Service") for the purposes of (i) calculating payroll and its associated liabilities for User's business; (ii) processing payroll and making related payroll payments; (iii) making certain payroll tax payments and payroll tax filings electronically; and (iv) if applicable, administering wage garnishments, such as child support payments.`}
      </p>
      <p>
        {`In performing the EOR Service, the Commons will rely on the information provided by such Member, User or the Account Administrators. The Commons will not be held responsible for any errors resulting from incorrect or incomplete information provided by the Member, User or Account Administrators.`}
      </p>
      <p>
        {`Prior to each Employee Member's initial payroll processing date, such Member must submit the completed and executed documents required by the Commons through Onboarding for providing the EOR Service, as determined by the Commons in its sole discretion.`}
      </p>
      <p>
        {`Each Employee Member is responsible for: (i) depositing any federal, state, and local withholding liabilities incurred prior to enrolling in the EOR Service; (ii) submitting any payroll returns to tax agencies (state, federal, and/or local) that were due for payroll tax liabilities incurred prior to enrolling in the EOR Service; and (iii) cancelling any prior employer of record, payroll service or services of professional employee organizations/employee leasing companies.`}
      </p>
      <p>
        {`In performing the EOR Service, each Employee Member acknowledges and agrees that (i) the Commons is not acting in a fiduciary capacity for Member and/or its business; (ii) using the EOR Service does not relieve the Employee Member of its obligations under local, state, or federal laws or regulations to retain records relating to Employee Member's data contained in the Commons' files; and (iii) any information that the Commons provides in connection with the EOR Service is for informational purposes only and the Employee Member should not rely on it as legal, tax, insurance or accounting advice.`}
      </p>
      <p>
        {`Each Employee Member agrees that by submitting each payroll (including the first payroll), the Employee Member: (i) approves all payroll information; (ii) represents and warrants to the Commons that no payroll information submitted to the Commons will result in entries that would violate the sanctions program of the Office of Foreign Assets Control of the U.S. Department of the Treasury or any other applicable laws, rules, or regulations; (iii) waives and releases any Claim against the Commons arising out of any errors or omissions in the payroll information which Member has not corrected (whether directly or through Member, User or any Account Administrators) or has not requested the Commons to correct; and (iv) acknowledges that any subsequent request for corrections will be considered special handling, and additional fees may be charged. Final responsibility for any audits or assessments rests with the Employee Member. The Commons is not obliged to verify the accuracy of any data provided by the Employee Member via the Platform or any other method.`}
      </p>
      <p>
        {`Invoices will be submitted to each Employee Member through the Platform at least eleven (11) calendar days prior to each payroll cycle on each 1st and 3rd Friday of each calendar month. Any amounts due associated with each payroll cycle will be debited from the Bank Account nine (9) calendar days prior to each payroll date.`}
      </p>
      <p>
        {`If Employee Member does not have sufficient funds in the Bank Account to pay amounts for a payroll withdrawal when due, or if Employee Member refuses to pay such amount, then the Commons will not be able to properly pay the applicable parties and will not be liable for any consequences or Claims directly or indirectly arising from such failure to pay, and the Commons may (i) debit the Bank Account or any other account owned in whole or in part by such Employee Member, including any Deposit on account with the Commons, to pay disbursements, fees or charges, payroll taxes, or other amounts due; (ii) refuse to perform further Services; and/or (iii) immediately terminate the EOR Services. For any amounts due and unpaid, the Commons may assess finance charges on such amounts and recover certain fees and costs of collection associated with such amounts or as permitted by law, including requesting an additional Deposit to be held on account.`}
      </p>

      <h2>6. Service Plans.</h2>
      <p>
        {`Employee Member may elect to subscribe to additional services provided by the Commons from or through the Platform ("Additional Services"). Some Additional Services have specific additional terms that apply to your use of those Additional Services (the "Additional Terms"). In the event of any inconsistency between the Additional Terms and these Terms, the provisions which are more favorable to the Commons will prevail, but only to the extent they apply to Employee Member's use of the Additional Services.`}
      </p>
      <p>
        {`Any changes to the Services shall be made through the Platform, subject to the Commons' approval. Applicable fee adjustments for an upgrade or downgrade will be applied to each Employee Member's Service charge for the calendar month in which such Member upgraded or downgraded, as applicable, and for each calendar month thereafter for so long as such Member is subscribed for the upgraded Services. Any downgraded features of Services shall go into effect at the beginning of the calendar month following the month in which such Member elected to downgrade such Services.`}
      </p>
      <p>
        {`The Commons may, at its reasonable discretion, decline to offer the Services for any reason, including in the event that the Onboarding process is not satisfactorily completed or for other lawful business reasons.`}
      </p>

      <h2>7. Service Fees.</h2>
      <p>
        {`Except as otherwise specified within these Terms or on each Member's Platform dashboard, Service fees are based on Services purchased and actual usage or consumption.`}
      </p>
      <p>
        {`Fees for the Services are as set forth in the applicable fee schedules listed on the Platform and Member authorizes the Commons to debit Member's designated bank account (the "Bank Account"), as applicable, for all fees as they become payable in accordance with this Section 6. Member understands, acknowledges and agrees that any fees, charges or other amounts invoiced and/or paid pursuant to these Terms ("Invoiced Amounts"), whether based on rates provided by law or as determined by the Commons, may include administrative charges and may vary from the actual costs of the Commons, regardless of how such Invoiced Amounts are presented on any invoice, proposal or otherwise, including, without limitation, Invoiced Amounts identified as taxes, contributions, premiums or deductibles. To the extent that any such Invoiced Amounts exceed the actual costs of the Commons, Member understands, acknowledges and agrees that such excess is part of the reasonable compensation payable to the Commons for the services provided pursuant to these Terms and not a pass-through charge or penalty.`}
      </p>
      <p>
        {`Unless otherwise stated in these Terms or applicable Additional Terms, fees for Services are based on the calendar months in which such Member is enrolled in any Services, with the exception of EOR Services, and such fees are applied in full for a given calendar month, regardless of whether the Employee Member is only enrolled in the Services for a portion of such month. Except for certain fees for particular add-on services that an Employee Member has opted into, fees for the Services will be billed to Employee Member and debited from such Employee Member's Bank Account on a monthly calendar basis, in arrears. All fees are non-refundable, except where required by law or as otherwise specified in these Terms or applicable Additional Terms. Employee Member agrees to reimburse the Commons for any sales, use, and similar taxes arising from the provision of the Services that any federal, state, or local governments may impose. The Commons may charge additional fees for exceptions processing, setup, and other special services (including optional add-on services).`}
      </p>
      <p>
        {`The Commons reserves the right to change the fees for its Services from time to time. Employee Members will be notified of any change to existing fees at least thirty (30) days before the fee change goes into effect. If a fee increase or a change to these Terms is not acceptable to a Member, such Member may cancel the Services as provided in Section 7 prior to the time when such fee increase or change to these Terms takes effect. Each Member's continued use of the Services beyond the cancellation window constitutes such Member's agreement to those changes. If the Commons is unable to collect fees due because of insufficient funds in Employee Member's Bank Account or for any other reason, such Member must pay the amount due immediately upon demand, plus any applicable exceptions processing fees, bank fees, or charges for return items, plus interest at the lesser of 18% per annum or the maximum rate permitted by law, plus attorneys' fees, other costs of collection, and any other costs incurred by the Commons in pursuing the collection of the unpaid amount, as permitted by law.`}
      </p>

      <h2>8. Term; Termination.</h2>
      <p>
        {`These Terms shall be effective beginning on the Start Date and remain in effect until terminated by either party.`}
      </p>
      <p>
        {`Either party may terminate these Terms upon providing five (5) business days' notice to the other party through the Platform ("Termination Notice").`}
      </p>
      <p>
        {`Following the Termination Notice, termination of Member's access to the Platform will occur at the end of the next calendar month. Between the Notice period and the end of the month following cancellation, the parties will continue to meet the obligations set forth in these Terms.`}
      </p>
      <p>
        {`Upon termination by either party, the Commons will cease to be Employee Member's employer of record, process payment for any EOR Service which has been invoiced to Employee Member up to the date of termination and apply the Deposit to any remaining outstanding balance for the calendar month of termination. Any unused portion of the Deposit shall be retained by the Commons as a termination fee, unless otherwise required by law or agreed upon in writing between the parties.`}
      </p>

      <h2>9. Third Party Services</h2>
      <h3>Third-Party Services.</h3>
      <p>
        {`Certain services through the Platform will be provided by Commons third-party service providers (each, a "Third-Party Service"). Each Member shall be solely responsible for, and assumes all risk arising from, such Member's election to receive and receipt of a Third-Party Service. The Commons shall not be responsible for Third-Party Services or any material, information, or results made available through the Third-Party Services. Further, each Member may be required to agree to additional terms and conditions or agreements with respect to the provision of Third-Party Services. To the extent consistent with applicable law, the Commons may receive commissions, referral fees or other sources of revenue from the Third-Party Service provider with respect to a Third-Party Service.`}
      </p>
      <h3>Third-Party Sites.</h3>
      <p>
        {`The Platform and the Services may contain links to third-party websites or resources. The Commons provides these links only as a convenience and is not responsible for the content, products, or services on or available from those websites or resources, or links displayed on such websites. Each Member acknowledges its sole responsibility for, and assumes all risk arising from, each Member's use of any third-party websites or resources.`}
      </p>

      <h2>10. Third Party Service Providers.</h2>
      <h3>Credit Card Processing.</h3>
      <p>
        {`Credit card payment processing services for the Services are provided by Wyre, Authorize.net and other third-party merchant account providers ("Third Party Credit Card Merchants") and are subject to the applicable agreements, which includes such Third Party Merchant's terms of service and privacy policy (collectively, the "Services Agreements"). Employee Member agrees to be bound by the Services Agreements, as they may be modified by such Third Party Merchants from time to time. As a condition to the Commons enabling credit card payment processing services through such Third Party Merchants, each Employee Member agrees to provide the Commons with accurate and complete information about such Member, and authorizes the Commons to share any such information with the Third Party Merchants, as well as transaction information related to such Member's use of the payment processing services provided by the Third Party Merchants. If an Employee Member fails to provide the Commons with accurate and complete information about such Member, the Commons may suspend or terminate such Member's access to the Services. In all cases, standard credit card or other third-party processing fees apply in addition to any service fees. The Commons is not responsible for the performance of any third-party credit card processing or third-party payment services.`}
      </p>
      <h3>ACH Payments.</h3>
      <p>
        {`ACH payment services for the Services are provided by Dwolla, or such other merchants as may be appointed by the Commons. By choosing to use a Bank Account as Member's payment method, Employee Member will be able to complete their purchase using any valid automated clearing house ("ACH")-enabled Bank Account at a United States-based financial institution. Whenever an Employee Member chooses to pay for an order using the Bank Account, each Employee Member is authorizing the Commons to debit such Bank Account for the total amount of such Member's Service Fees (including applicable taxes and fees). To complete the transaction, Member, or an authorized agent acting on its behalf, will create an electronic funds transfer or bank draft, which will be presented to such Member's bank or financial institution for payment from such Bank Account. Each Employee Member's transaction must be payable in U.S. dollars. The Commons, in its sole discretion, may refuse this payment option service to anyone or any Employee Member without notice for any reason at any time.`}
      </p>
      <h3>Dwolla Platform.</h3>
      <p>
        {`In order to use the payment functionality of the Service, each Employee Member must open a Dwolla Platform account provided by Dwolla, Inc. and accept the Dwolla Terms of Service and Privacy Policy. Any funds held in the Dwolla account are held by Dwolla's financial institution partners as set out in the Dwolla Terms of Service. Each Employee Member authorizes the Commons to collect and share with Dwolla User's personal information including full name, date of birth, social security number, physical address, email address and financial information, and each Employee Member is responsible for the accuracy and completeness of that data. Each Employee Member understands that it will access and manage its Dwolla account through the Services, and Dwolla account notifications will be sent by the Commons, not Dwolla. The Commons will provide customer support for your Dwolla account activity, and contact information can be found at `}
        <a
          href="https://opolis.co/#contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://opolis.co/#contact
        </a>
        {` or `}
        <a href="mailto:support@opolis.co">support@opolis.co</a>
      </p>

      <h2>11. Rights, Duties, and Responsibilities of Members.</h2>
      <h3>Supervise and Control.</h3>
      <p>
        {`Each Employee Member will be responsible for the day-to-day supervision, direction and control of Employee Member's employees and Users, as well as any of its employees with respect to whom the Commons is providing EOR Services. Employee Members will verify skills and references to determine employment eligibility of employees with respect to whom the Commons is providing EOR Services .`}
      </p>
      <h3>Right to Request Removal.</h3>
      <p>
        {`Employee Member has the right to request removal of employees with respect to whom the Commons is providing EOR Services .`}
      </p>
      <h3>Duty to Maintain Records.</h3>
      <p>
        {`Employee Member agrees to maintain records of actual time worked and verify the accuracy of wages and salaries reported to and paid by the Commons.`}
      </p>
      <h3>Intellectual Property Rights.</h3>
      <p>
        {`All Members acknowledge and agree that all rights to any patent, work product, or intellectual property or any interest in any technology, development, process, or product shall be unaffected by these Terms. Nothing about these Terms or the Service shall create in the Commons or the Trustee any interest in any intellectual property, patents or ownership of work product as between Members. Additionally, nothing in these Terms or the Service shall create in the Members any interest in any intellectual property, patents or ownership of work product as between the Commons and Trustee.`}
      </p>
      <h3>Workplace Safety.</h3>
      <p>
        {`Each Employee Member agrees to comply at its expense with all reasonable or legally required directives from the Commons, the Commons' workers compensation carrier, or any government agency having jurisdiction over workplace health and safety. Each Employee Member shall provide or ensure use of all personal protective equipment, as required by federal, state or local law, regulation, ordinance, directive, or rule or as deemed necessary by the Commons or its workers compensation carrier. The Commons or its workers compensation carrier and its liability insurance carriers shall have the right to inspect each Employee Member's premises to prevent exposure to an unsafe workplace.`}
      </p>
      <p>
        {`Each Employee Member agrees that it will comply, at its own expense, with all safety, health and work environment laws, regulations, ordinances, directives, and rules imposed by controlling federal, state and local governments, and it will immediately report all accidents and injuries to the Commons.`}
      </p>
      <p>
        {`Nothing contained in these Terms shall relieve each Employee Member of its obligations imposed under any safety-related law or regulation. Each Employee Member acknowledges, agrees, and warrants that such Member is responsible for complying with requirements set forth in such Member's written safety plan. Each Employee Member indemnifies and holds harmless the Commons for any fines, assessments, penalties or other relief awarded against the Commons for safety violations which are under the direction and control of such Member.`}
      </p>
      <h3>License Requirements.</h3>
      <p>
        {`If employees with respect to whom the Commons is providing EOR Services are required to be licensed or to act under the supervision of a licensed person or entity, each Employee Member shall be solely responsible for verifying such license or providing such required supervision.`}
      </p>
      <h3>Insurance.</h3>
      <h4>Automobile.</h4>
      <p>
        {`If any employee with respect to whom the Commons is providing EOR Services is to drive a vehicle of any kind for Employee Member, such Member will furnish liability insurance to include coverage for both bodily injury and property damage. Employee Member acknowledges, understands, and agrees that, notwithstanding any other provision of the Terms, the fees charged by the Commons and remitted by such Member are not intended to compensate the Commons for the risk associated with the liabilities which may arise out to the operation of any vehicle or any other equipment controlled, owned, operated, or maintained by such Member.`}
      </p>
      <h4>Professional Liability.</h4>
      <p>
        {`If an employee with respect to whom the Commons is providing EOR Services performs any duties in a professional capacity, Employee Member agrees to exercise such direction and control over said employee sufficient to comply with all applicable laws, and each Employee Member shall furnish malpractice insurance which shall cover any acts, errors or omissions, including but not limited to negligence. The employee shall be deemed the employee of the Employee Member for the purposes of this insurance. Each Employee Member agrees to cause its insurance carrier to name the Commons as an additional named insured on the Employee Member's policy and shall provide evidence of such coverage and shall issue a Certificate of Insurance evidencing such coverage to the Commons allowing not less than 30 days' notice of cancellation or material change. Each Employee Member agrees to file against such policy exclusively with respect to any claim for malpractice or errors and omissions for any employee engaged in the performance of licensed and/or professional duties. Each Employee Member agrees to defend the Commons, and to cause its insurance carrier to defend the Commons, against any and all liabilities of any kind, including costs and attorneys' fees, arising out of any such claim.`}
      </p>
      <h4>Employment Practices Liability.</h4>
      <p>
        {`The Commons does not furnish insurance for and cannot control Employee Member practices which the Commons is not directly involved in, is a party to or aware of that may result in discrimination charges or lawsuits involving age, sex, race, religion, national origin, disability, or like risks and exposures. Employee Member agrees to hold the Commons harmless and indemnify the Commons from any and all such liability.`}
      </p>
      <h4>General Liability.</h4>
      <p>
        {`The parties further agree that, if an employee with respect to whom the Commons is providing EOR Services  in the course of his/her duties participates in actions that result in bodily injury or property damage, Employee Member will file for recovery against his/her own liability insurance policy. Employee Member is required to secure all usual and customary forms of liability insurance that such Employee Member would deem essential to have if such employees were the employees solely of Employee Member, for its own protection and the protection of the Commons. Employee Member agrees to hold the Commons harmless and indemnify it against all liability claims involving any and all employees with respect to whom the Commons is providing EOR Services which may arise in the course of their job performance on behalf of such Member. Any and all damages awarded to such an employee or his or her representative as a result of such claims will be paid by Employee Member and not the Commons, or if required to be paid by the Commons, Employee Member will reimburse the Commons for all costs expended by the Commons, including but not limited to awards, judgments, and attorney's fees.`}
      </p>
      <h4>Evidence of Insurance Coverage.</h4>
      <p>
        {`Each Employee Member agrees to keep in full force and effect at all times during the term of these Terms, a comprehensive general liability insurance policy with a minimum combined single limit of $1,000,000 insuring such Member against liability for bodily injury and property damage arising out of such Member's premises, completed operations, and/or products. Said policy shall also include blanket contractual liability and personal injury liability. Each Employee Member shall provide the Commons with certificate(s) of insurance evidencing such coverage, with said certificate(s) providing for no less than 30 days' notice to the Commons in the event of cancellation of coverage.`}
      </p>
      <h3>Hold Harmless.</h3>
      <p>
        {`Each Employee Member agrees to release, defend, indemnify and hold the Commons harmless from any and all wrongful or negligent acts committed by such Member or any User or other person who is under Employee Member's supervision and control, including violations of any federal, state, or local statutes, laws or regulations.`}
      </p>
      <h3>COBRA.</h3>
      <p>
        {`If these Terms between Employee Member and the Commons are terminated for any reason, Employee Member and Employee Member alone shall be responsible for replacing for the employees with respect to whom the Commons is providing EOR Services such health care coverage as shall avoid the implication of a qualifying event as defined by Internal Revenue Code ("I.R.C.") 4980B.`}
      </p>
      <p>
        {`If Employee Member fails to provide such replacement health care coverage, the Commons shall be obligated to extend continuation of its health care coverage in accordance with I.R.C. 4980B. Should such event occur, Employee Member shall remit to the Commons a sum per employee as a one-time fee for the administration of continuation of health care coverage as specified on the Platform. Employee Member understands and agrees that this sum is fair compensation to the Commons for its expense in extending health care coverage continuation to the employees with respect to whom the Commons is providing EOR Services.`}
      </p>
      <p>
        {`No fee shall be due if Employee Member provides health care coverage which avoids the implication of a qualifying event. This paragraph shall not apply to individual cases of employee resignation or discharge which do not occur in the context of cancellation or termination of these Terms.`}
      </p>
      <p>
        {`Employee Member further agrees to comply with the provisions of I.R.C. 4980B by notifying the Commons of any event that would constitute a qualifying event under said statute as soon as Employee Member becomes aware of said event. The following events are defined as qualifying events which trigger COBRA eligibility for employees and their eligible family members:`}
      </p>
      <ul>
        <li>Death;</li>
        <li>Termination or reduction of hours;</li>
        <li>Divorce or legal separation;</li>
        <li>Medicare entitlement;</li>
        <li>Dependent child changing status; or,</li>
        <li>Bankruptcy of Member.</li>
      </ul>
      <p>
        {`The failure of Employee Member to notify the Commons of the occurrence of any of the aforementioned qualifying events upon becoming aware of them will result in Employee Member becoming liable for any and all costs or penalties that may be incurred by the Commons as the result of failure to offer continuation of coverage as required by COBRA regulations.`}
      </p>
      <h3>WARN Act.</h3>
      <p>
        {`The Commons can assume no liability from Employee Member in the event of an occurrence which triggers the Worker Advice and Retraining Notification (WARN) Act: a) any condition of Employee Member which could fit the definition of financial distress under the WARN Act; b) the filing by Employee Member of any petition for reorganization or bankruptcy; c) the closing by Employee Member of any facility or operation where employees with respect to whom the Commons is providing EOR Services are assigned or for which services are performed by such employees. Employee Member agrees to hold the Commons harmless, indemnify and defend it against all potential liabilities, costs, or penalties that may be incurred by the Commons as the result of such an occurrence.`}
      </p>
      <h3>No Assumption of Prior Liability.</h3>
      <p>
        {`Employee Member warrants that, in the event that any employee with respect to whom the Commons is providing EOR Services has been employed heretofore by Employee Member, all wages and benefits for said employee(s) are current, and that there are no liabilities, known or unknown, including without limitation costs and attorney's fees, which could arise out of any allegation, assertion, or claim that the Commons is a successor employer of Employee Member. Employee Member agrees to hold the Commons harmless, indemnify, and defend it against all claims for wages earned prior to these Terms by any and all employees. Any and all back wages awarded to an employee as a result of such claims will be paid by Employee Member and not the Commons, or if required to be paid by the Commons, Employee Member will reimburse the Commons for all costs expended by the Commons, including but not limited to awards, judgments, and attorney's fees.`}
      </p>
      <h3>Americans With Disabilities Act.</h3>
      <p>
        {`The Commons does not assume the Employee Member's responsibility for compliance or liability for non-compliance with the ADA. Employee Member is responsible for ensuring that facilities where employees are assigned permit access to handicapped individuals and as necessary, provide reasonable accommodations required by the ADA. Employee Member and the Commons acknowledge, understand, and agree that, notwithstanding any other provision of these Terms, access to any property over which Employee Member has ownership, administration, maintenance, or some other control, as well as the accommodation of said property to any person who may be handicapped, disabled, or perceived as being handicapped or disabled, shall be the sole and exclusive responsibility of Employee Member. The parties further agree that any exposure, risk, or liability for said access or accommodation, or failure thereof, whether imposed by the ADA, or some other federal, state, or local statute, law or regulation, shall be the sole responsibility of Employee Member. Employee Member agrees to indemnify, hold harmless, and defend the Commons from any costs, attorneys' fees, or other consequences of any sort arising out of Employee Member's breach of this provision. Any and all damages awarded to an employee, his or her representative, or any other person as a result of a claim related to such access or accommodation, will be paid by Employee Member and not the Commons, or if required to be paid by the Commons, Employee Member will reimburse the Commons for all costs expended by the Commons, including but not limited to awards, judgments, and attorney's fees.`}
      </p>
      <h3>Duty to Mitigate.</h3>
      <p>
        {`If Employee Member becomes aware of, or reasonably should have been aware of, any facts, issues, information, or circumstances which are reasonably likely, whether alone or in combination with any other facts, issues, information, or circumstances, to lead to a Claim against the Commons or Employee Member in connection with these Terms, Employee Member must use reasonable efforts to mitigate any loss that may give rise to such a Claim.`}
      </p>
      <h3>Bankruptcy.</h3>
      <p>
        {`Employee Member will immediately notify the Commons of the initiation of any bankruptcy or receivership or insolvency proceedings of whatever form (whether voluntary or involuntary). Employee Member agrees that any wages or taxes or contributions paid or advanced by the Commons prior to such bankruptcy that remain unpaid by Employee Member shall be treated as outstanding wage obligations for the purposes of determining priority in the associated legal proceedings with the intended effect that the Commons shall have the same rights as covered employees with respect to such wages and associated taxes and shall be entitled to relief as necessary to apply such status.`}
      </p>

      <h2>12. Rights and Duties of the Commons.</h2>
      <h3>Duty to Provide Services.</h3>
      <p>
        {`The Commons agrees to provide the Services subscribed to by each Member in accordance with the Services chosen by Member.`}
      </p>
      <h3>EOR Services.</h3>
      <p>
        {`The Commons will provide the following Services to each Employee Member and employee with respect to whom the Commons is providing EOR Services:`}
      </p>
      <ul>
        <li>
          {`Payment of wages, as reported and paid for by each Employee Member, through the Commons' payroll.`}
        </li>
        <li>
          {`Administration and payment of applicable employer related federal, state and local income tax withholding such as Social Security, federal and state unemployment taxes and disability insurance.`}
        </li>
        <li>
          {`Procurement or provision of, enrollment of employees in, and administration of workers compensation and employee benefit programs, and payment of related costs. Coverage is extended for these benefits subject to applicable state or federal regulations, applicable contracts, plan documents or other governing documents, and the approval of benefit plan providers.`}
        </li>
        <li>
          {`Completion and maintenance of payroll and benefit records, with the exception of employee records of actual hours worked which shall be verified and maintained by Employee Member.`}
        </li>
      </ul>
      <p>
        {`The Commons agrees that it will develop and maintain a set of personnel policies and safety plans required by state regulations. Each Employee Member will assist the Commons in implementing these policies and procedures.`}
      </p>
      <p>
        {`The Commons reserves the right to hire on our payroll, determine compensation and benefits, assign, discipline, and terminate the employment of employees with respect to whom the Commons is providing EOR Services, with reasonable notice to Employee Member.`}
      </p>
      <h3>Duty to Hold Harmless.</h3>
      <p>
        {`Each Member agrees to release, indemnify and hold the Commons harmless from any claims, liabilities, damages, losses, or expenses arising from wrongful or negligent acts of the Member or failure of the Member to act in accordance with the terms of this agreement during the term of the Terms.`}
      </p>

      <h2>13. Intellectual Property.</h2>
      <p>
        {`Trademarks, service marks, logos, emblems, slogans, designs and copyrighted works appearing on the Platform and Site are the property of the Commons or the third parties that provided them to us. The Employment Commons and those third parties retain all rights associated with any of the respective trademarks, service marks, logos, emblems, slogans, designs and copyrighted works appearing on the Platform and the Site. All copyright or other proprietary notices that appear in connection with the Services, including on the Platform or the Site, or the materials downloaded or printed from the Platform or the Site will appear on any copy of the document or portion that you make.`}
      </p>
      <p>
        {`All content, web pages, source code, calculations, products, materials, data, information, text, screens, photos, video, music and sound, functionality, services, design, layout, screen interfaces, "look and feel", design, functionality, and the operation of the Platform and the Site (collectively "Content") are the proprietary information of the Commons or the party that provided or licensed the Content to the Commons, and are protected by various intellectual property laws, including, but not limited to, copyrights, patents, trade secrets, trademarks, and service marks. All rights associated with the Content are owned by the Commons, our licensors, or our content providers. Except as otherwise expressly permitted under copyright law, no copying, redistribution, retransmission, publication or commercial or non-commercial exploitation of Content will be permitted without our express, authorized written permission and/or the express, authorized written permission of the copyright owner.`}
      </p>
      <p>
        {`The availability of any Content through the Platform shall under no circumstances constitute a transfer of any copyrights, trademarks, or other intellectual property rights. You do not acquire any license or ownership rights by downloading or viewing any Content or by any other means. You will not in any way copy, reproduce, publish, create derivative works from, perform, upload, post, distribute, transfer, transmit, modify, adapt, reverse engineer, frame in any Web page, or alter the appearance of any Content. All submissions to us containing any comments, improvements, suggestions, and ideas regarding the Platform and the Site will become and remain our exclusive property, including any rights or future rights associated with such submissions, even if the provisions of these Terms are later modified or terminated. This means that you forever disclaim any proprietary rights or any other rights or claims in such submissions. You acknowledge and agree that we have the unrestricted, unencumbered right to use, publish, and commercially exploit, identical, similar, or derivative ideas originating from your submission, in any medium, now and in the future, without notice, compensation or other obligation to you or any other person. Notwithstanding the foregoing, you remain solely responsible for the content of your submissions, and you acknowledge and agree that neither the Commons nor any third party affiliate of the Commons will assume any liability related to any action or inaction by the Commons or such third party with respect to your submissions.`}
      </p>
      <p>
        {`All testimonials submitted to us will also become and remain our exclusive property, even if the provisions of these Terms are later modified or terminated. This means that you irrevocably grant to us the unrestricted right (now and in the future, without notice, compensation or other obligation to you or any other person) to use your statement, image, likeness, as they may be used, in any medium, in connection with an advertisement or for any other publicity purpose. You further agree that we may use any percentage or part of your testimonial, image, likeness and/or works, in any way that we see fit, and may exclude your name or use a fictional name or other identifier at our sole discretion.`}
      </p>

      <h2>14. Warranty Disclaimer.</h2>
      <p>
        <strong>
          {`THE COMMONS DOES NOT MAKE ANY WARRANTIES OR PROMISES ABOUT THE SITE OR SITE CONTENT. FOR EXAMPLE, INFORMATION ON THE PLATFORM MAY NOT BE CURRENT, OR COMPLETE WHEN YOU VISIT THE PLATFORM AND IT MAY CONTAIN ERRORS AND INACCURACIES. ADDITIONALLY, WE DO NOT MAKE ANY COMMITMENTS TO THE PLATFORM'S FUNCTIONALITY, AVAILABILITY, RELIABILITY OR ABILITY TO MEET MEMBER'S NEEDS. THE EMPLOYMENT COMMONS PROVIDES THE PLATFORM, THE SITE AND THE SERVICES "AS IS" AND FOR MEMBER'S USE AT ITS OWN RISK.`}
        </strong>
      </p>
      <p>
        <strong>
          {`SOME JURISDICTIONS PROVIDE CERTAIN WARRANTIES, SUCH AS NON INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE. TO THE EXTENT PERMITTED BY LAW, THE COMMONS DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS IMPLIED, OR STATUTORY, INCLUDING ALL THE WARRANTIES LISTED ABOVE, AND ANY WARRANTIES OF TITLE, ACCURACY, AND QUIET ENJOYMENT.`}
        </strong>
      </p>

      <h2>15. Indemnification.</h2>
      <p>
        {`In addition to any other such indemnification provisions provided herein, Member agrees to indemnify and hold the Commons, its parents, subsidiaries, affiliates, officers, employees, agents, partners, sub-contractors and licensors (collectively, the "Commons Parties") harmless from any losses, costs, liabilities and expenses (including reasonable attorneys' fees) (collectively, the "Claims") relating to, arising out of or in any way connected to: (i) Member's access to or use of the Platform or the Services; (ii) Member's violation or alleged violation of this Agreement; (iii) Member's violation or alleged violation of any third party right, including without limitation any right of privacy or publicity, or any right provided by any labor or employment law, rule, or regulation, or any intellectual property right; (iv) Member's violation or alleged violation of any applicable law, rule, or regulation, including but not limited to wage and hour laws; (v) Member's violation of the NACHA Rules; (vi) Member's gross negligence, fraudulent activity, or willful misconduct; (vii) the Commons or any other Commons Parties' use of or reliance on information or data furnished by Member, an employee or independent contractor of Member, User, an Account Administrator, or Authorized Representative in providing the Services, or otherwise in connection with these Terms; (viii) actions or activities that the Commons or any other Commons Parties undertakes in connection with the Services or these Terms at the direct request or instruction of anyone that the Commons or any other Commons reasonably believes to be Member, User, an Account Administrator, or an Authorized Representative (each such action or activity, a "Requested Action"); (ix) the Commons or any other Commons Parties' use of or reliance on information or data resulting from such Requested Actions; or (x) Member's failure, or the failure of any User, Account Administrators or Authorized Representatives, to properly follow the Commons' instructions with respect to the Services.`}
      </p>
      <p>
        {`The Commons reserves the right, at its own cost, to assume the exclusive defense and control of any matter requiring indemnification hereunder, in which event Member, and any User, Account Administrators or Authorized Representatives will fully cooperate with the Commons in asserting any available defenses. Member agrees that the provisions in this section will survive Member's access or use of the Platform and the Services.`}
      </p>

      <h2>16. Limitation of Liability.</h2>
      <p>
        <strong>
          {`MEMBER UNDERSTANDS AND AGREES THAT EXCEPT WHERE PROHIBITED IN NO EVENT WILL THE COMMONS PARTIES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE PLATFORM, THE SITE OR SERVICES, INCLUDING, WITHOUT LIMITATION, ANY DAMAGES RESULTING FROM LOSS OF USE, DATA, OR PROFITS, WHETHER OR NOT THE COMMONS PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, ON ANY THEORY OF LIABILITY. THE COMMONS PARTIES' TOTAL CUMULATIVE LIABILITY IN CONNECTION WITH THESE TERMS, THE PLATFORM, OR THE SERVICES, WHETHER IN CONTRACT, TORT, OR OTHERWISE, WILL NOT EXCEED ONE HUNDRED (US$100).`}
        </strong>
      </p>
      <p>
        {`Each Member releases the Commons from all liability related to any losses, damages, or claims arising from: (a) user error such as forgotten passwords, incorrectly constructed transactions, or mistyped virtual currency addresses; (b) server failure or data loss; (c) unauthorized access to the $WORK application; (d) bugs or other errors in the $WORK software; and (e) any unauthorized third party activities, including, but not limited to, the use of viruses, phishing, brute forcing, or other means of attack against your account or individual wallet.`}
      </p>

      <h2>17. Miscellaneous.</h2>
      <h3>Amendments.</h3>
      <p>
        {`We may change these Terms from time to time for any reason and such changes are effective when they are posted on the Platform. If we make any changes, we will change the Last Updated date (found above).`}
      </p>
      <h3>Security.</h3>
      <p>
        {`Member data transmitted to and from the Platform and the Site is encrypted for the Member's protection. However, the security of information transmitted through the Internet can never be guaranteed. The Commons is not responsible for any interception or interruption of any communications through the Internet or for changes to or losses of data. Member is responsible for maintaining the security of any password, user ID, or other form of authentication involved in obtaining access to password protected or secure areas of the Platform or Site. In order to protect you and your data, the Commons may suspend your use of the Platform, without notice, pending an investigation, if any breach of security is suspected.`}
      </p>
      <h3>Governing Law.</h3>
      <p>
        {`These Terms and any related action will be governed and interpreted by and under the laws of the State of Colorado, without regard to conflicts of laws principles or rules.`}
      </p>
      <h3>DISPUTE RESOLUTION, ARBITRATION, AND CLASS ACTION WAIVER.</h3>
      <h4>Agreement to Arbitration.</h4>
      <p>
        <strong>
          {`BY AGREEING TO THESE TERMS, MEMBER AGREES TO RESOLVE DISPUTES WITH THE COMMONS THROUGH BINDING ARBITRATION (AND WITH VERY FEW LIMITED EXCEPTIONS, NOT IN COURT), AND MEMBER WAIVES CERTAIN RIGHTS TO PARTICIPATE IN CLASS ACTIONS (AS DETAILED IN THE DISPUTE RESOLUTION, ARBITRATION AND CLASS ACTION WAIVER BELOW).`}
        </strong>
      </p>
      <h4>Statute of Limitations.</h4>
      <p>
        {`Member agrees that regardless of any statute or law to the contrary, any claim arising out of or related to the Platform or the Services, whether brought in arbitration or before a court of law, must commence within one (1) year after the cause of action accrues. Otherwise, such cause of action is permanently barred.`}
      </p>
      <h4>Legal Disputes Not Subject to Arbitration.</h4>
      <p>
        {`The Commons is based in the State of Colorado, so for any actions not subject to arbitration, Member and the Commons agree to submit to the personal jurisdiction of a state court located in Denver, Colorado. These Terms and the relationship between Member and the Commons shall be governed in all respects by the laws of the State of Colorado, without regard to its conflict of law provisions.`}
      </p>
      <p>
        {`We encourage Members to contact us in the event of any issues, as most issues can be resolved without the involvement of a court or arbitrator. If negotiations do not resolve any disputes relating to Member's use of the Services or these Terms, Member and the Commons agree to submit the dispute to arbitration. The only exceptions to arbitration are (1) for intellectual property claims alleging misuse, Infringement, or misappropriation of intellectual property; (2) for claims falling within the jurisdiction of small claims court; and (3) where a Member has opted out of arbitration in accordance with these Terms.`}
      </p>
      <p>
        {`This arbitration may be administered by JAMS under the JAMS Streamlined Arbitration Rules & Procedures. Judgment on the arbitration award may be entered in any court with jurisdiction. Arbitrations may only take place on an individual basis. No class arbitrations or other groupings of parties is allowed. By agreeing to these Terms, Member is waiving its right to trial by jury or to participate in a class action or representative proceeding; the Commons is also waiving these rights. If this prohibition of class arbitrations or other grouping of parties is deemed unenforceable, then this entire "Dispute Resolution, Arbitration, and Class Action Waiver" shall be deemed void and severed from the Terms. We follow the JAMS Policy on Consumer Arbitrations Pursuant to Pre-Dispute Clauses Minimum Standards of Procedural Fairness for all arbitrations done under these terms. Among other things, this means that if Member initiates arbitration against us, Member will be required to pay a $250 filing fee, and the Commons will pay for the other fees, including arbitrator fees. Member is responsible for its own attorneys' fees unless the arbitration rules and/or applicable law provide otherwise. It also means that the arbitration will be held in the county in which Member lives, or any other location we agree upon. If Member does not live in the United States, however, you agree to initiate arbitration in Denver, Colorado. If any portion of these terms does not follow that standard, that portion is severed from these Terms. To file an arbitration, Member must submit a Demand for Arbitration and filing fees to the appropriate court.`}
      </p>
      <p>
        {`Member can opt-out of the arbitration and class action waiver provisions set forth above by sending an email (from your registered email address on the Platform) letting us know that Member is opting out by contacting us with the subject line, "ARBITRATION AND CLASS ACTION WAIVER OPT-OUT" within thirty (30) days of Member's first use of the Services, or the Effective Date of the first Terms containing an arbitration and class action waiver provision, whichever is later. Otherwise, Member agrees to arbitrate. If Member opts out of the arbitration and class action waiver provisions set forth above, we will not be subject to them either with respect to any disputes with Member.`}
      </p>
      <p>
        {`The Commons will provide thirty (30) days' notice of any changes to this section by updating these Terms, sending Member a message, or otherwise notifying Member when it is logged into Member's account. Amendments will become effective thirty (30) days after they are posted the Platform or sent to Member. Changes to this section will otherwise apply prospectively only to claims arising after the thirtieth (30th) day. If a court or arbitrator decides that this paragraph is not enforceable or valid, then this subsection shall be severed from the section entitled "Dispute Resolution, Arbitration, and Class Action Waiver," and the court or arbitrator shall apply the first Arbitration and Class Action Waiver section in existence after you began using the Services.`}
      </p>
      <p>
        {`This "Dispute Resolution, Arbitration, and Class Action Waiver" section shall survive any termination of your account, these Terms, or the Services.`}
      </p>
      <h3>Waiver.</h3>
      <p>
        {`Any waiver or failure to enforce any provision of these Terms on one occasion will not be deemed a waiver of any other provision or of such provision on any other occasion. If any particular provision of these Terms is held invalid or unenforceable, that provision will be modified to reflect the original intention of the parties, and the other provisions will remain in full force and effect.`}
      </p>
      <h3>Force Majeure.</h3>
      <p>
        {`The Commons will not be liable for any losses caused directly or indirectly as a result of causes or events beyond the control of the Commons, including natural disasters, acts of God, war, terrorism actions or decrees of governmental bodies, exchange or market rulings, failure of the Internet, communication lines or utility systems, equipment and systems failures, unauthorized access, and theft (each, a "Force Majeure Event"). All of the obligations of the Commons with respect to the effected elements under these Terms will be suspended for the duration of such Force Majeure Event.`}
      </p>
      <h3>Contact.</h3>
      <p>
        If a Member has any questions about these Terms, the Platform, or the Services, such Member may contact the
        Commons at:{" "}
        <a href="mailto:support@opolis.co">support@opolis.co</a>.
      </p>

      <p>
        <strong>© 2024 OPOLIS INC.</strong>
      </p>

      <hr className="legal-tos-divider" />

      <p className="legal-tos-source-note">[From Employee Member Membership Agreement]</p>
      <h2>COOPERATIVE COVENANTS.</h2>
      <p>
        {`The Cooperative provides employer of record and other services, which may change from time to time, to Employee Members ("Services"), as defined in the Bylaws. The Cooperative provides the Services pursuant to the Cooperative's Terms, as may be amended from time to time. The Cooperative will become the Member's "employer of record" and will assume certain compliance duties for eligible and accepted employees who provide services for the Employee Member, such as payroll and payroll tax compliance, benefits administration, workers' compensation, processing unemployment claims, and other HR-related administrative tasks as available. Neither the execution of this Agreement, nor the participation by the Member in the activities of or opportunities offered by the Cooperative shall be deemed to create an employee-employer relationship between the Member and the Cooperative. Members are not employees of the Cooperative and are not entitled to protections or benefits available to employees under federal or state law, including but not limited to the Fair Labor Standards Act, the National Labor Relations Act, or state unemployment, workers compensation, wage and hour, or benefits laws. The Member's execution of this Agreement constitutes acknowledgment and acceptance of this disclosure.`}
      </p>
    </article>
  );
}

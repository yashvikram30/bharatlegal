/**
 * BharatLegal Statutory Document Drafting Engines & Templates
 * Grounded in Indian Law: Model Tenancy Act 2021, Negotiable Instruments Act 1881,
 * Consumer Protection Act 2019, and Right to Information Act 2005.
 */

export interface TemplateField {
  id: string;
  label: string;
  placeholder?: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  defaultValue?: string | number;
  options?: { label: string; value: string }[];
  helperText?: string;
  section: "parties" | "details" | "financials" | "terms";
}

export interface DocumentTemplate {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  statutoryBasis: string;
  description: string;
  estMinutes: number;
  badge: string;
  fields: TemplateField[];
  sampleData: Record<string, any>;
}

export const DRAFT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "residential-rent-agreement",
    title: "Residential Rental Agreement (Deed of Lease)",
    shortTitle: "Rent Agreement",
    category: "Real Estate & Tenancy",
    statutoryBasis: "Model Tenancy Act, 2021 & Indian Contract Act, 1872",
    description:
      "Statutory lease deed with mandatory 24-hr inspection notice, 2-month security deposit cap, structural repair division, and eviction safeguards.",
    estMinutes: 4,
    badge: "Model Tenancy Act Compliant",
    sampleData: {
      landlordName: "Rajesh Kumar Sharma",
      landlordFather: "Late Sh. Om Prakash Sharma",
      landlordAddress: "Flat 402, Royal Palms, Indiranagar, Bengaluru, Karnataka 560038",
      landlordPan: "ABCPS1234F",
      tenantName: "Priya Sundaram",
      tenantFather: "Sh. K. Sundaram",
      tenantAddress: "Permanent: 12B, Temple Street, Mylapore, Chennai, Tamil Nadu 600004",
      tenantPan: "XYZPS5678G",
      propertyAddress: "Apartment No. 301, 3rd Floor, Greenview Residency, 8th Main, Koramangala 4th Block, Bengaluru, Karnataka 560034",
      monthlyRent: "32000",
      securityDeposit: "64000",
      leaseDurationMonths: "11",
      commencementDate: new Date().toISOString().split("T")[0],
      rentDueDate: "5",
      noticePeriodMonths: "1",
      paymentMode: "NEFT / UPI Bank Transfer",
    },
    fields: [
      {
        id: "landlordName",
        label: "Landlord (Lessor) Full Name",
        placeholder: "e.g. Rajesh Kumar Sharma",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "landlordFather",
        label: "Landlord Father's / Spouse's Name",
        placeholder: "e.g. Late Sh. Om Prakash Sharma",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "landlordAddress",
        label: "Landlord Permanent Residential Address",
        placeholder: "Full address with PIN code",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "landlordPan",
        label: "Landlord PAN / Aadhaar (Optional)",
        placeholder: "e.g. ABCDE1234F",
        type: "text",
        section: "parties",
      },
      {
        id: "tenantName",
        label: "Tenant (Lessee) Full Name",
        placeholder: "e.g. Priya Sundaram",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "tenantFather",
        label: "Tenant Father's / Spouse's Name",
        placeholder: "e.g. Sh. K. Sundaram",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "tenantAddress",
        label: "Tenant Permanent Address",
        placeholder: "Permanent hometown address with PIN",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "propertyAddress",
        label: "Leased Premises Full Description & Address",
        placeholder: "Flat No., Building Name, Street, Locality, City, State, PIN",
        type: "textarea",
        required: true,
        section: "details",
      },
      {
        id: "monthlyRent",
        label: "Monthly Rent Amount (₹)",
        placeholder: "e.g. 25000",
        type: "number",
        required: true,
        section: "financials",
      },
      {
        id: "securityDeposit",
        label: "Interest-Free Refundable Security Deposit (₹)",
        placeholder: "e.g. 50000",
        type: "number",
        required: true,
        helperText: "Under Section 11 Model Tenancy Act, residential deposit is capped at a maximum of 2 months' rent.",
        section: "financials",
      },
      {
        id: "leaseDurationMonths",
        label: "Lease Duration (Months)",
        placeholder: "11",
        type: "select",
        required: true,
        defaultValue: "11",
        options: [
          { label: "11 Months (Standard Non-Registration Term)", value: "11" },
          { label: "12 Months", value: "12" },
          { label: "24 Months", value: "24" },
          { label: "36 Months", value: "36" },
        ],
        section: "terms",
      },
      {
        id: "commencementDate",
        label: "Lease Commencement Date",
        type: "date",
        required: true,
        section: "terms",
      },
      {
        id: "rentDueDate",
        label: "Monthly Rent Due Day",
        placeholder: "e.g. 5 (5th of every English calendar month)",
        type: "number",
        required: true,
        defaultValue: 5,
        section: "financials",
      },
      {
        id: "noticePeriodMonths",
        label: "Termination Notice Period (Months)",
        placeholder: "1",
        type: "select",
        required: true,
        defaultValue: "1",
        options: [
          { label: "1 Month Notice", value: "1" },
          { label: "2 Months Notice", value: "2" },
          { label: "3 Months Notice", value: "3" },
        ],
        section: "terms",
      },
    ],
  },
  {
    id: "cheque-bounce-notice",
    title: "Legal Notice for Dishonour of Cheque (Sec 138 NI Act)",
    shortTitle: "Section 138 Cheque Notice",
    category: "Banking & Commercial Litigation",
    statutoryBasis: "Section 138 & 142 of Negotiable Instruments Act, 1881",
    description:
      "Mandatory statutory demand notice with the exact 15-day cure period, return memo recitation, and criminal prosecution warning.",
    estMinutes: 3,
    badge: "Section 138 NI Act Mandatory",
    sampleData: {
      payeeName: "M/s Apex Infotech Solutions LLP",
      payeeAddress: "4th Floor, Tech Hub, Sector 62, Noida, Uttar Pradesh 201301",
      payeeRep: "Arun Mehra (Designated Partner)",
      drawerName: "Vikas Malhotra, Director of Zenith Media Works Pvt. Ltd.",
      drawerAddress: "B-14, Okhla Industrial Area Phase-I, New Delhi 110020",
      chequeNumber: "048291",
      chequeDate: "2024-06-15",
      chequeAmount: "450000",
      draweeBank: "HDFC Bank Ltd., Okhla Branch, New Delhi",
      returnMemoDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      returnReason: "Funds Insufficient",
      transactionContext:
        "Supply of enterprise IT infrastructure hardware and cloud integration services vide Tax Invoice No. AIS/2024/089 dated 10th May 2024.",
    },
    fields: [
      {
        id: "payeeName",
        label: "Complainant / Payee Name (You)",
        placeholder: "Your full individual name or company / firm name",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "payeeRep",
        label: "Authorised Representative / Title (if entity)",
        placeholder: "e.g. Arun Mehra (Designated Partner) or Self",
        type: "text",
        section: "parties",
      },
      {
        id: "payeeAddress",
        label: "Payee Full Communication Address",
        placeholder: "Full address with PIN code",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "drawerName",
        label: "Defaulting Drawer Name (Who issued the bounced cheque)",
        placeholder: "Full name and designation / company",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "drawerAddress",
        label: "Defaulting Drawer Full Address",
        placeholder: "Official / residential address where legal notice will be served",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "chequeNumber",
        label: "Cheque Number",
        placeholder: "e.g. 048291",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "chequeDate",
        label: "Date on Cheque",
        type: "date",
        required: true,
        section: "details",
      },
      {
        id: "chequeAmount",
        label: "Cheque Amount (₹)",
        placeholder: "e.g. 450000",
        type: "number",
        required: true,
        section: "financials",
      },
      {
        id: "draweeBank",
        label: "Drawee Bank & Branch (Bank on which cheque is drawn)",
        placeholder: "e.g. HDFC Bank Ltd., Connaught Place Branch",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "returnMemoDate",
        label: "Bank Return Memo Date",
        type: "date",
        required: true,
        helperText: "Notice must be dispatched within 30 days of receiving this bank return memo.",
        section: "details",
      },
      {
        id: "returnReason",
        label: "Bank Return Reason",
        placeholder: "Funds Insufficient",
        type: "select",
        required: true,
        defaultValue: "Funds Insufficient",
        options: [
          { label: "Funds Insufficient", value: "Funds Insufficient" },
          { label: "Exceeds Arrangement", value: "Exceeds Arrangement" },
          { label: "Account Closed", value: "Account Closed" },
          { label: "Payment Stopped by Drawer", value: "Payment Stopped by Drawer" },
          { label: "Refer to Drawer", value: "Refer to Drawer" },
        ],
        section: "details",
      },
      {
        id: "transactionContext",
        label: "Underlying Lawful Debt / Consideration",
        placeholder: "Describe the invoice, loan, agreement, or goods/services for which this cheque was issued",
        type: "textarea",
        required: true,
        section: "terms",
      },
    ],
  },
  {
    id: "consumer-grievance-notice",
    title: "Consumer Grievance Legal Notice (CPA 2019)",
    shortTitle: "Consumer Notice",
    category: "Consumer Redressal",
    statutoryBasis: "Section 35 & 2(11) of Consumer Protection Act, 2019",
    description:
      "Formal legal notice before filing on e-Daakhil for defective goods, deficiency in service, or unfair trade practices.",
    estMinutes: 3,
    badge: "Consumer Protection Act 2019",
    sampleData: {
      consumerName: "Ananya Deshmukh",
      consumerAddress: "B-604, Godrej Woods, Wakad, Pune, Maharashtra 411057",
      consumerPhone: "+91 98765 43210",
      companyName: "Zenith Retail E-Commerce Pvt. Ltd. & CoolAir Appliances India Ltd.",
      companyAddress: "Registered Office: Plot 18, Udyog Vihar Phase IV, Gurugram, Haryana 122015",
      productService: "CoolAir Inverter Split AC 1.5 Ton (Model: CA-15S-INV)",
      orderNumber: "ORD-2024-884912",
      purchaseDate: "2024-05-10",
      amountPaid: "42999",
      deficiencyDescription:
        "The appliance delivered was completely non-functional upon installation by authorized technicians due to compressor gas leakage. Despite logging 6 support tickets and 3 technician visits acknowledging dead-on-arrival status, the company refused replacement or full refund, causing extreme hardship during peak summer.",
      reliefDemanded:
        "Immediate full refund of ₹42,999 along with 18% interest per annum, plus ₹25,000 as compensation for mental harassment and ₹10,000 towards legal notice expenses.",
    },
    fields: [
      {
        id: "consumerName",
        label: "Consumer Full Name",
        placeholder: "e.g. Ananya Deshmukh",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "consumerAddress",
        label: "Consumer Address",
        placeholder: "Full address with PIN",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "consumerPhone",
        label: "Consumer Contact Number / Email",
        placeholder: "e.g. +91 98765 43210 / email@example.com",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "companyName",
        label: "Opposite Party (Seller / Manufacturer / Service Provider)",
        placeholder: "e.g. XYZ E-Commerce Pvt. Ltd.",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "companyAddress",
        label: "Opposite Party Registered Office Address",
        placeholder: "Registered corporate address with PIN",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "productService",
        label: "Product / Service Name & Specification",
        placeholder: "e.g. Smartphone 128GB / Flight Booking / Warranty Service",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "orderNumber",
        label: "Invoice / Order / Policy / PNR Number",
        placeholder: "e.g. INV-2024-00123",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "purchaseDate",
        label: "Date of Purchase / Transaction",
        type: "date",
        required: true,
        section: "details",
      },
      {
        id: "amountPaid",
        label: "Total Consideration Paid (₹)",
        placeholder: "e.g. 42999",
        type: "number",
        required: true,
        section: "financials",
      },
      {
        id: "deficiencyDescription",
        label: "Defect in Goods / Deficiency in Service (Facts)",
        placeholder: "Detail the breakdown, defects, communication failure, or unfair trade practice",
        type: "textarea",
        required: true,
        section: "terms",
      },
      {
        id: "reliefDemanded",
        label: "Relief Demanded (Refund, Replacement & Damages)",
        placeholder: "Specify exact refund, interest, and compensation sought within 15 days",
        type: "textarea",
        required: true,
        section: "terms",
      },
    ],
  },
  {
    id: "rti-application",
    title: "Application under Right to Information Act, 2005",
    shortTitle: "RTI Application",
    category: "Civic Governance & Transparency",
    statutoryBasis: "Section 6(1) of Right to Information Act, 2005",
    description:
      "Statutory RTI request format addressed to Public Information Officers with numbered information queries and fee particulars.",
    estMinutes: 3,
    badge: "Section 6(1) RTI Act Compliant",
    sampleData: {
      applicantName: "Rohan Varma",
      applicantAddress: "House No. 45, Sector 15, Chandigarh 160015",
      applicantPhone: "+91 98123 45678",
      applicantEmail: "rohan.varma@example.com",
      publicAuthority: "Municipal Corporation of Chandigarh",
      pioDesignation: "The Central Public Information Officer (CPIO), Office of Chief Engineer",
      informationQueries:
        "1. Please provide certified copies of the sanctioned budget, tender notices, and work completion certificates for the road resurfacing project carried out in Sector 15 during FY 2023-24.\n2. Please provide the name of the contractor to whom the work was awarded along with the quoted and finalized contract value.\n3. Please provide certified copies of the road quality inspection reports conducted by municipal engineers prior to disbursing payment.",
      feeParticulars: "Indian Postal Order (IPO) No. 42G 987654 for ₹10/- enclosed herewith as prescribed statutory fee.",
      isBpl: "No",
    },
    fields: [
      {
        id: "applicantName",
        label: "Applicant Full Name",
        placeholder: "e.g. Rohan Varma",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "applicantAddress",
        label: "Applicant Complete Postal Address",
        placeholder: "Address where certified copies/reply will be posted",
        type: "textarea",
        required: true,
        section: "parties",
      },
      {
        id: "applicantPhone",
        label: "Applicant Phone & Email",
        placeholder: "+91 XXXXX XXXXX / email@domain.com",
        type: "text",
        required: true,
        section: "parties",
      },
      {
        id: "publicAuthority",
        label: "Name of the Public Authority / Ministry / Department",
        placeholder: "e.g. National Highways Authority of India (NHAI) / Delhi Development Authority",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "pioDesignation",
        label: "Public Information Officer (PIO / CPIO) Designation & Office",
        placeholder: "The Public Information Officer, [Department Name], [City]",
        type: "text",
        required: true,
        section: "details",
      },
      {
        id: "informationQueries",
        label: "Particulars of Information Sought (Numbered Questions)",
        placeholder: "1. Please provide certified copies of...\n2. What is the status of...",
        type: "textarea",
        required: true,
        section: "terms",
      },
      {
        id: "feeParticulars",
        label: "Application Fee Particulars (₹10 Statutory Fee)",
        placeholder: "IPO / Demand Draft / Online Payment Transaction ID",
        type: "text",
        required: true,
        defaultValue: "Indian Postal Order (IPO) for ₹10/- enclosed herewith as prescribed application fee.",
        section: "financials",
      },
      {
        id: "isBpl",
        label: "Whether Applicant Belongs to BPL (Below Poverty Line)?",
        type: "select",
        required: true,
        defaultValue: "No",
        options: [
          { label: "No (Enclosing standard ₹10 fee)", value: "No" },
          { label: "Yes (Exempt from fee under Section 7(5); BPL card proof attached)", value: "Yes" },
        ],
        section: "financials",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// DETERMINISTIC STATUTORY GENERATORS (Zero-Token Offline Guarantee)
// ---------------------------------------------------------------------------

export function generateDeterministicDraft(templateId: string, data: Record<string, any>): string {
  switch (templateId) {
    case "residential-rent-agreement":
      return generateRentAgreement(data);
    case "cheque-bounce-notice":
      return generateChequeNotice(data);
    case "consumer-grievance-notice":
      return generateConsumerNotice(data);
    case "rti-application":
      return generateRtiApplication(data);
    default:
      throw new Error(`Unknown template ID: ${templateId}`);
  }
}

function generateRentAgreement(d: Record<string, any>): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `RESIDENTIAL RENTAL AGREEMENT
(IN ACCORDANCE WITH THE MODEL TENANCY ACT, 2021 & INDIAN CONTRACT ACT, 1872)

THIS RESIDENTIAL RENTAL LEASE AGREEMENT (hereinafter referred to as the "Agreement") is made and executed on this ${currentDate}, at [City, State], by and between:

LESSOR / LANDLORD:
${d.landlordName || "[Landlord Name]"}, son/daughter/spouse of ${d.landlordFather || "[Father/Spouse Name]"}, residing at:
${d.landlordAddress || "[Permanent Address]"}
(PAN / Identification: ${d.landlordPan || "As on record"})
(hereinafter called the "LESSOR", which expression shall, unless repugnant to the context, include their heirs, legal representatives, and assigns) of the FIRST PART;

AND

LESSEE / TENANT:
${d.tenantName || "[Tenant Name]"}, son/daughter/spouse of ${d.tenantFather || "[Father/Spouse Name]"}, having permanent residence at:
${d.tenantAddress || "[Tenant Permanent Address]"}
(PAN / Identification: ${d.tenantPan || "As on record"})
(hereinafter called the "LESSEE", which expression shall, unless repugnant to the context, include their heirs, successors, and permitted assigns) of the SECOND PART.

WHEREAS the Lessor is the absolute lawful owner and in legal possession of the residential property situated at:
"${d.propertyAddress || "[Full Property Address]"}" (hereinafter referred to as the "SCHEDULE PREMISES").

AND WHEREAS the Lessee has approached the Lessor to take on rent the Schedule Premises for residential dwelling purposes only, and the Lessor has agreed to let out the same on the terms and covenants set out herein.

NOW THIS AGREEMENT WITNESSETH AND THE PARTIES MUTUALLY AGREE AS FOLLOWS:

1. TENURE OF LEASE
The tenancy shall commence on ${d.commencementDate || "[Start Date]"} and shall remain in full force for a period of ${d.leaseDurationMonths || "11"} months, expiring on the completion of the said term, subject to earlier termination or mutual renewal upon revised terms in writing.

2. MONTHLY RENT & DUE DATE
(a) The Lessee shall pay to the Lessor a monthly rent of ₹${Number(d.monthlyRent || 0).toLocaleString("en-IN")}/- (Rupees [in words] only), exclusive of electricity, water, and society maintenance charges.
(b) The monthly rent shall be payable on or before the ${d.rentDueDate || "5"}th day of each calendar month via ${d.paymentMode || "Bank Transfer / Electronic Mode"}.

3. INTEREST-FREE REFUNDABLE SECURITY DEPOSIT
(a) Pursuant to Section 11 of the Model Tenancy Act, 2021, the Lessee has deposited an interest-free refundable security deposit of ₹${Number(d.securityDeposit || 0).toLocaleString("en-IN")}/- with the Lessor upon execution of this deed.
(b) Pursuant to Section 13 of the Model Tenancy Act, 2021, the said security deposit shall be refunded in full to the Lessee on the date of vacating and handing over peaceful vacant physical possession of the Schedule Premises, subject only to deductions for genuine unpaid rent, utilities, or tenant-attributable physical damages, which must be supported by an itemized written statement.

4. LANDLORD'S RIGHT OF ENTRY (SECTION 15 COMPLIANCE)
Pursuant to Section 15 of the Model Tenancy Act, 2021, the Lessor or their designated agent shall not enter the Schedule Premises without giving at least 24 (twenty-four) hours prior written notice (or electronic message) to the Lessee. Any inspection, repair, or entry shall strictly take place between 9:00 AM and 6:00 PM.

5. ESSENTIAL SERVICES & REPAIRS
(a) The Lessor shall not withhold, cut off, or sever any essential supply or service (including water, electricity, sanitary, elevator, or common amenities) enjoyed by the Lessee, in strict compliance with Section 20 of the Model Tenancy Act.
(b) Structural maintenance, whitewashing, and exterior plumbing shall be the responsibility of the Lessor. Day-to-day minor maintenance and electrical bulb/tap replacements shall be borne by the Lessee.

6. RESTRICTION ON ARBITRARY EVICTION (SECTION 21)
The Lessor shall not evict the Lessee during the subsistence of this lease agreement without an order of the competent Rent Court/Authority under Section 21 of the Model Tenancy Act, 2021.

7. TERMINATION & NOTICE PERIOD
Either party may terminate this tenancy by serving ${d.noticePeriodMonths || "1"} (one) month's advance written notice to the other party. Upon expiration of the notice period, the Lessee shall peacefully hand over possession and the Lessor shall settle the security deposit as stipulated in Clause 3.

8. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by and construed in accordance with the Model Tenancy Act / Rent Control laws applicable in the state of the property's jurisdiction and the Indian Contract Act, 1872.

IN WITNESS WHEREOF, the Lessor and the Lessee have affixed their signatures to this Agreement on the day, month, and year first above written in the presence of the following witnesses.


_______________________________               _______________________________
LESSOR / LANDLORD                             LESSEE / TENANT
(${d.landlordName || "Landlord"})              (${d.tenantName || "Tenant"})


WITNESSES:

1. Signature: _______________________          2. Signature: _______________________
   Name:                                          Name:
   Address:                                       Address:
   Phone/ID:                                      Phone/ID:
`;
}

function generateChequeNotice(d: Record<string, any>): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `REGISTERED A.D. / SPEED POST / LEGAL NOTICE
DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Date: ${currentDate}

TO:
${d.drawerName || "[Drawer Name / Company]"}
${d.drawerAddress || "[Drawer Address]"}

FROM / UNDER INSTRUCTIONS OF:
${d.payeeName || "[Payee Name]"}
${d.payeeRep ? `Represented by: ${d.payeeRep}\n` : ""}${d.payeeAddress || "[Payee Address]"}

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 READ WITH SECTION 142 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 (AS AMENDED UP TO DATE) FOR DISHONOUR OF CHEQUE NO. ${d.chequeNumber || "[Number]"} FOR AN AMOUNT OF ₹${Number(d.chequeAmount || 0).toLocaleString("en-IN")}/-.

Sir / Madam,

Under instructions from and on behalf of our client, ${d.payeeName || "[Client Name]"}, we hereby serve upon you this Statutory Legal Demand Notice:

1. That you, the Noticee, in discharge of your legally enforceable debt and lawful consideration towards our client regarding:
"${d.transactionContext || "[Underlying Debt / Transaction Context]"}",
issued and handed over Cheque No. ${d.chequeNumber || "[Cheque No]"} dated ${d.chequeDate || "[Date]"} drawn on ${d.draweeBank || "[Bank & Branch]"} for the sum of ₹${Number(d.chequeAmount || 0).toLocaleString("en-IN")}/- (Rupees [in words] only) in favour of our client.

2. That at the time of issuing the aforesaid cheque, you expressly assured and represented to our client that the said instrument was good for payment and would be duly honoured on presentment.

3. That relying upon your solemn representations, our client presented the said cheque for clearance through their bankers. However, to our client's utter shock and dismay, the said cheque was returned unpaid / dishonoured by your bank vide Cheque Return Memo dated ${d.returnMemoDate || "[Memo Date]"} with the endorsement / remarks:
"${d.returnReason || "Funds Insufficient"}".

4. That our client received the aforementioned Bank Return Memo on or about ${d.returnMemoDate || "[Memo Date]"}, and this notice is being dispatched within the mandatory statutory period of 30 (thirty) days from the date of receipt of information from the bank regarding the return of the cheque as unpaid.

5. That it is manifest from the above facts that you issued the said cheque dishonestly, well knowing that sufficient funds were not available in your account, thereby committing an offence under Section 138 of the Negotiable Instruments Act, 1881, and an offence of cheating under Section 318 of the Bharatiya Nyaya Sanhita, 2023 (formerly Section 420 IPC).

6. NOW THEREFORE, through this statutory notice, you are hereby called upon to pay to our client the said sum of ₹${Number(d.chequeAmount || 0).toLocaleString("en-IN")}/- (Rupees [in words] only) within a period of 15 (FIFTEEN) DAYS from the date of receipt of this notice, failing which our client shall be constrained to initiate criminal prosecution against you under Section 138 read with Section 142 of the Negotiable Instruments Act, 1881, before the competent Court of Judicial Magistrate / Metropolitan Magistrate, at your sole risk, cost, and consequences.

7. TAKE FURTHER NOTICE that under Section 138 of the Negotiable Instruments Act, an offence of cheque bounce is punishable with imprisonment for a term which may extend up to TWO YEARS, or with fine which may extend to TWICE THE AMOUNT of the cheque, or with both. In addition, our client reserves the right to claim interest @ 18% per annum and legal costs incurred in issuing this notice.

A copy of this notice is retained in our office for future judicial record and presentation in court.


Yours faithfully,


________________________________________
ADVOCATE / AUTHORISED SIGNATORY
For and on behalf of: ${d.payeeName || "Complainant"}
Address: ${d.payeeAddress || "Payee Address"}
`;
}

function generateConsumerNotice(d: Record<string, any>): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `LEGAL NOTICE BEFORE INSTITUTION OF CONSUMER COMPLAINT
UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

Date: ${currentDate}

TO:
${d.companyName || "[Opposite Party / Company]"}
Through its Managing Director / Grievance Officer
Registered Office:
${d.companyAddress || "[Company Registered Address]"}

FROM:
${d.consumerName || "[Consumer Name]"}
${d.consumerAddress || "[Consumer Address]"}
Contact: ${d.consumerPhone || "[Phone/Email]"}

SUBJECT: LEGAL NOTICE UNDER CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE, UNFAIR TRADE PRACTICE, AND DEFECTIVE PRODUCT REGARDING ORDER/INVOICE NO. ${d.orderNumber || "[Order No]"} DATED ${d.purchaseDate || "[Date]"}.

Sir / Madam,

I, the undersigned consumer, hereby serve upon you this formal Legal Notice under the provisions of the Consumer Protection Act, 2019:

1. That I am a bona fide "consumer" within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased the product / subscribed to the service: "${d.productService || "[Product/Service Description]}"} vide Order / Invoice No. ${d.orderNumber || "[Order No]"} on ${d.purchaseDate || "[Purchase Date]"}, for a total valuable consideration of ₹${Number(d.amountPaid || 0).toLocaleString("en-IN")}/-, which was paid in full to you.

2. That upon delivery / commencement of the said service, the following severe defects, non-conformities, and deficiencies were encountered:
"${d.deficiencyDescription || "[Deficiency Details]"}"

3. That despite repeated grievances, escalation tickets, emails, and telephonic complaints made to your customer grievance portal, you have willfully neglected, refused, or failed to rectify the defect, provide replacement, or process a full refund.

4. That your deliberate failure, misleading representations, and refusal to honour standard consumer guarantees constitute:
(a) "Deficiency in Service" under Section 2(11) of the Consumer Protection Act, 2019;
(b) "Defect in Goods" under Section 2(10) of the Consumer Protection Act, 2019;
(c) "Unfair Trade Practice" under Section 2(47) of the Act; and
(d) Product liability failure under Section 84 of the Consumer Protection Act, 2019.

5. That your unlawful conduct has caused immense mental agony, harassment, severe inconvenience, and wrongful financial loss to me.

6. NOW THEREFORE, I hereby demand that within 15 (FIFTEEN) DAYS of the receipt of this legal notice, you must:
${d.reliefDemanded || "Effect an immediate full refund of the amount paid along with statutory compensation."}

7. TAKE NOTICE that if you fail to comply with the demands set forth above within the stipulated 15-day period, I shall immediately file a formal Consumer Complaint under Section 35 of the Consumer Protection Act, 2019 before the competent District Consumer Disputes Redressal Commission (via the National e-Daakhil Consumer Portal), seeking:
- Full refund of consideration paid with interest @ 18% per annum;
- Punitive damages for unfair trade practices and mental agony; and
- Full costs of litigation.
All at your sole peril, cost, and legal consequences.


Yours sincerely,


________________________________________
${d.consumerName || "Consumer"}
Complainant / Consumer
Address: ${d.consumerAddress || "Address"}
Contact: ${d.consumerPhone || "Phone"}
`;
}

function generateRtiApplication(d: Record<string, any>): string {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

Date: ${currentDate}
Place: [City, State]

TO:
${d.pioDesignation || "The Central Public Information Officer (CPIO)"}
${d.publicAuthority || "[Public Authority / Department]"}
Office Address: [Department Address]

1. FULL NAME OF APPLICANT:
   ${d.applicantName || "[Applicant Name]"}

2. CITIZENSHIP:
   Indian Citizen

3. COMPLETE POSTAL ADDRESS FOR COMMUNICATION:
   ${d.applicantAddress || "[Postal Address]"}
   Telephone / Mobile: ${d.applicantPhone || "[Phone]"}
   Email: ${d.applicantEmail || "[Email]"}

4. PARTICULARS OF INFORMATION SOUGHT:
   (In accordance with Section 6(1) of the Right to Information Act, 2005):

${d.informationQueries || "1. Please provide certified copies of...\n2. Please confirm whether..."}

5. PERIOD TO WHICH THE INFORMATION PERTAINS:
   Relevant period as specified in the queries above.

6. FORMAT IN WHICH INFORMATION IS SOUGHT:
   Certified hard copies by Registered Post / Speed Post, or authenticated electronic copies via Email.

7. APPLICATION FEE DETAILS:
   ${d.feeParticulars || "Indian Postal Order (IPO) for ₹10/- enclosed herewith as prescribed statutory fee."}

8. BELOW POVERTY LINE (BPL) STATUS:
   Applicant belongs to BPL category: ${d.isBpl || "No"}.
   ${d.isBpl === "Yes" ? "(Proof of valid BPL Ration Card / Certificate attached herewith; fee exemption claimed under Section 7(5) of the RTI Act)." : ""}

9. STATUTORY TIME LIMIT:
   As provided under Section 7(1) of the RTI Act, 2005, the requested information must be furnished within 30 (thirty) days of the receipt of this application.

10. DECLARATION:
    I hereby declare that I am a Citizen of India and that the information requested does not fall within the exemptions specified under Section 8 or 9 of the Right to Information Act, 2005.


Enclosures:
1. Proof of Application Fee (IPO / Receipt)
2. Identity Proof / Address Proof


________________________________________
SIGNATURE OF THE APPLICANT
(${d.applicantName || "Applicant"})
`;
}

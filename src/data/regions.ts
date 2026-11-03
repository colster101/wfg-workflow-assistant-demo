/* Region packs: drive currency, names, and locally common situations
   for the demo. Add a new region by extending REGIONS below. */

export type RegionId = 'us' | 'sg' | 'uk' | 'anz';

export type CurrencyConfig = {
  symbol: string;        // e.g. "$", "S$", "£"
  code: string;          // ISO 4217 e.g. "USD"
  locale: string;        // BCP-47 used for Intl.NumberFormat
  /* thresholds shown verbatim in rule labels — pick rounded local-feeling numbers */
  smallChangeThreshold: number; // e.g. 25 USD ≈ 35 SGD ≈ 20 GBP (premium delta auto-approval)
  fraudThresholdLabel: string;  // human label e.g. "$50K", "S$70K", "£40K"
};

export type RegionPack = {
  id: RegionId;
  label: string;         // "United States"
  shortLabel: string;    // "US"
  flag: string;          // emoji flag for UI
  dateLocale: string;    // for toLocaleDateString — same as currency locale generally
  currency: CurrencyConfig;

  /* Operator showing in the AppBar */
  operator: { name: string; initials: string; role: string };

  /* Pool of customer identities. Index N is reused across mockData
     work item N so swapping regions changes names consistently.
     `address` is optional — only populated when the region pack has
     curated address data to display on the customer card. */
  customers: Array<{ name: string; phone: string; email: string; nric: string; address?: string }>;

  /* Pool of staff assignees keyed by the role they play in the demo.
     The keys map to the original US-flavoured names we want to swap out. */
  staff: {
    operationsManager: string;
    claimsAssignees: string[];     // 3 names
    underwritingAssignees: string[]; // 2 names
    newBusinessAssignees: string[];  // 1 name
    policyServicesAssignees: string[]; // 2 names
    walkthroughIntakeRep: string;
    walkthroughVerifier: string;
    walkthroughQA: string;
  };

  /* CRM staff pool — 5 names that map 1-to-1 onto the base SG names
     [Sarah Tan, James Wong, Ahmad Zulkifli, Kevin Chia, Rachel Lim].
     Used to swap hardcoded CRM interaction/SMS/email author names
     when the region changes. */
  crmStaff: string[];

  /* Product and rider names — used in walkthrough header + step bodies. */
  product: {
    name: string;                 // e.g. "PrimeLife Whole Life"
    riderOptions: string[];       // 4 rider names for the dropdown
    defaultRider: string;         // selected rider
    riderCoverageAmount: number;  // ADB coverage (250000 USD style)
    faceAmount: number;           // 250000 USD style
    currentPremium: number;       // monthly
    newPremium: number;           // monthly
    yearsInForce: number;
    underwritingClass: string;    // e.g. "Standard Plus" in US, "Preferred" in UK/SG
  };

  /* Channel commonly seen for the demo intake step */
  primaryChannel: 'Call Center' | 'Digital' | 'Agent' | 'Mail';

  /* Label for the national ID field (SSN, NRIC / UEN, NI Number, etc.) */
  idLabel: string;

  /* Common local situation strings woven into descriptions / activity */
  situations: {
    claimsComplex: string;        // top claim case description
    claimsDispute: string;        // beneficiary dispute case description
    underwritingMedical: string;  // pended medical underwriting
    newBusinessClean: string;     // clean new-business case
    endorsementRider: string;     // rider addition endorsement
    addressChange: string;        // address change
    cancellation: string;         // policy cancellation
    billingInquiry: string;       // billing question
    medicalRecordsAcronym: string;// "APS" in US, "GP Report" in UK, "Medical Report" in SG
    regulatoryNote: string;       // small banner-ready text describing local context
  };
};

function fmt(locale: string, code: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 0 });
}

export function formatCurrency(amount: number, region: RegionPack, opts?: { fractionDigits?: number }) {
  /* Format the number with locale grouping, but prepend the region's
     explicit symbol (e.g. "S$", "£") rather than letting Intl pick the
     locale default — en-SG renders SGD as "$" which is indistinguishable
     from USD in the demo. */
  const number = new Intl.NumberFormat(region.currency.locale, {
    minimumFractionDigits: opts?.fractionDigits ?? 0,
    maximumFractionDigits: opts?.fractionDigits ?? 0,
  }).format(amount);
  return `${region.currency.symbol}${number}`;
}

export function formatCurrencyCompact(amount: number, region: RegionPack) {
  if (amount >= 1000) {
    const k = Math.round(amount / 1000);
    return `${region.currency.symbol}${k}K`;
  }
  return formatCurrency(amount, region);
}

export const REGIONS: Record<RegionId, RegionPack> = {
  us: {
    id: 'us',
    label: 'United States',
    shortLabel: 'US',
    flag: '🇺🇸',
    dateLocale: 'en-US',
    currency: {
      symbol: '$', code: 'USD', locale: 'en-US',
      smallChangeThreshold: 25,
      fraudThresholdLabel: '$50K',
    },
    operator: { name: 'Demo Coordinator', initials: 'DC', role: 'WFG Distribution Operations' },
    customers: [
      { name: 'Robert Vasquez',   phone: '+1 (415) 555-2841', email: 'r.vasquez@example.com',  nric: '192-55-2841', address: '2841 Market St, San Francisco, CA 94114' },
      { name: 'Linda Patel',      phone: '+1 (312) 555-1190', email: 'l.patel@example.com',     nric: '312-44-1190', address: '1190 N Michigan Ave, Chicago, IL 60601' },
      { name: 'Marcus Johnson',   phone: '+1 (646) 555-7715', email: 'm.johnson@example.com',   nric: '646-66-7715', address: '7715 Broadway, New York, NY 10036' },
      { name: 'Theresa Williams', phone: '+1 (213) 555-4422', email: 't.williams@example.com',  nric: '213-55-4422', address: '4422 Sunset Blvd, Los Angeles, CA 90028' },
      { name: 'Gregory Hoffman',  phone: '+1 (617) 555-0098', email: 'g.hoffman@example.com',   nric: '617-44-0098', address: '98 Commonwealth Ave, Boston, MA 02116' },
      { name: 'Diana Park',       phone: '+1 (206) 555-3340', email: 'd.park@example.com',      nric: '206-55-3340', address: '3340 Eastlake Ave E, Seattle, WA 98102' },
      { name: 'Samuel Green',     phone: '+1 (305) 555-9911', email: 's.green@example.com',     nric: '305-66-9911', address: '9911 SW 8th St, Miami, FL 33174' },
      { name: 'Jennifer Adams',   phone: '+1 (720) 555-6628', email: 'j.adams@example.com',     nric: '720-55-6628', address: '6628 E Colfax Ave, Denver, CO 80220' },
      { name: 'DXC Technology US Inc',  phone: '+1 (408) 555-1188', email: 'insurance@dxc.com',          nric: '',            address: '1188 El Camino Real, San Jose, CA 95126' },
      { name: 'Claire Dupont',    phone: '+1 (504) 555-2275', email: 'c.dupont@example.com',    nric: '504-55-2275', address: '2275 Magazine St, New Orleans, LA 70130' },
      { name: 'Nathan Brooks',    phone: '+1 (404) 555-3382', email: 'n.brooks@example.com',    nric: '404-66-3382', address: '3382 Peachtree Rd NE, Atlanta, GA 30326' },
      { name: 'Pacific Star Holdings US LLC', phone: '+1 (602) 555-7741', email: 'finance@pacificstar.com', nric: '',      address: '7741 N 7th Ave, Phoenix, AZ 85013' },
      { name: 'Frank Sullivan',   phone: '+1 (617) 555-8829', email: 'f.sullivan@example.com',  nric: '617-44-8829', address: '8829 Washington St, Boston, MA 02118' },
      { name: 'Angela Moore',     phone: '+1 (503) 555-4416', email: 'a.moore@example.com',     nric: '503-55-4416', address: '4416 NE Broadway, Portland, OR 97213' },
      { name: 'Harold Kim',       phone: '+1 (415) 555-9924', email: 'h.kim@example.com',       nric: '415-66-9924', address: '9924 Telegraph Ave, Oakland, CA 94609' },
    ],
    staff: {
      operationsManager: 'Jamie Dawson',
      claimsAssignees: ['Sarah Mitchell', 'Michael Torres', 'Karen White'],
      underwritingAssignees: ['David Reyes', 'Amy Foster'],
      newBusinessAssignees: ['Lisa Chen'],
      policyServicesAssignees: ['Priya Nair', 'Tom Bradley'],
      walkthroughIntakeRep: 'Olivia Park',
      walkthroughVerifier: 'David Reyes',
      walkthroughQA: 'Priya Nair',
    },
    crmStaff: ['Sarah Mitchell', 'Michael Torres', 'David Reyes', 'Karen White', 'Amy Foster'],
    product: {
      name: 'PrimeLife Whole Life',
      riderOptions: ['Accidental Death Benefit', 'Waiver of Premium', 'Child Term Rider', 'Long-Term Care Rider'],
      defaultRider: 'Accidental Death Benefit',
      riderCoverageAmount: 100000,
      faceAmount: 250000,
      currentPremium: 84.20,
      newPremium: 92.20,
      yearsInForce: 8,
      underwritingClass: 'Standard Plus',
    },
    primaryChannel: 'Call Center',
    idLabel: 'SSN',
    situations: {
      claimsComplex: 'Complex liability claim — third-party involvement. Medical documentation incomplete.',
      claimsDispute: 'Death benefit claim. Beneficiary disputes payout amount — legal review requested.',
      underwritingMedical: 'SIWL application. Applicant disclosed Type 2 diabetes — additional APS required.',
      newBusinessClean: 'Whole life application — $250K face amount. Clean health history.',
      endorsementRider: 'Rider addition — Accidental Death Benefit. Awaiting signed endorsement.',
      addressChange: 'Residential address update. All 3 policies on account to be updated.',
      cancellation: 'Customer-requested cancellation. Surrender value calculation required.',
      billingInquiry: 'Customer querying premium increase on renewal. Needs explanation letter.',
      medicalRecordsAcronym: 'APS',
      regulatoryNote: 'NAIC unfair-claims practices apply; state DOI complaint window 60 days.',
    },
  },

  sg: {
    id: 'sg',
    label: 'Singapore',
    shortLabel: 'SG',
    flag: '🇸🇬',
    dateLocale: 'en-SG',
    currency: {
      symbol: 'S$', code: 'SGD', locale: 'en-SG',
      smallChangeThreshold: 35,
      fraudThresholdLabel: 'S$70K',
    },
    /* Operations Manager is the Supervisor persona (Option 1). */
    operator: { name: 'Vikram Singh Rai', initials: 'VR', role: 'Operations Manager' },
    /* Customer pool — primarily Policy Holder personas, padded with
       Employee/IT/Safety/Sales/Actuary personas. Index 1 = walkthrough
       primary customer (Adrian Tan Wei Ming). Indices 12–14 are repeat
       customers (same person, different policy) since the user-supplied
       name list has fewer entries than the demo's 15 customer slots. */
    customers: [
      { name: 'Tan Wei Ming',                phone: '+65 9123 4567', email: 'tanweiming@email.com',           nric: 'S8812345A', address: '12 Clementi Ave 2, #08-45, Singapore 120012' },
      { name: 'Priya Nair',                  phone: '+65 9234 5678', email: 'priya.nair@gmail.com',           nric: 'S9023456B', address: '88 Bukit Timah Road, #12-22, Singapore 229832' },
      { name: 'Ahmad bin Rashid',            phone: '+65 9345 6789', email: 'ahmad.rashid@yahoo.com',         nric: 'S7834567C', address: '45 Tampines Street 21, #03-12, Singapore 521045' },
      { name: 'Lim Hui Shan',               phone: '+65 9456 7890', email: 'lim.huishan@outlook.com',        nric: 'S9245678D', address: '102 Jurong East Street 13, #07-88, Singapore 600102' },
      { name: 'Rajesh Kumar Pillai',         phone: '+65 9567 8901', email: 'rajesh.pillai@dxc.com',          nric: 'S8556789E', address: '6 Raffles Boulevard, #18-01, Singapore 039594' },
      { name: 'Chen Mei Ling',              phone: '+65 9678 9012', email: 'chenmeiling88@gmail.com',         nric: 'S9367890F', address: '231 Bishan Street 22, #14-33, Singapore 570231' },
      { name: 'Muhammad Farid bin Hassan',   phone: '+65 9789 0123', email: 'mfarid.hassan@hotmail.com',       nric: 'S8078901G', address: '78 Woodlands Drive 14, #05-22, Singapore 731078' },
      { name: 'Siti Rahimah binte Yusof',   phone: '+65 9890 1234', email: 'siti.rahimah@singtel.com',        nric: 'S9589012H', address: '55 Pasir Ris Drive 3, #12-01, Singapore 510055' },
      { name: 'DXC Technology Singapore',   phone: '+65 6512 3456', email: 'insurance@dxc.com',               nric: 'UEN201234567K', address: '1 Harbourfront Avenue, #12-01, Singapore 098632' },
      { name: 'Kevin Loh Boon Huat',        phone: '+65 9012 3456', email: 'kevin.loh@gmail.com',             nric: 'S7690123I', address: '18 Yishun Ring Road, #06-14, Singapore 768872' },
      { name: 'Ananya Krishnamurthy',        phone: '+65 9123 9988', email: 'ananya.k@techcorp.sg',            nric: 'F9301234J', address: '33 Orchard Road, #05-01, Singapore 238867' },
      { name: 'Pacific Star Holdings',       phone: '+65 6234 5678', email: 'finance@pacificstar.com.sg',      nric: 'UEN200988765M', address: '8 Marina View, #40-01, Singapore 018960' },
      { name: 'Deepa Krishnan',             phone: '+65 9612 7741', email: 'deepa.krishnan@example.com',      nric: 'F9523456M', address: '20 Buona Vista Road, #08-11, Singapore 275882' },
      { name: 'Tan Wei Ming',                phone: '+65 9123 4567', email: 'tanweiming@email.com',            nric: 'S8812345A', address: '12 Clementi Ave 2, #08-45, Singapore 120012' },
      { name: 'Priya Nair',                  phone: '+65 9234 5678', email: 'priya.nair@gmail.com',            nric: 'S9023456B', address: '88 Bukit Timah Road, #12-22, Singapore 229832' },
    ],
    staff: {
      // Supervisor persona — Op 1 owns ops, Op 2 acts as senior claims handler
      operationsManager: 'Vikram Singh Rai',
      // Claims Adjuster personas + Supervisor Op 2 as senior claims handler
      claimsAssignees: ['Suresh Anand Pillai', 'Aaron Teo Kai Sheng', 'Ravi Shankar Velu'],
      underwritingAssignees: ['Muhammad Farhan Ahmad', 'Hafizah Binte Salleh'],
      newBusinessAssignees: ['Melissa Lim Jia En'],
      // CSR personas — Prakash leads policy services, Rajiv handles intake too
      policyServicesAssignees: ['Prakash Nair Subramaniam', 'Rajiv Kumar Narayanan'],
      walkthroughIntakeRep: 'Rajiv Kumar Narayanan',
      walkthroughVerifier: 'Muhammad Farhan Ahmad',
      walkthroughQA: 'Jeanette Marie Pereira',
    },
    crmStaff: ['Sarah Tan', 'James Wong', 'Ahmad Zulkifli', 'Kevin Chia', 'Rachel Lim'],
    product: {
      name: 'PrimeLife Whole Life (SGD)',
      riderOptions: ['Accidental Death Benefit', 'Critical Illness Rider', 'Waiver of Premium', 'Early Critical Illness Rider'],
      defaultRider: 'Critical Illness Rider',
      riderCoverageAmount: 140000,
      faceAmount: 350000,
      currentPremium: 118.40,
      newPremium: 129.80,
      yearsInForce: 8,
      underwritingClass: 'Preferred',
    },
    primaryChannel: 'Digital',
    idLabel: 'NRIC / UEN',
    situations: {
      claimsComplex: 'Hospital claim — TPA dispute over LOA. Additional supporting bills requested from provider.',
      claimsDispute: 'Death benefit claim. Nominee under Insurance Act s.49M contested — legal review requested.',
      underwritingMedical: 'Term application. Applicant disclosed Type 2 diabetes — additional GP medical report required.',
      newBusinessClean: 'Whole life application — S$350K sum assured. Clean health history.',
      endorsementRider: 'Rider addition — Critical Illness rider. Awaiting signed endorsement.',
      addressChange: 'HDB address update. All 3 policies on NRIC to be updated.',
      cancellation: 'Free-look cancellation request within 14-day window. Premium refund calculation required.',
      billingInquiry: 'Customer querying GIRO premium deduction on renewal. Needs explanation letter.',
      medicalRecordsAcronym: 'GP Report',
      regulatoryNote: 'MAS Notice 117 applies; free-look period 14 days from policy delivery.',
    },
  },

  uk: {
    id: 'uk',
    label: 'United Kingdom',
    shortLabel: 'UK',
    flag: '🇬🇧',
    dateLocale: 'en-GB',
    currency: {
      symbol: '£', code: 'GBP', locale: 'en-GB',
      smallChangeThreshold: 20,
      fraudThresholdLabel: '£40K',
    },
    operator: { name: 'Duncan Ferris', initials: 'DF', role: 'Operations Manager' },
    /* Customer pool sourced from the demo persona reference sheet: the three
       Policy Holder personas (indices 0-5, both name options), padded with
       the Actuary/IT Professional/Employee/Safety Team/HR personas since the
       reference sheet has fewer entries than the demo's 15 customer slots.
       Addresses come from the reference sheet's 11 UK addresses; indices
       11-14 repeat earlier ones. Indices 8 and 11 map onto the corporate
       clients C-009 / C-012 (see SG_CUSTOMER_NAMES) so they carry company
       names/addresses rather than an individual persona, matching the SG
       pack — otherwise mapCustomerName would show a person's name for a
       corporate account. */
    customers: [
      { name: 'James Whitfield',              phone: '+44 20 7946 3311',   email: 'j.whitfield@example.co.uk',   nric: 'AB 123456 C', address: '12 Cheyne Walk, London, SW3 5RA' },
      { name: 'Priya Sharma',                 phone: '+44 117 496 2245',   email: 'p.sharma@example.co.uk',      nric: 'CD 234567 D', address: '45 Corn Street, Bristol, BS1 1HT' },
      { name: 'Charlotte Bennett',             phone: '+44 20 7946 5571',   email: 'c.bennett@example.co.uk',     nric: 'EF 345678 A', address: '18 Cathedral Street, London, SE1 9DE' },
      { name: 'Amara Johnson',                phone: '+44 161 496 0291',   email: 'a.johnson@example.co.uk',     nric: 'GH 456789 B', address: '23 Wilmslow Road, Manchester, Greater Manchester, M14 6XY' },
      { name: 'Rupert Spencer',               phone: '+44 191 496 6628',   email: 'r.spencer@example.co.uk',     nric: 'IJ 567890 C', address: '9 Grainger Street, Newcastle upon Tyne, Tyne and Wear, NE1 5JQ' },
      { name: 'Nigel Taylor',                 phone: '+44 131 496 0090',   email: 'n.taylor@example.co.uk',      nric: 'KL 678901 D', address: '39 Thistle Street, Edinburgh, EH2 1DY' },
      { name: 'Freya Thornton',               phone: '+44 1926 496 330',   email: 'f.thornton@example.co.uk',    nric: 'MN 789012 A', address: '31 The Parade, Leamington Spa, Warwickshire, CV32 4BH' },
      { name: 'Kwame Osei',                   phone: '+44 1483 496 088',   email: 'k.osei@example.co.uk',        nric: 'OP 890123 B', address: '14 Millbrook Street, Guildford, Surrey, GU1 3XQ' },
      { name: 'DXC Technology UK Ltd',        phone: '+44 1302 496 500',   email: 'insurance@dxc.com',           nric: '',            address: 'Unit 14, Wheatley Park Industrial Estate, Doncaster, South Yorkshire, DN3 3FB' },
      { name: 'Mei-Ling Chan',                phone: '+44 29 2018 3382',   email: 'm.chan@example.co.uk',        nric: 'QR 901234 C', address: '2 Mill Lane, Cardiff, South Glamorgan, CF10 5FQ' },
      { name: 'Ellie Rutherford',             phone: '+44 1865 496 224',   email: 'e.rutherford@example.co.uk',  nric: 'ST 012345 D', address: '17 Broad Street, Oxford, Oxfordshire, OX1 3AS' },
      { name: 'Pacific Star Holdings UK Ltd', phone: '+44 20 7946 6000',   email: 'finance@pacificstar.co.uk',   nric: '',            address: '18 Cathedral Street, London, SE1 9DE' },
      { name: 'Percy Adams',                  phone: '+44 117 496 4416',   email: 'p.adams@example.co.uk',       nric: 'UV 123456 A', address: '45 Corn Street, Bristol, BS1 1HT' },
      { name: 'Yasmin Farooq',                phone: '+44 191 496 9924',   email: 'y.farooq@example.co.uk',      nric: 'WX 234567 B', address: '9 Grainger Street, Newcastle upon Tyne, Tyne and Wear, NE1 5JQ' },
      { name: 'Olivia Trent',                 phone: '+44 161 496 1188',   email: 'o.trent@example.co.uk',       nric: 'YZ 345678 C', address: '23 Wilmslow Road, Manchester, Greater Manchester, M14 6XY' },
    ],
    /* Staff mapped from the reference sheet's internal-role personas:
       Supervisor -> operationsManager, Claims Adjuster -> claimsAssignees
       (padded with Supervisor Option 2 as senior claims handler, matching
       the SG pack's pattern), Underwriter -> underwritingAssignees,
       Sales Agent/Broker -> newBusinessAssignees, CSR -> policyServicesAssignees. */
    staff: {
      operationsManager: 'Duncan Ferris',
      claimsAssignees: ['Callum McAllister', 'Rhea Patel', 'Leila Osman'],
      underwritingAssignees: ['Harriet Sinclair', 'Connor Whitmore'],
      newBusinessAssignees: ['Oliver Bancroft'],
      policyServicesAssignees: ['Ryan Fitzgerald', 'Nadia Hussain'],
      walkthroughIntakeRep: 'Nadia Hussain',
      walkthroughVerifier: 'Harriet Sinclair',
      walkthroughQA: 'Ryan Fitzgerald',
    },
    crmStaff: ['Callum McAllister', 'Rhea Patel', 'Harriet Sinclair', 'Leila Osman', 'Connor Whitmore'],
    product: {
      name: 'PrimeLife Whole of Life',
      riderOptions: ['Accidental Death Benefit', 'Waiver of Premium', 'Critical Illness Cover', 'Terminal Illness Benefit'],
      defaultRider: 'Critical Illness Cover',
      riderCoverageAmount: 80000,
      faceAmount: 200000,
      currentPremium: 68.50,
      newPremium: 76.20,
      yearsInForce: 8,
      underwritingClass: 'Preferred',
    },
    primaryChannel: 'Call Center',
    idLabel: 'NI Number',
    situations: {
      claimsComplex: 'Complex liability claim — third-party involvement. GP report outstanding.',
      claimsDispute: 'Death benefit claim. Estate disputes beneficiary nomination — legal review requested.',
      underwritingMedical: 'Term life application. Applicant disclosed Type 2 diabetes — additional GP report required.',
      newBusinessClean: 'Whole of life application — £200K sum assured. Clean health history.',
      endorsementRider: 'Rider addition — Critical Illness Cover. Awaiting signed endorsement.',
      addressChange: 'Residential address update. All 3 policies on account to be updated.',
      cancellation: 'Cooling-off period cancellation within 30-day window. Premium refund calculation required.',
      billingInquiry: 'Customer querying Direct Debit premium increase on renewal. Needs explanation letter.',
      medicalRecordsAcronym: 'GP Report',
      regulatoryNote: 'FCA ICOBS rules apply; cooling-off period 30 days from policy issue.',
    },
  },
  anz: {
    id: 'anz',
    label: 'Australia & New Zealand',
    shortLabel: 'ANZ',
    flag: '🇦🇺',
    dateLocale: 'en-AU',
    currency: {
      symbol: 'A$', code: 'AUD', locale: 'en-AU',
      smallChangeThreshold: 35,
      fraudThresholdLabel: 'A$75K',
    },
    operator: { name: 'Olivia Nguyen', initials: 'ON', role: 'Operations Manager' },
    /* Customer pool: invented names and addresses. Streets and suburbs are
       borrowed from one city and placed in another so no address is real. */
    customers: [
      { name: 'Emma Clarke',       phone: '+61 412 555 018', email: 'emma.clarke@example.com.au',     nric: 'DL 4821 556', address: '14 Collins Street, Parramatta NSW' },
      { name: "Liam O'Connor",     phone: '+61 423 555 204', email: 'liam.oconnor@example.com.au',    nric: 'DL 5530 219', address: '32 Pitt Street, Carlton VIC' },
      { name: 'Mia Thompson',      phone: '+61 401 555 377', email: 'mia.thompson@example.com.au',    nric: 'DL 6612 904', address: '7 Queen Street, Glebe NSW' },
      { name: 'Noah Patel',        phone: '+61 433 555 120', email: 'noah.patel@example.com.au',      nric: 'DL 7045 318', address: '115 Lygon Street, Bondi Junction NSW' },
      { name: 'Chloe Nguyen',      phone: '+61 418 555 662', email: 'chloe.nguyen@example.com.au',    nric: 'DL 3387 741', address: '22 Chapel Street, Kingsford NSW' },
      { name: 'Jack Anderson',     phone: '+64 21 555 0143', email: 'jack.anderson@example.co.nz',    nric: 'DL 8819 052', address: '9 Ponsonby Road, Epsom VIC' },
      { name: 'Ava Williams',      phone: '+61 407 555 890', email: 'ava.williams@example.com.au',    nric: 'DL 2290 473', address: '48 Bourke Street, Newtown NSW' },
      { name: 'Oliver Brown',      phone: '+61 429 555 135', email: 'oliver.brown@example.com.au',    nric: 'DL 9175 628', address: '3 Hay Street, Caulfield VIC' },
      { name: 'DXC Technology Australia Pty Ltd', phone: '+61 2 5555 0100', email: 'insurance@dxc.com', nric: '', address: 'Level 12, 80 Flinders Street, North Sydney NSW' },
      { name: 'Isabella Rossi',    phone: '+61 415 555 741', email: 'isabella.rossi@example.com.au',  nric: 'DL 4456 187', address: '18 Hunter Street, Mosman NSW' },
      { name: 'William Scott',     phone: '+64 22 555 0198', email: 'william.scott@example.co.nz',    nric: 'DL 1034 866', address: '5 Lambton Quay, Wellington NZ' },
      { name: 'Grace Mitchell',    phone: '+61 408 555 259', email: 'grace.mitchell@example.com.au',  nric: 'DL 7721 330', address: '21 Rundle Mall, Glenelg SA' },
      { name: 'Ethan Walsh',       phone: '+61 437 555 612', email: 'ethan.walsh@example.com.au',     nric: 'DL 5068 904', address: '60 Adelaide Street, Surfers Paradise QLD' },
      { name: 'Sophie Harris',     phone: '+61 411 555 288', email: 'sophie.harris@example.com.au',   nric: 'DL 6349 215', address: '11 Sunset Boulevard, Cronulla NSW' },
      { name: 'Pacific Star Holdings Pty Ltd', phone: '+61 3 5555 0177', email: 'finance@pacificstar.com.au', nric: '', address: '40 George Street, Hobart TAS' },
    ],
    staff: {
      operationsManager: 'Olivia Nguyen',
      claimsAssignees: ['Daniel Harper', 'Priya Iyer', 'Ben Calder'],
      underwritingAssignees: ['Hannah Doyle', 'Lachlan Reid'],
      newBusinessAssignees: ['Tessa Muir'],
      policyServicesAssignees: ['Aaron Lee', 'Rachel Okafor'],
      walkthroughIntakeRep: 'Rachel Okafor',
      walkthroughVerifier: 'Hannah Doyle',
      walkthroughQA: 'Aaron Lee',
    },
    crmStaff: ['Daniel Harper', 'Ben Calder', 'Hannah Doyle', 'Tessa Muir', 'Aaron Lee'],
    product: {
      name: 'PrimeLife Whole Life (AUD)',
      riderOptions: ['Accidental Death Benefit', 'Total and Permanent Disability', 'Child Term Rider', 'Critical Illness Cover'],
      defaultRider: 'Critical Illness Cover',
      riderCoverageAmount: 150000,
      faceAmount: 400000,
      currentPremium: 124.60,
      newPremium: 136.90,
      yearsInForce: 8,
      underwritingClass: 'Preferred',
    },
    primaryChannel: 'Call Center',
    idLabel: 'Driver licence',
    situations: {
      claimsComplex: 'Complex injury claim — third-party involvement. GP report outstanding.',
      claimsDispute: 'Death benefit claim. Beneficiary disputes nomination — legal review requested.',
      underwritingMedical: 'Term life application. Applicant disclosed Type 2 diabetes — additional GP report required.',
      newBusinessClean: 'Whole life application — A$400K sum insured. Clean health history.',
      endorsementRider: 'Rider addition — Critical Illness Cover. Awaiting signed endorsement.',
      addressChange: 'Residential address update. All 3 policies on account to be updated.',
      cancellation: 'Cooling-off period cancellation within 14-day window. Premium refund calculation required.',
      billingInquiry: 'Customer querying direct debit premium increase on renewal. Needs explanation letter.',
      medicalRecordsAcronym: 'GP Report',
      regulatoryNote: 'Life Insurance Code of Practice applies; cooling-off period 14 days from policy issue.',
    },
  },

};

export const REGION_LIST: RegionPack[] = [REGIONS.us];

/* Base SG CRM staff names used as keys for the per-region mapping. */
export const SG_BASE_CRM_STAFF = ['Sarah Tan', 'James Wong', 'Ahmad Zulkifli', 'Kevin Chia', 'Rachel Lim'];

/* SG customer full names keyed by clientNo — used for body-text replacement. */
const SG_CUSTOMER_NAMES: Record<string, string> = {
  'C-001': 'Tan Wei Ming',
  'C-002': 'Priya Nair',
  'C-003': 'Ahmad bin Rashid',
  'C-004': 'Lim Hui Shan',
  'C-005': 'Rajesh Kumar Pillai',
  'C-006': 'Chen Mei Ling',
  'C-007': 'Muhammad Farid bin Hassan',
  'C-008': 'Siti Rahimah binte Yusof',
  'C-009': 'DXC Technology Singapore Pte Ltd',
  'C-010': 'Kevin Loh Boon Huat',
  'C-011': 'Ananya Krishnamurthy',
  'C-012': 'Pacific Star Holdings Pte Ltd',
};

export function mapCustomerName(clientNo: string, region: RegionPack): string {
  const match = clientNo.match(/^C-(\d+)$/);
  if (!match) return clientNo;
  const idx = parseInt(match[1], 10) - 1;
  return region.customers[idx]?.name ?? clientNo;
}

export function mapCrmStaffName(name: string, region: RegionPack): string {
  if (!name || name === 'Customer Portal' || name === 'Claims Team') return name;
  const idx = SG_BASE_CRM_STAFF.indexOf(name);
  if (idx === -1 || idx >= region.crmStaff.length) return name;
  return region.crmStaff[idx];
}

/* Base CRM narrative text is written in SGD ("S$1,250") since the CRM
   demo data (crmData.ts) was authored for the Singapore/MSIG scenario.
   Swap the symbol/code so amounts read correctly for the selected region —
   this only swaps the currency mark, not the numeric value, same as the
   name-swap functions above. */
export function mapCurrencyInText(text: string, region: RegionPack): string {
  if (region.currency.symbol === 'S$') return text;
  return text
    .split('S$').join(region.currency.symbol)
    .replace(/\bSGD\b/g, region.currency.code);
}

/* Replaces SG customer name in the "Dear [Title] [Name]," greeting and anywhere
   the full name appears in the body, plus swaps SG staff names in signatures. */
export function mapNamesInBody(body: string, clientNo: string, region: RegionPack): string {
  let result = mapCurrencyInText(body, region);
  const mappedCustomer = mapCustomerName(clientNo, region);
  const sgCustomer = SG_CUSTOMER_NAMES[clientNo];

  if (sgCustomer && mappedCustomer !== clientNo) {
    // Replace "Dear [optional title] [any name]," greeting
    result = result.replace(
      /^(Dear\s+)(?:(?:Mr|Ms|Mrs|Dr|Miss)\.?\s+)?[A-Z][A-Za-z\s'.-]+,/m,
      `$1${mappedCustomer},`
    );
    // Replace any remaining full SG name occurrences
    result = result.split(sgCustomer).join(mappedCustomer);
  }

  // Replace SG staff names in signature lines
  SG_BASE_CRM_STAFF.forEach((sgName, i) => {
    if (result.includes(sgName) && i < region.crmStaff.length) {
      result = result.split(sgName).join(region.crmStaff[i]);
    }
  });

  return result;
}

export function mapCustomerEmail(clientNo: string, region: RegionPack): string {
  const match = clientNo.match(/^C-(\d+)$/);
  if (!match) return '';
  const idx = parseInt(match[1], 10) - 1;
  return region.customers[idx]?.email ?? '';
}

export function mapCustomerPhone(clientNo: string, region: RegionPack): string {
  const match = clientNo.match(/^C-(\d+)$/);
  if (!match) return '';
  const idx = parseInt(match[1], 10) - 1;
  return region.customers[idx]?.phone ?? '';
}

export function mapCustomerNric(clientNo: string, region: RegionPack): string {
  const match = clientNo.match(/^C-(\d+)$/);
  if (!match) return '';
  const idx = parseInt(match[1], 10) - 1;
  return region.customers[idx]?.nric ?? '';
}

export function mapCustomerAddress(clientNo: string, region: RegionPack): string {
  const match = clientNo.match(/^C-(\d+)$/);
  if (!match) return '';
  const idx = parseInt(match[1], 10) - 1;
  return region.customers[idx]?.address ?? '';
}

/* keep typescript happy when fmt is unused — exposed for callers who want a
   pre-built Intl.NumberFormat instance. */
export { fmt as _formatterFactory };

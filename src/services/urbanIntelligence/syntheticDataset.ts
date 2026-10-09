import type { Complaint, UnifiedIncident, FieldTeam, WardEquityMetric } from '@/types/urbanIntelligence';

export const INITIAL_WARDS: WardEquityMetric[] = [
  {
    wardId: 'WARD-04',
    wardName: 'Ward 4 - Vijay Nagar North',
    population: 48000,
    complaintCount: 42,
    complaintsPerCapita: 0.88,
    avgResolutionHours: 14.5,
    avgWaitHours: 4.2,
    resolutionRatePercent: 88,
    potentialUnderReporting: false,
    disparityLevel: 'normal',
    activeIncidents: 4
  },
  {
    wardId: 'WARD-09',
    wardName: 'Ward 9 - Rajwada Central',
    population: 62000,
    complaintCount: 68,
    complaintsPerCapita: 1.10,
    avgResolutionHours: 19.8,
    avgWaitHours: 6.8,
    resolutionRatePercent: 82,
    potentialUnderReporting: false,
    disparityLevel: 'normal',
    activeIncidents: 6
  },
  {
    wardId: 'WARD-12',
    wardName: 'Ward 12 - Sukhlia Industrial Belt',
    population: 55000,
    complaintCount: 39,
    complaintsPerCapita: 0.71,
    avgResolutionHours: 32.4,
    avgWaitHours: 15.6,
    resolutionRatePercent: 64,
    potentialUnderReporting: false,
    disparityLevel: 'moderate_delay',
    activeIncidents: 5
  },
  {
    wardId: 'WARD-17',
    wardName: 'Ward 17 - Chhoti Gwaltoli (Old City)',
    population: 71000,
    complaintCount: 78,
    complaintsPerCapita: 1.10,
    avgResolutionHours: 24.1,
    avgWaitHours: 8.5,
    resolutionRatePercent: 78,
    potentialUnderReporting: false,
    disparityLevel: 'normal',
    activeIncidents: 7
  },
  {
    wardId: 'WARD-23',
    wardName: 'Ward 23 - Banganga Colony',
    population: 84000,
    complaintCount: 11,
    complaintsPerCapita: 0.13,
    avgResolutionHours: 46.2,
    avgWaitHours: 28.4,
    resolutionRatePercent: 45,
    potentialUnderReporting: true, // FLAG: Low complaints relative to massive population + long wait times
    disparityLevel: 'severe_disparity',
    activeIncidents: 3
  },
  {
    wardId: 'WARD-28',
    wardName: 'Ward 28 - Annapurna Hills',
    population: 39000,
    complaintCount: 22,
    complaintsPerCapita: 0.56,
    avgResolutionHours: 12.0,
    avgWaitHours: 3.1,
    resolutionRatePercent: 92,
    potentialUnderReporting: false,
    disparityLevel: 'normal',
    activeIncidents: 2
  }
];

export const INITIAL_FIELD_TEAMS: FieldTeam[] = [
  {
    id: 'TEAM-WAT-01',
    name: 'Jal Seva Rapid Response Team A',
    department: 'Water & Sewage',
    contactNumber: '+91 98260 11201',
    skills: ['Main Line Repair', 'Excavation', 'High Pressure Pumping', 'Trench Shoring'],
    equipment: ['Hydraulic Excavator', 'Submersible Sludge Pump', 'Pipe Joint Welder'],
    currentStatus: 'available',
    activeAssignments: 1,
    baseLatitude: 22.7244,
    baseLongitude: 75.8710,
    zone: 'Central Zone'
  },
  {
    id: 'TEAM-WAT-02',
    name: 'Sewage Dewatering Squad B',
    department: 'Water & Sewage',
    contactNumber: '+91 98260 11202',
    skills: ['Sewer Jetting', 'Catch-Basin Clearing', 'Manhole De-silting'],
    equipment: ['Suction Tanker Truck (5000L)', 'High-Pressure Jetting Rods'],
    currentStatus: 'available',
    activeAssignments: 0,
    baseLatitude: 22.7480,
    baseLongitude: 75.8920,
    zone: 'East Zone'
  },
  {
    id: 'TEAM-ROD-01',
    name: 'Highway & Pothole Quick-Pave Unit',
    department: 'Roads & Infrastructure',
    contactNumber: '+91 98260 22101',
    skills: ['Cold Asphalt Patching', 'Road Barricading', 'Emergency Leveling'],
    equipment: ['Mini Roller Compactor', 'Infrared Patch Heater', 'Traffic Delineators'],
    currentStatus: 'on_site',
    activeAssignments: 2,
    baseLatitude: 22.7533,
    baseLongitude: 75.8890,
    zone: 'North Zone'
  },
  {
    id: 'TEAM-ELE-01',
    name: 'Grid Safety High-Voltage Unit',
    department: 'Electricity & Lighting',
    contactNumber: '+91 98260 33401',
    skills: ['Overhead Cable Splicing', 'Transformer Isolation', 'Hazard De-energization'],
    equipment: ['Hydraulic Bucket Lift', 'Dielectric Toolset', 'Thermal Imaging Camera'],
    currentStatus: 'available',
    activeAssignments: 0,
    baseLatitude: 22.7196,
    baseLongitude: 75.8577,
    zone: 'Central Zone'
  },
  {
    id: 'TEAM-SAN-01',
    name: 'Sanitation Cleanliness Taskforce 4',
    department: 'Solid Waste',
    contactNumber: '+91 98260 44501',
    skills: ['Bulk Waste Clearance', 'Chemical Disinfection', 'Drain Dredging'],
    equipment: ['Compactor Truck', 'Front End Loader', 'Bio-enzyme Sprayers'],
    currentStatus: 'available',
    activeAssignments: 1,
    baseLatitude: 22.7090,
    baseLongitude: 75.8610,
    zone: 'West Zone'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  // Cluster 1: Major water burst on Hospital Corridor (Hindi, Hinglish, English)
  {
    id: 'CMP-2026-101',
    citizenName: 'Dr. Alok Verma',
    phone: '+91 98930 45120',
    language: 'hinglish',
    rawText: 'District Hospital ke main gate ke samne paani ka bada pipe phat gaya hai. Ambulance ka rasta poora block ho raha hai aur paani emergency ward ki taraf badh raha hai!',
    translatedText: 'Major water pipeline burst right in front of District Hospital main gate. Ambulance route is completely blocked and water is surging towards emergency ward!',
    category: 'Water & Sewage',
    subcategory: 'Main Water Line Rupture',
    wardId: 'WARD-04',
    wardName: 'Ward 4 - Vijay Nagar North',
    latitude: 22.7540,
    longitude: 75.8912,
    address: 'Opposite Lifeline Trauma Centre, AB Road, Ward 4',
    timestamp: '2026-10-08T19:30:00Z',
    confidenceScore: 96,
    missingDetails: [],
    incidentId: 'INC-2026-001'
  },
  {
    id: 'CMP-2026-102',
    citizenName: 'Ramesh Sharma',
    phone: '+91 94250 88219',
    language: 'hi',
    rawText: 'अस्पताल वाली रोड पर बहुत तेज पानी बह रहा है। सड़क धंसने लगी है, कोई बड़ी दुर्घटना हो सकती है।',
    translatedText: 'Very high water current on hospital road. Road surface has started caving in, severe accident risk.',
    category: 'Water & Sewage',
    subcategory: 'Road Cave-In & Water Surge',
    wardId: 'WARD-04',
    wardName: 'Ward 4 - Vijay Nagar North',
    latitude: 22.7538,
    longitude: 75.8915,
    address: 'Near Medichem Pharmacy, AB Road, Ward 4',
    timestamp: '2026-10-08T19:42:00Z',
    confidenceScore: 94,
    missingDetails: [],
    isDuplicateOf: 'CMP-2026-101',
    incidentId: 'INC-2026-001'
  },
  {
    id: 'CMP-2026-103',
    citizenName: 'Sneha Kulkarni',
    phone: '+91 97550 31244',
    language: 'en',
    rawText: 'Severe flooding outside hospital entrance due to burst pipeline. Stagnant pressure drop in entire residential colony behind it.',
    translatedText: 'Severe flooding outside hospital entrance due to burst pipeline. Stagnant pressure drop in entire residential colony behind it.',
    category: 'Water & Sewage',
    subcategory: 'Main Line Rupture',
    wardId: 'WARD-04',
    wardName: 'Ward 4 - Vijay Nagar North',
    latitude: 22.7543,
    longitude: 75.8909,
    address: 'Gate 2, District Hospital Perimeter, Ward 4',
    timestamp: '2026-10-08T20:10:00Z',
    confidenceScore: 92,
    missingDetails: [],
    isDuplicateOf: 'CMP-2026-101',
    incidentId: 'INC-2026-001'
  },

  // Cluster 2: Live Electric Wire sparking near Primary School
  {
    id: 'CMP-2026-104',
    citizenName: 'Vandana Joshi',
    phone: '+91 99260 77112',
    language: 'hinglish',
    rawText: 'Saraswati Bal Mandir school ke bahar transformer se taar toot kar latak gaya hai. Spark ho raha hai aur bacche chhutti ke waqt yahan se nikalte hain.',
    translatedText: 'Snapping overhead wire hanging from transformer outside Saraswati Bal Mandir school. Continuous sparking near school dismissal zone.',
    category: 'Electricity & Lighting',
    subcategory: 'Live Wire Snapped',
    wardId: 'WARD-09',
    wardName: 'Ward 9 - Rajwada Central',
    latitude: 22.7215,
    longitude: 75.8590,
    address: 'Lane 3, Behind Sarafa Bazaar, Ward 9',
    timestamp: '2026-10-08T20:45:00Z',
    confidenceScore: 98,
    missingDetails: [],
    incidentId: 'INC-2026-002'
  },
  {
    id: 'CMP-2026-105',
    citizenName: 'Mohd. Imran',
    phone: '+91 91110 44230',
    language: 'hi',
    rawText: 'बिजली का तार जमीन छू रहा है स्कूल की दीवार के पास। तुरंत बिजली बंद करवाएं।',
    translatedText: 'Electric cable touching the ground near school boundary wall. Cut power immediately.',
    category: 'Electricity & Lighting',
    subcategory: 'Live Wire Hazard',
    wardId: 'WARD-09',
    wardName: 'Ward 9 - Rajwada Central',
    latitude: 22.7218,
    longitude: 75.8588,
    address: 'Near Old School Boundary, Ward 9',
    timestamp: '2026-10-08T21:05:00Z',
    confidenceScore: 95,
    missingDetails: [],
    isDuplicateOf: 'CMP-2026-104',
    incidentId: 'INC-2026-002'
  },

  // Cluster 3: Blocked Stormwater Drain before heavy monsoon rain forecast
  {
    id: 'CMP-2026-106',
    citizenName: 'Gurdeep Singh',
    phone: '+91 98270 65119',
    language: 'en',
    rawText: 'Main stormwater canal completely choked with plastic and construction debris. Monsoon alert forecast for tomorrow, this will cause 3ft waterlogging in 200 homes.',
    translatedText: 'Main stormwater canal completely choked with plastic and construction debris. Monsoon alert forecast for tomorrow, this will cause 3ft waterlogging in 200 homes.',
    category: 'Water & Sewage',
    subcategory: 'Storm Drain Blockage',
    wardId: 'WARD-12',
    wardName: 'Ward 12 - Sukhlia Industrial Belt',
    latitude: 22.7610,
    longitude: 75.8780,
    address: 'Bridge culvert near Industrial Plot 42, Ward 12',
    timestamp: '2026-10-08T18:00:00Z',
    confidenceScore: 89,
    missingDetails: [],
    incidentId: 'INC-2026-003'
  },
  {
    id: 'CMP-2026-107',
    citizenName: 'Kailash Chouhan',
    phone: '+91 93000 12590',
    language: 'hinglish',
    rawText: 'Nala poora jam hai kachre se. Barish hui to sari factory aur basti me paani ghus jayega.',
    translatedText: 'Storm drain completely jammed with debris. If it rains, water will drown factories and residential slums.',
    category: 'Water & Sewage',
    subcategory: 'Storm Drain Blockage',
    wardId: 'WARD-12',
    wardName: 'Ward 12 - Sukhlia Industrial Belt',
    latitude: 22.7615,
    longitude: 75.8778,
    address: 'Plot 43 Canal Crossway, Ward 12',
    timestamp: '2026-10-08T18:50:00Z',
    confidenceScore: 91,
    missingDetails: [],
    isDuplicateOf: 'CMP-2026-106',
    incidentId: 'INC-2026-003'
  },

  // Incident 4: Deep Potholes causing motorcycle accidents
  {
    id: 'CMP-2026-108',
    citizenName: 'Priya Rathore',
    phone: '+91 97130 99401',
    language: 'en',
    rawText: 'Craters on bypass bridge ramp. Two scooter riders slipped and sustained head injuries in the dark yesterday night due to faulty street lighting.',
    translatedText: 'Craters on bypass bridge ramp. Two scooter riders slipped and sustained head injuries in the dark yesterday night due to faulty street lighting.',
    category: 'Roads & Infrastructure',
    subcategory: 'Hazardous Pothole Cluster',
    wardId: 'WARD-17',
    wardName: 'Ward 17 - Chhoti Gwaltoli (Old City)',
    latitude: 22.7150,
    longitude: 75.8670,
    address: 'Railway Overbridge Exit, Ward 17',
    timestamp: '2026-10-08T17:15:00Z',
    confidenceScore: 86,
    missingDetails: [],
    incidentId: 'INC-2026-004'
  },

  // Incident 5: Chronic Neglect in Under-Reported Ward (Ward 23)
  {
    id: 'CMP-2026-109',
    citizenName: 'Sundarlal Patel',
    phone: '+91 94060 22180',
    language: 'hi',
    rawText: 'बाणगंगा बस्ती में 15 दिनों से कचरा गाड़ी नहीं आई है। मुख्य चौराहे पर सड़ांध मार रहा है, डेंगू के मरीज निकल रहे हैं। कोई अधिकारी नहीं सुन रहा।',
    translatedText: 'Garbage collection truck has not visited Banganga settlement for 15 days. Rotten heap at main crossway, dengue cases spreading. No officer responds.',
    category: 'Solid Waste',
    subcategory: 'Uncollected Garbage Dump',
    wardId: 'WARD-23',
    wardName: 'Ward 23 - Banganga Colony',
    latitude: 22.7420,
    longitude: 75.8450,
    address: 'Chowk No 3, Banganga Sector B, Ward 23',
    timestamp: '2026-10-08T12:00:00Z',
    confidenceScore: 93,
    missingDetails: [],
    incidentId: 'INC-2026-005'
  }
];

export const INITIAL_UNIFIED_INCIDENTS: UnifiedIncident[] = [
  {
    id: 'INC-2026-001',
    incidentNumber: 'URB-IND-26-01',
    title: 'Hospital Corridor Main Pipeline Burst & Impending Road Collapse',
    description: 'High-pressure 600mm potable water transmission line ruptured directly in front of the District Hospital trauma entrance. Water is advancing toward the emergency ward, ambulance ingress is blocked, and subsurface erosion threatens asphalt collapse.',
    category: 'Water & Sewage',
    department: 'Water & Sewage',
    wardId: 'WARD-04',
    wardName: 'Ward 4 - Vijay Nagar North',
    latitude: 22.7540,
    longitude: 75.8912,
    address: 'AB Road, Opposite District Hospital Emergency Wing',
    status: 'investigating',
    urgency: 'critical',
    complaintCount: 3,
    complaintIds: ['CMP-2026-101', 'CMP-2026-102', 'CMP-2026-103'],
    evidencePhotos: [],
    firstReportedAt: '2026-10-08T19:30:00Z',
    lastUpdatedAt: '2026-10-08T20:10:00Z',
    affectedPopulationEstimate: 12500,
    nearbyCriticalInfrastructure: ['District Hospital (50m)', 'Trauma Centre (80m)', 'Metro Pillar 142 (120m)'],
    rootCauseHypothesis: 'Aging cast-iron transmission trunk fractured under traffic vibration combined with water hammer pressure surge.',
    weatherEscalationRisk: 'moderate',
    slaBreachRiskPercent: 88,
    priorityScore: {
      urgency: 95,      // U
      impact: 92,       // I (Critical hospital road)
      safety: 90,       // S (Ambulance disruption + collapse risk)
      waitingTime: 65,  // W (~4 hours elapsed)
      confidence: 94,   // C (3 verified independent citizen reports)
      environmental: 70,// E (Millions of liters treated water wasted)
      totalScore: 88.7, // 0.25(95) + 0.25(92) + 0.20(90) + 0.10(65) + 0.10(94) + 0.10(70) = 23.75+23+18+6.5+9.4+7 = 87.65
      formulaExplanation: 'Scored 88/100: Emergency medical corridor blockage (+24), life-safety ambulance delay (+18), multi-report evidence consensus (+9.4).'
    },
    priorityHistory: [
      {
        id: 'EVT-01',
        timestamp: '2026-10-08T19:30:00Z',
        previousScore: 0,
        newScore: 78.5,
        reason: 'Initial report processed from Dr. Alok Verma with high civic urgency.',
        author: 'AI_DYNAMIC_RECALC'
      },
      {
        id: 'EVT-02',
        timestamp: '2026-10-08T19:42:00Z',
        previousScore: 78.5,
        newScore: 84.2,
        reason: 'Duplicate fusion: Second citizen report confirmed road collapse hazard under traffic.',
        author: 'NEW_EVIDENCE'
      },
      {
        id: 'EVT-03',
        timestamp: '2026-10-08T20:10:00Z',
        previousScore: 84.2,
        newScore: 88.7,
        reason: 'Fused 3rd complaint confirming water ingress into hospital perimeter. Safety score elevated to 90.',
        author: 'AI_DYNAMIC_RECALC'
      }
    ],
    assignedTeamId: 'TEAM-WAT-01',
    assignedTeamName: 'Jal Seva Rapid Response Team A'
  },
  {
    id: 'INC-2026-002',
    incidentNumber: 'URB-IND-26-02',
    title: 'High-Voltage Snapped Cable Sparking at School Dismissal Gate',
    description: '11kV distribution line detached from transformer pole, hanging low across the primary pedestrian pathway outside Saraswati Bal Mandir School. Arc sparking observed during damp atmospheric conditions.',
    category: 'Electricity & Lighting',
    department: 'Electricity & Lighting',
    wardId: 'WARD-09',
    wardName: 'Ward 9 - Rajwada Central',
    latitude: 22.7215,
    longitude: 75.8590,
    address: 'Lane 3, Outside Primary School, Sarafa Zone',
    status: 'open',
    urgency: 'critical',
    complaintCount: 2,
    complaintIds: ['CMP-2026-104', 'CMP-2026-105'],
    evidencePhotos: [],
    firstReportedAt: '2026-10-08T20:45:00Z',
    lastUpdatedAt: '2026-10-08T21:05:00Z',
    affectedPopulationEstimate: 850,
    nearbyCriticalInfrastructure: ['Saraswati Bal Mandir (15m)', 'Local Anganwadi Centre (40m)'],
    rootCauseHypothesis: 'Overheating of distribution transformer bushing connector caused terminal fatigue failure.',
    weatherEscalationRisk: 'severe',
    slaBreachRiskPercent: 95,
    priorityScore: {
      urgency: 98,
      impact: 85,
      safety: 99,
      waitingTime: 50,
      confidence: 96,
      environmental: 65,
      totalScore: 92.8,
      formulaExplanation: 'Scored 93/100: Extreme electrocution risk to schoolchildren (Safety: 99), instant AI escalation override activated.'
    },
    priorityHistory: [
      {
        id: 'EVT-10',
        timestamp: '2026-10-08T20:45:00Z',
        previousScore: 0,
        newScore: 91.0,
        reason: 'Direct safety override: Live high-voltage wire near school ground.',
        author: 'AI_DYNAMIC_RECALC'
      },
      {
        id: 'EVT-11',
        timestamp: '2026-10-08T21:05:00Z',
        previousScore: 91.0,
        newScore: 92.8,
        reason: 'Fused second complaint confirming cable is contacting grounded wet surface.',
        author: 'NEW_EVIDENCE'
      }
    ],
    assignedTeamId: 'TEAM-ELE-01',
    assignedTeamName: 'Grid Safety High-Voltage Unit'
  },
  {
    id: 'INC-2026-003',
    incidentNumber: 'URB-IND-26-03',
    title: 'Major Stormwater Culvert Blockage with Inbound Monsoon Surge',
    description: 'Choked industrial stormwater canal culvert under Sukhlia bridge. Heavy construction waste and plastic blockage prevents water flow. High rainfall forecast within 12 hours threatens massive flooding across 200 tenements.',
    category: 'Water & Sewage',
    department: 'Water & Sewage',
    wardId: 'WARD-12',
    wardName: 'Ward 12 - Sukhlia Industrial Belt',
    latitude: 22.7610,
    longitude: 75.8780,
    address: 'Bridge culvert near Industrial Plot 42',
    status: 'open',
    urgency: 'high',
    complaintCount: 2,
    complaintIds: ['CMP-2026-106', 'CMP-2026-107'],
    evidencePhotos: [],
    firstReportedAt: '2026-10-08T18:00:00Z',
    lastUpdatedAt: '2026-10-08T18:50:00Z',
    affectedPopulationEstimate: 3400,
    nearbyCriticalInfrastructure: ['Industrial Power Substation (200m)', 'Worker Settlement Basti (80m)'],
    rootCauseHypothesis: 'Illegal nighttime dumping of industrial packaging and construction debris into open canal.',
    weatherEscalationRisk: 'severe',
    slaBreachRiskPercent: 72,
    priorityScore: {
      urgency: 80,
      impact: 84,
      safety: 75,
      waitingTime: 70,
      confidence: 90,
      environmental: 92, // Severe environmental risk due to forecast
      totalScore: 81.2,
      formulaExplanation: 'Scored 81/100: High environmental factor (+9.2) due to weather forecast multiplier; delayed clearing will trigger flash inundation.'
    },
    priorityHistory: [
      {
        id: 'EVT-20',
        timestamp: '2026-10-08T18:00:00Z',
        previousScore: 0,
        newScore: 68.0,
        reason: 'Reported as routine drain obstruction.',
        author: 'AI_DYNAMIC_RECALC'
      },
      {
        id: 'EVT-21',
        timestamp: '2026-10-08T18:30:00Z',
        previousScore: 68.0,
        newScore: 81.2,
        reason: 'Weather Intelligence Alert triggered: Heavy rain warning within 12h elevated environmental factor from 40 to 92.',
        author: 'WEATHER_ALERT'
      }
    ]
  },
  {
    id: 'INC-2026-004',
    incidentNumber: 'URB-IND-26-04',
    title: 'Accident-Prone Pothole Craters on Unlit Flyover Descent',
    description: 'Multiple deep potholes (depth > 12cm) right at the high-speed descent curvature of Railway Overbridge. In combination with non-functional street lamps, two vehicular accidents were recorded last night.',
    category: 'Roads & Infrastructure',
    department: 'Roads & Infrastructure',
    wardId: 'WARD-17',
    wardName: 'Ward 17 - Chhoti Gwaltoli (Old City)',
    latitude: 22.7150,
    longitude: 75.8670,
    address: 'Railway Overbridge Exit Ramp, Ward 17',
    status: 'assigned',
    urgency: 'high',
    complaintCount: 1,
    complaintIds: ['CMP-2026-108'],
    evidencePhotos: [],
    firstReportedAt: '2026-10-08T17:15:00Z',
    lastUpdatedAt: '2026-10-08T17:15:00Z',
    affectedPopulationEstimate: 9500,
    nearbyCriticalInfrastructure: ['Indore Junction Railway Station (400m)'],
    rootCauseHypothesis: 'Sub-base moisture penetration after asphalt seal degradation under heavy bus transit load.',
    weatherEscalationRisk: 'moderate',
    slaBreachRiskPercent: 45,
    priorityScore: {
      urgency: 72,
      impact: 78,
      safety: 85,
      waitingTime: 62,
      confidence: 86,
      environmental: 40,
      totalScore: 73.3,
      formulaExplanation: 'Scored 73/100: Elevated safety risk (85) due to verified head injury accident reports and dark blind curvature.'
    },
    priorityHistory: [
      {
        id: 'EVT-30',
        timestamp: '2026-10-08T17:15:00Z',
        previousScore: 0,
        newScore: 73.3,
        reason: 'Classified under hazardous road defects with casualty history.',
        author: 'AI_DYNAMIC_RECALC'
      }
    ],
    assignedTeamId: 'TEAM-ROD-01',
    assignedTeamName: 'Highway & Pothole Quick-Pave Unit'
  },
  {
    id: 'INC-2026-005',
    incidentNumber: 'URB-IND-26-05',
    title: '15-Day Chronic Municipal Waste Accumulation in High-Density Settlement',
    description: 'Over 8 metric tons of decomposing municipal solid waste overflowing in Banganga Chowk. Stray animals and vector breeding confirmed. Detected by Fairness Engine as severely overdue service disparity.',
    category: 'Solid Waste',
    department: 'Solid Waste',
    wardId: 'WARD-23',
    wardName: 'Ward 23 - Banganga Colony',
    latitude: 22.7420,
    longitude: 75.8450,
    address: 'Chowk No 3, Banganga Sector B, Ward 23',
    status: 'open',
    urgency: 'medium',
    complaintCount: 1,
    complaintIds: ['CMP-2026-109'],
    evidencePhotos: [],
    firstReportedAt: '2026-10-08T12:00:00Z',
    lastUpdatedAt: '2026-10-08T12:00:00Z',
    affectedPopulationEstimate: 18000,
    nearbyCriticalInfrastructure: ['Community Health Dispensary (120m)'],
    rootCauseHypothesis: 'Route vehicle breakdown coupled with driver redeployment to central festival zones.',
    weatherEscalationRisk: 'moderate',
    slaBreachRiskPercent: 92,
    priorityScore: {
      urgency: 65,
      impact: 88,       // High population density
      safety: 60,
      waitingTime: 95,   // Waiting time extreme (15 days overdue)
      confidence: 93,
      environmental: 75,
      totalScore: 76.55,
      formulaExplanation: 'Scored 77/100: Boosted by severe waiting time penalty (95) and Under-Served Ward Fairness Alert (Ward 23).'
    },
    priorityHistory: [
      {
        id: 'EVT-40',
        timestamp: '2026-10-08T12:00:00Z',
        previousScore: 0,
        newScore: 62.0,
        reason: 'Initial citizen complaint received from under-reported ward.',
        author: 'AI_DYNAMIC_RECALC'
      },
      {
        id: 'EVT-41',
        timestamp: '2026-10-08T14:00:00Z',
        previousScore: 62.0,
        newScore: 76.55,
        reason: 'Fairness Engine Boost: Ward 23 flagged for 46h avg delay and 84% under-reporting disparity.',
        author: 'AI_DYNAMIC_RECALC'
      }
    ]
  }
];

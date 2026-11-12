// ---------- Sample data ----------
const WH_USERS = {
  admin:    { id:'u1', name:'Marcus Bennett', first:'Marcus', email:'m.bennett@tuckerops.com', role:'admin', roleLabel:'Administrator', title:'Operations Director', photo:'assets/p1.jpg', site:'All sites' },
  manager:  { id:'u2', name:'Daniel Reyes',  first:'Daniel', email:'d.reyes@tuckerops.com',  role:'manager', roleLabel:'Manager', title:'Site Manager · North Depot', photo:'assets/p2.jpg', site:'North Depot' },
  employee: { id:'u3', name:'Amara Okafor',  first:'Amara',  email:'a.okafor@tuckerops.com', role:'employee', roleLabel:'Employee', title:'Safety Technician', photo:'assets/p3.jpg', site:'North Depot' },
};

const WH_PERMS = {
  admin:    { attendance:true, approve:true, assign:true, analytics:true, allRecords:true, manageUsers:true, integrations:true, integrationsEdit:true },
  manager:  { attendance:true, approve:true, assign:true, analytics:true, allRecords:true, manageUsers:false, integrations:true, integrationsEdit:false },
  employee: { attendance:false, approve:false, assign:false, analytics:false, allRecords:false, manageUsers:false, integrations:false, integrationsEdit:false },
};

const WH_STAFF = [
  { id:'u3', name:'Amara Okafor', role:'Safety Technician', dept:'Safety', photo:'assets/p3.jpg', status:'in', inAt:'07:02', hours:'—', site:'North Depot' },
  { id:'s2', name:'Sofia Marchetti', role:'Quality Inspector', dept:'Quality', photo:'assets/p4.jpg', status:'in', inAt:'06:55', hours:'—', site:'North Depot' },
  { id:'s3', name:'Jordan Whitfield', role:'Forklift Operator', dept:'Warehouse', initials:'JW', status:'break', inAt:'06:48', hours:'—', site:'North Depot' },
  { id:'s4', name:'Priya Raman', role:'Maintenance Tech', dept:'Maintenance', initials:'PR', status:'in', inAt:'07:15', hours:'—', site:'East Yard' },
  { id:'s5', name:'Luis Ortega', role:'Dock Lead', dept:'Warehouse', initials:'LO', status:'late', inAt:'08:41', hours:'—', site:'North Depot' },
  { id:'s6', name:'Hannah Cho', role:'Electrician', dept:'Maintenance', initials:'HC', status:'absent', inAt:'—', hours:'—', site:'East Yard', note:'Sick leave' },
  { id:'s7', name:'Tom Gallagher', role:'Driver', dept:'Logistics', initials:'TG', status:'out', inAt:'05:30', outAt:'13:58', hours:'8.0h', site:'North Depot' },
  { id:'s8', name:'Kemi Adeyemi', role:'Inventory Clerk', dept:'Warehouse', initials:'KA', status:'in', inAt:'07:30', hours:'—', site:'North Depot' },
  { id:'s9', name:'Ethan Brooks', role:'Forklift Operator', dept:'Warehouse', initials:'EB', status:'absent', inAt:'—', hours:'—', site:'East Yard', note:'Not yet clocked in' },
  { id:'s10', name:'Grace Liu', role:'Quality Inspector', dept:'Quality', initials:'GL', status:'in', inAt:'06:58', hours:'—', site:'East Yard' },
];

const WH_TIMESHEETS = [
  { id:'ts1', name:'Amara Okafor', uid:'u3', week:'Nov 9 – 13', hours:38.5, ot:0, status:'pending' },
  { id:'ts2', name:'Sofia Marchetti', uid:'s2', week:'Nov 9 – 13', hours:41.0, ot:1.0, status:'pending' },
  { id:'ts3', name:'Jordan Whitfield', uid:'s3', week:'Nov 9 – 13', hours:40.0, ot:0, status:'approved' },
  { id:'ts4', name:'Priya Raman', uid:'s4', week:'Nov 9 – 13', hours:36.25, ot:0, status:'pending' },
  { id:'ts5', name:'Luis Ortega', uid:'s5', week:'Nov 9 – 13', hours:43.5, ot:3.5, status:'review' },
  { id:'ts6', name:'Tom Gallagher', uid:'s7', week:'Nov 9 – 13', hours:40.0, ot:0, status:'approved' },
];

// Amara's week (Mon-Sun), hours
const WH_WEEK = [
  { d:'Mon', date:'Nov 9', h:8.25, in:'07:00', out:'15:45', brk:30 },
  { d:'Tue', date:'Nov 10', h:7.75, in:'07:05', out:'15:20', brk:30 },
  { d:'Wed', date:'Nov 11', h:8.5, in:'06:55', out:'16:10', brk:45 },
  { d:'Thu', date:'Nov 12', h:8.0, in:'07:00', out:'15:30', brk:30 },
  { d:'Fri', date:'Nov 13', h:0, today:true },
  { d:'Sat', date:'Nov 14', h:0, future:true },
  { d:'Sun', date:'Nov 15', h:0, future:true },
];

const WH_CATEGORIES = [
  { id:'safety', name:'Workplace Safety', icon:'shield', items:['Emergency exits clear and signed','Fire extinguishers charged & tagged','First-aid kit fully stocked','PPE available at station','Walkways free of obstruction','Spill kits accessible'] },
  { id:'equip', name:'Equipment', icon:'wrench', items:['Forklift brakes & horn functional','Hydraulic lines show no leaks','Battery charge above 80%','Load chart visible on unit','Seat belt operational'] },
  { id:'fleet', name:'Vehicle / Fleet', icon:'truck', items:['Tyre tread & pressure within spec','Lights and indicators working','Fluid levels topped up','Dashcam recording','Load secured and strapped'] },
  { id:'quality', name:'Quality Control', icon:'badge', items:['Sample batch labelled correctly','Packaging free of damage','Temperature log within range','Lot numbers recorded'] },
  { id:'facility', name:'Facility', icon:'building', items:['HVAC operating normally','Lighting fully functional','Restrooms sanitised','Loading dock doors seal properly','Security cameras online'] },
];

const WH_LOCATIONS = ['North Depot · Bay 3','North Depot · Loading Dock','North Depot · Cold Storage','East Yard · Workshop','East Yard · Fleet Bay','Head Office · Floor 2'];

const WH_INSPECTIONS = [
  { id:'INS-2481', cat:'safety', title:'Weekly Fire Safety Walkthrough', loc:'North Depot · Bay 3', who:'Amara Okafor', uid:'u3', date:'Nov 13, 2026', time:'09:12', status:'passed', score:'6/6', items:6, failed:0 },
  { id:'INS-2480', cat:'equip', title:'Forklift FL-07 Pre-shift Check', loc:'North Depot · Loading Dock', who:'Jordan Whitfield', uid:'s3', date:'Nov 13, 2026', time:'07:20', status:'failed', score:'3/5', items:5, failed:2 },
  { id:'INS-2479', cat:'quality', title:'Cold Chain Batch #C-1182', loc:'North Depot · Cold Storage', who:'Sofia Marchetti', uid:'s2', date:'Nov 12, 2026', time:'15:40', status:'attention', score:'3/4', items:4, failed:0 },
  { id:'INS-2478', cat:'fleet', title:'Van TK-14 Monthly Inspection', loc:'East Yard · Fleet Bay', who:'Tom Gallagher', uid:'s7', date:'Nov 12, 2026', time:'11:05', status:'passed', score:'5/5', items:5, failed:0 },
  { id:'INS-2477', cat:'facility', title:'East Yard Workshop Facility Audit', loc:'East Yard · Workshop', who:'Priya Raman', uid:'s4', date:'Nov 11, 2026', time:'14:22', status:'passed', score:'5/5', items:5, failed:0 },
  { id:'INS-2476', cat:'safety', title:'PPE Compliance Spot Check', loc:'North Depot · Loading Dock', who:'Amara Okafor', uid:'u3', date:'Nov 10, 2026', time:'10:48', status:'attention', score:'5/6', items:6, failed:0 },
  { id:'INS-2475', cat:'equip', title:'Pallet Jack PJ-03 Check', loc:'North Depot · Bay 3', who:'Kemi Adeyemi', uid:'s8', date:'Nov 10, 2026', time:'08:15', status:'passed', score:'5/5', items:5, failed:0 },
  { id:'INS-2474', cat:'safety', title:'Spill Kit & Eyewash Audit', loc:'East Yard · Workshop', who:'Amara Okafor', uid:'u3', date:'Nov 7, 2026', time:'13:30', status:'passed', score:'6/6', items:6, failed:0 },
];

const WH_ASSIGNED = [
  { id:'A-311', cat:'safety', title:'Monthly Emergency Lighting Test', loc:'North Depot · Bay 3', who:'Amara Okafor', uid:'u3', due:'Today, 14:00', status:'scheduled' },
  { id:'A-312', cat:'facility', title:'Loading Dock Door Seal Check', loc:'North Depot · Loading Dock', who:'Amara Okafor', uid:'u3', due:'Nov 14', status:'scheduled' },
  { id:'A-313', cat:'equip', title:'Forklift FL-07 Re-inspection', loc:'North Depot · Loading Dock', who:'Jordan Whitfield', uid:'s3', due:'Today, 12:00', status:'scheduled' },
  { id:'A-314', cat:'fleet', title:'Van TK-09 Brake Inspection', loc:'East Yard · Fleet Bay', who:'Tom Gallagher', uid:'s7', due:'Nov 15', status:'scheduled' },
  { id:'A-315', cat:'quality', title:'Inbound Pallet QC — PO 77120', loc:'North Depot · Cold Storage', who:'Sofia Marchetti', uid:'s2', due:'Nov 14', status:'scheduled' },
];

const WH_ACTIVITY = [
  { type:'in', t:'Luis Ortega clocked in', s:'North Depot · 41 min late', time:'08:41', priv:true },
  { type:'insp', t:'INS-2481 Fire Safety Walkthrough submitted', s:'Amara Okafor · Passed 6/6', time:'09:12', uid:'u3' },
  { type:'fail', t:'INS-2480 Forklift FL-07 failed 2 items', s:'Jordan Whitfield · Re-inspection assigned', time:'07:20', priv:true },
  { type:'in', t:'Kemi Adeyemi clocked in', s:'North Depot', time:'07:30', priv:true },
  { type:'sys', t:'Sheets export scheduled for 18:00', s:'Timesheets_Nov_W2 · Google Sheets', time:'07:00' },
  { type:'out', t:'Tom Gallagher clocked out', s:'Early shift · 8.0 h', time:'13:58', priv:true },
  { type:'in', t:'You clocked in', s:'North Depot · on time', time:'07:02', uid:'u3', self:true },
];

const WH_NOTIFS = [
  { t:'Inspection due today', s:'Monthly Emergency Lighting Test — 14:00', time:'2h ago', unread:true, go:'assigned' },
  { t:'Timesheet reminder', s:'Submit week Nov 9–13 by Friday 17:00', time:'4h ago', unread:true, go:'timesheets' },
  { t:'Forklift FL-07 flagged', s:'Failed pre-shift check — out of service', time:'5h ago', unread:false, go:'history', priv:true },
  { t:'Policy update', s:'Updated PPE guidelines in Drive › Safety', time:'Yesterday', unread:false, go:'integrations' },
];

// Analytics by period
const WH_ANALYTICS = {
  week: {
    label:'This week', att:[{l:'Mon',p:92,la:5,a:3},{l:'Tue',p:94,la:3,a:3},{l:'Wed',p:89,la:6,a:5},{l:'Thu',p:95,la:2,a:3},{l:'Fri',p:83,la:7,a:10}],
    hours:1642, hoursD:'+3.1%', rate:87, passed:18, failed:3, attention:4, pending:6, attendance:91,
    byDept:[{l:'Warehouse',v:612},{l:'Maintenance',v:388},{l:'Quality',v:274},{l:'Logistics',v:236},{l:'Safety',v:132}],
  },
  month: {
    label:'This month', att:[{l:'W1',p:93,la:4,a:3},{l:'W2',p:90,la:5,a:5},{l:'W3',p:0,la:0,a:0},{l:'W4',p:0,la:0,a:0}].filter(x=>x.p),
    hours:3410, hoursD:'+1.4%', rate:84, passed:41, failed:7, attention:9, pending:11, attendance:92,
    byDept:[{l:'Warehouse',v:1270},{l:'Maintenance',v:804},{l:'Quality',v:566},{l:'Logistics',v:492},{l:'Safety',v:278}],
  },
  quarter: {
    label:'This quarter', att:[{l:'Sep',p:94,la:3,a:3},{l:'Oct',p:92,la:4,a:4},{l:'Nov',p:91,la:5,a:4}],
    hours:19880, hoursD:'−0.6%', rate:89, passed:212, failed:19, attention:31, pending:11, attendance:92,
    byDept:[{l:'Warehouse',v:7420},{l:'Maintenance',v:4690},{l:'Quality',v:3290},{l:'Logistics',v:2870},{l:'Safety',v:1610}],
  },
};

const WH_SHEET_ROWS = [
  ['2026-11-13','Amara Okafor','07:02','—','In progress','North Depot'],
  ['2026-11-13','Sofia Marchetti','06:55','—','In progress','North Depot'],
  ['2026-11-12','Tom Gallagher','05:30','13:58','8.00','North Depot'],
  ['2026-11-12','Priya Raman','07:10','15:40','8.00','East Yard'],
];

Object.assign(window,{WH_USERS,WH_PERMS,WH_STAFF,WH_TIMESHEETS,WH_WEEK,WH_CATEGORIES,WH_LOCATIONS,WH_INSPECTIONS,WH_ASSIGNED,WH_ACTIVITY,WH_NOTIFS,WH_ANALYTICS,WH_SHEET_ROWS});

// Const for roles
export const ADMIN = 1
export const DUTY_TEAM_MEMBER = 2
export const QI_COMPANY = 3
export const COAST_GUARD = 4
export const VESSEL_VIEWER = 5
export const NASA_NAVY = 6
export const COMPANY_PLAN_MANAGER = 7
export const ACCOUNT_MANAGER = 8
const allRoles = [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, VESSEL_VIEWER, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER]

const assignedRoles = {
  // Normal All Roles Routes
  Lock: [...allRoles],
  Register: [...allRoles],
  Login: [...allRoles],
  'Docx Viewer': [...allRoles],
  Dashboard: [...allRoles],

  // Administration
  Administration: [ADMIN, ACCOUNT_MANAGER],
  'Admin Workflow': [ADMIN, ACCOUNT_MANAGER],
  'Alerts System': [ADMIN],
  'System Reports': [ADMIN, ACCOUNT_MANAGER],
  'Reports ': [ADMIN, ACCOUNT_MANAGER],
  'DB Changes': [ADMIN, ACCOUNT_MANAGER],
  'Active Vessels': [ADMIN, ACCOUNT_MANAGER],
  'No-Contract': [ADMIN, ACCOUNT_MANAGER],
  'Schedule Reports': [ADMIN, ACCOUNT_MANAGER],
  'GSA Files': [ADMIN],

  // Navigate
  Navigate: [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY],
  'COP Map': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Pin Drops': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Latest AIS Positions': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  AIS: [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  Fleets: [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Fleets Detail': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],

  // NPREP
  NPREP: [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER],
  'Tabletop Exercise': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER],
  'Remote Assessment': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER],

  // Companies
  Companies: [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / VRP Express': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Company / General Information': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / Addresses': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / Capabilities': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Company / Affiliates': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / Individuals': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / Vessels': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY, COMPANY_PLAN_MANAGER],
  'Company / Plans': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, ACCOUNT_MANAGER],
  'Company / Files': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Company / Notes': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Company / Billing Info': [ADMIN, ACCOUNT_MANAGER],

  // Plans
  Plans: [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Plan / VRP Express': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Plan / General Information': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Plan / Addresses': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Plan / VRP': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER, COMPANY_PLAN_MANAGER],
  'Plan / Individuals': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Plan / Vessels': [...allRoles],
  'Plan / Files': [...allRoles],
  'Plan / Notes': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],

  // Vessels
  Vessels: [...allRoles],
  'Vessel / VRP Express': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Vessel / General Information': [...allRoles],
  'Vessel / Communication': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, VESSEL_VIEWER, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Vessel / VRP': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Vessel / Construction': [...allRoles],
  'Vessel / Capabilities': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Vessel / AIS Data': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Vessel / Notes': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Vessel / Files': [...allRoles],

  // Vessel Classes
  'Vessel Class': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Vessel Class / General Information': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Vessel Class / Vessels': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Vessel Class / Files': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Vessel Class / Notes': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],

  // Individuals
  Individuals: [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'Individual / General Information': [...allRoles],
  'Individual / Address': [...allRoles],
  'Individual / Capabilities': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, ACCOUNT_MANAGER],
  'Individual / Files': [...allRoles],
  'Individual / Notes': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'Individual / Change Password': [...allRoles],

  // Accounts
  Accounts: [ADMIN, ACCOUNT_MANAGER],
  'Account Managers': [ADMIN, ACCOUNT_MANAGER],

  'Accounts Billing Information': [ADMIN, ACCOUNT_MANAGER],
  'Billing Layout': [ADMIN, ACCOUNT_MANAGER],

  'Vessel Billing Groups': [ADMIN, ACCOUNT_MANAGER],
  'Vessel Billing Group / General Information': [ADMIN, ACCOUNT_MANAGER],
  'Vessel Billing Group / Vessels': [ADMIN, ACCOUNT_MANAGER],
  'Vessel Billing Group / Address': [ADMIN, ACCOUNT_MANAGER],
  'Vessel Billing Group / Notes': [ADMIN, ACCOUNT_MANAGER],

  'Automatic Discounts': [ADMIN, ACCOUNT_MANAGER],

  // Geographic Annexes
  'Geographic Annexes': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'GSAs DJ-S': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
  'GSAs DJ-S A': [ADMIN, DUTY_TEAM_MEMBER, NASA_NAVY, QI_COMPANY, COMPANY_PLAN_MANAGER, ACCOUNT_MANAGER],
}

// Const for Tabs
const companyTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Company / General Information',
    to: 'general',
  },
  {
    title: 'Addresses',
    icon: 'mdi-map-marker',
    name: 'Company / Addresses',
    to: 'addresses',
  },
  {
    title: 'Plans',
    icon: 'mdi-notebook',
    name: 'Company / Plans',
    to: 'plans',
  },
  {
    title: 'Vessels',
    icon: 'mdi-ferry',
    name: 'Company / Vessels',
    to: 'vessels',
  },
  {
    title: 'Capabilities',
    icon: 'mdi-pier-crane',
    name: 'Company / Capabilities',
    to: 'smff',
  },
  {
    title: 'Affiliates',
    icon: 'mdi-domain',
    name: 'Company / Affiliates',
    to: 'affiliates',
  },
  {
    title: 'Individuals',
    icon: 'mdi-account-tie',
    name: 'Company / Individuals',
    to: 'individuals',
  },
  {
    title: 'Billing Info',
    icon: 'mdi-currency-usd',
    name: 'Company / Billing Info',
    to: 'billing-info',
  },
  {
    title: 'Files',
    icon: 'mdi-folder-open',
    name: 'Company / Files',
    to: 'files',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Company / Notes',
    to: 'notes',
  },
]

const planTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Plan / General Information',
    to: 'general',
  },
  {
    title: 'Addresses',
    icon: 'mdi-map-marker',
    name: 'Plan / Addresses',
    to: 'addresses',
  },
  {
    title: 'VRP',
    icon: 'mdi-notebook',
    name: 'Plan / VRP',
    to: 'plan',
  },
  {
    title: 'Individuals',
    icon: 'mdi-account-tie',
    name: 'Plan / Individuals',
    to: 'individuals',
  },
  {
    title: 'Vessels',
    icon: 'mdi-ferry',
    name: 'Plan / Vessels',
    to: 'vessels',
  },
  {
    title: 'Files',
    icon: 'mdi-folder-open',
    name: 'Plan / Files',
    to: 'files',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Plan / Notes',
    to: 'notes',
  },
]

const vesselTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Vessel / General Information',
    to: 'general',
  },
  {
    title: 'Comms',
    icon: 'mdi-phone-dial',
    name: 'Vessel / Communication',
    to: 'communication',
  },
  {
    title: 'VRP',
    icon: 'mdi-notebook-check',
    name: 'Vessel / VRP',
    to: 'vrp',
  },
  {
    title: 'Construction',
    icon: 'mdi-ruler-square',
    name: 'Vessel / Construction',
    to: 'construction',
  },
  {
    title: 'Capabilities',
    icon: 'mdi-pier-crane',
    name: 'Vessel / Capabilities',
    to: 'smff',
  },
  {
    title: 'AIS Data',
    icon: 'mdi-map-marker',
    name: 'Vessel / AIS Data',
    to: 'ais',
  },
  {
    title: 'Files',
    icon: 'mdi-folder-open',
    name: 'Vessel / Files',
    to: 'files',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Vessel / Notes',
    to: 'notes',
  },
]

const individualTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Individual / General Information',
    to: 'general',
  },
  {
    title: 'Address',
    icon: 'mdi-map-marker',
    name: 'Individual / Address',
    to: 'address',
  },
  {
    title: 'Capabilities',
    icon: 'mdi-pier-crane',
    name: 'Individual / Capabilities',
    to: 'smff',
  },
  {
    title: 'Files',
    icon: 'mdi-folder-open',
    name: 'Individual / Files',
    to: 'files',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Individual / Notes',
    to: 'notes',
  },
  {
    title: 'Password',
    icon: 'mdi-lock',
    name: 'Individual / Change Password',
    to: 'change-password',
  },
]

const vesselClassTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Vessel Class / General Information',
    to: 'general',
  },
  {
    title: 'Vessels',
    icon: 'mdi-ferry',
    name: 'Vessel Class / Vessels',
    to: 'vessels',
  },
  {
    title: 'Files',
    icon: 'mdi-folder-open',
    name: 'Vessel Class / Files',
    to: 'files',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Vessel Class / Notes',
    to: 'notes',
  },
]

const vesselBillingGroupTabs = [
  {
    title: 'General',
    icon: 'mdi-information',
    name: 'Vessel Billing Group / General Information',
    to: 'general',
  },
  {
    title: 'Vessels',
    icon: 'mdi-ferry',
    name: 'Vessel Billing Group / Vessels',
    to: 'vessels',
  },
  {
    title: 'Address',
    icon: 'mdi-map-marker',
    name: 'Vessel Billing Group / Address',
    to: 'address',
  },
  {
    title: 'Notes',
    icon: 'mdi-pen',
    name: 'Vessel Billing Group / Notes',
    to: 'notes',
  },
]

// Const for API Guard
const assignedAPIs = {
  'networks/short': [...allRoles],
  'users/internal': [...allRoles],
  'vessels/getVesselInfo': [...allRoles],
  'account-manager/short': [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  fleets: [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER],
  'vessel-class/all-vessel-class': [ADMIN],
  'plans/short': [ADMIN, DUTY_TEAM_MEMBER, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, NASA_NAVY, ACCOUNT_MANAGER],
  'address/countries': [...allRoles],
  'companies/short': [ADMIN, DUTY_TEAM_MEMBER, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, NASA_NAVY, ACCOUNT_MANAGER],
  'address/regions': [...allRoles],
  'vendors/types': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  'vendors/insurers': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  'vendors/providers': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  'vendors/pi': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  'vendors/qi-plan-preparer': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  contacttypes: [...allRoles],
  roles: [...allRoles],
  'plans/planNumber': [...allRoles],
  'zones/short': [...allRoles],
  'vendors/societies': [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER],
  'company/getCompanyInfo': [ADMIN, DUTY_TEAM_MEMBER, COAST_GUARD, QI_COMPANY, COMPANY_PLAN_MANAGER, NASA_NAVY, ACCOUNT_MANAGER],
}

// Util Functions
export const guardRoute = (routeName, role) => {
  return assignedRoles[routeName] ? assignedRoles[routeName].includes(role) : false
}

export const guardAPI = (apiUrl, role) => {
  return assignedAPIs[apiUrl] ? assignedAPIs[apiUrl].includes(role) : false
}

// Check permission for internal/external users
export const isInternal = role => {
  return [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER].includes(role)
}

// Check permission to include vrp data or not
export const includeVrp = role => {
  return [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY].includes(role)
}

export const adminDutyQi = role => {
  return [ADMIN, DUTY_TEAM_MEMBER, QI_COMPANY, ACCOUNT_MANAGER].includes(role)
}

// What is the logged in user's role? Start
export const isAdmin = role => {
  return ADMIN === role
}
export const isDutyTeamMember = role => {
  return DUTY_TEAM_MEMBER === role
}
export const isNasaNavy = role => {
  return NASA_NAVY === role
}
export const isVesselViewer = role => {
  return VESSEL_VIEWER === role
}
export const isCompanyPlanManager = role => {
  return COMPANY_PLAN_MANAGER === role
}
export const isQiCompany = role => {
  return QI_COMPANY === role
}
export const isCoastGuard = role => {
  return COAST_GUARD === role
}
export const isAccountManager = role => {
  return ACCOUNT_MANAGER === role
}
// What is the logged in user's role? End

// Check permission for Companies Tabs
export const checkCompaniesTab = role => {
  return companyTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Plans Tabs
export const checkPlansTab = role => {
  return planTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Vessels Tabs
export const checkVesselsTab = role => {
  return vesselTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Vessel Class Tabs
export const checkVesselClassTab = role => {
  return vesselClassTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Individuals Tabs
export const checkIndividualsTab = role => {
  return individualTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Vessel Billing Group Tabs
export const checkVesselBillingGroupTab = role => {
  return vesselBillingGroupTabs.filter(tab => assignedRoles[tab.name].includes(role))
}

// Check permission for Vessel Files Tab
export const checkVesselFilesTab = (tab, role) => {
  const allTabs = ['Fire Plans', 'Drawings', 'Models', 'RACE', 'Photos', 'Pre-fire Plan Cert', 'Stability Booklet', 'Drills and Exercises']
  const tabs = {
    [ADMIN]: allTabs,
    [DUTY_TEAM_MEMBER]: allTabs,
    [ACCOUNT_MANAGER]: allTabs,
    [NASA_NAVY]: allTabs.filter(tab => tab !== 'RACE' && tab !== 'Drills and Exercises'),
    [COAST_GUARD]: ['Fire Plans', 'Pre-fire Plan Cert', 'Photos'],
    [VESSEL_VIEWER]: ['Fire Plans', 'Pre-fire Plan Cert', 'Photos', 'RACE'],
    [QI_COMPANY]: ['Fire Plans', 'Drawings', 'Pre-fire Plan Cert', 'Stability Booklet', 'Drills and Exercises'],
    [COMPANY_PLAN_MANAGER]: allTabs,
  }

  return tabs[role].includes(tab)
}

export const canSeeIndividuals = (role) => {
  return [ADMIN, DUTY_TEAM_MEMBER, ACCOUNT_MANAGER, NASA_NAVY, COMPANY_PLAN_MANAGER].includes(role)
}

// For DJS and DJS-A Switch
export const djsaStatus = (active) => {
  const djsaSwitch = [
    { text: 'DJS Inactive', active: 1, color: 'error', companyIcon: 'mdi-domain-off', planVesselIcon: 'mdi-shield-off' },
    { text: 'DJS Active', active: 2, color: 'success', companyIcon: 'mdi-domain', planVesselIcon: 'mdi-shield-check' },
    { text: 'DJS-A Active', active: 3, color: 'success', companyIcon: '$djsaCompany', planVesselIcon: 'mdi-shield-check-outline' },
    { text: 'DJS-A Inactive', active: 4, color: 'error', companyIcon: '$djsaInactiveCompany', planVesselIcon: 'mdi-shield-off-outline' },
    { text: 'DJS and DJS-A Active', active: 5, color: 'warning', companyIcon: 'mdi-domain', planVesselIcon: 'mdi-shield-half-full' },
  ]
  return djsaSwitch.find(item => item.active === active)
}

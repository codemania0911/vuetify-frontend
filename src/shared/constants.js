export const MIXINS = {
  networks: { url: 'networks/short', item: 'networks' },
  internalUsers: { url: 'users/internal', item: 'internalUsers' },
  vessels: { url: 'vessels/getVesselInfo', item: 'vessels' },
  accountManagers: { url: 'account-manager/short', item: 'accountManagers' },
  fleets: { url: 'fleets', item: 'fleets' },
  vesselClasses: { url: 'vessel-class/all-vessel-class', item: 'vesselClasses' },
  plans: { url: 'plans/short', item: 'plans' },
  countries: { url: 'address/countries', item: 'countries' },
  companies: { url: 'companies/short', item: 'companies' },
  regions: { url: 'address/regions', item: 'regions' },
  vendorTypes: { url: 'vendors/types', item: 'vendorTypes' },
  insurers: { url: 'vendors/insurers', item: 'insurers' },
  providers: { url: 'vendors/providers', item: 'providers' },
  userTypes: { url: 'contacttypes', item: 'userTypes' },
  roles: { url: 'roles', item: 'roles' },
  planNumbers: { url: 'plans/planNumber', item: 'planNumbers' },
  zones: { url: 'zones/short', item: 'zones' },
  societies: { url: 'vendors/societies', item: 'societies' },
  qis: { url: 'vendors/qi-plan-preparer', item: 'qis' },
  pis: { url: 'vendors/pi', item: 'pis' },
  vesselTypes: { url: 'vessels/types', item: 'vesselTypes' },
  billingModes: { url: 'billing-modes', item: 'billingModes' },
  reports: { url: 'reports/report', item: 'reports' },
}

export const OIL_GROUP = ['I', 'II', 'III', 'IV', 'V']

export const TRUE_FALSE_SOURCE = ['YES', 'NO']

export const BULK_EDITOR_COLUMNS = {
  vessels: (
    companies,
    vesselTypes,
    societies,
    pis,
    insurers,
    providers,
    planNumbers,
  ) => ([
    {
      type: 'dropdown',
      title: 'COMPANY',
      source: companies,
      autocomplete: true,
    },
    {
      type: 'dropdown',
      title: 'Plan Number',
      source: planNumbers,
      autocomplete: true,
    },
    {
      type: 'text',
      title: 'VESSEL NAME',
    },
    {
      type: 'text',
      title: 'IMO #',
    },
    {
      type: 'numeric',
      title: 'OFFICIAL #',
    },
    {
      type: 'dropdown',
      title: 'VESSEL TYPE',
      source: vesselTypes,
      autocomplete: true,
    },
    {
      type: 'dropdown',
      title: 'SOCIETY',
      source: societies,
      autocomplete: true,
    },
    {
      type: 'text',
      title: 'DWT',
    },
    {
      type: 'dropdown',
      title: 'P&I CLUB',
      source: pis,
      autocomplete: true,
    },
    {
      type: 'dropdown',
      title: 'H&M INSURER',
      source: insurers,
      autocomplete: true,
    },
    {
      type: 'text',
      title: 'DECK AREA',
    },
    {
      type: 'text',
      title: 'Largest Cargo Tank',
    },
    {
      type: 'text',
      title: 'Gross Tonnage',
    },
    {
      type: 'dropdown',
      title: 'Oil Group',
      source: OIL_GROUP,
      autocomplete: true,
    },
    {
      type: 'dropdown',
      title: 'Damage Stability',
      source: providers,
      autocomplete: true,
    },
    {
      type: 'dropdown',
      title: 'Tank',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'DJ-S Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'DJ-S A Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'numeric',
      title: 'ID',
      readOnly: true,
    },
  ]),

  companies: (countries) => ([
    {
      type: 'text',
      title: 'Company',
      width: 300,
    },
    {
      type: 'dropdown',
      title: 'DJ-S Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'DJ-S A Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'Network Active',
      readOnly: true,
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'Country',
      readOnly: true,
      source: countries,
      width: 250,
    },
    {
      type: 'numeric',
      title: 'ID',
      readOnly: true,
    },
  ]),

  users: (companies, roles) => ([
    {
      type: 'text',
      title: 'Title',
    },
    {
      type: 'text',
      title: 'First Name',
    },
    {
      type: 'text',
      title: 'Last Name',
    },
    {
      type: 'dropdown',
      title: 'Company',
      source: companies,
      autocomplete: true,
      width: 350,
    },
    {
      type: 'text',
      title: 'Occupation',
      width: 200,
    },
    {
      type: 'dropdown',
      title: 'Role',
      source: roles,
      autocomplete: true,
      width: 250,
    },
    {
      type: 'text',
      title: 'Email',
      width: 250,
    },
    {
      type: 'numeric',
      title: 'Mobile Number',
      width: 200,
    },
    {
      type: 'numeric',
      title: 'ID',
      readOnly: true,
    },
  ]),

  plans: (qi) => ([
    {
      type: 'text',
      title: 'Name',
      width: 200,
    },
    {
      type: 'text',
      title: 'Plan Number',
    },
    {
      type: 'dropdown',
      title: 'QI Company',
      source: qi,
      autocomplete: true,
      width: 250,
    },
    {
      type: 'dropdown',
      title: 'Plan Preparer',
      source: qi,
      autocomplete: true,
      width: 250,
    },
    {
      type: 'dropdown',
      title: 'DJ-S Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'dropdown',
      title: 'DJ-S A Active',
      source: TRUE_FALSE_SOURCE,
    },
    {
      type: 'numeric',
      title: 'ID',
      readOnly: true,
    },
  ]),
}

export const MAIN_PLAN = [
  {
    text: 'Plan Holder',
    value: 'holder',
    showOnMobile: true,
    width: '400px',
  },
  {
    text: 'Number',
    value: 'number',
    showOnMobile: true,
  },
  {
    text: 'VRP Status',
    value: 'vrp_status',
    showOnMobile: false,
    sortable: false,
    internal: true,
  },
  {
    text: 'Exp Date',
    value: 'exp_date',
    showOnMobile: false,
    internal: true,
  },
  {
    text: 'Status',
    value: 'djs_status',
    showOnMobile: true,
  },
  {
    text: 'DJS',
    value: 'djs_vessels',
    badge: 'mdi-ferry',
    showOnMobile: false,
    sortable: false,
  },
  {
    text: 'VRP',
    value: 'vrp_vessels',
    badge: 'mdi-ferry',
    showOnMobile: false,
    sortable: false,
    internal: true,
  },
  {
    text: 'Country',
    value: 'country',
    icon: 'mdi-flag',
    showOnMobile: true,
    sortable: false,
  },
  {
    text: 'Action',
    value: '',
    showOnMobile: false,
    sortable: false,
  },
]

export const MAIN_COMPANY = [
  {
    text: 'Company',
    value: 'name',
    showOnMobile: true,
    width: '400px',
  },
  {
    text: 'Plans',
    value: 'plan_count',
    showOnMobile: true,
  },
  {
    text: 'Status',
    value: 'djs_coverage',
    showOnMobile: true,
    sortable: false,
  },
  {
    text: 'Individuals',
    icon: 'mdi-account-multiple-outline',
    value: 'individuals',
    showOnMobile: false,
    sortable: false,
  },
  {
    text: 'Count of Vessels in Plans',
    value: 'vrp_vessels',
    badge: 'mdi-ferry',
    badgeColor: 'success',
    badgeIcon: 'mdi-notebook',
    showOnMobile: false,
    sortable: false,
  },
  {
    text: 'Count of Vessels not in Plans',
    value: 'djs_vessels',
    badge: 'mdi-ferry',
    showOnMobile: false,
    badgeColor: 'error',
    badgeIcon: 'mdi-notebook',
    sortable: false,
  },
  {
    text: 'Country',
    value: 'country',
    icon: 'mdi-flag',
    showOnMobile: true,
    sortable: false,
  },
]

export const days = [
  { text: 'Sunday', value: 1 },
  { text: 'Monday', value: 2 },
  { text: 'Tuesday', value: 3 },
  { text: 'Wednesday', value: 4 },
  { text: 'Thursday', value: 5 },
  { text: 'Friday', value: 6 },
  { text: 'Saturday', value: 7 },
]

export const dates = () => {
  const dates = []
  let i = 1
  while (i < 29) {
    dates.push({ text: i, value: i })
    i++
  }
  return dates
}

export const billingModes = [
  { route: 'client', title: 'Billing By Client', path: 'djs-client', djs: 1 },
  { route: 'vessel', title: 'Billing By Vessel', path: 'djs-vessel', djs: 1 },
  { route: 'group', title: 'Billing By Group', path: 'djs-group', djs: 1 },

  { route: 'client', title: 'Billing By Client', path: 'djsa-client', djs: 0 },
  { route: 'vessel', title: 'Billing By Vessel', path: 'djsa-vessel', djs: 0 },
  { route: 'group', title: 'Billing By Group', path: 'djsa-group', djs: 0 },
]

export const makeCurrency = (num) => {
  // return with thousand operator and round number
  return num ? '$' + parseInt(num.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
}

export const makeDate = (date) => {
  return date ? new Date(date).toISOString().split('T')[0] : ''
}

export const icons = [
  'mdi-home-map-marker',
  'mdi-map-marker',
  'mdi-map-marker-alert',
  'mdi-map-marker-alert-outline',
  'mdi-map-marker-check',
  'mdi-map-marker-check-outline',
  'mdi-map-marker-circle',
  'mdi-map-marker-distance',
  'mdi-map-marker-down',
  'mdi-map-marker-left',
  'mdi-map-marker-left-outline',
  'mdi-map-marker-minus',
  'mdi-map-marker-minus-outline',
  'mdi-map-marker-multiple',
  'mdi-map-marker-multiple-outline',
  'mdi-map-marker-off',
  'mdi-map-marker-off-outline',
  'mdi-map-marker-outline',
  'mdi-map-marker-path',
  'mdi-map-marker-plus',
  'mdi-map-marker-plus-outline',
  'mdi-map-marker-question',
  'mdi-map-marker-question-outline',
  'mdi-map-marker-radius',
  'mdi-map-marker-radius-outline',
  'mdi-map-marker-remove',
  'mdi-map-marker-remove-outline',
  'mdi-map-marker-remove-variant',
  'mdi-map-marker-right',
  'mdi-map-marker-right-outline',
  'mdi-map-marker-star',
  'mdi-map-marker-star-outline',
  'mdi-map-marker-up',
]

export const statusItems = [
  { text: 'All', value: -1 },
  { text: 'Active DJ-S', value: 2 },
  { text: 'Active DJ-S A', value: 3 },
  { text: 'Inactive DJ-S', value: 1 },
  { text: 'Inactive DJ-S A', value: 4 },
  { text: 'DJS and DJS-A Active', value: 5 },
]

export const resourceProviderItems = [
  { text: 'All', value: -1 },
  { text: 'Provider', value: 1 },
  { text: 'Non-provider', value: 0 },
]

export const vrpItems = [
  { text: 'All', value: -1 },
  { text: 'Authorized', value: 1 },
  { text: 'Not Authorized', value: 0 },
]

export const activeFields = [
  { text: 'DJS and DJS-A Active Status', value: 5 },
  { text: 'DJS Active Status', value: 2 },
  { text: 'DJS-A Active Status', value: 3 },
  { text: 'All Active Statuses', value: -1 },
]

export const includes = [
  { text: 'All', value: null },
  { text: 'Non VRP', value: 1 },
  { text: 'In Plan', value: 0 },
]

export const staticSearch = {
  active_field_id: -1,
  resource_provider: -1,
  include_vrp: -1,
  vrp_status: -1,
  networks: [],
  merge: -1,
  vendors: [],
}

export const userStaticSearch = {
  active: -1,
  companies: [],
  role: 0,
  resource_provider: -1,
}

export const planStaticSearch = {
  active_field_id: -1,
  resource_provider: -1,
  include_vrp: -1,
  vrp_status: -1,
  networks: [],
  merge: -1,
  plan_number: false,
}

export const vesselStaticSearch = {
  active_field_id: -1,
  resource_provider: -1,
  include_vrp: -1,
  company_vessel: 0,
  types: [],
  qi: [],
  pi: [],
  response: [],
  societies: [],
  insurers: [],
  providers: [],
  vendors: [],
  fleets: [],
  vrp_status: -1,
  vrp_comparison: -1,
  companies: [],
  networks: [],
  merge: -1,
}

export const userStatusItems = [
  { text: 'All', value: -1 },
  { text: 'Active', value: 1 },
  { text: 'Inactive', value: 0 },
]

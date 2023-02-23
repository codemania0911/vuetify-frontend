/* eslint-disable */
export const splitMultiDropdownValues = valueString => {
  return valueString
    ? valueString.split(';').map(i => Number(i)).filter(i => Number.isFinite(i))
    : []
}

export const combineMultiDropdownValues = valueArray => {
  return valueArray && valueArray.length > 0
    ? valueArray.join(';')
    : null
}

export const formatNumber = input => {
  if (input === '') return null
  return Number(input)
}

export const getColumnsFromVessels = vessels => vessels.map(({
  company,
  name,
  imo,
  official_number,
  vessel_type_id,
  societies,
  dead_weight,
  pi,
  insurers,
  deck_area,
  oil_tank_volume,
  gross_tonnage,
  oil_group,
  providers,
  tanker,
  active_field_id,
  plan,
  id,
}) => [
  company.id,
  plan.id,
  name,
  imo,
  official_number,
  vessel_type_id,
  combineMultiDropdownValues(societies),
  // societies,
  dead_weight,
  combineMultiDropdownValues(pi),
  // pi,
  combineMultiDropdownValues(insurers),
  // insurers,
  deck_area,
  oil_tank_volume,
  gross_tonnage,
  oil_group,
  combineMultiDropdownValues(providers),
  // providers,
  tanker ? 'YES' : 'NO',
  [2, 5].includes(active_field_id) ? 'YES' : 'NO',
  [3, 5].includes(active_field_id) ? 'YES' : 'NO',
  id,
])

export const getColumnsFromCompanies = companies => companies.map(({
  name,
  active_field_id,
  networks_active,
  country,
  id,
}) => [
  name,
  [2, 5].includes(active_field_id) ? 'YES' : 'NO',
  [3, 5].includes(active_field_id) ? 'YES' : 'NO',
  networks_active ? 'YES' : 'NO',
  country,
  id,
])

export const getColumnsFromUsers = users => users.map(({
  title,
  first_name,
  last_name,
  primary_company_id,
  occupation,
  role_id,
  email,
  mobile_number,
  id,
}) => [
  title,
  first_name,
  last_name,
  primary_company_id,
  occupation,
  role_id,
  email,
  mobile_number,
  id,
])

export const getColumnsFromPlans = users => users.map(({
  plan_holder_name,
  plan_number,
  qi_id,
  plan_preparer_id,
  active_field_id,
  id,
}) => [
  plan_holder_name,
  plan_number,
  qi_id,
  plan_preparer_id,
  [2, 5].includes(active_field_id) ? 'YES' : 'NO',
  [3, 5].includes(active_field_id) ? 'YES' : 'NO',
  id,
])

export const companyColIndex = {
  0: 'name',
  1: 'active_field_id',
  2: 'active_field_id',
  3: 'networks_active',
  4: 'country',
  5: 'id',
}

export const userColIndex = {
  0: 'title',
  1: 'first_name',
  2: 'last_name',
  3: 'primary_company_id',
  4: 'occupation',
  5: 'role_id',
  6: 'email',
  7: 'mobile_number',
  8: 'id',
}

export const vesselColIndex = {
  0: 'company',
  1: 'plan_number',
  2: 'name',
  3: 'imo',
  4: 'official_number',
  5: 'vessel_type_id',
  6: 'societies',
  7: 'dead_weight',
  8: 'pi',
  9: 'insurers',
  10: 'deck_area',
  11: 'oil_tank_volume',
  12: 'gross_tonnage',
  13: 'oil_group',
  14: 'providers',
  15: 'tanker',
  16: 'active_field_id',
  17: 'active_field_id',
  18: 'id',
}

export const planColIndex = {
  0: 'plan_holder_name',
  1: 'plan_number',
  2: 'qi_id',
  3: 'plan_preparer_id',
  4: 'active_field_id',
  5: 'active_field_id',
  6: 'id',
}

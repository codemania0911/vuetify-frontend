import Vue from 'vue'
import Router from 'vue-router'
import cookies from 'js-cookie'
import store from './store'
import { guardRoute } from '@/shared/management'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/pages',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: 'Lock',
          path: 'lock',
          component: () => import('@/views/pages/Lock'),
        },
        {
          name: 'Register',
          path: 'register',
          component: () => import('@/views/pages/Register'),
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: 'Login',
          path: '',
          component: () => import('@/views/pages/Login'),
        },
      ],
    },
    {
      path: '/admin-workflow',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: 'Admin Workflow',
          path: '',
          component: () => import('@/views/pages/AdminWorkflow'),
        },
      ],
    },
    // Doc Viewer
    {
      name: 'Docx Viewer',
      path: '/docxviewer',
      component: () => import('@/views/dashboard/Companies/view/DocxViewer.vue'),
    },
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('@/views/dashboard/Dashboard/Index'),
        },
        // Root level
        {
          name: 'Companies',
          path: 'companies',
          component: () => import('@/views/dashboard/Companies/Index'),
        },
        {
          name: 'Company / VRP Express',
          path: 'companies/:id/vrpexpress',
          component: () => import('@/views/dashboard/Companies/view/VRPImport'),
        },
        {
          name: 'Company Detail',
          path: 'companies/:id',
          redirect: 'companies/:id/general',
          component: () => import('@/views/dashboard/Companies/view/Index'),
          children: [
            {
              name: 'Company / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/Companies/view/General'),
            },
            {
              name: 'Company / Addresses',
              path: 'addresses',
              component: () => import('@/views/dashboard/Companies/view/Addresses'),
            },
            // {
            //   name: 'Company / VRP',
            //   path: 'plan',
            //   component: () => import('@/views/dashboard/Companies/view/VRP'),
            // },
            {
              name: 'Company / Capabilities',
              path: 'smff',
              component: () => import('@/views/dashboard/Companies/view/SMFF'),
            },
            {
              name: 'Company / Affiliates',
              path: 'affiliates',
              component: () => import('@/views/dashboard/Companies/view/Affiliates'),
            },
            {
              name: 'Company / Individuals',
              path: 'individuals',
              component: () => import('@/views/dashboard/Companies/view/Individuals'),
            },
            {
              name: 'Company / Plans',
              path: 'plans',
              component: () => import('@/views/dashboard/Companies/view/Plans'),
            },
            {
              name: 'Company / Vessels',
              path: 'vessels',
              component: () => import('@/views/dashboard/Companies/view/Vessels'),
            },
            // {
            //   name: 'Company / Vessels',
            //   path: 'vessels',
            //   component: () => import('@/views/dashboard/Companies/view/Vessels'),
            // },
            {
              name: 'Company / Files',
              path: 'files',
              component: () => import('@/views/dashboard/Companies/view/Files'),
            },
            {
              name: 'Company / Billing Info',
              path: 'billing-info',
              component: () => import('@/views/dashboard/Companies/view/BillingInfo'),
            },
            {
              name: 'Company / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/components/Notes'),
              props: {
                type: 'companies',
              },
            },
          ],
        },
        // Plans
        {
          name: 'Plans',
          path: 'plans',
          component: () => import('@/views/dashboard/Plans/Index'),
        },
        {
          name: 'Plan / VRP Express',
          path: 'plans/:id/vrpexpress',
          component: () => import('@/views/dashboard/Plans/view/VRPImport'),
        },
        {
          name: 'Plan Detail',
          path: 'plans/:id',
          redirect: 'plans/:id/general',
          component: () => import('@/views/dashboard/Plans/view/Index'),
          children: [
            {
              name: 'Plan / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/Plans/view/General'),
            },
            {
              name: 'Plan / Addresses',
              path: 'addresses',
              component: () => import('@/views/dashboard/Plans/view/Addresses'),
            },
            {
              name: 'Plan / VRP',
              path: 'plan',
              component: () => import('@/views/dashboard/Plans/view/VRP'),
            },
            {
              name: 'Plan / Individuals',
              path: 'individuals',
              component: () => import('@/views/dashboard/Plans/view/Individuals'),
            },
            {
              name: 'Plan / Vessels',
              path: 'vessels',
              component: () => import('@/views/dashboard/Plans/view/Vessels'),
            },
            {
              name: 'Plan / Files',
              path: 'files',
              component: () => import('@/views/dashboard/Plans/view/Files'),
            },
            {
              name: 'Plan / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/components/Notes'),
              props: {
                type: 'plans',
              },
            },
          ],
        },
        {
          name: 'Vessels',
          path: 'vessels',
          component: () => import('@/views/dashboard/Vessels/Index'),
        },
        {
          name: 'Vessel / VRP Express',
          path: 'vessels/:id/vrpexpress',
          component: () => import('@/views/dashboard/Vessels/view/VRPImport'),
        },
        {
          name: 'Vessel Detail',
          path: 'vessels/:id',
          redirect: 'vessels/:id/general',
          component: () => import('@/views/dashboard/Vessels/view/Index'),
          children: [
            {
              name: 'Vessel / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/Vessels/view/General'),
            },
            {
              name: 'Vessel / Communication',
              path: 'communication',
              component: () => import('@/views/dashboard/Vessels/view/Communication'),
            },
            {
              name: 'Vessel / VRP',
              path: 'vrp',
              component: () => import('@/views/dashboard/Vessels/view/VRP'),
            },
            {
              name: 'Vessel / Construction',
              path: 'construction',
              component: () => import('@/views/dashboard/Vessels/view/Construction'),
            },
            {
              name: 'Vessel / Capabilities',
              path: 'smff',
              component: () => import('@/views/dashboard/Vessels/view/SMFF'),
            },
            {
              name: 'Vessel / AIS Data',
              path: 'ais',
              component: () => import('@/views/dashboard/Vessels/view/AIS'),
            },
            {
              name: 'Vessel / Files',
              path: 'files',
              component: () => import('@/views/dashboard/Vessels/view/Files'),
            },
            {
              name: 'Vessel / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/components/Notes'),
              props: {
                type: 'vessels',
              },
            },
          ],
        },

        // Vessel Class
        {
          name: 'Vessel Class',
          path: 'vessel-class',
          component: () => import('@/views/dashboard/VesselClass/Index'),
        },
        {
          name: 'Vessel Class Detail',
          path: 'vessel-class/:id',
          redirect: 'vessel-class/:id/general',
          component: () => import('@/views/dashboard/VesselClass/view/Index'),
          children: [
            {
              name: 'Vessel Class / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/VesselClass/view/General'),
            },
            {
              name: 'Vessel Class / Vessels',
              path: 'vessels',
              component: () => import('@/views/dashboard/VesselClass/view/Vessels'),
            },
            {
              name: 'Vessel Class / Files',
              path: 'files',
              component: () => import('@/views/dashboard/VesselClass/view/Files'),
            },
            {
              name: 'Vessel Class / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/VesselClass/view/Notes'),
            },
          ],
        },

        // Individuals
        {
          name: 'Individuals',
          path: 'individuals',
          component: () => import('@/views/dashboard/Individuals/Index'),
        },
        {
          name: 'Individual Detail',
          path: 'individuals/:id',
          redirect: 'individuals/:id/general',
          component: () => import('@/views/dashboard/Individuals/view/Index'),
          children: [
            {
              name: 'Individual / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/Individuals/view/General'),
            },
            {
              name: 'Individual / Address',
              path: 'address',
              component: () => import('@/views/dashboard/Individuals/view/Address'),
            },
            {
              name: 'Individual / Capabilities',
              path: 'smff',
              component: () => import('@/views/dashboard/Individuals/view/SMFF'),
            },
            {
              name: 'Individual / Files',
              path: 'files',
              component: () => import('@/views/dashboard/Individuals/view/Files'),
            },
            {
              name: 'Individual / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/components/Notes'),
              props: {
                type: 'users',
              },
            },
            {
              name: 'Individual / Change Password',
              path: 'change-password',
              component: () => import('@/views/dashboard/Individuals/view/ChangePassword'),
            },
          ],
        },
        {
          name: 'System Reports',
          path: 'reports',
          redirect: 'reports/reports',
          component: () => import('@/views/dashboard/Reports/Index'),
          children: [
            {
              name: 'Reports ',
              path: 'reports',
              component: () => import('@/views/dashboard/Reports/Reports'),
            },
            {
              name: 'DB Changes',
              path: 'db-changes',
              component: () => import('@/views/dashboard/Reports/DBChanges'),
            },
            {
              name: 'Active Vessels',
              path: 'active-vessels',
              component: () => import('@/views/dashboard/Reports/ActiveVessels'),
            },
            {
              name: 'No-Contract',
              path: 'no-contract',
              component: () => import('@/views/dashboard/Reports/NoContract'),
            },
            {
              name: 'Schedule Reports',
              path: 'schedule',
              component: () => import('@/views/dashboard/Reports/Schedule'),
            },
          ],
        },
        {
          name: 'COP Map',
          path: 'map',
          component: () => import('@/views/dashboard/Map/Index'),
        },
        {
          name: 'Pin Drops',
          path: 'pin-drops',
          component: () => import('@/views/dashboard/Navigate/PinDrops'),
        },
        {
          name: 'Latest AIS Positions',
          path: 'latest-ais-positions',
          component: () => import('@/views/dashboard/Navigate/LatestAISPositions'),
        },
        {
          name: 'Fleets',
          path: 'fleets',
          component: () => import('@/views/dashboard/Fleets/Fleets'),
        },
        {
          name: 'Fleets Detail',
          path: 'fleets/:id',
          component: () => import('@/views/dashboard/Fleets/VesselInformation'),
        },
        {
          name: 'GSAs DJ-S',
          path: 'gsa',
          component: () => import('@/views/dashboard/GSA/Gsa'),
        },
        {
          name: 'GSAs DJ-S A',
          path: 'gsa-a',
          component: () => import('@/views/dashboard/GSA/GsaA'),
        },
        {
          name: 'Alerts System',
          path: 'alerts',
          component: () => import('@/views/dashboard/Alert'),
        },
        {
          name: 'GSA Files',
          path: 'gsa-files',
          component: () => import('@/views/dashboard/Administration/GsaFileIndex'),
        },
        {
          name: 'AIS',
          path: 'ais',
          component: () => import('@/views/dashboard/Ais'),
        },
        {
          name: 'Tabletop Exercise',
          path: 'ttx',
          component: () => import('@/views/dashboard/TabletopExercise'),
        },
        {
          name: 'Remote Assessment',
          path: 'race',
          component: () => import('@/views/dashboard/RemoteAssessment'),
        },

        // Accounts Start -------------------------
        {
          name: 'Account Managers',
          path: 'account-managers',
          component: () => import('@/views/dashboard/Accounts/AccountManagers/Index'),
        },

        // Vessel Billing Groups
        {
          name: 'Vessel Billing Groups',
          path: 'vessel-billing-groups',
          component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/Index'),
        },
        {
          name: 'Vessel Billing Group Detail',
          path: 'vessel-billing-groups/:id',
          redirect: 'vessel-billing-groups/:id/general',
          component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/view/Index'),
          children: [
            {
              name: 'Vessel Billing Group / General Information',
              path: 'general',
              component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/view/General'),
            },
            {
              name: 'Vessel Billing Group / Vessels',
              path: 'vessels',
              component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/view/Vessels'),
            },
            {
              name: 'Vessel Billing Group / Address',
              path: 'address',
              component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/view/Address'),
            },
            {
              name: 'Vessel Billing Group / Notes',
              path: 'notes',
              component: () => import('@/views/dashboard/Accounts/VesselBillingGroups/view/Notes'),
            },
          ],
        },

        {
          name: 'Automatic Discounts',
          path: 'discounts',
          component: () => import('@/views/dashboard/Accounts/Discounts/Index'),
        },
        {
          name: 'Accounts Billing Information',
          path: 'accounts-billing-info',
          component: () => import('@/views/dashboard/Accounts/BillingInfo/Index'),
        },
        {
          name: 'Billing Layout',
          path: 'accounts-billing-info/:mode',
          component: () => import('@/views/dashboard/Accounts/BillingInfo/components/BillingLayout'),
        },
        // Accounts End -------------------------
      ],
    },
    {
      path: '*',
      component: () => import('@/views/pages/Index'),
      children: [
        {
          name: '404 Error',
          path: '',
          component: () => import('@/views/pages/Error'),
        },
      ],
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !cookies.get('cdt-token')) {
    next('/login')
  }

  if (to.path === '/login' && cookies.get('cdt-token')) {
    return next('/')
  }

  if (to.path !== '/login') {
    if (store.state.authentication.role) {
      if (!guardRoute(to.name, store.state.authentication.role.id)) return next('/')
    } else {
      store.watch(state => state.authentication.role, (role) => {
        if (role && !guardRoute(to.name, role.id)) return next('/')
      })
    }
  }
  next()
})

import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Dashboard } from './dashboard/dashboard';
import { AdminPanel} from './admin-panel/admin-panel';
import { EnergyMonitoring } from './energy-monitoring/energy-monitoring';
import { InfrastructureReporting } from './infrastructure-reporting/infrastructure-reporting';
import { PublicTransportTracking} from './public-transport-tracking/public-transport-tracking';
import { SmartTrafficManagement } from './smart-traffic-management/smart-traffic-management';
import { WasteManagement} from './waste-management/waste-management';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
{
path: '',
redirectTo: 'home',
pathMatch: 'full',
},
{
path: 'home',
component: Home,
},
{
path: 'dashboard',
component: Dashboard,
},
{
path: 'admin-panel',
component: AdminPanel,
},
{
path: 'energy-monitoring',
component: EnergyMonitoring,
},
{
path: 'infrastructure-reporting',
component: InfrastructureReporting,
},
{
path: 'public-transport-tracking',
component: PublicTransportTracking,
},
{
path: 'smart-traffic-management',
component: SmartTrafficManagement,
},
{
path: 'waste-management',
component: WasteManagement,
},
{
path: '**',
component: NotFound,
},
];
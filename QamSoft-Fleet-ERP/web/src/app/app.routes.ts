// import { Routes } from '@angular/router';

// import { Vehicles } from './pages/fleet/vehicles/vehicles';
// export const routes: Routes = [{
//     path: 'fleet/vehicles',
//     component: Vehicles
//   }];
import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Vehicles } from './pages/fleet/vehicles/vehicles';
import { Drivers } from './pages/fleet/drivers/drivers';
//import { GpsDevices } from './pages/fleet/gps-devices/gps-devices';
import { GpsDevices } from './pages/fleet/gps-devices/gps-devices';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'fleet/vehicles',
        component: Vehicles,
      },
      {
        path: 'fleet/drivers',
        component: Drivers,
      },
            {
        path: 'fleet/gpsdevices',
        component: GpsDevices,
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];

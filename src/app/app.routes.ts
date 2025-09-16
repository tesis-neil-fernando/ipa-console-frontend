import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './sites/home/home';
import { Processes } from './sites/processes/processes';
import { Logs } from './sites/logs/logs';
import { Settings } from './sites/settings/settings';
import { Login } from './sites/login/login';
import { Dashboard } from './sites/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'dashboard', component: Dashboard},
            { path: 'processes', component: Processes },
            { path: 'logs', component: Logs },
            { path: 'settings', component: Settings }
        ]
    },
    {
        path: 'login',
        component: Login
    }
];

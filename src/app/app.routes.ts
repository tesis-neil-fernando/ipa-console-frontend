import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './sites/home/home';
import { Processes } from './sites/processes/processes';
import { Logs } from './sites/logs/logs';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'processes', component: Processes },
            { path: 'logs', component: Logs },
        ]
    }
];

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-sidebar',
//   imports: [RouterLink, RouterLinkActive],
//   templateUrl: './sidebar.html',
//   styleUrl: './sidebar.scss',
// })
// export class Sidebar {

// }

interface MenuNode {
  name: string;
  route?: string;
  children?: MenuNode[];
}

@Component({
  selector: 'app-sidebar',

  imports: [
    RouterLink,
    RouterLinkActive,
    MatTreeModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  menuData: MenuNode[] = [
    {
      name: 'Fleet',
      children: [
        {
          name: 'Drivers',
          route: '/fleet/drivers'
        },
        {
          name: 'Vehicles',
          route: '/fleet/vehicles'
        },
        {
          name: 'GPS Devices',
          route: '/fleet/gpsdevices'
        }
      ]
    }
  ];

  childrenAccessor = (node: MenuNode) =>
    node.children ?? [];

  hasChild = (_: number, node: MenuNode) =>
    !!node.children && node.children.length > 0;
}

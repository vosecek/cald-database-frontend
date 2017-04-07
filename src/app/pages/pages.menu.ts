export const PAGES_MENU = [
  {
    path: 'app',
    title: "Dashboard",
    children: [
      {
        path: 'dashboard',
        data: {
          menu: {
            title: 'Dashboard',
            icon: 'ion-android-home',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'seasons',
        data: {
          menu: {
            title: 'Turnaje',
            icon: 'ion-calendar',
            selected: false,
            expanded: false,
            order: 200,
          }
        }
      },
      {
        path: 'teams',
        data: {
          menu: {
            title: 'Oddíly',
            icon: 'ion-ios-people',
            selected: false,
            expanded: false,
            order: 250,
          }
        },
      },
      {
        path: 'user',
        data: {
          menu: {
            title: 'Můj účet',
            icon: 'ion-person',
            selected: false,
            expanded: false,
            order: 260
          }
        }
      }, {
        path: 'admin',
        data: {
          menu: {
            admin: true,
            title: 'Administrace',
            icon: 'ion-key',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      }
    ]
  }
];

import { WASHING_MACHINE, FREEZER, EV_CHARGER } from "../../../constants";

export const initialDayPlan = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [],
    },
  ];
  
  export const predefinedDayPlan1 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 3, end: 5 }, 
        { start: 7, end: 9 }, 
        { start: 19, end: 20 }, 
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [
        { start: 1, end: 5 }
      ],
    },
  ];
  
  export const predefinedDayPlan2 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 5, end: 6 },
        { start: 7, end: 9 },
        { start: 19, end: 20 },
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [
        { start: 5, end: 6 }
      ],
    },
  ];

  export const predefinedDayPlan3 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [
        { start: 13, end: 15 },
      ],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 12, end: 13 },
        { start: 19, end: 20 },
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [],
    },
  ];

  export const predefinedDayPlan4 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [
        { start: 15, end: 17 },
      ],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 19, end: 20 },
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [],
    },
  ];

  export const predefinedDayPlan5 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 19, end: 20 },
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [
        { start: 23, end: 24 },
      ],
    },
  ];

  export const predefinedDayPlan6 = [
    {
      id: WASHING_MACHINE,
      name: 'Washing Machine',
      slots: [],
    },
    {
      id: FREEZER,
      name: 'Freezer',
      slots: [
        { start: 22, end: 23 },
      ],
    },
    {
      id: EV_CHARGER,
      name: 'EV Charger',
      slots: [
        { start: 22, end: 24 },
      ],
    },
  ];
  
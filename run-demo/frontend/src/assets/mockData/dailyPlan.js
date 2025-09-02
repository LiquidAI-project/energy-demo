import { WASHING_MACHINE, FREEZER, EV_CHARGER } from "../../../constants";

export const cloudBasedPlan = [
  {
    id: WASHING_MACHINE,
    name: 'Washing Machine',
    slots: [
      { start: 0, end: 13, value: 0 },
      { start: 13, end: 15, value: 0.3 },
      { start: 15, end: 24, value: 0 },
    ],
  },
  {
    id: FREEZER,
    name: 'Freezer',
    slots: [
      { start: 0, end: 3, value: 0.2 },
      { start: 3, end: 5, value: 0.9 },
      { start: 5, end: 7, value: 0.2 },
      { start: 7, end: 9, value: 0.9 },
      { start: 9, end: 12, value: 0.2 },
      { start: 12, end: 13, value: 0.9 },
      { start: 13, end: 19, value: 0.2 },
      { start: 19, end: 20, value: 0.9 },
      { start: 20, end: 22, value: 0.2 },
      { start: 22, end: 23, value: 0.9 },
      { start: 23, end: 24, value: 0.2 },
    ],
  },
  {
    id: EV_CHARGER,
    name: 'EV Charger',
    slots: [
      { start: 0, end: 1, value: 0 },
      { start: 1, end: 5, value: 5 },
      { start: 5, end: 22, value: 0 },
      { start: 22, end: 24, value: 5 },
    ],
  },
];

export const liquidBasedPlanFinal = [
  {
    id: WASHING_MACHINE,
    name: 'Washing Machine',
    slots: [
      { start: 15, end: 17, value: 0.3 },
    ],
  },
  {
    id: FREEZER,
    name: 'Freezer',
    slots: [
      { start: 3, end: 4, value: 0.9 },
      { start: 5, end: 6, value: 0.9 },
      { start: 7, end: 9, value: 0.9 },
      { start: 12, end: 13, value: 0.9 },
      { start: 19, end: 20, value: 0.9 },
      { start: 22, end: 23, value: 0.9 },
    ],
  },
  {
    id: EV_CHARGER,
    name: 'EV Charger',
    slots: [
      { start: 1, end: 4, value: 5 },
      { start: 5, end: 6, value: 5 },
      { start: 22, end: 24, value: 5 },
    ],
  },
];

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
  
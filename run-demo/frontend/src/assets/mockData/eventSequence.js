export const ANIMATION_EVENT_SEQUENCE = [
    {
        id: "dayPlanExecution_0030",
        hour: 0,
        minute: 30,
        steps: [
            ["reverseDir", "evLine", "NewDeviceDiscoveryIcon", "New device connected"],
            ["normalDir", "icLine", "NewDeviceInfoIcon", "Forwarding new device info"],
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            [
                ["normalDir", "freezerLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"],
                ["normalDir", "wmLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"],
                ["normalDir", "evLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
            ]
        ],
    },
    {
        id: "dayPlanExecution_0130",
        hour: 1,
        minute: 30,
        steps: [
            ["normalDir", "evLine", "QueryIcon", "Is Charging?"]
        ],
    },
    {
        id: "dayPlanExecution_0230",
        hour: 2,
        minute: 30,
        steps: [
            ["normalDir", "evLine", "QueryIcon", "Battery Status?"]
        ],
    },
    {
        id: "dayPlanExecution_0430", // need to show that IC is doing something to recalculate the schedule
        hour: 4,
        minute: 30,
        steps: [
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            [
                ["normalDir", "evLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"],
                ["normalDir", "freezerLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
            ]
        ],
    },
    {
        id: "dayPlanExecution_0510",
        hour: 5,
        minute: 10,
        steps: [
            ["normalDir", "freezerLine", "QueryIcon", "Consumed Energy?"],
        ],
    },
    {
        id: "dayPlanExecution_0910",
        hour: 9,
        minute: 10,
        steps: [
            ["normalDir", "evLine", "QueryIcon", "Battery Status Car1?"],
        ],
    },
    {
        id: "dayPlanExecution_0940",
        hour: 9,
        minute: 40,
        steps: [
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            ["normalDir", "wmLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
        ],
    },
    {
        id: "dayPlanExecution_1300",
        hour: 13,
        minute: 0,
        steps: [
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            [
                ["normalDir", "wmLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"],
                ["normalDir", "freezerLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
            ]
        ],
    },
    {
        id: "dayPlanExecution_1310",
        hour: 13,
        minute: 10,
        steps: [
            ["normalDir", "wmLine", "QueryIcon", "Consumed Energy?"],
        ],
    },
    {
        id: "dayPlanExecution_1710",
        hour: 17,
        minute: 10,
        steps: [
            ["normalDir", "evLine", "QueryIcon", "Battery Status Car1?"],
        ],
    },
    {
        id: "dayPlanExecution_1800",
        hour: 18,
        minute: 0,
        steps: [
            ["reverseDir", "evLine", "NewDeviceDiscoveryIcon", "New device connected"],
            ["normalDir", "icLine", "NewDeviceInfoIcon", "Forwarding new device info"],
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            ["normalDir", "evLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
        ],
    },
    {
        id: "dayPlanExecution_2100",
        hour: 21,
        minute: 0,
        steps: [
            ["reverseDir", "icLine", "ScheduleIcon", "Sending new schedule"],
            ["normalDir", "evLine", "WasmWithOnnxScheduleIcon", "Forwards schedule"]
        ],
    },
    {
        id: "dayPlanExecution_2210",
        hour: 22,
        minute: 10,
        steps: [
            ["normalDir", "wmLine", "QueryIcon", "Consumed Energy?"],
            ["normalDir", "freezerLine", "QueryIcon", "Consumed Energy?"],
        ],
    },
];
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
        id: "dayPlanExecution_0050",
        hour: 1,
        minute: 50,
        steps: [
            ["normalDir", "evLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_0250",
        hour: 2,
        minute: 50,
        steps: [
            ["normalDir", "freezerLine", "", ""]
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
        id: "dayPlanExecution_0500",
        hour: 5,
        minute: 0,
        steps: [
            ["normalDir", "freezerLine", "", ""],
            ["normalDir", "evLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_0650",
        hour: 6,
        minute: 50,
        steps: [
            ["normalDir", "freezerLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_0740",
        hour: 7,
        minute: 40,
        steps: [
            ["normalDir", "wmLine", "", ""]
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
        id: "dayPlanExecution_1440",
        hour: 14,
        minute: 40,
        steps: [
            ["normalDir", "wmLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_1700",
        hour: 17,
        minute: 0,
        steps: [
            ["normalDir", "wmLine", "", ""]
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
        id: "dayPlanExecution_1940",
        hour: 19,
        minute: 40,
        steps: [
            ["normalDir", "freezerLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_2200",
        hour: 22,
        minute: 0,
        steps: [
            ["normalDir", "freezerLine", "", ""]
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
        id: "dayPlanExecution_2140",
        hour: 21,
        minute: 40,
        steps: [
            ["normalDir", "evLine", "", ""]
        ],
    },
    {
        id: "dayPlanExecution_2300",
        hour: 23,
        minute: 0,
        steps: [
            ["normalDir", "evLine", "", ""]
        ],
    }
];
import { GamepadButton, GamepadAxis, DataType } from "./data.svelte";


export const NODE_CATEGORIES = ["Input", "Math", "Boolean", "State", "Output"];


export const NODE_TYPES = [
    {
        category: "Input",
        name: "Button Input",
        props: [
            {
                id: "button",
                name: "Button",
                type: "button",
                value: GamepadButton.A
            }
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Input",
        name: "Axis Input",
        props: [
            {
                id: "axis",
                name: "Axis",
                type: "axis",
                value: GamepadAxis.RightStickY
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Input",
        name: "First Tick",
        output: {type: DataType.Bool}
    },
    {
        category: "Input",
        name: "Current Motor Position",
        props: [
            {
                id: "motor",
                name: "Motor",
                type: "input",
                inputType: "text",
                value: ""
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Input",
        name: "IMU Heading",
        props: [
            {
                id: "measure",
                before: "Measure",
                type: "select",
                options: ["radians", "degrees"],
                value: "radians"
            },
            {
                id: "zeroAtStart",
                name: "Zero at Start",
                type: "checkbox",
                value: true
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Input",
        name: "Touch Sensor Pressed",
        props: [
            {
                id: "sensor",
                name: "Sensor",
                type: "input",
                inputType: "text",
                value: ""
            }
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Input",
        name: "Get Data",
        props: [
            {
                id: "name",
                name: "Name",
                type: "input",
                inputType: "text",
                value: ""
            },
            {
                id: "type",
                name: "Type",
                type: "type",
                value: DataType.Real
            }
        ],
        output: {typeSource: "type"}
    },
    {
        category: "Math",
        name: "Number",
        props: [
            {
                id: "value",
                name: "Value",
                type: "input",
                inputType: "number",
                value: 0
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Math",
        name: "Sum",
        props: [
            {
                id: "operandCount",
                name: "Operand #",
                type: "input",
                inputType: "number",
                value: 2
            }
        ],
        inputs: [
            {id: "addend", type: DataType.Real, repeatsSource: "operandCount"}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Math",
        name: "Numeric Operation",
        props: [
            {
                id: "operation",
                before: "a ",
                after: " b",
                center: true,
                type: "select",
                options: ["+", "-", "*", "/", "**", "mod", "min", "max"],
                value: "*"
            }
        ],
        inputs: [
            {id: "a", type: DataType.Real, label: "a"},
            {id: "b", type: DataType.Real, label: "b"}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Math",
        name: "Compare",
        props: [
            {
                id: "operation",
                before: "a ",
                after: " b",
                center: true,
                type: "select",
                options: ["≥", "≤", ">", "<", "=", "≠"],
                value: "≥"
            }
        ],
        inputs: [
            {id: "a", type: DataType.Real, label: "a"},
            {id: "b", type: DataType.Real, label: "b"}
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Math",
        name: "Unary Operation",
        props: [
            {
                id: "operation",
                before: "",
                after: " value",
                center: true,
                type: "select",
                options: ["negate", "round", "floor", "ceil", "sin", "cos", "tan", "arcsin", "arccos", "arctan", "ln"],
                value: "negate"
            }
        ],
        inputs: [
            {id: "input", type: DataType.Real}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Boolean",
        name: "Boolean",
        props: [
            {
                id: "value",
                name: "Is True",
                type: "checkbox",
                value: false
            }
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Boolean",
        name: "Not",
        inputs: [
            {id: "input", type: DataType.Bool}
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Boolean",
        name: "Logical Operation",
        props: [
            {
                id: "operation",
                before: "a ",
                after: " b",
                center: true,
                type: "select",
                options: ["and", "or", "xor"],
                value: "or"
            },
            {
                id: "operandCount",
                name: "Operand #",
                type: "input",
                inputType: "number",
                value: 2
            }
        ],
        inputs: [
            {id: "operand", type: DataType.Bool, repeatsSource: "operandCount"}
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "Boolean",
        name: "Ternary",
        props: [
            {
                id: "type",
                name: "On",
                center: true,
                type: "type",
                value: DataType.Real
            }
        ],
        inputs: [
            {id: "condition", type: DataType.Bool, label: "cond"},
            {id: "ifTrue", typeSource: "type", label: "true"},
            {id: "ifFalse", typeSource: "type", label: "false"}
        ],
        output: {typeSource: "type"}
    },
    {
        category: "Boolean",
        name: "Value or 0",
        inputs: [
            {id: "condition", type: DataType.Bool, label: "cond"},
            {id: "value", type: DataType.Real, label: "val"}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Boolean",
        name: "Bool to Real",
        props: [
            {
                id: "falseVal",
                name: "When False",
                type: "input",
                inputType: "number",
                value: 0
            },
            {
                id: "trueVal",
                name: "When True",
                type: "input",
                inputType: "number",
                value: 1
            }
        ],
        inputs: [{id: "condition", type: DataType.Bool}],
        output: {type: DataType.Real}
    },
    {
        category: "Boolean",
        name: "On Edge",
        props: [
            {
                id: "onRising",
                name: "On Rising",
                type: "checkbox",
                value: true
            },
            {
                id: "onFalling",
                name: "On Falling",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "input", type: DataType.Bool}
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "State",
        name: "Integrate",
        props: [
            {
                id: "C",
                name: "C",
                type: "input",
                inputType: "number",
                value: 0
            },
            {
                id: "useMin",
                name: "Use min",
                type: "checkbox",
                value: false
            },
            {
                id: "min",
                name: "Min",
                showWhen: "useMin",
                type: "input",
                inputType: "number",
                value: 0
            },
            {
                id: "useMax",
                name: "Use max",
                type: "checkbox",
                value: false
            },
            {
                id: "max",
                name: "Max",
                showWhen: "useMax",
                type: "input",
                inputType: "number",
                value: 1
            },
            {
                id: "allowReset",
                name: "Allow Reset",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "integrand", type: DataType.Real},
            {
                id: "reset", type: DataType.Bool, 
                label: "reset", showSource: "allowReset"
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "State",
        name: "SR Latch",
        props: [
            {
                id: "startingState",
                name: "Starts True",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "set", type: DataType.Bool, label: "set"},
            {id: "reset", type: DataType.Bool, label: "reset"},
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "State",
        name: "Flip Flop",
        props: [
            {
                id: "startingState",
                name: "Starts True",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "input", type: DataType.Bool}
        ],
        output: {type: DataType.Bool}
    },
    {
        category: "State",
        name: "Stopwatch",
        inputs: [
            {id: "reset", type: DataType.Bool, label: "reset"}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "State",
        name: "Differentiate",
        inputs: [
            {id: "input", type: DataType.Real}
        ],
        output: {type: DataType.Real}
    },
    {
        category: "State",
        name: "Store",
        props: [
            {
                id: "type",
                name: "Store",
                center: true,
                type: "type",
                value: DataType.Real
            }
        ],
        inputs: [
            {id: "update", type: DataType.Bool, label: "alter"},
            {id: "source", typeSource: "type", label: "src"}
        ],
        output: {typeSource: "type"}
    },
    {
        category: "State",
        name: "Discrete Sum",
        props: [
            {
                id: "startValue",
                name: "Start at",
                type: "input",
                inputType: "number",
                value: "0"
            },
            {
                id: "useMin",
                name: "Use min",
                type: "checkbox",
                value: false
            },
            {
                id: "min",
                name: "Min",
                showWhen: "useMin",
                type: "input",
                inputType: "number",
                value: 0
            },
            {
                id: "useMax",
                name: "Use max",
                type: "checkbox",
                value: false
            },
            {
                id: "max",
                name: "Max",
                showWhen: "useMax",
                type: "input",
                inputType: "number",
                value: 1
            },
            {
                id: "allowReset",
                name: "Allow Reset",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "input", type: DataType.Real},
            {
                id: "reset", type: DataType.Bool, 
                label: "reset", showSource: "allowReset"
            }
        ],
        output: {type: DataType.Real}
    },
    {
        category: "Output",
        name: "Send Telemetry",
        props: [
            {
                id: "caption",
                name: "Caption",
                type: "input",
                inputType: "text",
                value: "data"
            },
            {
                id: "type",
                name: "Type",
                type: "type",
                value: DataType.Real
            }
        ],
        inputs: [
            {id: "data", typeSource: "type"}
        ]
    },
    {
        category: "Output",
        name: "Motor Power",
        props: [
            {
                id: "motor",
                name: "Motor",
                type: "input",
                inputType: "text",
                value: ""
            },
            {
                id: "zeroPowerBreaking",
                name: "Break at 0 Power",
                type: "checkbox",
                value: false
            }
        ],
        inputs: [
            {id: "power", type: DataType.Real}
        ]
    },
    {
        category: "Output",
        name: "Motor Target Position",
        props: [
            {
                id: "motor",
                name: "Motor",
                type: "input",
                inputType: "text",
                value: ""
            }
        ],
        inputs: [
            {id: "position", type: DataType.Real}
        ]
    },
    {
        category: "Output",
        name: "Reset Motor Encoder",
        props: [
            {
                id: "motor",
                name: "Motor",
                type: "input",
                inputType: "text",
                value: ""
            }
        ],
        inputs: [
            {id: "reset", type: DataType.Bool}
        ]
    },
    {
        category: "Output",
        name: "Servo Position",
        props: [
            {
                id: "servo",
                name: "Servo",
                type: "input",
                inputType: "text",
                value: ""
            },
            {
                id: "takeBool",
                name: "Take Bool",
                type: "checkbox"
            },
            {
                id: "remapRange",
                name: "Remap Range",
                type: "checkbox"
            },
            {
                id: "at0",
                name: "At 0",
                showWhen: "remapRange",
                type: "input",
                inputType: "number",
                value: 0,
                minValue: 0,
                maxValue: 1
            },
            {
                id: "at1",
                name: "At 1",
                showWhen: "remapRange",
                type: "input",
                inputType: "number",
                value: 1,
                minValue: 0,
                maxValue: 1
            }
        ],
        inputs: [
            {id: "realPosition", type: DataType.Real, hideSource: "takeBool"},
            {id: "boolPosition", type: DataType.Bool, showSource: "takeBool"}
        ]
    },
    {
        category: "Ouput",
        name: "Set Data",
        props: [
            {
                id: "name",
                name: "Name",
                type: "input",
                inputType: "text",
                value: ""
            },
            {
                id: "type",
                name: "Type",
                type: "type",
                value: DataType.Real
            }
        ],
        inputs: [
            {id: "value", typeSource: "type"}
        ]
    }
];

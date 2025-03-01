import { compile } from "svelte/compiler";
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new ButtonNode(() -> gamepad1.$0)",
            subs: [
                {fromProp: "button", format: "button"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new SupplierNode<Double>(() -> gamepad1.$0)",
            subs: [
                {fromProp: "axis", format: "axis"}
            ]
        }
    },
    {
        category: "Input",
        name: "First Tick",
        output: {type: DataType.Bool},
        compileTo: {
            template: "new IsFirstTickNode()"
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new GetMotorPositionNode($0)",
            subs: [
                {fromProp: "motor", format: "str"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new GetIMUHeadingNode($0, $1)",
            subs: [
                {fromProp: "measure", format: "str"},
                {fromProp: "zeroAtStart", format: "bool"}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new IsTouchSensorPressedNode($0)",
            subs: [
                {fromProp: "sensor", format: "str"}
            ]
        }
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
        output: {typeSource: "type"},
        compileTo: {
            template: "new GetDataNode<$0>($1)",
            subs: [
                {fromProp: "type", format: "type"},
                {fromProp: "name", format: "str"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new SupplierNode<Double>(() -> $0)",
            subs: [
                {fromProp: "value", format: "num"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new ReduceNode<Double>($0, (double a, double b) -> a + b)",
            subs: [
                {fromInput: "addend", format: "operandArray"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new BiOperatorNode<Double, Double>($0, $1, (double a, double b) -> $2)",
            subs: [
                {fromInput: "a", format: "operand"},
                {fromInput: "b", format: "operand"},
                {fromProp: "operation", format: "map", mapping: {
                    "+": "a + b", "-": "a - b", "*": "a * b", "/": "a / b",
                    "mod": "a % b", "min": "Math.min(a, b)", "max": "Math.max(a, b)"
                }}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new BiOperatorNode<Double, Boolean>($0, $1, (double a, double b) -> $2)",
            subs: [
                {fromInput: "a", format: "operand"},
                {fromInput: "b", format: "operand"},
                {fromProp: "operation", format: "map", mapping: {
                    "≥": "a >= b", "≤": "a <= b", ">": "a > b", "<": "a < b",
                    "=": "a == b", "≠": "!="
                }}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new MonoOperatorNode<Double, Double>($0, (double a) -> $1)",
            subs: [
                {fromInput: "input", format: "operand"},
                {fromProp: "operation", format: "map", mapping: {
                    "negate": "-a", "round": "Math.round(a)", "floor": "Math.floor(a)",
                    "ceil": "Math.ceil(a)", "sin": "Math.sin(a)", "cos": "Math.cos(a)",
                    "tan": "Math.tan(a)", "arcsin": "Math.asin(a)", "arccos": "Math.acos(a)",
                    "arctan": "Math.atan(a)", "ln": "Math.log(a)"
                }}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new SupplierNode<Boolean>(() -> $0)",
            subs: [
                {fromProp: "value", format: "bool"}
            ]
        }
    },
    {
        category: "Boolean",
        name: "Not",
        inputs: [
            {id: "input", type: DataType.Bool}
        ],
        output: {type: DataType.Bool},
        compileTo: {
            template: "new MonoOperatorNode<Boolean, Boolean>($0, (boolean b) -> !b)",
            subs: [
                {fromInput: "input", format: "operand"}
            ]
        }
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
            {id: "operands", type: DataType.Bool, repeatsSource: "operandCount"}
        ],
        output: {type: DataType.Bool},
        compileTo: {
            template: "new ReduceNode<Boolean>($0, (boolean a, boolean b) -> a $1 b)",
            subs: [
                {fromInput: "operands", format: "operandArray"},
                {fromProp: "operation", format: "map", mapping: {
                    "and": "&&", "or": "||", "xor": "^"
                }}
            ]
        }
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
        output: {typeSource: "type"},
        compileTo: {
            template: "new TenaryNode<$0>($1, $2, $3)",
            subs: [
                {fromProp: "type", format: "type"},
                {fromInput: "condition", format: "operand"},
                {fromInput: "ifTrue", format: "operand"},
                {fromInput: "ifFalse", format: "operand"}
            ]
        }
    },
    {
        category: "Boolean",
        name: "Value or 0",
        inputs: [
            {id: "condition", type: DataType.Bool, label: "cond"},
            {id: "value", type: DataType.Real, label: "val"}
        ],
        output: {type: DataType.Real},
        compileTo: {
            template: "new ValueOr0Node<Double>($0, $1)",
            subs: [
                {fromInput: "condition", format: "operand"},
                {fromInput: "value", format: "operand"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new MonoOperatorNode<Boolean, Double>($0, (boolean c) -> c ? $1 : $2)",
            subs: [
                {fromInput: "condition", format: "operand"},
                {fromProp: "trueVal", format: "num"},
                {fromProp: "falseVal", format: "num"}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new OnEdgeNode($0, $1, $2)",
            subs: [
                {fromInput: "input", format: "operand"},
                {fromProp: "onRising", format: "bool"},
                {fromProp: "onFalling", format: "bool"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new IntegratorNode($0, $1, $2, $3, $4)",
            subs: [
                {fromProp: "C", format: "num"},
                {fromProp: "min", format: "num"},
                {fromProp: "max", format: "num"},
                {fromInput: "integrand", format: "operand"},
                {fromInput: "reset", format: "optionalOperand", otherwise: "null"}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new RSLatchNode($0, $1, $2)",
            subs: [
                {fromInput: "set", format: "operand"},
                {fromInput: "reset", format: "operand"},
                {fromProp: "startingState", format: "bool"}
            ]
        }
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
        output: {type: DataType.Bool},
        compileTo: {
            template: "new TFlipFlipNode($0, $1)",
            subs: [
                {fromInput: "input", format: "operand"},
                {fromProp: "startingState", format: "bool"}
            ]
        }
    },
    {
        category: "State",
        name: "Stopwatch",
        inputs: [
            {id: "reset", type: DataType.Bool, label: "reset"}
        ],
        output: {type: DataType.Real},
        compileTo: {
            template: "new StopwatchNode($0)",
            subs: [
                {fromInput: "reset", format: "operand"}
            ]
        }
    },
    {
        category: "State",
        name: "Differentiate",
        inputs: [
            {id: "input", type: DataType.Real}
        ],
        output: {type: DataType.Real},
        compileTo: {
            template: "new DifferentiateNode($0)",
            subs: [
                {fromInput: "reset", format: "operand"}
            ]
        }
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
        output: {typeSource: "type"},
        compileTo: {
            template: "new StoreStateNode<$0>($1, $2)",
            subs: [
                {fromInput: "type", format: "type"},
                {fromInput: "update", format: "operand"},
                {fromInput: "source", format: "operand"}
            ]
        }
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
        output: {type: DataType.Real},
        compileTo: {
            template: "new DiscreteSumNode($0, $1, $2, $3, $4)",
            subs: [
                {fromProp: "C", format: "num"},
                {fromProp: "min", format: "num"},
                {fromProp: "max", format: "num"},
                {fromInput: "integrand", format: "operand"},
                {fromInput: "reset", format: "optionalOperand", otherwise: "null"}
            ]
        }
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
        ],
        compileTo: {
            template: "new TelemetryOutputNode<$0>($1, $2)",
            subs: [
                {fromProp: "type", format: "type"},
                {fromProp: "caption", format: "str"},
                {fromInput: "data", format: "operand"}
            ]
        }
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
        ],
        compileTo: {
            template: "new SetMotorPowerNode($0, $1, $2)",
            subs: [
                {fromProp: "motor", format: "str"},
                {fromInput: "power", format: "operand"},
                {fromProp: "zeroPowerBreaking", format: "bool"}
            ]
        }
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
        ],
        compileTo: {
            template: "new SetMotorPositionNode($0, $1)",
            subs: [
                {fromProp: "motor", format: "str"},
                {fromInput: "position", format: "operand"}
            ]
        }
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
        ],
        compileTo: {
            template: "new ResetMotorEncoderNode($0, $1, $2)",
            subs: [
                {fromProp: "motor", format: "str"},
                {fromInput: "reset", format: "operand"}
            ]
        }
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
        ],
        compileTo: {
            template: "new ServoPositionNode($0, $1, $2, $3, $4, $5)",
            subs: [
                {fromProp: "servo", format: "str"},
                {fromInput: "realPosition", format: "optionalOperand", otherwise: "null"},
                {fromInput: "boolPosition", format: "optionalOperand", otherwise: "null"},
                {fromProp: "remapRange", format: "bool"},
                {fromProp: "at0", format: "num"},
                {fromProp: "at1", format: "num"}
            ]
        }
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
        ],
        compileTo: {
            template: "new SetDataNode<$0>($1, $2)",
            subs: [
                {fromProp: "type", format: "type"},
                {fromProp: "name", format: "str"},
                {fromInput: "value", format: "operand"}
            ]
        }
    }
];

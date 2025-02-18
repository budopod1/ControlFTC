// mouse button used to drag things
export let DRAGGING_BUTTON = 0;


export const FileType = {
    Template: 0,
    Subsystem: 1
};


export const DataType = {
    Real: "real",
    Bool: "bool"
};


export const GamepadButton = {
    A: "a",
    B: "b",
    Back: "back",
    DPadDown: "dpad_down",
    DPadLeft: "dpad_left",
    DPadRight: "dpad_right",
    DPadUp: "dpad_up",
    Guide: "guide",
    LeftBumper: "left_bumper",
    LeftStickButton: "left_stick_button",
    RightBumper: "right_bumper",
    RightStickButton: "right_stick_button",
    Start: "start",
    X: "x",
    Y: "y"
};


export const GamepadJoystick = {
    LeftStick: "left_stick",
    RightStick: "right_stick"
}


export const GamepadAxis = {
    LeftStickX: "left_stick_x",
    LeftStickY: "left_stick_y",
    LeftTrigger: "left_trigger",
    RightStickX: "right_stick_x",
    RightStickY: "right_stick_y",
    RightTrigger: "right_trigger"
};


export function joystickToAxis(stick, axis) {
    return stick+"_"+axis;
}


export class FileBase {
    name = $state();

    constructor(name, type) {
        this.name = name;
        // these are both constants
        this.id = Math.random();
        this.type = type;
    }

    toJSON() {
        return {
            id: this.id,
            name: $state.snapshot(this.name),
            type: this.type,
        };
    }

    loadFromJSON(_json) {}

    static fromJSON(json) {
        let cons = [TemplateFile, SubsystemFile][json.type];
        let file = new cons();
        file.id = json.id;
        file.name = json.name;
        file.loadFromJSON(json);
        return file;
    }
}


const DEFAULT_TEMPLATE_TEXT = `
public class ClassName {
$
}
`.trimStart().replaceAll("$", "    ");


export class TemplateFile extends FileBase {
    text = $state(DEFAULT_TEMPLATE_TEXT);

    constructor() {
        super("Template", FileType.Template);
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            text: this.text
        });
    }

    loadFromJSON(json) {
        this.text = json.text;
    }
}


export class SubsystemNode {
    x = $state(0);
    y = $state(0);
    data = $state();
    outputConnections = $state([]);

    constructor(data) {
        this.id = Math.random();
        this.data = data;
    }

    toJSON() {
        return {
            id: this.id,
            x: $state.snapshot(this.x), 
            y: $state.snapshot(this.y),
            data: $state.snapshot(this.data),
            outputConnections: $state.snapshot(this.outputConnections)
        };
    }

    static fromJSON(json) {
        let node = new SubsystemNode(json.data);
        node.id = json.id;
        node.x = json.x;
        node.y = json.y;
        node.outputConnections = json.outputConnections;
        return node;
    }
}


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
            {id: "operand", type: DataType.Bool, repeatCount: "operandCount"}
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
    },,
    {
        category: "Boolean",
        name: "Value or 0",
        inputs: [
            {id: "condition", type: DataType.Bool, label: "cond"},
            {id: "value", type: DataType.Real, label: "val"}
        ],
        output: {typeSource: "type"}
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
    }
];


export function getNodeProp(nodeData, propID) {
    return nodeData.props.find(prop => prop.id == propID);
}


export function getPortType(nodeData, portData) {
    if (portData.type) return portData.type;
    if (portData.typeSource) {
        return getNodeProp(nodeData, portData.typeSource).value;
    }
    return null;
}


export function getNodeInputs(nodeData) {
    if (!nodeData.inputs) return [];
    return nodeData.inputs.map(input => {
        if (input.showSource) {
           if (!getNodeProp(nodeData, input.showSource).value) return [];
        }
        if (input.hideSource) {
            if (getNodeProp(nodeData, input.hideSource).value) return [];
        }
        if (input.repeatsSource) {
            let repeatCount = +getNodeProp(nodeData, input.repeatsSource).value;
            if (repeatCount < 0 || !Number.isInteger(repeatCount)) return [];
            return Array(repeatCount).fill(input);
        } else {
            return input;
        }
    }).flat();
}


export class SubsystemFile extends FileBase {
    nodes = $state([]);
    
    constructor() {
        super("Untitled Subsystem", FileType.Subsystem);
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            nodes: $state.snapshot(this.nodes.map(
                node => node.toJSON()
            ))
        });
    }

    getNodeById(id) {
        return this.nodes.find(node => node.id == id);
    }

    removeStaleConnections() {
        for (let node of this.nodes) {
            node.outputConnections = node.outputConnections.filter(
                connEnd => this.getNodeById(connEnd.node)
            );
        }
    }

    getConnectionTo(nodeId, portIdx) {
        for (let startNode of this.nodes) {
            for (let connEnd of startNode.outputConnections) {
                if (connEnd.node == nodeId && connEnd.port == portIdx) {
                    return {startNode, connEnd};
                }
            }
        }
        return null;
    }

    loadFromJSON(json) {
        this.nodes = json.nodes.map(
            node => SubsystemNode.fromJSON(node));
    }
}


export class OpMode {
    name = $state("Untitled Opmode");
    files = $state([]);

    toJSON() {
        return {
            name: $state.snapshot(this.name),
            files: $state.snapshot(this.files.map(
                file => file.toJSON()
            ))
        };
    }

    static fromJSON(json) {
        let opmode = new OpMode();
        opmode.name = json.name;
        opmode.files = json.files.map(
            file => FileBase.fromJSON(file));
        return opmode;
    }
}


export function loadState() {
    if (localStorage.getItem("state")) {
        let jsonState = JSON.parse(localStorage.getItem("state"));
        state_.opmode = OpMode.fromJSON(jsonState.opmode);
    } else {
        state_.opmode = new OpMode();
    }
}


export function getFileById(id) {
    if (id == null) return null;
    return state_.opmode.files.find(file => file.id == id);
}


export let state_ = $state({opmode: null, selectedFileID: null});
export let actions = $state({
    addFile: null, deleteFile: null, setNextNode: null,
    chooseButton: null, chooseAxis: null
});

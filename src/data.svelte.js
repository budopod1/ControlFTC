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


const INIT_LOCATION = "// INIT";
const LOOP_LOCATION = "// LOOP";


export class TemplateFile extends FileBase {
    text = $state(DEFAULT_TEMPLATE_TEXT);

    constructor() {
        super("Template", FileType.Template);
    }

    errorOutput(error) {
        return `/*
 * ERROR while compiling template:
 * ${error}
 */
`;
    }

    indentToMatch(txt, src, pos) {
        let upTo = src.slice(0, pos);
        let indent = "";
        for (let i = upTo.length - 1; i >= 0; i--) {
            if (src[i] == " ") {
                indent += " ";
            } else {
                break;
            }
        }
        return txt.replaceAll("\n", "\n" + indent).trim();
    }

    compile(opmode) {
        let initInsert = `
ElapsedTime runtime = new ElapsedTime();
double lastFrameTime = 0;
`;
        let loopInsert = `
double currentTime = runtime.time();
double deltaTime = currentTime - lastFrameTime;
lastFrameTime = currentTime;

for (Updatee updatee : updatees) {
    updatee.update(deltaTime);
}
        `.trim();

        // TODO: actually do the main compilation here

        let initIdx = this.text.indexOf(INIT_LOCATION);
        if (initIdx == -1) {
            return this.errorOutput(`Initiation location not found in template, please specify it with '${INIT_LOCATION}'`);
        }

        let loopIdx = this.text.indexOf(LOOP_LOCATION);
        if (loopIdx == -1) {
            return this.errorOutput(`Loop location not found in template, please specify it with '${LOOP_LOCATION}'`);
        }

        return this.text
            .replace(INIT_LOCATION, this.indentToMatch(initInsert, this.text, initIdx))
            .replace(LOOP_LOCATION, this.indentToMatch(loopInsert, this.text, loopIdx));
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

    constructor() {
        this.id = Math.random();
    }

    toJSON() {
        return {
            id: this.id,
            name: $state.snapshot(this.name),
            files: $state.snapshot(this.files.map(
                file => file.toJSON()
            ))
        };
    }

    static fromJSON(json) {
        let opmode = new OpMode();
        opmode.id = json.id;
        opmode.name = json.name;
        opmode.files = json.files.map(
            file => FileBase.fromJSON(file));
        return opmode;
    }
}

export function getOpmodeById(id) {
    return allOpmodes.find(opmode => opmode.id == id);
}


export function switchOpmode(id) {
    state_.opmode = getOpmodeById(id);
    saveState();
}


export function newOpmode() {
    let opmode = new OpMode();
    allOpmodes.push(opmode);
    state_.opmode = opmode;
    saveState();
}


export function deleteOpmode(id) {
    if (state_.opmode.id == id) {
        if (allOpmodes.length == 1) {
            newOpmode();
        } else {
            state_.opmode = allOpmodes.findLast(
                opmode => opmode.id != id
            );
        }
    }
    allOpmodes.splice(allOpmodes.findIndex(opmode => opmode.id == id), 1);
}


export function loadState() {
    if (localStorage.getItem("opmodes")) {
        let jsonOpmodes = JSON.parse(localStorage.getItem("opmodes"));
        let newOpmodes = jsonOpmodes.map(opmodeJSON => OpMode.fromJSON(opmodeJSON));
        allOpmodes.splice(0, allOpmodes.length, ...newOpmodes);
    }
    if (allOpmodes.length == 0) {
        allOpmodes.push(new OpMode());
    }
    if (localStorage.getItem("activeOpmode")) {
        let activeOpmodeId = JSON.parse(localStorage.getItem("activeOpmode"));
        state_.opmode = getOpmodeById(activeOpmodeId);
    } else {
        state_.opmode = allOpmodes.at(-1);
    }
}


export function saveState() {
    let opmodesJSON = allOpmodes.map(opmode => opmode.toJSON());
    localStorage.setItem("opmodes", JSON.stringify(opmodesJSON));
    localStorage.setItem("activeOpmode", JSON.stringify(state_.opmode.id));
}


export function getFileById(id) {
    if (id == null) return null;
    return state_.opmode.files.find(file => file.id == id);
}


export let allOpmodes = $state([]);
export let state_ = $state({opmode: null, selectedFileID: null});
export let actions = $state({
    manageOpmodes: null, addFile: null, deleteFile: null, setNextNode: null,
    chooseButton: null, chooseAxis: null, compileOpmode: null
});

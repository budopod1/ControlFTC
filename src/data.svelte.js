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


export function dataTypeToJava(dataType) {
    if (dataType == DataType.Bool) {
        return "Boolean";
    } else if (dataType == DataType.Real) {
        return "Double";
    }

    return null;
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

    doCleanupWork() {}

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


class CompileError extends Error {
    constructor(message) {
        super(message);
    }
}


const DEFAULT_TEMPLATE_TEXT = `
public class ClassName {
$
}
`.trimStart().replaceAll("$", "    ");


const INIT_LOCATION = "// INIT\n";
const LOOP_LOCATION = "// LOOP\n";


export class TemplateFile extends FileBase {
    text = $state(DEFAULT_TEMPLATE_TEXT);

    constructor() {
        super("Template", FileType.Template);
    }

    static compileError(msg) {
        throw new CompileError(msg);
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
        let result = txt.replaceAll(/\n(?=.)/g, "\n" + indent);
        while (result.endsWith(" ")) result = result.slice(3)
        return result;
    }

    _compile(opmode) {
        let initInsert = `
ElapsedTime runtime = new ElapsedTime();
double lastFrameTime = 0;

`.trimStart();
        let loopInsert = `
double currentTime = runtime.time();
double deltaTime = currentTime - lastFrameTime;
lastFrameTime = currentTime;

for (Updatee updatee : updatees) {
    updatee.update(deltaTime);
}
`.trimStart();

        let allUpdatees = [];

        let subsystems = opmode.files.filter(
            file => file.type == FileType.Subsystem);
        for (let subsystem of subsystems) {
            let {subsystemInit, subsystemUpdatees} = subsystem.compile();
            initInsert += subsystemInit + "\n";
            allUpdatees.push(...subsystemUpdatees);
        }

        initInsert += `Updatee[] updatees = {${allUpdatees.join(", ")}};\n`;

        let initIdx = this.text.indexOf(INIT_LOCATION);
        if (initIdx == -1) {
            TemplateFile.compileError(
                `Initiation location not found in template, please specify it with '${INIT_LOCATION}'`);
        }

        let loopIdx = this.text.indexOf(LOOP_LOCATION);
        if (loopIdx == -1) {
            TemplateFile.compileError(
                `Loop location not found in template, please specify it with '${LOOP_LOCATION}'`);
        }

        return this.text
            .replace(INIT_LOCATION, this.indentToMatch(initInsert, this.text, initIdx))
            .replace(LOOP_LOCATION, this.indentToMatch(loopInsert, this.text, loopIdx));
    }

    compile(opmode) {
        try {
            return this._compile(opmode);
        } catch (e) {
            if (!(e instanceof CompileError)) throw e;
            return `/*
* ERROR while compiling template:
* ${e.message}
*/
`;
        }
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

    doCleanupWork() {
        for (let node of this.nodes) {
            node.outputConnections = node.outputConnections.filter(
                connEnd => {
                    let endNode = this.getNodeById(connEnd.node);
                    if (!endNode) return false;
                    let startType = getPortType(node, node.data.output);
                    let endNodeInputs = getNodeInputs(endNode.data);
                    if (connEnd.port >= endNodeInputs.length) return false;
                    let endPort = endNodeInputs[connEnd.port]
                    let endType = getPortType(endNode.data, endPort);
                    return startType == endType;
                }
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

    compileError(error) {
        TemplateFile.compileError(`In ${this.name}: ${error}`)
    }

    verifyNodeLegality(node) {
        let nodeInputCount = getNodeInputs(node.data).length;
        for (let i = 0; i < nodeInputCount; i++) {
            if (this.getConnectionTo(node.id, i) == null) {
                this.compileError("Nothing connected to node input");
            }
        }
    }

    formatPropValue(propValue, substitution) {
        switch (substitution.format) {
        case "button":
        case "axis":
        case "raw":
            return propValue;
        case "str":
            return JSON.stringify(propValue.toString());
        case "num":
            return (+propValue).toString();
        case "bool":
            return propValue ? "true" : "false";
        case "map":
            return substitution.mapping[propValue];
        case "type":
            return dataTypeToJava(propValue) || "unknown type"
        default:
            return "unknown prop substitution format";
        }
    }

    formatOperand(node, substitution, nodeMappings) {
        switch (substitution.format) {
        case "operand": {
            let operandIdx = getNodeInputs(node.data)
                .findIndex(input => input.id == substitution.fromInput);
            let connection = this.getConnectionTo(node.id, operandIdx);
            return nodeMappings.get(connection.startNode.id);
        }
        
        case "optionalOperand": {
            let operandIdx = getNodeInputs(node.data)
                .findIndex(input => input.id == substitution.fromInput);
            if (operandIdx == -1) return substitution.otherwise;
            let connection = this.getConnectionTo(node.id, operandIdx);
            return nodeMappings.get(connection.startNode.id);
        }
        
        case "operandArray": {
            let operands = [];
            let nodeInputs = getNodeInputs(node.data);

            for (let i = 0; i < nodeInputs.length; i++) {
                let input = nodeInputs[i];
                if (input.id == substitution.fromInput) {
                    let connection = this.getConnectionTo(node.id, i);
                    operands.push(nodeMappings.get(connection.startNode.id));
                }
            }

            let rawInputData = node.data.inputs
                .find(input => input.id == substitution.fromInput);
            let type = dataTypeToJava(getPortType(node.data, rawInputData));

            return `new ProviderNode<${type}>[] {${operands.join(", ")}}`
        }
        
        default:
            return "unknown operand substitution format";
        }
    }

    compileNode(node, nodeMappings) {
        let compileTo = node.data.compileTo;
        let result = compileTo.template;
        
        let i = -1;
        for (let sub of compileTo.subs) {
            i++;
            let formatted = "invalid substitution";
            if (sub.fromProp) {
                formatted = this.formatPropValue(
                    getNodeProp(node.data, sub.fromProp).value, sub
                );
            } else if (sub.fromInput) {
                formatted = this.formatOperand(
                    node, sub, nodeMappings
                );
            }
            result = result.replace("$"+i, formatted);
        }
        
        return result;
    }

    compile() {
        for (let node of this.nodes) {
            this.verifyNodeLegality(node);
        }

        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn%27s_algorithm
        let sortedNodes = [];
        let removedEdges = new Map();
        let noIncomingEdgesNodes = this.nodes
            .filter(node => getNodeInputs(node.data).length == 0);
        
        while (noIncomingEdgesNodes.length > 0) {
            let node = noIncomingEdgesNodes.pop();

            if (sortedNodes.includes(node)) {
                this.compileError("there is at least one cycle");
            }
            
            sortedNodes.push(node);
            
            for (let connEnd of node.outputConnections) {
                let endNode = this.getNodeById(connEnd.node);

                let endNodeRemovedEdges = removedEdges.get(endNode.id) || 0;
                endNodeRemovedEdges++;
                removedEdges.set(endNode.id, endNodeRemovedEdges);

                if (endNodeRemovedEdges == getNodeInputs(endNode.data).length) {
                    noIncomingEdgesNodes.push(endNode);
                }
            }
        }

        let subsystemInit = "";

        let nodeMappings = new Map();

        for (let node of sortedNodes) {
            let name = "n"+node.id.toString().replace("0.", "");
            let expression = this.compileNode(node, nodeMappings);
            let type = expression.match(/^new (\w+(?:<[\w, ]+>)?)\(/)[1];
            nodeMappings.set(node.id, name);
            subsystemInit += `${type} ${name} = ${expression};\n`;
        }

        return {subsystemInit, subsystemUpdatees: nodeMappings.values()};
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

    doCleanupWork() {
        for (let file of this.files) {
            file.doCleanupWork();
        }
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

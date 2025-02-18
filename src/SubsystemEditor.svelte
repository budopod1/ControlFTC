<script>
    import { setContext } from "svelte";
    import { cubicOut } from "svelte/easing";
    import { SvelteMap } from 'svelte/reactivity';

    import VisualNode from "./VisualNode.svelte";
    import PortConnection from "./PortConnection.svelte";
    import BoundObserver from "./BoundObserver.svelte";

    import { SubsystemNode, actions, DRAGGING_BUTTON, state_, getFileById, getPortType, getNodeInputs } from "./data.svelte.js";

    let selectedFile = $derived(getFileById(state_.selectedFileID));

    let holderBounds = $state();

    const ZOOM_SCALE = -0.002;

    let isMouseHeld = false;
    let isMouseIn = false;
    let heldNode = null;

    let mouseX = $state(0);
    let mouseY = $state(0);

    let zoomMultiple = $state(1);
    let panX = $state(0);
    let panY = $state(0);

    let connectionStarts = new SvelteMap();
    let connectionEnds = new SvelteMap();
    let connectingStartNode = $state(null);

    let shownConnections = $derived(
        selectedFile.nodes.map(startNode => {
            let connStartPoint = connectionStarts.get(startNode.id);
            if (!connStartPoint) return [];
            let startType = getPortType(startNode.data, startNode.data.output);
            let connections = [];
            for (let connEnd of startNode.outputConnections) {
                let endNode = selectedFile.getNodeById(connEnd.node);
                if (!endNode) continue;
                let endPort = getNodeInputs(endNode.data)[connEnd.port];
                let endType = getPortType(endNode.data, endPort);
                if (startType != endType) continue;
                let connEndPoint = connectionEnds
                    .get(connEnd.node)
                    ?.get(connEnd.port);
                if (!connEndPoint) continue;
                connections.push({start: connStartPoint, end: connEndPoint});
            }
            return connections;
        }).flat()
    );

    let nextNodeData = null;

    actions.setNextNode = (data) => {
        nextNodeData = data;
    };

    function tryAddNextNode() {
        if (nextNodeData == null) return;
        let node = new SubsystemNode(nextNodeData);
        selectedFile.nodes.push(node);
        nextNodeData = null;

        if (isMouseIn) {
            heldNode = node;
            isMouseHeld = true;
            
            let [holderMouseX, holderMouseY] = convertPageToHolderCoords(mouseX, mouseY);
            node.x = -panX + holderMouseX / zoomMultiple;
            node.y = -panY + holderMouseY / zoomMultiple;
        } else {
            node.x = -panX + holderBounds.width / 2 / zoomMultiple;
            node.y = -panY + holderBounds.height / 2 / zoomMultiple;
        }
    }

    function removeNode(toRemove) {
        selectedFile.nodes = selectedFile.nodes.filter(
            node => node != toRemove);
        selectedFile.removeStaleConnections();
    }

    window.addEventListener("mouseup", (e) => {
        if (e.button != DRAGGING_BUTTON) return;

        tryAddNextNode();

        if (!isMouseIn && isMouseHeld && heldNode) {
            removeNode(heldNode);
        }

        isMouseHeld = false;
    });

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isMouseHeld) return;

        let deltaX = e.movementX / zoomMultiple;
        let deltaY = e.movementY / zoomMultiple;
        if (heldNode) {
            heldNode.x += deltaX;
            heldNode.y += deltaY;
        } else {
            panX += deltaX;
            panY += deltaY;
        }
    });

    function convertPageToHolderCoords(x, y) {
        return [x - holderBounds.x, y - holderBounds.y];
    }

    function handleMouseWheel(e) {
        let zoomMultiplier = 2 ** (e.deltaY * ZOOM_SCALE);

        zoomMultiple *= zoomMultiplier;

        let [holderMouseX, holderMouseY] = convertPageToHolderCoords(e.clientX, e.clientY);

        panX += holderMouseX * (1 - zoomMultiplier) / zoomMultiple;
        panY += holderMouseY * (1 - zoomMultiplier) / zoomMultiple;
    }

    function handleMouseEnter() {
        isMouseIn = true;
        tryAddNextNode();
    }

    function handleMouseLeave() {
        isMouseIn = false;
    }

    function handleMouseDown(e, node) {
        // if you press a mouse button button while connecting nodes,
        // the connection is cancelled
        connectingStartNode = null;

        if (e.button != DRAGGING_BUTTON) return;
        isMouseHeld = true;
        heldNode = node;
        if (node) {
            e.stopPropagation();
        }
    }

    // Version of the scale svelte transition that works with transforms that change through the animation
    function scaleNode(node, { duration = 400 }) {
        return {
            duration,
            easing: cubicOut,
            css: (t, _u) => `
                --node-scale: ${t};
                opacity: ${t}
            `
        };
    }

    function tryConnect(startNodeId, endNodeId, endPortIdx) {
        let startNode = selectedFile.getNodeById(startNodeId);
        if (startNode.id == endNodeId) return;

        let endNodeData = selectedFile.getNodeById(endNodeId).data;
        let endPort = getNodeInputs(endNodeData)[endPortIdx];
        if (!endPort) return;

        let startType = getPortType(startNode.data, startNode.data.output);
        let endType = getPortType(endNodeData, endPort);
        if (startType != endType) return;
        
        connectingStartNode = null;
        startNode.outputConnections.push({node: endNodeId, port: endPortIdx});
    }

    function destroyConnection({ startNode, connEnd }) {
        let startNodeConns = startNode.outputConnections;
        startNodeConns.splice(startNodeConns.indexOf(connEnd), 1);
    }

    function outputPortMouseDown(nodeId) {
        if (connectingStartNode == nodeId) {
            connectingStartNode = null
        } else {
            connectingStartNode = nodeId;
        }
    }

    function inputPortMouseUp(endNodeId, endPortIdx) {
        let preexistingConn = selectedFile.getConnectionTo(endNodeId, endPortIdx);

        if (connectingStartNode) {
            if (preexistingConn) {
                destroyConnection(preexistingConn);
            }

            tryConnect(connectingStartNode, endNodeId, endPortIdx);
        } else {
            if (preexistingConn) {
                destroyConnection(preexistingConn);
                connectingStartNode = preexistingConn.startNode.id;
            }
        }
    }

    function inputPortMouseDragExit(endNodeId, endPortIdx) {
        if (connectingStartNode) return;
        let preexistingConn = selectedFile.getConnectionTo(endNodeId, endPortIdx);
        if (preexistingConn) {
            destroyConnection(preexistingConn);
            connectingStartNode = preexistingConn.startNode.id;
        }
    }

    function updatePortPosition({ nodeId, isOut, portIdx, position }) {
        if (isOut) {
            connectionStarts.set(nodeId, position);
        } else {
            let nodeConnectionEnds = connectionEnds.get(nodeId);
            if (!nodeConnectionEnds) {
                nodeConnectionEnds = new SvelteMap();
                connectionEnds.set(nodeId, nodeConnectionEnds);
            }
            nodeConnectionEnds.set(portIdx, position);
        }
    }

    function deletePortPosition({ nodeId, isOut, portIdx }) {
        if (isOut) {
            connectionStarts.delete(nodeId);
        } else {
            let nodeConnectionEnds = connectionEnds.get(nodeId);
            nodeConnectionEnds.delete(portIdx);
            if (nodeConnectionEnds.size == 0) {
                connectionEnds.delete(nodeId);
            }
        }
    }
    
    setContext("connectionFuncs", {
        outputPortMouseDown, inputPortMouseUp, inputPortMouseDragExit,
        updatePortPosition, deletePortPosition
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="se-holder" onwheel={handleMouseWheel}
    onmousedown={e => handleMouseDown(e, null)} onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave} style:--zoom-multiple={zoomMultiple}
    style:--pan-x={panX+"px"} style:--pan-y={panY+"px"}
    style:--se-offset-x={holderBounds.x+"px"}
    style:--se-offset-y={holderBounds.y+"px"}>

    <BoundObserver bind:bounds={holderBounds}/>
    
    <div class="se-background"></div>

    <div class="se-transformed">
        <div class="se-nodes">
            {#each selectedFile.nodes as node (node.id)}
                <div class="node-holder" onmousedown={e => handleMouseDown(e, node)}
                    style:--node-x={node.x+"px"} style:--node-y={node.y+"px"}
                    in:scaleNode out:scaleNode>
                    <VisualNode bind:data={node.data} nodeId={node.id}/>
                </div>
            {/each}
        </div>
    </div>

    <div class="se-connections">
        <svg width="100%" height="100%">
            {#if connectingStartNode && connectionStarts.has(connectingStartNode)}
                <PortConnection endPoint={{x: mouseX, y: mouseY}}
                    startPoint={connectionStarts.get(connectingStartNode)}/>
            {/if}
            {#each shownConnections as connection}
                <PortConnection startPoint={connection.start}
                    endPoint={connection.end}/>
            {/each}
        </svg>
    </div>

    <div class="se-label">
        <h2>{selectedFile.name}</h2>
    </div>
</div>

<style>
    .se-holder {
        height: 100%;
        position: relative;
        overflow: hidden;
        --background-scale: 2;
    }

    .se-transformed {
        width: 0;
        height: 0;
        position: relative;
        transform: scale(var(--zoom-multiple)) translate(var(--pan-x), var(--pan-y));
    }

    .se-background {
        position: absolute;
        inset: 0;
        image-rendering: crisp-edges;
        background-image: url("/grid.png");
        background-position:
            calc(var(--pan-x) * var(--zoom-multiple))
            calc(var(--pan-y) * var(--zoom-multiple));
        --background-zoom-repeat: 4;
        --background-zoom: calc(var(--zoom-multiple) / pow(var(--background-zoom-repeat), round(down, log(var(--zoom-multiple), var(--background-zoom-repeat)))));
        --background-len: calc(48px * var(--background-scale) * var(--background-zoom));
        background-size: var(--background-len) var(--background-len);
        height: 100%;
    }

    .se-label {
        color: var(--active-text-color);
        text-shadow: 0px 0px 1px var(--active-text-color);
        padding: var(--container-padding);
        position: absolute;
        bottom: 0;
        right: 0;
        opacity: 0.5;
    }

    .node-holder {
        --node-scale: 1;
        position: absolute;
        left: var(--node-x);
        top: var(--node-y);
        transform: translate(-50%, -50%) scale(var(--node-scale));
    }

    .se-connections {
        position: absolute;
        top: calc(-1 * var(--se-offset-y));
        left: calc(-1 * var(--se-offset-x));
        width: 100vw;
        height: 100vh;
        pointer-events: none;
    }
</style>

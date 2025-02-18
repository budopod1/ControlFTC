<script>
    import { getContext, hasContext, onDestroy } from "svelte";

    import BoundObserver from "./BoundObserver.svelte";

    import { DataType, getPortType } from "./data.svelte.js";

    let { nodeData, nodeId, portData, idx = 0, isOut } = $props();

    let type = $derived(getPortType(nodeData, portData));

    let bounds = $state();

    let connectPoint = $derived.by(() => {
        if (!bounds) return {x: 0, y: 0};
        return {
            x: isOut ? bounds.right : bounds.left,
            y: bounds.top + bounds.height / 2
        };
    });

    function stopDrag(e) {
        e.preventDefault();
    }

    let handleMouseDown = $state();
    let handleMouseUp = $state();
    let handleMouseLeave = $state();

    if (hasContext("connectionFuncs")) {
        let {
            outputPortMouseDown, inputPortMouseUp, inputPortMouseDragExit,
            updatePortPosition, deletePortPosition
        } = getContext("connectionFuncs");

        $effect(() => updatePortPosition({
            nodeId, isOut, portIdx: idx, position: connectPoint
        }));

        onDestroy(() => deletePortPosition({
            nodeId, isOut, portIdx: idx
        }));

        handleMouseDown = (e) => {
            e.stopPropagation();
            if (isOut) {
                outputPortMouseDown(nodeId);
            }
        };

        handleMouseUp = (e) => {
            e.stopPropagation();
            if (!isOut) {
                inputPortMouseUp(nodeId, idx);
            }
        };

        handleMouseLeave = (e) => {
            if (!isOut && e.buttons) {
                inputPortMouseDragExit(nodeId, idx);
            }
        }
    } else {
        handleMouseDown = () => {};
        handleMouseUp = () => {};
        handleMouseLeave = () => {};
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={["port", {"port-out": isOut, "port-in": !isOut}]}
    onmousedown={handleMouseDown} onmouseup={handleMouseUp}
    onmouseleave={handleMouseLeave}>
    <BoundObserver bind:bounds={bounds}/>

    <div class="port-icon">
        {#if type == DataType.Bool}
            <img src="./boolicon.svg" alt="bool" ondragstart={stopDrag}/>
        {:else if type == DataType.Real}
            <img src="./realicon.svg" alt="real" ondragstart={stopDrag}/>
        {/if}
    </div>
    
    {#if portData.label}
        <div class="port-label">{portData.label}</div>
    {/if}
</div>

<style>
    .port {
        position: relative;
    }

    .port-icon img {
        width: 100%;
        height: auto;
    }

    .port-icon {
        position: relative;
        font-size: 0;
    }

    .port-out .port-icon {
        right: calc(-1 * var(--container-padding));
    }

    .port-in .port-icon {
        left: calc(-1 * var(--container-padding));
    }

    .port-label {
        position: absolute;
        top: 0;
        bottom: 0;
        pointer-events: none;
        font-size: 0.7rem;
        writing-mode: vertical-rl;
        text-align: center;
        text-shadow: 2px 0px 4px white, 0px 2px 4px white, -2px 0px 4px white, 0px -2px 4px white;
    }

    .port-out .port-label {
        left: 0;
    }

    .port-in .port-label {
        right: 0;
    }
</style>

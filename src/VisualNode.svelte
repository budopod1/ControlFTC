<script>
    import AxisProp from "./AxisProp.svelte";
    import ButtonProp from "./ButtonProp.svelte";
    import CheckboxProp from "./CheckboxProp.svelte";
    import InputProp from "./InputProp.svelte";
    import NodePort from "./NodePort.svelte";
    import SelectProp from "./SelectProp.svelte";
    import TypeProp from "./TypeProp.svelte";

    import { getNodeInputs, getNodeProp } from "./data.svelte";

    let { data = $bindable(), nodeId = null } = $props();

    function shouldShowProp(prop) {
        if (prop.hideWhen && getNodeProp(data, prop.hideWhen).value) {
            return false;
        } else if (prop.showWhen && !getNodeProp(data, prop.showWhen).value) {
            return false;
        }
        return true;
    }
</script>

<div class="node">
    <div class="node-name">{data.name}</div>
    <div class="node-inputs">
        {#each getNodeInputs(data) as input, idx}
            <NodePort nodeData={data} {nodeId} portData={input} {idx} isOut={false}/>
        {/each}
    </div>
    <div class="node-props">
        {#each data.props || [] as prop, i}
            {#if shouldShowProp(prop)}
                <div class={["node-prop", {"center-node-prop": prop.center}]}>
                    {#if prop.type == "button"}
                        <ButtonProp bind:prop={data.props[i]}/>
                    {:else if prop.type == "input"}
                        <InputProp bind:prop={data.props[i]}/>
                    {:else if prop.type == "type"}
                        <TypeProp bind:prop={data.props[i]}/>
                    {:else if prop.type == "select"}
                        <SelectProp bind:prop={data.props[i]}/>
                    {:else if prop.type == "checkbox"}
                        <CheckboxProp bind:prop={data.props[i]}/>
                    {:else if prop.type == "axis"}
                        <AxisProp bind:prop={data.props[i]}/>
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
    <div class="node-outputs">
        {#if data.output}
            <NodePort nodeData={data} {nodeId} portData={data.output} isOut={true}/>
        {/if}
    </div>
</div>

<style>
    .node {
        min-width: 10rem;
        padding: var(--container-padding);
        background-color: white;
        color: black;
        border-radius: 0.2rem;
        user-select: none;
        cursor: grab;
        font-size: 0.9rem;
        display: inline-grid;
        --port-width: 1rem;
        grid-template-columns: var(--port-width) minmax(max-content, auto) var(--port-width);
        grid-template-rows: auto auto;
    }

    .node-name {
        grid-row: 1;
        grid-column: span 3;
        padding-bottom: var(--container-padding);
    }

    .node-inputs {
        grid-column: 1;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--container-padding);
    }

    .node-props {
        grid-column: 2;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--container-padding);
    }

    .center-node-prop, :global(.center-node-prop *) {
        text-align: center;
    }

    .node-outputs {
        grid-column: 3;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>

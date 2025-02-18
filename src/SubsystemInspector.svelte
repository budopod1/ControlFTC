<script>
    import Collapsible from "./Collapsible.svelte";
    import VisualNode from "./VisualNode.svelte";

    import { NODE_CATEGORIES, NODE_TYPES, actions, DRAGGING_BUTTON } from "./data.svelte.js";

    let { selectedFile } = $props();

    let categoryLists = $state(NODE_CATEGORIES.map(category => ({
        name: category, nodes: NODE_TYPES.filter(nodeData => nodeData.category == category)
    })));

    function handleNodeMouseDown(e, node) {
        if (e.button != DRAGGING_BUTTON) return;
        actions.setNextNode($state.snapshot(node));
    }
</script>

{#each categoryLists as categoryList}
    <Collapsible>
        {#snippet header()}
            {categoryList.name}
        {/snippet}

        {#each categoryList.nodes as nodeData, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="demo-node-holder"
                onmousedown={e => handleNodeMouseDown(e, nodeData)}>
                <VisualNode bind:data={categoryList.nodes[i]}/>
            </div>
        {/each}
    </Collapsible>
{/each}

<style>
    .demo-node-holder {
        width: max-content;
    }

    .demo-node-holder:not(:last-child) {
        padding-bottom: 0.5rem;
    }

    :global .inspector .collapsible:not(:last-child) {
        border-bottom: none;
    }
</style>

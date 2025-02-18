<script>
    let { items, direction } = $props();

    let draggingBar = $state();
    let elements = $state(Array(items.length).fill(null));
    let changedSizes = $state(Array(items.length).fill(null));

    function barPressed(i) {
        draggingBar = i;
    }

    window.addEventListener("mouseup", () => {
        draggingBar = null;
    });

    window.addEventListener("mousemove", (e) => {
        if (draggingBar == null) return;
        let delta = {column: e.movementY, row: e.movementX}[direction];
        let pastCenter = false;
        let itemIdx = draggingBar - 1;
        for (let i in items) {
            if (items[i].center) {
                pastCenter = true;
                itemIdx++;
            }
            if (+i === itemIdx) break;
        }
        let sizePropMap = {row: "offsetWidth", column: "offsetHeight"};
        let size = elements[itemIdx][sizePropMap[direction]];
        if (pastCenter) {
            size -= delta;
        } else {
            size += delta;
        }
        changedSizes[itemIdx] = size+"px";
    });
</script>

<div class="split-container" style:--flex-direction={direction}>
    {#each items as item, i}
        {#if i > 0}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class={["split-bar", {"selected-bar": draggingBar == i}]}
                onmousedown={() => barPressed(i)}></div>
        {/if}
        <div class="split-item" style:flex-grow={item.center?"1":"0"}
            style:--item-size={changedSizes[i] || item.size || "0"}
            bind:this={elements[i]}>
            {@render item.element()}
        </div>
    {/each}
</div>

<style>
    .split-container {
        display: flex;
        flex-direction: var(--flex-direction);
        align-items: stretch;
        width: 100%;
        height: 100%;
        --handle-size: 3px;
    }

    .split-item {
        width: var(--item-size);
    }

    .split-bar {
        flex-basis: var(--border-size);
        background-color: var(--border-color);
        position: relative;
        cursor: col-resize;
    }

    .selected-bar::after {
        background-color: var(--active-color);
    }

    .split-bar::after {
        content: "";
        position: absolute;
        top: calc(-1*var(--handle-size));
        bottom: calc(-1*var(--handle-size));
        left: calc(-1*var(--handle-size));
        right: calc(-1*var(--handle-size));
    }
</style>

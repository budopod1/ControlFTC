<script>
    import { actions } from "./data.svelte.js";

    let { prop = $bindable() } = $props();

    function selectAxis() {
        actions.chooseAxis().then((axis) => {
            if (axis != null) {
                prop.value = axis;
            }
        });
    }
</script>

{prop.name}
<button onclick={selectAxis} onmousedown={e => e.stopPropagation()}>
    {prop.value || " "}
</button>

<style>
    button {
        border: solid 1px black;
        white-space: pre;
        --line-height: 1.2;
        line-height: var(--line-height);
        min-width: calc(var(--line-height) * 1em);
        padding: 1px;
        box-sizing: content-box;
    }
</style>

<script>
    import { actions } from "./data.svelte.js";

    let { prop = $bindable() } = $props();

    function selectButton() {
        actions.chooseButton().then((button) => {
            if (button != null) {
                prop.value = button;
            }
        });
    }
</script>

{prop.name}
<button onclick={selectButton} onmousedown={e => e.stopPropagation()}>
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

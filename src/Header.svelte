<script>
    import { actions, state_ } from "./data.svelte.js";

    function doCompile() {
        actions.compileOpmode(state_.opmode);
    }
</script>

<div class="header-bar">
    <h1>
        ControlFTC
    </h1>
    <div class="header-tools">
        <button class="btn" onclick={doCompile}>Compile</button>
    </div>
</div>

<style>
    .header-bar {
        padding: var(--container-padding);
        border-bottom: solid var(--border-size) var(--border-color);
        display: flex;
        gap: var(--container-padding);
    }

    h1 {
        flex-grow: 1;
    }

    .header-tools {
        display: flex;
        gap: var(--border-size);
        background-color: var(--border-color);
        padding: var(--border-size);
    }
</style>

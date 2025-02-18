<script>
    import { FileType } from "./data.svelte.js";

    let { file } = $props();
</script>

{#if file.type == FileType.Subsystem}
    <i class="bi bi-diagram-2 bi-rot-90" style:color="#2bce2e"></i>
{:else if  file.type == FileType.Template}
    <i class="bi bi-braces" style:color="#ff8000"></i>
{/if}

<style>
    .bi-rot-90::before {
        rotate: 90deg;
    }
</style>

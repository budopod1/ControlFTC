<script>
    import FileTypeIcon from "./FileTypeIcon.svelte";
    import SubsystemInspector from "./SubsystemInspector.svelte";

    import { state_, getFileById, FileType } from "./data.svelte.js";

    let selectedFile = $derived(getFileById(state_.selectedFileID));
</script>

<div class="inspector">
    <h2>
        <i class="bi bi-wrench-adjustable"></i>
        {#if selectedFile == null}
            Nothing selected
        {:else}
            <FileTypeIcon file={selectedFile}/>
            {selectedFile.name}
        {/if}
    </h2>

    {#key selectedFile?.id}
        {#if selectedFile?.type == FileType.Subsystem }
            <SubsystemInspector {selectedFile}/>
        {/if}
    {/key}
</div>

<style>
    .inspector {
        padding: var(--container-padding);
        /* extra bottom padding so you can scroll a bit past the last item */
        padding-bottom: calc(5rem + var(--container-padding)); 
        height: 100%;
        overflow-y: auto;
    }
    
    h2 {
        padding-bottom: var(--container-padding);
    }
</style>

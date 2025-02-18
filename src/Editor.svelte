<script>
    import SubsystemEditor from "./SubsystemEditor.svelte";
    import TemplateEditor from "./TemplateEditor.svelte";

    import { state_, getFileById, FileType } from "./data.svelte.js";

    let selectedFile = $derived(getFileById(state_.selectedFileID));
</script>

{#key selectedFile?.id}
    {#if selectedFile == null}
        <div class="center">
            <div>
                No file open
            </div>
        </div>
    {:else if selectedFile.type == FileType.Template}
        <TemplateEditor/>
    {:else if selectedFile.type == FileType.Subsystem}
        <SubsystemEditor/>
    {/if}
{/key}

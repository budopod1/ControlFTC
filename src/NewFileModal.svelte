<script>
    import Modal from "./Modal.svelte";

    import { state_, actions, TemplateFile, SubsystemFile } from "./data.svelte.js";

    let openModal = $state();
    let newFileType = $state("subsystem");

    actions.addFile = async () => {
        if (await openModal()) {
            let cons = {
                subsystem: SubsystemFile,
                template: TemplateFile
            }[newFileType];
            let file = new cons();
            state_.opmode.files.push(file);
            state_.selectedFileID = file.id;
        }
    };
</script>

<Modal title="New file" bind:openModal={openModal}>
    Create a 
    <select bind:value={newFileType}>
        <option value="subsystem">subsystem</option>
        <option value="template">template</option>
    </select>.

    {#snippet footer()}
        <button type="submit" class="btn">Create</button>
    {/snippet}
</Modal>

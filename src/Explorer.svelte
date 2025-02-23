<script>
    import { fly } from "svelte/transition";
	import { flip } from 'svelte/animate';

    import FileTypeIcon from "./FileTypeIcon.svelte";

    import { state_, actions } from "./data.svelte.js";

    let sortedFiles = $derived(state_.opmode.files.toSorted(
        (a, b) => +(a.name > b.name) - +(a.name < b.name)
    ));

    function updateFileName(file, e) {
        file.name = e.target.value;
    }

    function selectFile(e, file) {
        e.stopPropagation();
        state_.selectedFileID = file?.id;
    }

    function handleTrashClick(e, fileId) {
        e.stopPropagation();
        actions.deleteFile(fileId);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="explorer">
    <div class="name-row">
        <b>
            <input bind:value={state_.opmode.name} class="text-input"
                aria-label="OpMode name">
        </b>
        <button aria-label="new file" onclick={actions.addFile}>
            <i class="bi bi-file-earmark-plus"></i>
        </button>
        <button aria-label="manage opmodes" onclick={actions.manageOpmodes}>
            <i class="bi bi-folder2"></i>
        </button>
    </div>

    <div class="file-list" role="list">
        {#each sortedFiles as file (file.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div class={["name-row", {"selected-name-row": state_.selectedFileID == file.id}]}
                in:fly={{ x: -100 }} out:fly={{ x: -100 }} animate:flip
                onclick={(e) => selectFile(e, file)} role="listitem">
                <FileTypeIcon {file}/>
                <input onfocusout={(e)=>updateFileName(file, e)} value={file.name} 
                    disabled={state_.selectedFileID != file.id} class="text-input"
                    aria-label="file name">
                <div class="file-actions">
                    <button aria-label="delete file"
                        onclick={(e) => handleTrashClick(e, file.id)}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        {/each}
    </div>

    <div class="explorer-rest" onclick={(e) => selectFile(e, null)}></div>
</div>

<style>
    .explorer {
        height: 100%;
        padding: var(--container-padding);
        display: flex;
        flex-direction: column;
    }

    .file-list {
        font-size: 0.9rem;
    }

    .file-actions {
        visibility: hidden;
    }

    .name-row:hover .file-actions {
        visibility: visible;
    }

    .explorer-rest {
        flex-grow: 1;
    }
</style>

<script>
    import Modal from "./Modal.svelte";

    import { actions, allOpmodes, newOpmode, switchOpmode, deleteOpmode, state_ } from "./data.svelte.js";

    let openModal = $state();

    actions.manageOpmodes = async () => {
        await openModal();
    };

    function handleTrashClick(e, opmode) {
        e.stopPropagation();
        let confirmMsg = `Are you sure you want to delete this '${opmode.name}'. 
This CANNOT be undone.`;
        if (confirm(confirmMsg)) deleteOpmode(opmode.id);
    }
</script>

<Modal title="Manage Opmodes" bind:openModal>
    <div class="opmode-list">
        {#each allOpmodes as opmode, i (opmode.id)}
            {@const isSelected = opmode.id == state_.opmode.id}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class={[
                    "name-row", "opmode-item",
                    {"selected-opmode-item": isSelected}
                ]} onclick={() => switchOpmode(opmode.id)}>
                <input bind:value={allOpmodes[i].name} class="text-input"
                    aria-label="opmode name" disabled={!isSelected}/>
                <div class="opmode-actions">
                    <button aria-label="delete opmode" type="button"
                        onclick={(e) => handleTrashClick(e, opmode)}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        {/each}
    </div>

    {#snippet footer()}
        <button type="button" class="btn" onclick={newOpmode}>
            New Opmode
        </button>
        <div class="flex-spacer"></div>
        <button type="submit" class="btn">
            Done
        </button>
    {/snippet}
</Modal>

<style>
    .opmode-list {
        display: flex;
        flex-direction: column;
        min-height: 15vh;
        max-height: 50vh;
        overflow-y: scroll;
    }

    .opmode-item {
        background-color: var(--focus-background-color);
        padding: var(--container-padding);
        cursor: pointer;
        border-bottom: solid var(--border-size) var(--border-color);
    }

    .opmode-item:first-child {
        border-top: solid var(--border-size) var(--border-color);
    }

    .selected-opmode-item {
        background-color: var(--background-color);
    }

    .opmode-actions {
        visibility: hidden;
    }

    .opmode-item:hover .opmode-actions {
        visibility: visible;
    }

    .flex-spacer {
        flex-grow: 1;
    }
</style>

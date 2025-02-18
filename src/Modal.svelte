<script>
    let { openModal = $bindable(), closeModal = $bindable(), title, children, footer } = $props();

    let dialog;
    let resolvePromise = null;
    let rejectPromise = null;

    openModal = async () => {
        dialog.showModal();
        let { promise, resolve, reject } = Promise.withResolvers();
        resolvePromise = resolve;
        rejectPromise = reject;
        try {
            await promise;
            return true;
        } catch {
            return false;
        }
    }

    closeModal = () => {
        dialog.close();
    };

    function onDialogClose() {
        if (rejectPromise != null) {
            rejectPromise();
        }
    }

    function onFormSubmit() {
        if (resolvePromise != null) {
            resolvePromise();
        }
    }
</script>

<dialog bind:this={dialog} onclose={onDialogClose}>
    <form method="dialog" class="dialog-form" onsubmit={onFormSubmit}>
        <div class="dialog-header">
            <div class="dialog-header-title">
                <h2>{title}</h2>
            </div>
            <button class="dialog-header-close" aria-label="close modal"
                onclick={closeModal} type="button">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        {#if children != null}
            <div class="dialog-body">
                {@render children()}
            </div>
        {/if}
        <div class="dialog-footer">
            {@render footer()}
        </div>
    </form>
</dialog>

<style>
    dialog {
        border: none;
        background-color: var(--focus-background-color);
        color: var(--active-text-color);
        padding: var(--modal-padding);
        min-width: 40vw;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.3);
    }

    dialog > :not(:last-child) {
        border-bottom: solid var(--border-size) var(--border-color);
    }

    .dialog-form > div {
        padding: var(--container-padding);
    }

    .dialog-header {
        display: flex;
    }

    .dialog-header-title {
        flex-grow: 1;
    }

    .dialog-footer {
        display: flex;
        justify-content: end;
    }
</style>

<script>
    import { basicSetup } from "codemirror";
    import { EditorView } from "@codemirror/view";
    import { EditorState } from "@codemirror/state";
    import { indentUnit } from "@codemirror/language";
    import { oneDark } from "@codemirror/theme-one-dark";
    import { java } from "@codemirror/lang-java";

    import Modal from "./Modal.svelte";

    import { actions, FileType } from "./data.svelte.js";

    let openModal = $state();

    let isModalOpen = $state(false);

    let opmode = $state(null);

    let templateFiles = $derived(opmode?.files?.filter(
        file => file.type == FileType.Template
    ));

    let currentTemplate = $state(null);

    let compilationResult = $state("");

    let resultParent;

    let view;

    $effect(() => {
        if (!resultParent) return;

        let extensions = [
            basicSetup,
            java(),
            oneDark,
            indentUnit.of("    "),
            EditorState.readOnly.of(true),
            EditorView.editable.of(false),
            EditorView.contentAttributes.of({tabindex: "0"})
        ];

        let state = EditorState.create({
            extensions
        });

        view = new EditorView({
            parent: resultParent,
            state,
        });
    });

    $effect(() => {
        let doc = view.state.doc;

        if (doc.toString() != compilationResult) {
            view.dispatch({changes: {
                from: 0, to: doc.length, insert: compilationResult
            }});
        }
    });

    $effect(() => {
        if (!isModalOpen) return;
        compilationResult = currentTemplate && opmode
            ? currentTemplate.compile(opmode) : "";
    });

    $effect(() => {
        if (templateFiles == null) {
            return;
        } else if (templateFiles.length == 0) {
            currentTemplate = null;
        } else if (!templateFiles.some(file => file == currentTemplate)) {
            currentTemplate = templateFiles.at(-1);
        }
    });

    actions.compileOpmode = (opmodeToCompile) => {
        opmode = opmodeToCompile;
        opmode.doCleanupWork();
        isModalOpen = true;
        openModal().finally(() => isModalOpen = false);
    };

    let copyPrompt = $state(null);

    function copyResult() {
        navigator.clipboard.writeText(compilationResult)
            .then(() => copyPrompt = "Copied!")
            .catch(() => copyPrompt = "Could not copy");
    }
</script>

<Modal title={opmode ? "Compile "+opmode.name : ""} bind:openModal
    dialogClass="compile-modal">
    <div class="compile-body">
        <div class="compile-options">
            <div class="compile-option">
                Use template <select bind:value={currentTemplate}>
                    {#each templateFiles || [] as file (file.id)}
                        <option value={file}>{file.name}</option>
                    {:else}
                        <option value={null}>none avaliable</option>
                    {/each}
                </select>
            </div>
        </div>
        <hr>
        <div class="compile-result">
            <div class="compile-result-header">
                <span>Result</span>
                <button class="btn" type="button" onclick={copyResult}
                    onmouseleave={() => copyPrompt = null}>
                    {#if copyPrompt != null}
                        {copyPrompt}
                    {:else}
                        <i class="bi bi-clipboard"></i> Copy
                    {/if}
                </button>
            </div>
            <div class="compile-result-txt" bind:this={resultParent}></div>
        </div>
    </div>

    {#snippet footer()}
        <button type="submit" class="btn">Done</button>
    {/snippet}
</Modal>

<style>
    :global .compile-modal {
        width: 95vw;
        height: 90vh;
    }

    :global .compile-modal > form {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :global .compile-modal > form > .dialog-body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }

    .compile-body {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .compile-result {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .compile-result-header {
        display: flex;
        justify-content: space-between;
    }

    .compile-result-txt {
        flex-grow: 1;
        overflow: hidden;
    }
</style>
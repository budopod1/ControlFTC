<script>
    import { basicSetup } from "codemirror";
    import { EditorView, keymap } from "@codemirror/view";
    import { EditorState } from "@codemirror/state";
    import { indentWithTab } from "@codemirror/commands";
    import { indentUnit } from "@codemirror/language";
    import { oneDark } from "@codemirror/theme-one-dark";
    import { java } from "@codemirror/lang-java";

    import { state_, getFileById } from "./data.svelte.js";

    let selectedFile = $derived(getFileById(state_.selectedFileID));

    let editorParent;

    let view;

    $effect(() => {
        if (!editorParent) return;

        let extensions = [
            basicSetup, 
            java(),
            keymap.of([indentWithTab]),
            oneDark,
            indentUnit.of("    "),
            EditorView.updateListener.of((e) => {
                selectedFile.text = e.state.doc.toString();
            })
        ];

        let state = EditorState.create({
            extensions
        });

        view = new EditorView({
            parent: editorParent,
            state,
        });
    });

    $effect(() => {
        let text = selectedFile.text;
        let doc = view.state.doc;

        if (doc.toString() != text) {
            view.dispatch({changes: {
                from: 0, to: doc.length, insert: text
            }});
        }
    });
</script>

<div class="editor-parent" bind:this={editorParent}></div>

<style>
    .editor-parent {
        height: 100%;
    }

    :global .cm-editor {
        width: 100%;
        height: 100%;
    }
</style>

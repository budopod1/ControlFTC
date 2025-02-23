<script>
    import Header from "./Header.svelte";
    import SplitScreen from "./SplitScreen.svelte";
    import Explorer from "./Explorer.svelte";
    import Editor from "./Editor.svelte";
    import Inspector from "./Inspector.svelte";
    import Footer from "./Footer.svelte";
    import ManageOpmodesModal from "./ManageOpmodesModal.svelte";
    import NewFileModal from "./NewFileModal.svelte";
    import ChooseButtonModal from "./ChooseButtonModal.svelte";
    import ChooseAxisModal from "./ChooseAxisModal.svelte";

    import { state_, actions, saveState } from "./data.svelte.js";

    actions.deleteFile = (id) => {
        state_.opmode.files = state_.opmode.files.filter(
            file => file.id != id);
    };

    const SAVE_TIMEOUT = 2 * 1000;

    $effect(() => {
        $state.snapshot(state_);

        const timeout = setTimeout(saveState, SAVE_TIMEOUT);

        // if the data is updated again soon enough, don't bother saving
        return () => {
            clearTimeout(timeout);
        };
    });
</script>

<header>
    <Header/>
</header>
<main>
    <SplitScreen items={[
        {element: Explorer, size: "20%"}, 
        {element: Editor, center: true}, 
        {element: Inspector, size: "25%"}
    ]} direction="row"/>
</main>
<footer>
    <Footer/>
</footer>

<ManageOpmodesModal/>
<NewFileModal/>
<ChooseButtonModal/>
<ChooseAxisModal/>

<style>
    :global(#app) {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    main {
        flex-grow: 1;
        min-height: 0;
    }
</style>

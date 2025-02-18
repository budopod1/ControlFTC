<script>
    import { onMount } from "svelte";

    let { bounds = $bindable() } = $props();

    bounds = {};

    let elem;

    onMount(() => {
        bounds = elem.getBoundingClientRect();

        let animationFrame;

        function checkPosition() {
            animationFrame = requestAnimationFrame(checkPosition);

            let newBounds = elem.getBoundingClientRect();

            for (let prop of ["x", "y", "width", "height"]) {
                if (bounds[prop] != newBounds[prop]) {
                    bounds = newBounds;
                    break;
                }
            }
        }

        animationFrame = requestAnimationFrame(checkPosition);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    });
</script>

<div class="bound-observer" bind:this={elem}></div>

<style>
    .bound-observer {
        position: absolute;
        inset: 0;
    }
</style>

<script>
    import { sineInOut } from "svelte/easing";

    let { header, children } = $props();

    const COLLAPSE_DURATION = 400;

    // function collapse(element, { duration }) {
    //     let computedStyle = getComputedStyle(element);
    //     let paddingTop = parseInt(computedStyle.paddingTop);
    //     let paddingBottom = parseInt(computedStyle.paddingBottom);
    //     debugger;
    //     let height = element.children[0].clientHeight + paddingTop + paddingBottom;

    //     return {
    //         duration,
    //         css: (t, u) => {
    //             let eased = sineInOut(t);

    //             return `
    //                 max-height: ${height*eased}px;
    //                 padding-top: ${paddingTop*eased}px;
    //                 padding-bottom: ${paddingBottom*eased}px;
    //             `;
    //         }
    //     };
    // }

    function collapse(element) {
        return {
            duration: COLLAPSE_DURATION,
            easing: sineInOut,
            tick: (t, u) => {
                if (t > 0.999) {
                    element.style.maxHeight = "unset";
                } else {
                    let height = element.children[0].clientHeight;
                    element.style.maxHeight = height*t+"px";
                }
            }
        };
    }

    let open = $state(false);
</script>

<div class={["collapsible", {"collapsible-collapsed": !open}]}
    style:--collapse-duration={COLLAPSE_DURATION/1000+"s"}>
    <button class="collapsible-header" onclick={() => open = !open}>
        <span class="collapsible-arrow">
            <i class="bi bi-caret-right-fill"></i>
        </span>
        <span>
            {@render header()}
        </span>
    </button>
    {#if open}
        <div class="collapsible-body" in:collapse out:collapse>
            <div class="collapsible-content">{@render children()}</div>
        </div>
    {/if}
</div>

<style>
    .collapsible {
        border: solid var(--border-size) var(--border-color);
        border-left: none;
        border-right: none;
    }

    .collapsible-header {
        display: flex;
        width: 100%;
        padding: 0;
        text-align: left;
    }

    .collapsible-arrow {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: var(--collapsible-indent);
        transition: rotate var(--collapse-duration);
        rotate: 90deg;
        font-size: 0.9rem;
    }

    .collapsible-collapsed .collapsible-arrow {
        rotate: 0deg;
    }
    
    .collapsible-body {
        overflow: hidden;
    }

    .collapsible-content {
        --vertical-padding: var(--container-padding);
        padding-top: var(--vertical-padding);
        padding-bottom: var(--vertical-padding);
        padding-left: var(--collapsible-indent);
        padding-right: var(--container-padding);
    }
</style>

<script>
    let { prop = $bindable() } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<label onmousedown={e => e.stopPropagation()}>
    <input bind:checked={prop.value} type="checkbox"/> {prop.name}
</label>

<script>
    let { prop = $bindable() } = $props();
</script>

<label>
    {prop.before}
    <select bind:value={prop.value} onmousedown={e => e.stopPropagation()}>
        {#each prop.options as option}
            <option value={option}>{option}</option>
        {/each}
    </select>
    {prop.after}
</label>

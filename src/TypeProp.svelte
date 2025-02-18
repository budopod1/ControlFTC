<script>
    import { DataType } from "./data.svelte";

    let { prop = $bindable() } = $props();
</script>

<label>
    {prop.name}
    <select bind:value={prop.value} onmousedown={e => e.stopPropagation()}>
        {#each Object.values(DataType) as dataType}
            <option value={dataType}>{dataType}</option>
        {/each}
    </select>
</label>

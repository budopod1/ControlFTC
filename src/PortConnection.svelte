<script>
    let { startPoint, endPoint } = $props();

    let straightDist = 20;

    let d = $derived(
        `M ${startPoint.x} ${startPoint.y} h ${straightDist} L ${endPoint.x - straightDist} ${endPoint.y} h ${straightDist}`
    );
</script>

<path {d}/>

<style>
    path {
        fill: none;
        stroke: #b2b2b2;
        stroke-width: 5px;
        stroke-linejoin: round;
    }
</style>

<script>
    let { prop = $bindable() } = $props();

    function correctValue(val) {
        if (prop.inputType == "number") {
            let num = +val;
            if (Number.isNaN(num)) num = 0;
            if (Number.isFinite(prop.minValue)) {
                num = Math.max(prop.minValue, num);
            }
            if (Number.isFinite(prop.maxValue)) {
                num = Math.min(prop.maxValue, num);
            }
            return num;
        } else {
            return val;
        }
    }

    let tempValue = $state();

    $effect(() => tempValue = prop.value.toString());

    function handleInput() {
        let corrected = correctValue(tempValue);
        if (tempValue == corrected.toString()) {
            prop.value = corrected;
        }
    }

    function handleFocusOut() {
        prop.value = correctValue(tempValue);
        tempValue = prop.value.toString();
    }
</script>

<label>
    {prop.name}
    <input bind:value={tempValue} type={prop.inputType} oninput={handleInput}
        onfocusout={handleFocusOut} onmousedown={e => e.stopPropagation()}/>
</label>

<style>
    input {
        width: 5rem;
        border: solid 1px black;
    }

    input[type=number] {
        width: 4rem;
    }
</style>

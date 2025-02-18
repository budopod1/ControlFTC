<div class="header-bar">
    <h1>
        ControlFTC
    </h1>
    <div class="header-tools">
        <button class="btn">Btn 1</button>
        <button class="btn">Btn 2</button>
        <button class="btn">Btn 3</button>
    </div>
</div>

<style>
    .header-bar {
        padding: var(--container-padding);
        border-bottom: solid var(--border-size) var(--border-color);
        display: flex;
        gap: var(--container-padding);
    }

    h1 {
        flex-grow: 1;
    }

    .header-tools {
        display: flex;
        gap: var(--border-size);
        background-color: var(--border-color);
        padding: var(--border-size);
    }
</style>

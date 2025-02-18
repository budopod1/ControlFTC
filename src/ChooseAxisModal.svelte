<script>
    import Modal from "./Modal.svelte";

    import { actions, GamepadJoystick, GamepadAxis, joystickToAxis } from "./data.svelte.js";

    let selectedJoystick = $state(null);
    let selectedButton = $state(null);
    let openModal = $state();
    let closeModal = $state();

    actions.chooseAxis = async () => {
        selectedJoystick = null;
        selectedButton = null;
        await openModal();
        return selectedButton;
    };

    function addSelectableClass(doc) {
        for (let elem of doc.getElementsByClassName("axis")) {
            elem.classList.add("selectable");
        }
    }

    function addClickEvents(doc, bindings, func) {
        for (let [class_, value] of Object.entries(bindings)) {
            let elem = doc.getElementsByClassName(class_)[0];
            elem.addEventListener("click", () => func(value));
        }
    }

    function chooseButton(button) {
        selectedButton = button;
        closeModal();
    }

    function chooseJoystick(joystick) {
        selectedJoystick = joystick;
    }
    
    function chooseXOrY(axis) {
        chooseButton(joystickToAxis(selectedJoystick, axis));
    }

    function mainDiagramLoaded(e) {
        let gamepadDoc = e.target.contentDocument;
        addSelectableClass(gamepadDoc);
        addClickEvents(gamepadDoc, {
            left_joystick: GamepadJoystick.LeftStick,
            right_joystick: GamepadJoystick.RightStick
        }, chooseJoystick);
    }

    function triggerDiagramLoaded(e) {
        let gamepadDoc = e.target.contentDocument;
        addSelectableClass(gamepadDoc);
        addClickEvents(gamepadDoc, {
            left_trigger: GamepadAxis.LeftTrigger,
            right_trigger: GamepadAxis.RightTrigger
        }, chooseButton);
    };
</script>

<Modal title="Choose an axis" bind:openModal bind:closeModal>
    <object data="gamepadtriggers.svg" type="image/svg+xml"
        onload={triggerDiagramLoaded} aria-label="FTC Gamepad Triggers"
        class="gamepad-diagram"></object>
    <object data="ftcgamepad.svg" type="image/svg+xml" onload={mainDiagramLoaded}
        aria-label="FTC Gamepad" class="gamepad-diagram"></object>
    
    {#if selectedJoystick != null}
        <div class="info-row">
            <div>
                Selected joystick: {selectedJoystick}
            </div>
            <div>
                Axis:
                <button onclick={() => chooseXOrY("x")} class="btn">
                    X
                </button>
                <button onclick={() => chooseXOrY("y")} class="btn">
                    Y
                </button>
            </div>
        </div>
    {/if}

    {#snippet footer()}
        <button type="submit" class="btn">Cancel</button>
    {/snippet}
</Modal>

<style>
    .gamepad-diagram {
        width: 55rem;
        height: auto;
        display: block;
    }

    @media (width < 60rem) {
        .gamepad-diagram {
            width: 100%;
        }
    }

    .info-row {
        display: flex;
        justify-content: space-between;
    }
</style>

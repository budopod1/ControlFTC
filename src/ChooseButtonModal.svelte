<script>
    import Modal from "./Modal.svelte";

    import { actions, GamepadButton } from "./data.svelte.js";

    let selectedButton = $state(null);
    let openModal = $state();
    let closeModal = $state();

    actions.chooseButton = async () => {
        selectedButton = null;
        await openModal();
        return selectedButton;
    };

    function chooseButton(button) {
        selectedButton = button;
        closeModal();
    }

    const BUTTON_BINDINGS = {
        a: GamepadButton.A,
        b: GamepadButton.B,
        back: GamepadButton.Back,
        guide: GamepadButton.Guide,
        left_bumper: GamepadButton.LeftBumper,
        left_joystick: GamepadButton.LeftStickButton,
        right_bumper: GamepadButton.RightBumper,
        right_joystick: GamepadButton.RightStickButton,
        start: GamepadButton.Start,
        x: GamepadButton.X,
        y: GamepadButton.Y
    };

    function diagramLoaded(e) {
        let gamepadDoc = e.target.contentDocument;

        for (let elem of gamepadDoc.getElementsByClassName("button")) {
            elem.classList.add("selectable");
        }

        for (let [class_, button] of Object.entries(BUTTON_BINDINGS)) {
            let elem = gamepadDoc.getElementsByClassName(class_)[0];
            elem.addEventListener("click", () => chooseButton(button));
        }

        let dpad = gamepadDoc.getElementsByClassName("dpad")[0];

        dpad.addEventListener("click", (e) => {
            let bound = dpad.getBoundingClientRect();
            let relX = e.clientX - (bound.x + bound.width / 2);
            let relY = (bound.y + bound.height / 2) - e.clientY;
            if (relX > Math.abs(relY)) {
                chooseButton(GamepadButton.DPadRight);
            } else if (relX < -Math.abs(relY)) {
                chooseButton(GamepadButton.DPadLeft);
            } else if (relY > Math.abs(relX)) {
                chooseButton(GamepadButton.DPadUp);
            } else if (relY < -Math.abs(relX)) {
                chooseButton(GamepadButton.DPadDown);
            }
        });
    };
</script>

<Modal title="Choose a button" bind:openModal bind:closeModal>
    <object data="/ftcgamepad.svg" type="image/svg+xml" onload={diagramLoaded}
        aria-label="FTC Gamepad" class="gamepad-diagram"></object>

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
</style>

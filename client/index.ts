import * as alt from 'alt-client';
import { useNativeMenu } from '@Client/menus/native/index.js';

const menu = useNativeMenu({
    header: 'Admin Menu',
    noExit: false, // Prevent menu from exiting forcing it open if set to true
    backCallback: () => {
        menu.destroy()
    }, // Call another function when backspace is pressed. Showing another menu, or something else.
    options: [
        {
            text: 'Heal',
            type: 'invoke',
            value: 'heal',
            callback: (value: string) => {
                alt.emitServerRaw(value)
            }
        },
        {
            text: 'GoTo Pizza Place',
            type: 'invoke',
            value: '',
            callback: () => {
                alt.emitServerRaw('teleportToPizzaPlace')
            }
        },
        {
            text: 'Spawn Vehicle',
            type: 'input',
            value: '',
            callback: (value: string) => {
                alt.emitServerRaw('spawnVehicle', value)
            }
        }
    ]
});

alt.on('keyup', (key) => {
    // F11
    if (key === 122) {
        menu.open();
    }
});
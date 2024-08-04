import * as alt from 'alt-client'
import * as native from 'natives'
import { useNativeMenu } from '@Client/menus/native/index.js'

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
            text: 'Try Cool Stuff',
            type: 'invoke',
            value: '',
            callback: () => {
                alt.emitServerRaw('tryCoolStuff')
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
})

const dict = 'anim@scripted@freemode@ig9_pizza@male@'
alt.onRpc('startAnimation', async (prop: alt.Object) => {
    await alt.Utils.requestAnimDict(dict)
    await alt.Utils.requestModel('prop_pizza_box_01')
    await alt.Utils.waitFor(() => prop.isSpawned)
    await alt.Utils.waitFor(() => prop.valid)

    if (!prop.valid) {
        return false
    }

    const playerPed = alt.Player.local.scriptID
    const playerPos = alt.Player.local.pos
    let playerHead = native.getEntityHeading(playerPed)
    playerHead += 180.0
    if (playerHead > 360.0) playerHead -= 360.0
    const scene = native.networkCreateSynchronisedScene(
        playerPos.x,
        playerPos.y,
        playerPos.z,
        0.0,
        0.0,
        playerHead,
        2,
        false,
        false,
        -1,
        0,
        1.0
    )

    native.networkAddPedToSynchronisedScene(
        playerPed,
        scene,
        dict,
        'action_03_player',
        1.5,
        -4.0,
        1,
        16,
        1148846080,
        0
    )

    native.networkAddEntityToSynchronisedScene(prop, scene, dict, 'action_03_pizza', 1.0, 1.0, 1)

    const cam = native.createCam('DEFAULT_ANIMATED_CAMERA', true)
    native.playCamAnim(
        cam,
        'action_03_cam',
        dict,
        playerPos.x,
        playerPos.y,
        playerPos.z,
        0.0,
        0.0,
        playerHead,
        false,
        2
    )

    native.renderScriptCams(true, false, 0, true, false, 0)
    native.networkStartSynchronisedScene(scene)
    native.takeOwnershipOfSynchronizedScene(scene)

    await alt.Utils.wait(native.getAnimDuration(dict, 'action_03_player') * 1000)

    native.setCamActive(cam, false)
    native.renderScriptCams(false, true, 1000, true, false, 0)
    native.networkStopSynchronisedScene(scene)
    native.clearPedTasksImmediately(playerPed)
    native.destroyCam(cam, false)

    return true
})

//Debug
alt.on('keyup', (key) => {
    // F11
    if (key === 122) {
        menu.open()
    }
})

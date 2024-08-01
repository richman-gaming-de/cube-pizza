import * as alt from 'alt-server'
import { useRebar } from '@Server/index.js'

const Rebar = useRebar()

// Create an interaction
const interaction = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(-1529.1893310546875, -908.73291015625, 9.16956901550293, 5, 2), 'player')

// Listen for the player to hit 'E' to interact
interaction.on(handleInteraction)

function handleInteraction(player: alt.Player, colshape: alt.Colshape, uid: string) {
    alt.log(`${player.name} has interacted with ${uid}`)
}

// Message to show the player when they interact
// Use `undefined` or `null` to hide default messages
interaction.setMessage('enter', 'Press \'E\' to Interact')
interaction.setMessage('leave', 'You left the interaction...')

// Removing the interaction also destroys the colshape
interaction.destroy()

// Do something when the player enters the interaction
interaction.onEnter((player: alt.Player, colshape: alt.Colshape, uid: string) => {
    alt.log(`${player.name} has entered the interaction`)
    // someone entered
})

// Do something when the player leaves the interaction
interaction.onLeave((player: alt.Player, colshape: alt.Colshape, uid: string) => {
    alt.log(`${player.name} has left the interaction`)
    // someone left
})


// Debug Menu

alt.on('playerConnect', (player: alt.Player) => {
    player.spawn(0, 0, 72)
    player.model = 'mp_m_freemode_01'
})

alt.onClient('heal', (player: alt.Player) => {
    player.health = 200
})

alt.onClient('spawnVehicle', (player: alt.Player, model: string) => {
    const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, player.rot.z)
    alt.nextTick(() => {
        player.setIntoVehicle(vehicle, 1)
    })
})

alt.onClient('teleportToPizzaPlace', (player: alt.Player) => {
    player.pos = new alt.Vector3(-1536.984375, -916.3381958007812, 10.12192440032959)
})
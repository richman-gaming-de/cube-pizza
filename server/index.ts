import * as alt from 'alt-server'
import { useRebar } from '@Server/index.js'
import * as Utility from '@Shared/utility/index.js'
import { BlipColor } from '@Shared/types/blip.js'
import { deliveryPoints } from '../shared/deliverypoints.js'

const Rebar = useRebar()

let jobBlip = null
let jobInteraction = null
let jobVehicle: alt.Vehicle = null
let payOut = 0

const pizzaGuyPos = new alt.Vector3(-1529.1893310546875, -908.73291015625, 9.16956901550293)

// Create an interaction
const interaction = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(pizzaGuyPos.x, pizzaGuyPos.y, pizzaGuyPos.z, 2, 2), 'player')

interaction.on(player => {
    if (!player.hasStreamSyncedMeta('activeJob')) {
        startRoute(player)
    }
    const meta = player.getStreamSyncedMeta('activeJob')
    if(meta !== 'pizza') return
    player.emitRaw('cube:pizza:showPizzaMenu')
})

function startRoute(player: alt.Player){
    const rPlayer = Rebar.usePlayer(player)
    if (!rPlayer.isValid()) return

    if(jobVehicle) jobVehicle.destroy()
    createJobVehicle()

    player.setStreamSyncedMeta('activeJob', 'pizza')

    const jobPosition = deliveryPoints[Math.floor(Math.random() * deliveryPoints.length)]

    jobBlip = Rebar.controllers.useBlipLocal(player, {
        pos: jobPosition,
        color: BlipColor.YELLOW,
        sprite: 280,
        shortRange: false,
        text: 'Kunde'
    })

    jobInteraction = Rebar.controllers.useInteractionLocal(player, 'deliverPizzaShape', 'Cylinder', [jobPosition.x, jobPosition.y, jobPosition.z, 2, 2])

    jobInteraction.on(async (player: alt.Player) => {
        if (Utility.vector.distance(player.pos, jobVehicle.pos) > 5) return rPlayer.notify.showNotification('Du bist zu weit weg vom Fahrzeug')

        jobBlip.destroy()
        jobInteraction.destroy()

        const object = Rebar.controllers.useObjectGlobal({
            model: alt.hash('prop_pizza_box_01'),
            pos: player.pos
        })

        const prop = object.getObject()
        const result = await player.emitRpc('cube:pizza:startAnimation', prop)

        if (!result) {
            object.destroy()
            return
        }

        object.destroy()

        jobBlip.update({
            pos: pizzaGuyPos,
            text: 'Pizza Station'
        })
        const tip = Math.floor(Math.random() * 15) + 1 // Random tip between 1 and 15
        rPlayer.notify.showNotification(`Super hier hast du $${tip} trinkgeld`)
        alt.emit('someGiveMoneyEvent')

        const roundPayOut = Utility.vector.distance(jobPosition, pizzaGuyPos) * 12
        payOut += roundPayOut

        jobInteraction.destroy()
    })
}

function createJobVehicle(){
    jobVehicle = new alt.Vehicle('pizzaboy', -1525.0675048828125, -914.4347534179688, 9.643064498901367, 0.01141282357275486, -0.13758710026741028, 2.4666574001312256)
    jobVehicle.numberPlateText = 'PIZZA'
}

alt.onClient('cube:pizza:newPizza', startRoute)

alt.onClient('cube:pizza:payOut', (player: alt.Player) => {
    if(!player.hasStreamSyncedMeta('activeJob')) return
    alt.emit('someGiveMoneyEvent', payOut)
    player.deleteStreamSyncedMeta('activeJob')
    if(jobVehicle) jobVehicle.destroy()
    if(jobBlip) jobBlip.destroy()
    if(jobInteraction) jobInteraction.destroy()
    const rPlayer = Rebar.usePlayer(player)
    return rPlayer.notify.showNotification('Job beendet')
})













alt.on('someGiveMoneyEvent', (player: alt.Player, amount: number = 0) => {
    const rPlayer = Rebar.usePlayer(player)
    rPlayer.notify.showNotification(`Du hast $${amount} verdient`)
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

alt.onClient('tryCoolStuff', (player: alt.Player) => {
    if (!player.vehicle) return
    player.pos = Utility.vector.getVectorInFrontOfPlayer(player.vehicle, -1)
})
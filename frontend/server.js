import { WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 8080 })
console.log("WebSocket server started on ws://localhost:8080")

const startTime = Date.now()
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const rand = (min, max) => min + Math.random() * (max - min)

const baseCellVoltages = Array.from({ length: 96 }, () => rand(4.08, 4.15))
const baseCellTemps = Array.from({ length: 96 }, () => rand(28, 34))

const generateTelemetry = () => {
  const elapsed = (Date.now() - startTime) / 1000
  const prechargeTarget = 380 + Math.sin(elapsed / 18) * 5
  const prechargeCurve = 1 - Math.exp(-elapsed / 12)
  const dcBusVoltage = clamp(prechargeTarget * prechargeCurve + rand(-1.5, 1.5), 0, 420)

  const totalBatteryVoltage = clamp(400 + Math.sin(elapsed / 15) * 3 + rand(-1, 1), 360, 420)

  const levitationDistance = clamp(12 + Math.sin(elapsed / 4) * 0.6 + rand(-0.1, 0.1), 10, 14)
  const levitationCurrent = clamp(85 + Math.sin(elapsed / 3) * 8 + rand(-2, 2), 60, 110)
  const levitationPower = clamp(levitationCurrent * 2.6 + rand(-15, 15), 120, 350)

  const cells = baseCellVoltages.map((base, index) => ({
    id: index + 1,
    voltage: Number((base + Math.sin(elapsed / 10 + index / 7) * 0.015 + rand(-0.01, 0.01)).toFixed(3)),
    temp: Number((baseCellTemps[index] + Math.sin(elapsed / 8 + index / 12) * 0.6).toFixed(1)),
  }))

  const packs = [
    {
      id: 1,
      voltage: Number((totalBatteryVoltage / 2 + rand(-1.2, 1.2)).toFixed(1)),
      cells: cells.slice(0, 48),
    },
    {
      id: 2,
      voltage: Number((totalBatteryVoltage / 2 + rand(-1.2, 1.2)).toFixed(1)),
      cells: cells.slice(48, 96),
    },
  ]

  return {
    hvbms: packs,
    lvbms: {
      id: 0,
      voltage: Number((24 + Math.sin(elapsed / 9) * 0.4 + rand(-0.2, 0.2)).toFixed(2)),
      cells: [
        { id: 1, temp: Number((28 + rand(-1, 1)).toFixed(1)) },
        { id: 2, temp: Number((28 + rand(-1, 1)).toFixed(1)) },
      ],
    },
    propulsion: {
      speed: Number((40 + Math.sin(elapsed / 2.8) * 15 + rand(-2, 2)).toFixed(1)),
      acceleration: Math.sin(elapsed / 5) > 0,
      braking: Math.sin(elapsed / 7) < -0.6,
    },
    levitation: {
      verticalGap: Number(levitationDistance.toFixed(2)),
      current: Number(levitationCurrent.toFixed(1)),
      power: Number(levitationPower.toFixed(1)),
      lateralOffset: Number((Math.sin(elapsed / 6) * 0.4).toFixed(3)),
      verticalAccel: Number((Math.sin(elapsed / 3) * 0.3).toFixed(2)),
      lateralAccel: Number((Math.cos(elapsed / 4) * 0.2).toFixed(2)),
      magnetTemp: Number((42 + Math.sin(elapsed / 10) * 2 + rand(-0.5, 0.5)).toFixed(1)),
    },
    cameras: {
      activeFeeds: 2,
      recording: true,
    },
    dcBusVoltage,
  }
}

const broadcastTelemetry = () => {
  const payload = JSON.stringify(generateTelemetry())
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload)
  })
}

setInterval(broadcastTelemetry, 500)

wss.on("connection", () => {
  console.log("Client connected")
})

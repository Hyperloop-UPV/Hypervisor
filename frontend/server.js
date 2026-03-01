import http from "node:http"

const CONFIG = {
  //port: 80,
  //ssePath: "/backend/stream",
  port: 4040,
  ssePath: "/telemetry",
  broadcastIntervalMs: 500,
  includeValuesInDictionary: false,
  dictionaryPlaceholderValue: null,
  packCount: 18,
  cellsPerPack: 6,
  lcuAirgapCount: 8,
  lcuCoilCount: 10,
}

const sseClients = new Set()
const startTime = Date.now()

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const rand = (min, max) => min + Math.random() * (max - min)
const measurementKey = (measurementId, boardId) => `${boardId}:${measurementId}`

const createMeasurementDefs = () => {
  const defs = []
  const add = (measurementId, boardId, displayUnits) => {
    defs.push({ measurementId, boardId, displayUnits })
  }

  for (let i = 1; i <= CONFIG.lcuAirgapCount; i += 1) {
    add(`lcu_airgap_${i}`, 4, "mm")
  }
  for (let i = 1; i <= CONFIG.lcuCoilCount; i += 1) {
    add(`lcu_coil_current_${i}`, 4, "A")
  }

  add("voltage_reading", 1, "V")
  add("current_reading", 1, "A")
  add("voltage_reading", 4, "V")
  add("current_reading", 4, "A")
  add("batteries_voltage_reading", 1, "V")
  add("voltage_min", 1, "V")
  add("voltage_max", 1, "V")

  for (let pack = 1; pack <= CONFIG.packCount; pack += 1) {
    for (let cell = 1; cell <= CONFIG.cellsPerPack; cell += 1) {
      add(`battery${pack}_cell${cell}`, 1, "V")
    }
    add(`battery${pack}_total_voltage`, 1, "V")
  }

  return defs
}

const measurementDefs = createMeasurementDefs()

const measurementDictionary = {}
measurementDefs.forEach((def, index) => {
  const key = String(index + 1)
  def.key = key
  measurementDictionary[key] = {
    measurement_id: def.measurementId,
    board_id: def.boardId,
    display_units: def.displayUnits,
    ...(CONFIG.includeValuesInDictionary
      ? { value: CONFIG.dictionaryPlaceholderValue }
      : {}),
  }
})

const measurementKeyById = new Map(
  measurementDefs.map((def) => [measurementKey(def.measurementId, def.boardId), def.key]),
)

const totalCells = CONFIG.packCount * CONFIG.cellsPerPack
const baseCellVoltages = Array.from({ length: totalCells }, () => rand(4.08, 4.15))

const generateMeasurementValues = () => {
  const elapsed = (Date.now() - startTime) / 1000
  const prechargeTarget = 380 + Math.sin(elapsed / 18) * 5
  const prechargeCurve = 1 - Math.exp(-elapsed / 12)
  const dcBusVoltage = clamp(prechargeTarget * prechargeCurve + rand(-1.5, 1.5), 0, 420)

  const levitationDistance = clamp(12 + Math.sin(elapsed / 4) * 0.6 + rand(-0.1, 0.1), 10, 14)
  const levitationCurrent = clamp(85 + Math.sin(elapsed / 3) * 8 + rand(-2, 2), 60, 110)

  const valuesByMeasurement = new Map()
  const allCellVoltages = []
  let totalBatteryVoltage = 0

  for (let packIndex = 0; packIndex < CONFIG.packCount; packIndex += 1) {
    const packId = packIndex + 1
    const offset = packIndex * CONFIG.cellsPerPack
    const cellVoltages = []

    for (let cellIndex = 0; cellIndex < CONFIG.cellsPerPack; cellIndex += 1) {
      const idx = offset + cellIndex
      const voltage = Number(
        (
          baseCellVoltages[idx] +
          Math.sin(elapsed / 10 + idx / 7) * 0.015 +
          rand(-0.01, 0.01)
        ).toFixed(3),
      )
      cellVoltages.push(voltage)
      allCellVoltages.push(voltage)
      valuesByMeasurement.set(
        measurementKey(`battery${packId}_cell${cellIndex + 1}`, 1),
        voltage,
      )
    }

    const packVoltage = cellVoltages.reduce((sum, value) => sum + value, 0)
    totalBatteryVoltage += packVoltage
    valuesByMeasurement.set(
      measurementKey(`battery${packId}_total_voltage`, 1),
      Number(packVoltage.toFixed(2)),
    )
  }

  valuesByMeasurement.set(
    measurementKey("batteries_voltage_reading", 1),
    Number(totalBatteryVoltage.toFixed(2)),
  )
  valuesByMeasurement.set(measurementKey("voltage_reading", 1), Number(dcBusVoltage.toFixed(2)))
  valuesByMeasurement.set(measurementKey("current_reading", 1), Number(levitationCurrent.toFixed(1)))
  valuesByMeasurement.set(
    measurementKey("voltage_reading", 4),
    Number((dcBusVoltage + 2).toFixed(2)),
  )
  valuesByMeasurement.set(
    measurementKey("current_reading", 4),
    Number((levitationCurrent + 3).toFixed(1)),
  )
  valuesByMeasurement.set(
    measurementKey("voltage_min", 1),
    allCellVoltages.length ? Math.min(...allCellVoltages) : null,
  )
  valuesByMeasurement.set(
    measurementKey("voltage_max", 1),
    allCellVoltages.length ? Math.max(...allCellVoltages) : null,
  )

  for (let i = 1; i <= CONFIG.lcuAirgapCount; i += 1) {
    valuesByMeasurement.set(
      measurementKey(`lcu_airgap_${i}`, 4),
      Number((levitationDistance + rand(-0.4, 0.4)).toFixed(2)),
    )
  }

  for (let i = 1; i <= CONFIG.lcuCoilCount; i += 1) {
    valuesByMeasurement.set(
      measurementKey(`lcu_coil_current_${i}`, 4),
      Number((levitationCurrent + rand(-4, 4)).toFixed(1)),
    )
  }

  return valuesByMeasurement
}

const sendPayload = (payload) => {
  if (sseClients.size === 0) return
  const message = `data: ${JSON.stringify(payload)}\n\n`
  sseClients.forEach((client) => {
    client.write(message)
  })
}

const broadcastTelemetry = () => {
  if (sseClients.size === 0) return
  const valuesByMeasurement = generateMeasurementValues()
  const updates = {}

  valuesByMeasurement.forEach((value, measurementKeyValue) => {
    const key = measurementKeyById.get(measurementKeyValue)
    if (!key) return
    updates[key] = value === null || value === undefined ? null : String(value)
  })

  sendPayload(updates)
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === CONFIG.ssePath) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    })
    res.write("retry: 1000\n\n")
    sseClients.add(res)
    res.write(`data: ${JSON.stringify(measurementDictionary)}\n\n`)

    req.on("close", () => {
      sseClients.delete(res)
    })
    return
  }

  res.writeHead(200, { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" })
  res.end("ok")
})

server.listen(CONFIG.port, () => {
  console.log(`SSE server started on http://localhost:${CONFIG.port}${CONFIG.ssePath}`)
})

setInterval(broadcastTelemetry, CONFIG.broadcastIntervalMs)

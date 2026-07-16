// Mock telemetry server for local frontend development.
//
// Reads backend/cmd/hypervisor-monitoring.json (the same file the real Go
// backend uses) so the fake data always matches whatever boards/packets/
// measurements are actually being monitored, and serves it as an SSE stream
// shaped exactly like the real backend's `/backend/stream` endpoint.
//
// Usage:
//   node server.js                  # realistic, time-varying values
//   MODE=fixed node server.js       # frozen values, no noise (useful for
//                                   # pixel-diffing/screenshot testing)
//   PORT=4040 node server.js        # defaults to 4040
//
// Then point the frontend dev server at it:
//   HYPERVISOR_BACKEND=http://localhost:4040 npm run dev
import http from "node:http"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MONITORING_PATH = path.resolve(__dirname, "../backend/cmd/hypervisor-monitoring.json")

const PORT = Number(process.env.PORT) || 4040
const SSE_PATH = "/backend/stream"
const BROADCAST_INTERVAL_MS = 500
const FIXED = process.env.MODE === "fixed"

const BOARD = { vcu: 3, lcu: 4, pcu: 5, hvbms: 7 }

// Board/packet/measurement layout, straight from the same file the backend reads.
const monitoring = JSON.parse(readFileSync(MONITORING_PATH, "utf-8"))

const measurementDefs = []
for (const [boardIdStr, packets] of Object.entries(monitoring)) {
  const boardId = Number(boardIdStr)
  for (const measurementIds of Object.values(packets)) {
    for (const measurementId of measurementIds) {
      measurementDefs.push({ measurementId, boardId })
    }
  }
}

// --- Types that aren't plain floats: enums (string labels) and booleans ---
// Mirrors the ADJ (Astra branch) measurement definitions for these ids.
const ENUM_VALUES = {
  [`${BOARD.pcu}:state`]: ["Connecting", "Idle", "Accelerating", "Fault"],
  [`${BOARD.vcu}:state`]: [
    "Idle", "Connected", "Maintenance", "Precharging", "HVActive", "Ready",
    "Propulsion", "Static Levitation", "Dynamic Levitation", "Fault",
  ],
  [`${BOARD.lcu}:master_state_machine`]: [
    "Connecting", "Idle", "Levitating", "Current Control", "Debug", "Fault",
  ],
  [`${BOARD.lcu}:slave_state_machine`]: [
    "SPI Connecting", "Idle", "Levitating", "Current Control", "Debug", "Fault",
  ],
  [`${BOARD.vcu}:brakes_status`]: ["BRAKED", "UNBRAKED"],
  [`${BOARD.hvbms}:sdc_status`]: ["ENGAGED", "DISENGAGED"],
  [`${BOARD.hvbms}:imd_status`]: [
    "NORMAL", "SHORTCIRCUIT", "UNDERVOLTAGE", "FAST_EVAL", "EQUIPMENT_FAULT", "GROUNDING_FAULT",
  ],
  [`${BOARD.hvbms}:sm_status`]: [
    "Connecting", "Idle", "Ready To Precharge", "Precharging", "Energized", "FAULT",
  ],
}

const BOOLEAN_IDS = new Set([
  "active_brakes", "electrovalve_enabled", "sdc_closed",
  "hvbms_connected", "pcu_connected", "lcu_connected",
  "gd_fault_a", "gd_fault_b", "gd_ready_a", "gd_ready_b",
  "imd_is_ok",
  "contactor_discharge", "contactor_precharge", "contactor_low", "contactor_high", "contactor_common_high",
])

const displayUnitFor = (measurementId) => {
  if (/^airgap_\d+$/.test(measurementId)) return "mm"
  if (/^coil_current_\d+$/.test(measurementId)) return "A"
  if (/^pwm_duty_cycle_\d+$/.test(measurementId) || /^duty_[uvw]$/.test(measurementId)) return "%"
  if (/_cell\d+$/.test(measurementId) || /_total_voltage$/.test(measurementId)) return "V"
  if (/_temp\d+$/.test(measurementId) || measurementId === "temp_min" || measurementId === "temp_max") return "ºC"
  if (["voltage_min", "voltage_max", "voltage_reading", "batteries_voltage_reading", "target_voltage"].includes(measurementId)) return "V"
  if (/^voltage_battery_[ab]$/.test(measurementId)) return "V"
  if (measurementId === "current_reading" || /^current_sensor_/.test(measurementId) || measurementId === "current_Peak" || measurementId === "error_pi" || measurementId === "actual_current_ref") return "A"
  if (measurementId === "frequency" || measurementId === "modulation_frequency" || measurementId === "imd_freq") return "Hz"
  if (measurementId === "imu_speed_km_h" || measurementId === "target_speed" || measurementId === "speed_error") return "km/h"
  if (measurementId === "imu_position_m") return "m"
  if (measurementId === "slip_motor" || measurementId === "soc" || measurementId === "imd_duty") return "%"
  if (measurementId === "svpwm_time") return "s"
  if (measurementId === "imd_resistance") return "MOhm"
  if (["high_pressure", "low_pressure", "pressure_regulator_feedback"].includes(measurementId)) return "bar"
  return undefined
}

// --- Dictionary sent once on connect: declares every measurement id/board/unit ---
const measurementDictionary = {}
measurementDefs.forEach((def, index) => {
  const key = String(index + 1)
  def.key = key
  measurementDictionary[key] = {
    measurement_id: def.measurementId,
    board_id: def.boardId,
    display_units: displayUnitFor(def.measurementId),
  }
})

const keyByMeasurement = new Map(
  measurementDefs.map((def) => [`${def.boardId}:${def.measurementId}`, def.key]),
)

// --- Value generation ---
const startTime = Date.now()
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const rand = (min, max) => (FIXED ? (min + max) / 2 : min + Math.random() * (max - min))
const wave = (elapsed, periodS, amplitude, phase = 0) =>
  FIXED ? 0 : Math.sin((elapsed / periodS) * 2 * Math.PI + phase) * amplitude

// Stable per-cell offsets so packs look distinct instead of identical.
const cellJitter = Array.from({ length: 12 }, (_, i) => Math.sin(i * 1.7) * 0.03)
const tempJitter = Array.from({ length: 4 }, (_, i) => Math.sin(i * 2.3) * 3)

const generateValues = (elapsed) => {
  const values = new Map() // "boardId:measurementId" -> string | null
  const set = (measurementId, boardId, value) => values.set(`${boardId}:${measurementId}`, value)

  // Enums
  for (const [key, options] of Object.entries(ENUM_VALUES)) {
    const [boardId, measurementId] = key.split(":")
    const period = 20 // seconds per full cycle through the enum
    const index = FIXED ? 1 : Math.floor((elapsed % period) / (period / options.length))
    set(measurementId, Number(boardId), options[clamp(index, 0, options.length - 1)])
  }

  // Booleans: mostly "healthy" steady state, faults stay off.
  for (const def of measurementDefs) {
    if (!BOOLEAN_IDS.has(def.measurementId)) continue
    const isFault = def.measurementId.includes("fault")
    set(def.measurementId, def.boardId, String(!isFault))
  }

  // --- LCU: levitation ---
  const levitationDistance = clamp(12 + wave(elapsed, 4, 0.6) + rand(-0.1, 0.1), 10, 14)
  const levitationCurrent = clamp(90 + wave(elapsed, 3, 8) + rand(-2, 2), 60, 110)
  for (let i = 1; i <= 8; i += 1) {
    set(`airgap_${i}`, BOARD.lcu, (levitationDistance + rand(-0.4, 0.4)).toFixed(2))
  }
  for (let i = 1; i <= 10; i += 1) {
    set(`coil_current_${i}`, BOARD.lcu, (levitationCurrent + rand(-4, 4)).toFixed(1))
  }
  for (let i = 1; i <= 10; i += 1) {
    set(`pwm_duty_cycle_${i}`, BOARD.lcu, clamp(50 + wave(elapsed, 6, 40, i), 0, 100).toFixed(1))
  }

  // --- HVBMS: battery packs ---
  const packCount = 8
  const cellsPerPack = 12
  const allCellVoltages = []
  const allTemps = []
  let batteriesTotalVoltage = 0

  for (let pack = 1; pack <= packCount; pack += 1) {
    let packVoltage = 0
    for (let cell = 1; cell <= cellsPerPack; cell += 1) {
      const voltage = clamp(4.1 + cellJitter[cell - 1] + wave(elapsed, 10, 0.015, cell) + rand(-0.01, 0.01), 3.6, 4.2)
      packVoltage += voltage
      allCellVoltages.push(voltage)
      set(`battery${pack}_cell${cell}`, BOARD.hvbms, voltage.toFixed(3))
    }
    set(`battery${pack}_total_voltage`, BOARD.hvbms, packVoltage.toFixed(2))
    batteriesTotalVoltage += packVoltage

    for (let temp = 1; temp <= 4; temp += 1) {
      const value = clamp(28 + tempJitter[temp - 1] + wave(elapsed, 25, 3, temp) + rand(-0.5, 0.5), 15, 45)
      allTemps.push(value)
      set(`battery${pack}_temp${temp}`, BOARD.hvbms, value.toFixed(1))
    }
  }

  set("batteries_voltage_reading", BOARD.hvbms, batteriesTotalVoltage.toFixed(2))
  set("voltage_min", BOARD.hvbms, Math.min(...allCellVoltages).toFixed(3))
  set("voltage_max", BOARD.hvbms, Math.max(...allCellVoltages).toFixed(3))
  set("temp_min", BOARD.hvbms, Math.min(...allTemps).toFixed(1))
  set("temp_max", BOARD.hvbms, Math.max(...allTemps).toFixed(1))

  const prechargeTarget = 380 + wave(elapsed, 18, 5)
  const prechargeCurve = FIXED ? 1 : 1 - Math.exp(-elapsed / 12)
  const dcBusVoltage = clamp(prechargeTarget * prechargeCurve + rand(-1.5, 1.5), 0, 420)
  set("voltage_reading", BOARD.hvbms, dcBusVoltage.toFixed(2))
  set("current_reading", BOARD.hvbms, clamp(levitationCurrent + rand(-2, 2), -15, 120).toFixed(1))
  set("soc", BOARD.hvbms, clamp(95 - elapsed / 120, 20, 100).toFixed(1))
  set("imd_resistance", BOARD.hvbms, clamp(50 + rand(-3, 3), 30, 70).toFixed(1))
  set("imd_duty", BOARD.hvbms, clamp(50 + wave(elapsed, 15, 10), 0, 100).toFixed(1))
  set("imd_freq", BOARD.hvbms, clamp(500 + wave(elapsed, 15, 20), 0, 1000).toFixed(1))

  // --- PCU: propulsion ---
  const targetSpeed = clamp(150 + wave(elapsed, 40, 120), 0, 300)
  const speedKmH = clamp(targetSpeed + rand(-3, 3), 0, 300)
  set("target_speed", BOARD.pcu, targetSpeed.toFixed(1))
  set("speed_error", BOARD.pcu, (targetSpeed - speedKmH).toFixed(2))
  set("imu_speed_km_h", BOARD.pcu, speedKmH.toFixed(1))
  set("imu_position_m", BOARD.pcu, (elapsed * (speedKmH / 3.6)).toFixed(1))
  set("slip_motor", BOARD.pcu, clamp(2 + wave(elapsed, 5, 1), 0, 10).toFixed(2))
  set("actual_current_ref", BOARD.pcu, clamp(80 + wave(elapsed, 6, 20) + rand(-2, 2), 0, 150).toFixed(1))
  set("frequency", BOARD.pcu, clamp(100 + wave(elapsed, 40, 80), 0, 300).toFixed(0))
  set("modulation_frequency", BOARD.pcu, clamp(4000 + wave(elapsed, 40, 400), 0, 8000).toFixed(0))
  set("duty_u", BOARD.pcu, clamp(50 + wave(elapsed, 1, 45, 0), 0, 100).toFixed(1))
  set("duty_v", BOARD.pcu, clamp(50 + wave(elapsed, 1, 45, (2 * Math.PI) / 3), 0, 100).toFixed(1))
  set("duty_w", BOARD.pcu, clamp(50 + wave(elapsed, 1, 45, (4 * Math.PI) / 3), 0, 100).toFixed(1))
  set("current_sensor_u_a", BOARD.pcu, (80 + wave(elapsed, 1, 30, 0)).toFixed(1))
  set("current_sensor_v_a", BOARD.pcu, (80 + wave(elapsed, 1, 30, (2 * Math.PI) / 3)).toFixed(1))
  set("current_sensor_w_a", BOARD.pcu, (80 + wave(elapsed, 1, 30, (4 * Math.PI) / 3)).toFixed(1))
  set("current_sensor_u_b", BOARD.pcu, (78 + wave(elapsed, 1, 30, 0.2)).toFixed(1))
  set("current_sensor_v_b", BOARD.pcu, (78 + wave(elapsed, 1, 30, (2 * Math.PI) / 3 + 0.2)).toFixed(1))
  set("current_sensor_w_b", BOARD.pcu, (78 + wave(elapsed, 1, 30, (4 * Math.PI) / 3 + 0.2)).toFixed(1))
  set("current_Peak", BOARD.pcu, clamp(110 + wave(elapsed, 6, 15), 0, 200).toFixed(1))
  set("error_pi", BOARD.pcu, wave(elapsed, 3, 1.5).toFixed(2))
  set("target_voltage", BOARD.pcu, clamp(360 + wave(elapsed, 18, 5), 0, 420).toFixed(1))
  set("svpwm_time", BOARD.pcu, (0.02 + rand(-0.002, 0.002)).toFixed(4))
  set("imod", BOARD.pcu, clamp(0.8 + wave(elapsed, 6, 0.1), 0, 1).toFixed(3))
  set("voltage_battery_a", BOARD.pcu, clamp(180 + wave(elapsed, 18, 3), 0, 220).toFixed(1))
  set("voltage_battery_b", BOARD.pcu, clamp(178 + wave(elapsed, 18, 3, 0.3), 0, 220).toFixed(1))

  // --- VCU: vehicle state ---
  set("high_pressure", BOARD.vcu, clamp(7 + wave(elapsed, 10, 0.3), 0, 10).toFixed(2))
  set("low_pressure", BOARD.vcu, clamp(2 + wave(elapsed, 10, 0.1), 0, 5).toFixed(2))
  set("pressure_regulator_feedback", BOARD.vcu, clamp(6.5 + wave(elapsed, 10, 0.3), 0, 10).toFixed(2))

  return values
}

// --- SSE plumbing ---
const sseClients = new Set()

const sendPayload = (payload) => {
  if (sseClients.size === 0) return
  const message = `data: ${JSON.stringify(payload)}\n\n`
  sseClients.forEach((client) => client.write(message))
}

const broadcastTelemetry = () => {
  if (sseClients.size === 0) return
  const elapsed = (Date.now() - startTime) / 1000
  const values = generateValues(elapsed)

  const status = {}
  values.forEach((value, measurementKey) => {
    const key = keyByMeasurement.get(measurementKey)
    if (!key) return
    status[key] = value === null || value === undefined ? null : String(value)
  })

  sendPayload({ uptime: FIXED ? 0 : Math.floor(elapsed), status })
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === SSE_PATH) {
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

server.listen(PORT, () => {
  console.log(`Mock telemetry server (${FIXED ? "fixed" : "dynamic"} mode) at http://localhost:${PORT}${SSE_PATH}`)
  console.log(`Point the frontend at it with: HYPERVISOR_BACKEND=http://localhost:${PORT} npm run dev`)
})

setInterval(broadcastTelemetry, BROADCAST_INTERVAL_MS)

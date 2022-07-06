const NodeCache = require("node-cache")
const fetch = require("node-fetch")
const responseUnsuccess = (response) => response.json({ success: false })

const cacheMemory = new NodeCache({ stdTTL: 86400 })

const controllers = {
  getTimeZones: async (req, res) => {
    const allTimeZones = await fetch("http://worldtimeapi.org/api/timezone")
      .then((promiseFetch) => promiseFetch.json())
      .then((timeZones) => timeZones)
      .catch(() => responseUnsuccess(res))

    const isCacheEmpty = !cacheMemory.has("savedTimeZones")
    if (isCacheEmpty) {
      cacheMemory.set("savedTimeZones", JSON.stringify([]))
    }

    if (Array.isArray(allTimeZones) && allTimeZones.length) {
      res.json({
        success: true,
        allTimeZones: allTimeZones.map((tz) => {
          const timeZone = { fullName: tz.replace("_", " ") }
          const firstIndexOfSlash = tz.indexOf("/")
          if (firstIndexOfSlash > 0) {
            timeZone.area = timeZone.fullName.substring(0, firstIndexOfSlash)
            const lastIndexOfSlash = tz.lastIndexOf("/")
            const hasRegion = firstIndexOfSlash !== lastIndexOfSlash
            if (hasRegion) {
              timeZone.location = timeZone.fullName.substring(
                firstIndexOfSlash + 1,
                lastIndexOfSlash
              )
              timeZone.region = timeZone.fullName.substring(
                lastIndexOfSlash + 1
              )
            } else {
              timeZone.location = timeZone.fullName.substring(
                firstIndexOfSlash + 1
              )
            }
          } else {
            timeZone.area = tz
          }
          return timeZone
        }),
        savedTimeZones: isCacheEmpty
          ? []
          : JSON.parse(cacheMemory.get("savedTimeZones")),
      })
    } else {
      responseUnsuccess(res)
    }
  },

  removeTimeZone: (req, res) => {
    console.log("1")
    const { area, location, region } = req.params
    const savedTimeZones = cacheMemory.get("savedTimeZones")
    console.log(savedTimeZones)
    const timeZones = JSON.parse(savedTimeZones)

    const timeZoneToRemove = region
      ? `${area}/${location}/${region}`
      : location
      ? `${area}/${location}`
      : `${area}`

    const timeZonesMap = new Map(
      timeZones.map((timeZone) => [timeZone.timezone, timeZone])
    )
    if (timeZonesMap.has(timeZoneToRemove)) {
      timeZonesMap.delete(timeZoneToRemove)
      cacheMemory.set(
        "savedTimeZones",
        JSON.stringify([...timeZonesMap.values()])
      )
      res.json({ success: true })
    } else {
      responseUnsuccess(res)
    }
  },

  searchOneTimeZone: async (req, res, next) => {
    const {
      method,
      params: { area, location, region },
    } = req

    let timeZonePromise
    if (region) {
      timeZonePromise = fetch(
        `http://worldtimeapi.org/api/timezone/${area}/${location.replace(
          " ",
          "_"
        )}/${region.replace(" ", "_")}`
      )
    } else if (location) {
      timeZonePromise = fetch(
        `http://worldtimeapi.org/api/timezone/${area}/${location.replace(
          " ",
          "_"
        )}`
      )
    } else if (area) {
      timeZonePromise = fetch(`http://worldtimeapi.org/api/timezone/${area}`)
    } else {
      responseUnsuccess(res)
    }

    await timeZonePromise
      .then((promiseFetch) => promiseFetch.json())
      .then((timeZone) => {
        if (timeZone.hasOwnProperty("error")) throw new Error()

        if (method === "PUT") {
          const savedTimeZones = cacheMemory.get("savedTimeZones")
          const timeZones = JSON.parse(savedTimeZones)

          const timeZonesMap = new Map(
            timeZones.map((timeZone) => [timeZone.timezone, timeZone])
          )
          if (!timeZonesMap.has(timeZone.timezone)) {
            timeZones.push(timeZone)
            cacheMemory.set("savedTimeZones", JSON.stringify(timeZones))
          }
        }

        res.json({ sucess: true, timeZone })
      })
      .catch(() => responseUnsuccess(res))
  },
}

module.exports = controllers

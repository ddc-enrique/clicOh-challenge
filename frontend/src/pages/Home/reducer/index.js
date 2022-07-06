import * as types from "./actionTypes.js"
import update from "immutability-helper"

export default function reducer(state, action) {
  switch (action.type) {
    case types.ADD_TIMEZONE: {
      const { timeZone } = action.payload

      return update(state, {
        savedTimeZones: { $add: [[timeZone.timezone, timeZone]] },
      })
    }
    case types.FILTER_TIMEZONES: {
      const { word } = action.payload
      const { allTimeZones } = state

      if (word.length) {
        const newOptionsList = [...allTimeZones.values()].filter((timeZone) => {
          if (
            timeZone.fullName
              .replace("/", " ")
              .toUpperCase()
              .startsWith(word.toUpperCase())
          ) {
            return true
          }
          if (timeZone.area.toUpperCase().startsWith(word.toUpperCase())) {
            return true
          }
          if (timeZone.location?.toUpperCase().startsWith(word.toUpperCase())) {
            return true
          }
          if (timeZone.region?.toUpperCase().startsWith(word.toUpperCase())) {
            return true
          }
          return false
        })

        return update(state, {
          optionsList: { $set: newOptionsList },
        })
      } else {
        return update(state, {
          optionsList: { $set: [] },
        })
      }
    }

    case types.GET_TIMEZONES: {
      const { allTimeZones, savedTimeZones } = action.payload

      return update(state, {
        allTimeZones: {
          $add: allTimeZones.map((timeZone) => [timeZone.fullName, timeZone]),
        },
        savedTimeZones: {
          $add: savedTimeZones.map((timeZone) => [timeZone.timezone, timeZone]),
        },
      })
    }

    case types.REMOVE_TIMEZONE: {
      const { timezone } = action.payload

      return update(state, {
        savedTimeZones: { $remove: [timezone] },
      })
    }

    default:
      return state
  }
}

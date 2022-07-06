import React, { useEffect, useMemo, useReducer, useState } from "react"
import "./styles.css"
import axios from "axios"
import cx from "classnames"
import reducer from "./reducer"
import {
  ADD_TIMEZONE,
  REMOVE_TIMEZONE,
  FILTER_TIMEZONES,
  GET_TIMEZONES,
} from "./reducer/actionTypes"

export const initialState = {
  timeZoneToSearch: "",
  allTimeZones: new Map(),
  optionsList: [],
  savedTimeZones: new Map(),
}

export const Home = (props) => {
  const [canShowOptionsList, setCanShowOptionsList] = useState(true)
  const [state, dispatch] = useReducer(reducer, initialState)
  const { allTimeZones, optionsList, savedTimeZones } = state

  const savedTimeZonesArray = useMemo(
    () => [...savedTimeZones.values()],
    [savedTimeZones]
  )

  const getAllTimeZones = async () => {
    try {
      let response = await axios.get("http://localhost:4000/api/timezones")
      if (!response.data.success) throw new Error("Error de conexión")
      const { allTimeZones, savedTimeZones } = response.data
      dispatch({
        type: GET_TIMEZONES,
        payload: { allTimeZones, savedTimeZones },
      })
    } catch (error) {
      alert(error)
    }
  }
  useEffect(() => {
    getAllTimeZones()
  }, [])

  const searchTimeZone = (event) => {
    dispatch({
      type: FILTER_TIMEZONES,
      payload: { word: event.target.value.trim() },
    })
  }

  const addTimeZone = async (timeZone) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/timezones/${timeZone.fullName}`
      )
      dispatch({
        type: ADD_TIMEZONE,
        payload: { timeZone: response.data.timeZone },
      })
    } catch (error) {
      alert(error)
    }
  }

  const removeTimeZone = async (timezone) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/timezones/${timezone}`
      )
      if (!response.data.success) throw new Error("Error de conexión")
      dispatch({
        type: REMOVE_TIMEZONE,
        payload: { timezone },
      })
    } catch (error) {
      alert(error)
    }
  }

  console.log({ optionsList, canShowOptionsList })
  return (
    <div className="container">
      <div className="inputContainer">
        <input
          className="searchInput"
          onChange={searchTimeZone}
          placeholder="Buscar zona horaria"
          onFocus={() => !canShowOptionsList && setCanShowOptionsList(true)}
          onBlur={() => canShowOptionsList && setCanShowOptionsList(false)}
        />
        {canShowOptionsList && !!optionsList.length && (
          <div className="optionsListContainer">
            <ul>
              {optionsList.map((timeZone) => (
                <li
                  key={timeZone.fullName}
                  className="listItem"
                  onMouseDown={() => addTimeZone(timeZone)}
                >
                  {timeZone.fullName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div
        className={cx("selectedTimeZonesContainer", {
          lesstThanThreeSavedTimeZones: savedTimeZonesArray.length < 3,
          lesstThanTwoSavedTimeZones: savedTimeZonesArray.length < 2,
        })}
      >
        {savedTimeZonesArray.length ? (
          savedTimeZonesArray.map((timeZone) => {
            console.log({ timeZone })
            const { location, region } = allTimeZones.get(
              timeZone.timezone.replace("_", " ")
            )
            return (
              <div key={timeZone.timezone} className="timeZoneCard">
                <span
                  className="deleteButton"
                  onMouseDown={() => removeTimeZone(timeZone.timezone)}
                >
                  X
                </span>
                <h3 className="locationRegion">
                  {region ? `${region} ${location}` : location}
                </h3>
                <span className="date">
                  {timeZone.datetime.substring(0, 10)}
                </span>
                <span className="time">
                  {`${timeZone.datetime.substring(11, 16)} (${
                    timeZone.abbreviation
                  })`}
                </span>
              </div>
            )
          })
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}

export default Home

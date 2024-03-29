import Color from 'colorjs.io'

const c1 = new Color('red')
const c2 = new Color('p3', [0, 1, 0])
const range = c1.range(c2, { space: 'hsl' })

const valueToColor = (stat, other, id) => {
  let x = parseFloat(stat) / (parseFloat(stat) + parseFloat(other))

  //custom calculation for plus/minus
  if (id === 4) {
    let offset = Math.min(parseFloat(stat), parseFloat(other))
    offset = offset < 0 ? Math.abs(offset) + 20 : 20
    x =
      (parseFloat(stat) + offset) /
      (parseFloat(stat) + parseFloat(other) + offset * 2)
  }

  //intensify colors for Save %
  if (id === 26) {
    x = x < 0.5 ? x * 0.95 : x * 1.05
  }

  x = id === 23 ? 1 - x : x //switch colors for GAA

  x *= 0.915 //offset to set equal stats to yellow

  return range(x)
}

const getAvg = (cat, stat, currentWeek) => {
  //GAA and Save % don't need calculations
  if (cat.id === 26 || cat.id === 23) return stat

  const dayofweek = new Date().getDay()
  const dayoffset = dayofweek === 6 ? 0 : (dayofweek + 1) / 7
  return (stat / (currentWeek - 1 + dayoffset)).toFixed(2)
}

const matchupFunctions = {
  c1,
  c2,
  valueToColor,
  getAvg
}

export default matchupFunctions

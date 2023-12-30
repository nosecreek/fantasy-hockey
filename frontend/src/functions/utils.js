const displayTOI = (s) => {
  s = s.toFixed(0)
  return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
}

const utils = {
  displayTOI
}

export default utils

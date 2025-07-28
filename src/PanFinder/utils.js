export function getScoreBackgroundColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  const red = Math.round(120 * (1 - normalizedScore))
  const green = Math.round(100 * normalizedScore)
  return `rgb(${red}, ${green}, 0)`
}

export function getScoreTextColor(result, maxScore) {
  const normalizedScore = maxScore > 0 ? result.overall_score / maxScore : 0
  return normalizedScore > 0.7 ? '#d2d9e1ff' : '#b6bfcaff'
}

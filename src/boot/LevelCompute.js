
export default (score) => {
  if (score >= 50000) {
    return {level: 8, next: 8, max: 100000, progress: 100}
  } else if (score >= 25000) {
    return {level: 8, next: 8, max: 50000, progress: Math.round(((score - 25000) / 25000) * 100)}
  } else if (score >= 15000) {
    return {level: 7, next: 8, max: 25000, progress: Math.round(((score - 15000) / 10000) * 100)}
  } else if (score >= 10000) {
    return {level: 6, next: 7, max: 15000, progress: Math.round(((score - 10000) / 5000) * 100)}
  } else if (score >= 6000) {
    return {level: 5, next: 6, max: 10000, progress: Math.round(((score - 6000) / 4000) * 100)}
  } else if (score >= 3000) {
    return {level: 4, next: 5, max: 6000, progress: Math.round(((score - 3000) / 3000) * 100)}
  } else if (score >= 1500) {
    return {level: 3, next: 4, max: 3000, progress: Math.round(((score - 1500) / 1500) * 100)}
  } else if (score >= 500) {
    return {level: 2, next: 3, max: 1500, progress: Math.round(((score - 500) / 1000) * 100)}
  } else {
    return {level: 1, next: 2, max: 500, progress: Math.round(((score) / 500) * 100)}
  }
}

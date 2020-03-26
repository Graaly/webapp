
export default (score) => {
  if (score >= 3000) {
    return {level: 9, next: 9, max: 15000, progress: ((score - 3000) / 12000)}
  } else if (score >= 1500) {
    return {level: 8, next: 9, max: 3000, progress: ((score - 1500) / 1500)}
  } else if (score >= 800) {
    return {level: 7, next: 8, max: 1500, progress: ((score - 800) / 700)}
  } else if (score >= 400) {
    return {level: 6, next: 7, max: 800, progress: ((score - 400) / 400)}
  } else if (score >= 200) {
    return {level: 5, next: 6, max: 400, progress: ((score - 200) / 200)}
  } else if (score >= 100) {
    return {level: 4, next: 5, max: 200, progress: ((score - 100) / 100)}
  } else if (score >= 30) {
    return {level: 3, next: 4, max: 100, progress: ((score - 30) / 70)}
  } else if (score >= 15) {
    return {level: 2, next: 3, max: 30, progress: ((score - 15) / 15)}
  } else {
    // progress = (score - min points) / (max points - min points)
    return {level: 1, next: 2, max: 15, progress: ((score) / 15)}
  }
}

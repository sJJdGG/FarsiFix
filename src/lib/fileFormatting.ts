export const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return '۰ بایت'
  }
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}

export const getDownloadName = (original: string) => {
  const lower = original.toLowerCase()
  if (lower.endsWith('.xlsx')) {
    return `${original.slice(0, -5)}_FarsiFix.xlsx`
  }
  return `${original}_FarsiFix.xlsx`
}

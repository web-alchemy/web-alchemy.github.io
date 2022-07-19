function formatDate(value) {
  return value.toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).replace(' г.', '')
}

module.exports = formatDate
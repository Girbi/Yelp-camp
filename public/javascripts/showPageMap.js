mapboxgl.accessToken = mapToken
const camp = JSON.parse(campground)
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: camp.geometry.coordinates,
  zoom: 9,
  projection: 'globe',
})
map.on('style.load', () => {
  map.setFog({})
})

new mapboxgl.Marker()
  .setLngLat(camp.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 20 }).setHTML(
      `<h3>${camp.title}</h3>
      <h6>${camp.location}</h6>`
    )
  )
  .addTo(map)

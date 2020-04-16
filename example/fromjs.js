import Immutable from 'immutable'

const { Map, fromJS } = Immutable

function setData(obj) {
  const map = obj
  for (let i = 100; i < 109; i++) {
    map[i] = i * 2
  }
  return map
}

const a = setData({})

const $a = fromJS(a)

// const $b = setData($a)


// const $b = $a.get('detail')

// $a.setIn(['detail', 'phone'], 123)
// $a.set('detail', {
//   b: 2,
// })

console.log($a)

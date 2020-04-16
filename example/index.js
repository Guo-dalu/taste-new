import produce from 'immer'
// import produceDeep from 'immer-with-deep-equal'

const baseState = {
  list: [
    {
      name: 'wenbo',
    },
  ],
  config: {
    fontSize: 12,
  },
}

const newList = [
  {
    name: 'wenbo',
  },
]

// const producer = draft => {
//   draft.list = [
//     {
//       name: 'wenbo',
//     },
//   ]
//   draft.config = {
//     fontSize: 12,
//   }
// }

const cleverProducer = draft => {
  newList.forEach((v, index) => {
    Object.assign(draft.list[index], v)
  })
}

const nextState = produce(baseState, cleverProducer)

console.log('origin  ', nextState, nextState === baseState)

// const nextStateWithDeep = produceDeep(baseState, producer)

// console.log('with deep   ', nextStateWithDeep, nextStateWithDeep === baseState)

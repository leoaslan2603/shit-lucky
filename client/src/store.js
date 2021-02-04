import { configureStore, createSlice } from '@reduxjs/toolkit'

const store = createSlice({
    name: 'store',
    initialState: {
        user: {},
        players: {},
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload
        },
        addPlayer: (state, action) => {
            state.players[action.payload.id] = action.payload
        },
    },
})

export const { login, addPlayer } = store.actions

export const getUser = state => state.user
export const getPlayers = state => state.players

export default configureStore({
    reducer: store.reducer,
})

import Login from './components/Login'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getUser } from './store'
import { Socket, SocketContext } from './socket'
import Dashboard from './components/Dashboard'

function AuthRoute ({ type, children, ...rest }) {
    const user = useSelector(getUser)

    const render = ({ location }) => {
        let condition;
        let redirectTo;

        if (type === 'guest') {
            condition = user.name && user.avatar
            redirectTo = '/'
        } else {
            condition = !user.name || !user.avatar
            redirectTo = '/login'
        }

        return !condition ? children : (
            <Redirect to={{
                pathname: redirectTo,
                state: { from: location }
            }} />
        )
    }

    return (
        <Route {...rest} render={render} />
    )
}

function App () {
    return (
        <SocketContext.Provider value={Socket}>
            <BrowserRouter>
                <Switch>
                    <AuthRoute type="guest" path="/login">
                        <Login />
                    </AuthRoute>

                    <AuthRoute path="/">
                        <Dashboard />
                    </AuthRoute>
                </Switch>
            </BrowserRouter>
        </SocketContext.Provider>
    )
}

export default App

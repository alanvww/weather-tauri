import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './containers/Home';

const { invoke } = window.__TAURI__.tauri;

function App() {
	// now we can call our Command!
	// Right-click the application background and open the developer tools.
	// You will see "Hello, World!" printed in the console!
	invoke('get_environment_variable', { name: '' })
		// `invoke` returns a Promise
		.then((response) => console.log(response));
	return (
		<div className="App">
			<Router>
				<Switch>
					<Route path="/">
						<Home />
					</Route>
				</Switch>
			</Router>
		</div>
	);
}

export default App;

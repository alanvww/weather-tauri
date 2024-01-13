import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import WeatherCard from '../components/WeatherCard';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import WeatherImage from '../components/WeatherImage';
import Footer from '../components/Footer';

// Set the Mapbox access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

// Custom hook to parse the query parameters
function useQuery() {
	return new URLSearchParams(useLocation().search);
}

function Home() {
	// References and state declarations
	const mapContainer = useRef();
	const map = useRef(null);
	const [city, setCity] = useState();
	const [weatherData, setWeatherData] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const [inputCity, setInputCity] = useState('');
	const [savedCities, setSavedCities] = useState(() => {
		const localData = localStorage.getItem('savedCities');
		return localData ? JSON.parse(localData) : [];
	});
	const [menuExpanded, setMenuExpanded] = useState(false);

	let query = useQuery();

	// Fetching weather data based on the city query or geolocation

	useEffect(() => {
		const cityQuery = query.get('city');
		if (cityQuery) {
			setCity(cityQuery);
		} else if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					fetchWeatherData(null, position.coords);
				},
				() => {
					setCity('osaka'); // Default to Osaka if geolocation fails
				}
			);
		} else {
			console.log('Geolocation is not supported by this browser.');
			setCity('osaka');
		}
	}, [query]);

	useEffect(() => {
		if (!city) return;
		fetchWeatherData(city);
	}, [city]);

	const fetchWeatherData = (city, coords = {}) => {
		setIsLoading(true); // Set loading to true when starting to fetch data
		const { latitude, longitude } = coords;
		const URL = city
			? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
			: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`;

		axios
			.get(URL)
			.then((response) => {
				setWeatherData(response.data);
				setIsLoading(false); // Set loading to false after data is fetched
			})
			.catch((error) => {
				console.error('Error fetching weather data:', error);
				setIsLoading(false); // Set loading to false even if there's an error
			});
	};

	useEffect(() => {
		if (!weatherData || map.current) return;
		const { lon, lat } = weatherData.coord;
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/mapbox/light-v10',
			center: [lon, lat],
			zoom: 10,
		});
	}, [weatherData]);

	// Initialize Mapbox map
	useEffect(() => {
		// Ensure mapContainer is rendered and weatherData is available before initializing the map
		if (isLoading || !weatherData || map.current || !mapContainer.current)
			return;

		const { lon, lat } = weatherData.coord;
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/mapbox/light-v10',
			center: [lon, lat],
			zoom: 10,
		});
	}, [isLoading, weatherData]); // Add isLoading to the dependency array

	// Handlers for adding, deleting, and toggling saved cities
	const handleCitySubmit = (event) => {
		event.preventDefault();
		if (inputCity && !savedCities.includes(inputCity)) {
			setSavedCities([...savedCities, inputCity]);
			setInputCity('');
		}
	};

	const handleDeleteCity = (cityToDelete) => {
		setSavedCities(savedCities.filter((city) => city !== cityToDelete));
	};

	const toggleMenu = () => {
		setMenuExpanded(!menuExpanded);
	};

	// Save cities to localStorage
	useEffect(() => {
		// Update localStorage whenever savedCities changes
		localStorage.setItem('savedCities', JSON.stringify(savedCities));
	}, [savedCities]);

	// Compute processed data for weather display
	const processedData = useMemo(() => {
		if (!weatherData) {
			return {};
		}
		const { clouds, main, weather, wind, coord, name } = weatherData;
		return {
			cloudiness: clouds?.all || 0,
			currentTemp: main ? Math.round(main.temp - 273.15) : 0,
			highTemp: main ? Math.round(main.temp_max - 273.15) : 0,
			humidity: main?.humidity || 0,
			lowTemp: main ? Math.round(main.temp_min - 273.15) : 0,
			weatherDescription: weather?.[0]?.description || '',
			weatherType: weather?.[0]?.main || '',
			windSpeed: wind?.speed || 0,
			weatherLng: coord?.lon || 0,
			weatherLat: coord?.lat || 0,
			currentCity: name || '',
		};
	}, [weatherData]);

	return (
		<>
			<main className="App">
				{/* Navigation and city input */}
				<header>
					<nav>
						<a href="/" className="currentLocation">
							Current Location
						</a>

						<form className="cityInputForm" onSubmit={handleCitySubmit}>
							<input
								type="text"
								className="cityInput"
								value={inputCity}
								onChange={(e) => setInputCity(e.target.value)}
								placeholder="Enter city name"
							/>
							<button type="submit" className="addCityButton">
								Add City
							</button>
						</form>
					</nav>
				</header>

				<div>
					{' '}
					<button className="expandMenuButton" onClick={toggleMenu}>
						Saved Cities
					</button>
					{(menuExpanded || savedCities.length > 0) && (
						<div className="popupMenu">
							{savedCities.length === 0 && <span>No saved cities yet!</span>}
							{savedCities.length > 0 && (
								<ul className="cityList">
									{savedCities.map((savedCity, index) => (
										<li key={index} className="savedCityItem">
											<a href={`/?city=${savedCity}`}>{savedCity}</a>
											<span
												className="deleteButton"
												onClick={() => handleDeleteCity(savedCity)}
											>
												X
											</span>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
				{/* Loading state and weather data display */}

				{isLoading && !weatherData && <div className="Loading">Loading...</div>}
				{weatherData && (
					<>
						<h1
							className="Location"
							style={{
								textShadow: `0 0 10px rgb(${255 - processedData.cloudiness},${
									255 - processedData.cloudiness
								},${255 - processedData.cloudiness})`,
							}}
						>
							{processedData.currentCity}
						</h1>
						<section
							className="WeatherIcon"
							style={{
								color: `rgba(${255 - processedData.cloudiness / 2},${
									255 - processedData.cloudiness / 2
								},${255 - processedData.cloudiness / 2},1)`,
							}}
						>
							<WeatherImage weatherType={processedData.weatherType} />
						</section>

						{/* Map container */}
						<div>
							<div ref={mapContainer} className="map-container" />
						</div>
						{/* Weather card display */}
						<WeatherCard {...processedData} />
					</>
				)}
			</main>
			<Footer />
		</>
	);
}

export default Home;

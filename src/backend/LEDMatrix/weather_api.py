import requests

def get_weather(latitude, longitude):
    # Construct the Open-Meteo URL
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"

    try:
        # Make the GET request to Open-Meteo API
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the JSON response
        weather_data = response.json()
        
        # Extract temperature and weather description
        temperature = weather_data["current_weather"]["temperature"]
        weather_code = weather_data["current_weather"]["weathercode"]
        
        # Convert temperature to an integer
        temperature = int(temperature)
        
        # Determine weather condition based on weather_code
        if weather_code == 0:
            weather_condition = "clear"
        elif weather_code == 1:
            weather_condition = "half_cloudy"
        elif weather_code == 2:
            weather_condition = "cloudy"
        elif weather_code == 3:
            weather_condition = "rainy"
        elif weather_code == 4:
            weather_condition = "snowy"
        elif weather_code == 5:
            weather_condition = "windy"
        else:
            weather_condition = "unknown"
        
        return temperature, weather_condition
    
    except requests.exceptions.RequestException as e:
        # Handle errors like connection issues or invalid responses
        print(f"Error fetching weather data: {e}")
        return None, None

# Example usage:
# latitude = 52.52  # Berlin latitude
# longitude = 13.405  # Berlin longitude
# temperature, weather_condition = get_weather(latitude, longitude)

# if temperature is not None and weather_condition is not None:
#     print(f"Current weather at ({latitude}, {longitude}): {temperature}°C, {weather_condition}")

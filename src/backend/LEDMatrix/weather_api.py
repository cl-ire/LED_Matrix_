import requests

def get_weather(latitude, longitude):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"

    # Map weather codes to your custom labels
    weather_code_map = {
        "clear": [0],
        "half_cloudy": [1, 2],
        "cloudy": [3, 45, 48],
        "rainy": [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
        "snowy": [71, 73, 75, 77, 85, 86],
        "windy": [95, 96, 99]  # Using thunderstorm codes as "windy" as per your original code — consider renaming
    }

    try:
        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()

        temperature = int(weather_data["current_weather"]["temperature"])
        weather_code = weather_data["current_weather"]["weathercode"]

        # Find matching condition
        weather_condition = "unknown"
        for label, codes in weather_code_map.items():
            if weather_code in codes:
                weather_condition = label
                break

        return temperature, weather_condition

    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None, None

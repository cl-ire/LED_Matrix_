import requests

def get_current_time(timezone="Europe/Berlin"):
    # Construct the API URL
    url = f"https://timeapi.io/api/time/current/zone?timeZone={timezone}"
    
    try:
        # Make the GET request to the Time API
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the JSON response
        time_data = response.json()
        
        # Extract the hour and minute from the response
        hour = time_data.get("hour")
        minute = time_data.get("minute")
        
        if hour is not None and minute is not None:
            return hour, minute
        else:
            print("Error: Could not extract time from the response.")
            return None, None
    
    except requests.exceptions.RequestException as e:
        # Handle errors like connection issues or invalid responses
        print(f"Error fetching time data: {e}")
        return None, None

# Example usage:
# hour, minute = get_current_time("Europe/Berlin")
# if hour is not None and minute is not None:
#     print(f"Current time in Berlin: {hour}:{minute}")


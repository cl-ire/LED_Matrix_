import time

def get_system_time():
    # Get the current time using the time module
    current_time = time.localtime()  # Returns the current local time
    
    # Extract hour and minute
    hour = current_time.tm_hour
    minute = current_time.tm_min
    
    return hour, minute

# Example usage:
# hour, minute = get_system_time()
# print(f"Current time: {hour:02d}:{minute:02d}")
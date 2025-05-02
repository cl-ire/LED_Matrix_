import time
import board
import neopixel
import threading
import os

from .digits import digits, weather_symbols
from .time_api import get_current_time
from .weather_api import get_weather
from .system_time_api import get_system_time

latitude = os.getenv("LATITUDE")
longitude = os.getenv("LONGITUDE")
timezone = os.getenv("TZ")

matrix_rotation = os.getenv("MATRIX_ROTATION")

class LEDMatrix:
    def __init__(self, rows, cols, brightness=0.2):
        self.brightness = brightness
        self.rows = rows
        self.cols = cols
        self.matrix = [[(0,0,0) for _ in range(cols)] for _ in range(rows)]
        self.clock_active = False
        self.clock_thread = None
        
        self.animation_active = False
        self.animation_thread = None
        
        pixel_pin = board.D18
        self.num_pixels = rows * cols
        
        self.pixels = neopixel.NeoPixel(pixel_pin, self.num_pixels, brightness=self.brightness, auto_write=False)

    def set_pixel(self, x, y, r, g, b):
        if 0 <= x < self.cols and 0 <= y < self.rows:
            self.pixels[self.get_index(x,y)] = (r, g, b)
    
    def fill_matrix(self, r, g, b):
        self.pixels.fill((r, g, b))
        self.pixels.show()
    
    def get_index(self, x, y):
        if 0 <= x < self.cols and 0 <= y < self.rows:
            
            if matrix_rotation == "0":            
                if y % 2 == 0:
                    return y * self.cols + (self.cols - x - 1)
                else:
                    return y * self.cols + x
            elif matrix_rotation == "90":    # 90 degrees counter-clockwise
                original_x = self.rows - y - 1
                original_y = x
                if original_y % 2 == 0:
                    return original_y * self.cols + (self.cols - original_x - 1)
                else:
                    return original_y * self.cols + original_x
            elif matrix_rotation == "180":    # 180 degrees
                flipped_x = self.cols - 1 - x
                flipped_y = self.rows - 1 - y
                if flipped_y % 2 == 0:
                    return flipped_y * self.cols + (self.cols - 1 - flipped_x)
                else:
                    return flipped_y * self.cols + flipped_x
            elif matrix_rotation == "270":    # 270 degrees counter-clockwise
                original_x = y
                original_y = self.cols - 1 - x

                if original_y % 2 == 0:
                    return original_y * self.cols + (self.cols - 1 - original_x)
                else:
                    return original_y * self.cols + original_x
        return None
        
    def load_matrix(self, matrix):
        for y in range(self.rows):
            for x in range(self.cols):
                self.pixels[self.get_index(x, y)] = matrix[y][x]
        self.pixels.show()    
     
    def clear(self):
        self.pixels.fill((0, 0, 0))
        self.pixels.show()
    
    def process_number(self, number):
        n_positiv = True
        
        if number < 0:
            n_positiv = False
            number = abs(number)
        
        if number < 10:
            return 0, number, n_positiv
        else:
            # Split the digits of the number
            n_digits = [int(n_digit) for n_digit in str(number)]
            return n_digits[0], n_digits[1], n_positiv
    
    def place_digit(self, digit, x, y, color=[170,0,170]):
        matrix = digits[digit]
        for i in range(5):
            for j in range(3):
                val = matrix[i][j]
                if 0 <= y + i < self.rows and 0 <= x + j < self.cols:                    
                    if val == 1:
                        self.set_pixel(x + j, y + i, color[0], color[1], color[2]) 
                    else: 
                        self.set_pixel(x + j, y + i, 0, 0, 0)
    
    def place_weather(self, weather, x, y):
        matrix = weather_symbols[weather]
        for i in range(6):
            for j in range(6):
                val = matrix[i][j]
                if 0 <= y + i < self.rows and 0 <= x + j < self.cols:                    
                    self.set_pixel(x + j, y + i, matrix[i][j][0], matrix[i][j][1], matrix[i][j][2])
    
    def place_clock(self, hour, minute, temp, weather, color=[170,0,170]):
                
        hour_1, hour_2, n_hour = self.process_number(hour)
        
        self.place_digit(hour_1, 0, 1)
        self.place_digit(hour_2, 4, 1)

        minute_1, minute_2, n_minute = self.process_number(minute)
        
        self.place_digit(minute_1, 9, 1)
        self.place_digit(minute_2, 13, 1)
        
        temp_1, temp_2, n_temp = self.process_number(temp)

        if n_temp:        
            if temp_1 != 0:
                self.place_digit(temp_1, 0, 9)
            self.place_digit(temp_2, 4, 9)        
            self.set_pixel(8, 9, color[0], color[1], color[2]) # colon
        else:
            if temp_1 != 0 and temp_1 != 1:
                self.place_digit(temp_1, 2, 9)
                self.place_digit(temp_2, 6, 9)        
                self.set_pixel(0, 11, color[0], color[1], color[2]) # minus sign
                self.set_pixel(8, 9, color[0], color[1], color[2])  # colon
            elif temp_1 == 1:
                self.place_digit(temp_1, 0, 9)
                self.place_digit(temp_2, 4, 9)
                self.set_pixel(0, 11, color[0], color[1], color[2]) # minus sign
                self.set_pixel(8, 9, color[0], color[1], color[2])  # colon
            else:
                self.place_digit(temp_2, 4, 9)
                self.set_pixel(0, 11, color[0], color[1], color[2]) # minus sign
                self.set_pixel(1, 11, color[0], color[1], color[2]) # minus sign
                self.set_pixel(2, 11, color[0], color[1], color[2]) # minus sign
                
                
        
        self.place_weather(weather, 10, 9)

        self.pixels.show()
        
    def update_clock(self):
        counter = 0
        self.clear()
        while self.clock_active:
                      
            if counter > 120:
                counter = 0
                # reset couter every hour
            if counter == 0:
                # update weather
                temperature, weather = get_weather(latitude, longitude) # Dresden coordinates
        
            hour, minute = get_system_time()
            
            self.place_clock(hour, minute, temperature, weather)
            counter += 1
            time.sleep(10)  # Update every 30 seconds
            
    def stop_clock(self):
        self.clock_active = False
        if self.clock_thread and self.clock_thread.is_alive():
            self.clock_thread.join()
            self.clock_thread = None
    
    def start_clock(self):
        self.stop_clock()  # 🔁 Ensure no thread is left hanging
        self.clock_active = True
        self.clock_thread = threading.Thread(target=self.update_clock, daemon=True)
        self.clock_thread.start()
    
    def update_animation(self, animation_frames, frame_delay=0.1):        
        while self.animation_active:
            for i in range(len(animation_frames)):
                if not self.animation_active:
                    break
                self.load_matrix(animation_frames[i])
                time.sleep(frame_delay)
    
    def stop_animation(self):
        self.animation_active = False
        if self.animation_thread and self.animation_thread.is_alive():
            self.animation_thread.join()
            self.animation_thread = None
    
    def start_animation(self, animation_frames, frame_delay=0.1):
        self.stop_animation()  # 🔁 Ensure no thread is left hanging
        self.animation_active = True
        self.animation_thread = threading.Thread(
            target=self.update_animation,
            args=(animation_frames, frame_delay),
            daemon=True
        )
        self.animation_thread.start()


#led_matrix = LEDMatrix(16, 16, brightness=0.2)

#led_matrix.update_clock()
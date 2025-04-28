import asyncio
import time
import threading
import board
import digitalio
from adafruit_debouncer import Debouncer

# BUTTON PINS
BUTTON_INC = 23  # GPIO pin to increase index
BUTTON_DEC = 24  # GPIO pin to decrease index

# Function to setup GPIO and pass callback function
def setup_gpio(change_index):
    inc_pin = digitalio.DigitalInOut(board.D23)
    inc_pin.direction = digitalio.Direction.INPUT
    inc_pin.pull = digitalio.Pull.UP
    inc_button = Debouncer(inc_pin)

    dec_pin = digitalio.DigitalInOut(board.D24)
    dec_pin.direction = digitalio.Direction.INPUT
    dec_pin.pull = digitalio.Pull.UP
    dec_button = Debouncer(dec_pin)

    # Start the button monitoring thread
    button_thread = threading.Thread(target=button_monitoring_loop, args=(inc_button, dec_button, change_index))
    button_thread.daemon = True  # This ensures the thread will close when the main program exits
    button_thread.start()

# The function to run the button checking in a separate thread
def button_monitoring_loop(inc_button, dec_button, change_index):
    while True:
        # Update debouncers
        inc_button.update()
        dec_button.update()

        # Check if the button was pressed
        if inc_button.fell:
            handle_increase(change_index)

        if dec_button.fell:
            handle_decrease(change_index)

        # Small delay to prevent high CPU usage
        time.sleep(0.01)

# Handle increase button press
def handle_increase(change_index):
    # Using asyncio to run the async function in a proper way
    asyncio.run(button_change_index(1, change_index))

# Handle decrease button press
def handle_decrease(change_index):
    # Using asyncio to run the async function in a proper way
    asyncio.run(button_change_index(-1, change_index))

# Function to change index in a separate thread
async def button_change_index(delta: int, change_index):
    await change_index(delta)

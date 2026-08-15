import requests

ESP32_URL = "http://10.107.148.149/control"  # 👈 your ESP32 IP

def send_to_esp32(state):
    try:
        res = requests.get(f"{ESP32_URL}?state={state}", timeout=2)
        print("ESP32:", state, res.status_code)
    except Exception as e:
        print("ESP32 ERROR:", e)
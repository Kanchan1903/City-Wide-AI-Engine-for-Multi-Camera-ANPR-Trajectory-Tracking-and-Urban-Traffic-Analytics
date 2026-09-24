import time
import requests

start = time.time()
try:
    response = requests.post('http://localhost:8001/auth/login', data={'username': 'admin', 'password': 'password'}, timeout=10)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", e)
print("Time taken:", time.time() - start)

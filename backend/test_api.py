import requests
import sys

try:
    with open('test_image.jpg', 'wb') as f:
        f.write(b'\x00\x00') # fake image, might fail YOLO but at least trigger pipeline init
except Exception:
    pass

try:
    files = {'file': ('test_image.jpg', open('test_image.jpg', 'rb'), 'image/jpeg')}
    data = {'camera_id': 'CAM_005'}
    response = requests.post('http://localhost:8000/api/anpr/process-image', files=files, data=data)
    print(response.status_code)
    print(response.json())
except Exception as e:
    print(f"Error: {e}")

import requests
import json

file_path = "d:/SIH_2026/backend/data/uploads/022532b8c1754d468894956351a042a0.jpg"

try:
    with open(file_path, 'rb') as f:
        files = {'file': ('test_image.jpg', f, 'image/jpeg')}
        data = {'camera_id': 'CAM_TEST'}
        
        print("Sending request to local backend...")
        response = requests.post('http://localhost:8000/api/anpr/process-image', files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

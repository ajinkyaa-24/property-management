import requests

url = "http://127.0.0.1:8000"

# Register a user
auth_data = {"email": "test9@test.com", "username": "test9", "password": "password", "is_active": True, "is_superuser": False}
requests.post(f"{url}/auth/register", json=auth_data)

# Login
login_data = {"username": "test9", "password": "password"}
r = requests.post(f"{url}/auth/login", data=login_data)
token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# Create Property
prop = {"address": "123 Test", "monthly_rent": 1000, "is_available": True}
r = requests.post(f"{url}/properties/", json=prop, headers=headers)
prop_id = r.json()["id"]

# Create Tenant
ten = {"first_name": "A", "last_name": "B", "email": "a@b.com"}
r = requests.post(f"{url}/tenants/", json=ten, headers=headers)
ten_id = r.json()["id"]

# Create Agreement
agr = {
    "property_id": prop_id,
    "tenant_id": ten_id,
    "start_date": "2026-06-01",
    "end_date": "2027-06-01",
    "agreed_rent": 1000,
    "deposit": 1000,
    "status": "active"
}
r = requests.post(f"{url}/agreements/", json=agr, headers=headers)
agr_id = r.json()["id"]

# Create Payment
pay = {
    "agreement_id": agr_id,
    "amount": "1000",
    "payment_date": "2026-06-15",
    "status": "confirmed"
}
r = requests.post(f"{url}/payments/", json=pay, headers=headers)
print("STATUS CODE:", r.status_code)
print("RESPONSE:", r.text)

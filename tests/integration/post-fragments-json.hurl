# tests/integration/post-fragments-json.hurl
# Test posting a JSON fragment and retrieving it

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

`{"title": "My JSON Fragment", "content": "This is a JSON fragment!"}`

# Expect HTTP 201 Created
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 68  # length of the JSON string

# Capture the fragment URL
[Captures]
url: header "Location"

# GET the fragment using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
Content-Length: 68

[Asserts]
body == `{"title": "My JSON Fragment", "content": "This is a JSON fragment!"}`

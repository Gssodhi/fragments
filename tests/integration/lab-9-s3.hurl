# tests/integration/lab-9-s3.hurl
# Integration test for S3 functionality

# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

HTTP/1.1 201
[Asserts]
status == 201
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9

# Capture the Location URL into a variable named `location`
[Captures]
location: header "Location"

# 2. GET the fragment we just created
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
status == 200
header "Content-Type" == "text/plain"
body == "Hello S3!"

# 3. DELETE the fragment
DELETE {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"

# 4. Try to GET the fragment again (should be deleted)
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
status == 404
#jsonpath "$.error" contains "not found"
# tests/integration/lab-10-dynamodb.hurl
# Integration test for DynamoDB functionality

# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{ "service": "DynamoDB" }

HTTP/1.1 201
[Asserts]
status == 201
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

# Capture the Location URL and fragment ID
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. GET the fragment info (metadata) for the first fragment
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 3. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`DynamoDB is **great**.`

HTTP/1.1 201
[Asserts]
status == 201
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

# Capture the second Location URL and fragment ID
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. GET the fragment info (metadata) for the second fragment
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 5. GET all fragments without expanding (just IDs)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 6. DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"

# 7. Try to GET the first fragment again (should be deleted)
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
status == 404

# 8. GET all fragments without expanding again
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
status == 200
jsonpath "$.status" == "ok"
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"
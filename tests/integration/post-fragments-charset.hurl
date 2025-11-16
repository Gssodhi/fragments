# tests/integration/post-fragments-charset.hurl
# Test posting a fragment with a charset in Content-Type and GET it back

# Step 1: POST a new fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`This is a fragment with charset!`

# Expect HTTP 201 Created
HTTP/1.1 201

[Asserts]
# Location header should include the fragment ID
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
# Status should be "ok"
jsonpath "$.status" == "ok"
# Fragment ID should be a UUID
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Fragment type returned by server (charset is stripped)
jsonpath "$.fragment.type" == "text/plain"
# OwnerId is hex
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Created and updated fields exist
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
# Fragment size matches
jsonpath "$.fragment.size" == 32

# Capture the fragment URL to use in GET
[Captures]
url: header "Location"

# Step 2: GET the fragment we just posted
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 32

[Asserts]
body == "This is a fragment with charset!"

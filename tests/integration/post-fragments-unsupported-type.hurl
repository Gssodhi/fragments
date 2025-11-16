# tests/integration/post-fragments-unsupported-type.hurl
# Attempt to POST a fragment with an unsupported Content-Type

POST http://localhost:8080/v1/fragments
Content-Type: application/xml
[BasicAuth]
user1@email.com:password1

<note>This is an XML fragment</note>

# We expect HTTP 415 Unsupported Media Type
HTTP/1.1 415

[Asserts]
# Optional: Confirm JSON error message returned
header "content-type" matches "application/json.*"
#jsonpath "$.error" isString
#jsonpath "$.message" isString

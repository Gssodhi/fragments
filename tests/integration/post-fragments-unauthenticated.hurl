# tests/integration/post-fragments-unauthenticated.hurl
# Test posting a fragment without authentication

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`This fragment is unauthenticated!`

# Expect HTTP 401 Unauthorized
HTTP/1.1 401

[Asserts]
# The server should return an error object
#jsonpath "$.error" isString
# The error message should be a string explaining unauthorized access
#jsonpath "$.message" isString

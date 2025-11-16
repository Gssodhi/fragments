# tests/integration/404.hurl
# Test that requesting a non-existent route returns 404

GET http://localhost:8080/no-such-route

# We expect an HTTP 404 Not Found
HTTP/1.1 404

# Additional assertions to verify correct error structure
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" isString

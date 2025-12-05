#!/bin/bash
echo "Testing Backend API..."

# 1. Login
echo "1. Login as Admin..."
LOGIN_RES=$(curl -s --noproxy "*" -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@myblog.com", "password": "admin123"}')

echo "Login Response: $LOGIN_RES"

# Extract Token using Node.js for reliability
TOKEN=$(echo "$LOGIN_RES" | node -e "try { console.log(JSON.parse(fs.readFileSync(0, 'utf-8')).data.accessToken) } catch(e) { console.error(e) }")

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token. Login might have failed."
    exit 1
fi

echo "✅ Token acquired."

# 2. Create Post
echo "2. Creating a new post..."
CREATE_RES=$(curl -s --noproxy "*" -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Test Post From CLI", "content": "This is a test post content created via curl.", "status": "published"}')

echo "Create Response: $CREATE_RES"

# Extract Post ID
POST_ID=$(echo "$CREATE_RES" | node -e "try { console.log(JSON.parse(fs.readFileSync(0, 'utf-8')).data.id) } catch(e) { console.error(e) }")

if [ -z "$POST_ID" ] || [ "$POST_ID" == "undefined" ]; then
    echo "❌ Failed to create post."
    exit 1
fi

echo "✅ Post created with ID: $POST_ID"

# 3. Publish Post (It was created as published, but let's try the publish endpoint if it was draft)
# The request above set status: published.
# Let's try to fetch it to verify.

echo "3. Fetching the post..."
GET_RES=$(curl -s --noproxy "*" -X GET "http://localhost:3000/api/v1/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Get Response: $GET_RES"

echo "✅ Backend tests completed."

# referral-manager

API for managing a referral program

# API Documentation

## `/create-referral`

### `GET` request

Create a referral link to sign up.

Requires the user to be authenticated

#### Example

```bash
curl --request GET \
  --url http://localhost:3000/create-referral \
  --header 'Authorization: Bearer <token>'
```

## `/register`

### `POST` request

Sign up to create a new user.

Takes `name`, `phoneNumber`, `email` and `password` fields to create a user.
1 email can only be used for 1 user.

#### Example

```bash
curl --request POST \
  --url http://localhost:3000/register \
  --header 'content-type: application/json' \
  --data '{
  "email": "john@example.org",
  "name": "John Doe",
  "phoneNumber": "1-202-456-1111",
  "password": "a"
}'
```

## `/register/renew`

### `POST` request

Get a new bearer token for an existing user.

Takes `email` and `password` fields

### Example

```bash
curl --request POST \
  --url http://localhost:3000/register/renew \
  --header 'content-type: application/json' \
  --data '{
  "email": "john@example.org",
  "password": "a"
}'
```

## `/courses`

### `GET` request

Get an array of available courses

#### Example

```bash
curl --request GET \
  --url http://localhost:3000/courses \
```

### `POST` request

Purchase a course.

Takes `cardNumber` and `expiryDate` fields. Requires to be authenticated

#### Example

```bash
curl --request POST \
  --url http://localhost:3000/courses \
  --header 'Authorization: Bearer <token>' \
  --header 'content-type: application/json' \
  --data '{
  "cardNumber": "4242424242424242",
  "expiryDate": "12/34",
  "courseId": 0
}'
```

## `/statistics`

### `GET` request

Get all referees of the current user.

Requires the user to be authenticated

#### Example

```bash
curl --request GET \
  --url http://localhost:3000/statistics \
  --header 'Authorization: Bearer <token>'
```

# How to build and run

```bash
npm install
npm run build
npm run preview
```

# Notice

This project has the following dependencies

- `express`
- `express-validator`
- `knex`
- `pg`
- `helmet`
- `jsonwebtoken`
- `bcryptjs`
- and others

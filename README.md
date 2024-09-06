# referral-manager

API for managing a referral program

# API Documentation

## `/create-referral`

### `GET` request

Create a referral link to sign up.

Takes in an `email` field of the referrer

#### Example

```bash
curl "http:localhost:3000/create-referral?email=johndoe@example.org"
```

## `/register`

### `POST` request

Sign up to create a new user.

Takes in `name`, `phoneNumber` and `email` fields to create a user.
1 email can only be used for 1 user.

#### Example

```json
{
  "name": "John Doe",
  "phoneNumber": "1-202-456-1111",
  "email": "johndoe@example.org"
}
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
- and others

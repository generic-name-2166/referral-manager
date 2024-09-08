CREATE TABLE "user" 
(
    id serial NOT NULL PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    phone_number varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    hashed_password text NOT NULL,
    referrer_id integer,
    FOREIGN KEY (referrer_id) REFERENCES "user"(id)
);

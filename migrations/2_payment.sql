CREATE TABLE payment
(
    id serial NOT NULL PRIMARY KEY,
    course_id smallint NOT NULL,
    student_id integer NOT NULL,
    FOREIGN KEY (student_id) REFERENCES "user"(id)
);

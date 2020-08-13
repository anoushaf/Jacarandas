--
-- Queries for Student pages
--

-- Available Courses -- read
-- Get all subjects
SELECT subject FROM courses GROUP BY subject ORDER BY subject ASC;
-- Get all courses by subject
SELECT * FROM courses WHERE subject = :subject ORDER BY name ASC;

-- Available Courses -- search
-- Get all courses with name or subject matching query param within a particular subject
SELECT * FROM courses WHERE (name LIKE '%:query%' OR subject LIKE '%:query%') AND subject = :subject ORDER BY name ASC;
-- Course -- read single record
SELECT * FROM courses WHERE id = :id;

-- Avatars - read
-- Get all avatars for registration form
SELECT * FROM avatars;
-- Student - create
INSERT INTO students (firstname, lastname, birthdate, username, password, email, avatar_id) VALUES (:firstname, :lastname, :birthdate, :username, :password, :email, :avatar_id);
-- Student - read
-- Get student info after log in
SELECT students.*, (SELECT image FROM avatars WHERE id = students.avatar_id) AS avatar_image FROM students WHERE students.username = :username AND students.password = :password;
-- If student is already signed in, get student info from id
SELECT * FROM students WHERE id = :student_id;
-- Student - update
UPDATE students SET firstname = :firstname, lastname = :lastname, birthdate = :birthdate, username = :username, password = :password, email = :email, avatar_id = :avatar_id WHERE id = :id;
-- Student - delete
DELETE FROM students WHERE id = :student_id;

-- My Courses -- read
SELECT courses.* FROM courses INNER JOIN course_students ON course_students.course_id = courses.id WHERE course_students.student_id = :student_id ORDER BY courses.subject ASC, courses.name ASC;

-- Student Enroll - create
INSERT INTO course_students (course_id, student_id) VALUES (:course_id, :student_id);
-- Student Enroll - delete
DELETE FROM course_students WHERE course_id = :course_id AND student_id = :student_id;

-- Student Optin - create
INSERT INTO optins (confirm, student_id) VALUES (:confirm, :student_id);
-- Student Optin - read
SELECT * FROM optins WHERE student_id = :student_id;
-- Student Optin - update
UPDATE optins SET confirm = :confirm WHERE student_id = :student_id;

--
-- Queries for Admin pages
--

-- Avatars - create
INSERT INTO avatars (image) VALUES (:image);
-- Avatars - read all
SELECT * FROM avatars;
-- Avatars -- read single record
SELECT * FROM avatars WHERE id = :id;
-- Avatars - update
UPDATE avatars SET image = :image WHERE id = :id;
-- Avatars - delete
DELETE FROM avatars WHERE id = :id;

-- Courses - create
INSERT INTO courses (name, subject, description, question, answer, audio, image, video) VALUES (:name, :subject, :description, :question, :answer, :audio, :image, :video);
-- Courses - read all
SELECT * FROM courses;
-- Courses -- read single record
SELECT * FROM courses WHERE id = :id;
-- Courses - update
UPDATE courses SET name = :name, subject = :subject, description = :description, question = :question, answer = :answer, audio = :audio, image = :image, video = :video WHERE id = :id;
-- Courses - delete
DELETE FROM courses WHERE id = :id;

-- Students and Optins - read
SELECT CONCAT(students.firstname, ' ', students.lastname) AS fullname,
students.email, students.username,
(SELECT image FROM avatars WHERE id = students.avatar_id) AS avatar,
optins.confirm AS optin
FROM students
INNER JOIN optins ON optins.student_id = students.id
ORDER BY lastname ASC, firstname ASC

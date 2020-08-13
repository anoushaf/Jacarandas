-- Disable foreign key checks for tables with foreign keys
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table structure for table `avatars`
--
DROP TABLE IF EXISTS avatars;
CREATE TABLE avatars (
  id INT(11) NOT NULL AUTO_INCREMENT,
  image VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `courses`
--
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  description LONGTEXT DEFAULT NULL,
  question LONGTEXT DEFAULT NULL,
  answer LONGTEXT DEFAULT NULL,
  audio VARCHAR(255) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  video VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `course_students`
--
DROP TABLE IF EXISTS course_students;
CREATE TABLE course_students (
  course_id INT(11) NOT NULL,
  student_id INT(11) NOT NULL,
  PRIMARY KEY (course_id, student_id),
  CONSTRAINT course_students_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT course_students_student_id FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `optins`
--
DROP TABLE IF EXISTS optins;
CREATE TABLE optins (
  id INT(11) NOT NULL AUTO_INCREMENT,
  confirm tinyINT(1) NOT NULL DEFAULT 0,
  student_id INT(11) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT optins_student_id FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `students`
--
DROP TABLE IF EXISTS students;
CREATE TABLE students (
  id INT(11) NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  birthdate DATE NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_id INT(11) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT students_avatar_id FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Reenable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

--
-- Sample data for `avatars`
--
INSERT INTO avatars (image) VALUES ('cassette.png');
INSERT INTO avatars (image) VALUES ('equalizer.png');
INSERT INTO avatars (image) VALUES ('headphones.png');
INSERT INTO avatars (image) VALUES ('mic.png');
INSERT INTO avatars (image) VALUES ('radio.png');
INSERT INTO avatars (image) VALUES ('record.png');
INSERT INTO avatars (image) VALUES ('reeltoreel.png');
INSERT INTO avatars (image) VALUES ('speaker.png');
INSERT INTO avatars (image) VALUES ('volume.png');
--
-- Sample data for `courses`
--
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'How to Read Sheet Music',
  'Music Theory',
  '<h2>How to Read Sheet Music</h2><h3>Step 1: Learn the Basic Symbols of Notation</h3><p>Music is made up of a variety of symbols, the most basic of which are the staff, the clefs, and the notes. All music contains these fundamental components, and to learn how to read music, you must first familiarize yourself with these basics.</p><h3>The Staff</h3><p>The staff consists of five lines and four spaces. Each of those lines and each of those spaces represents a different letter, which in turn represents a note. Those lines and spaces represent notes named A-G, and the note sequence moves alphabetically up the staff.</p>',
  'How many lines are in a staff?',
  'Five',
  NULL,
  'notes-staff.jpg',
  NULL
);
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'Intervals',
  'Music Theory',
  '<h2>Intervals</h2><p>In music theory, an interval is the difference in pitch between two sounds. In Western music, intervals are most commonly differences between notes of a diatonic scale. The smallest of these intervals is a semitone. Intervals smaller than a semitone are called microtones. They can be formed using the notes of various kinds of non-diatonic scales.</p>',
  NULL,
  NULL,
  NULL,
  'notes-intervals.jpg',
  NULL
);
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'Key Signatures',
  'Music Theory',
  '<h2>Key Signatures</h2><p>In musical notation, a key signature is a set of sharp, flat, and rarely, natural symbols placed together on the staff. Key signatures are generally written immediately after the clef at the beginning of a line of musical notation, although they can appear in other parts of a score, notably after a double barline.</p>',
  NULL,
  NULL,
  NULL,
  'notes-key-signatures.jpg',
  NULL
);
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'Video - A Beginner\'s Guide to Music Theory',
  'Music Theory',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'https://www.youtube.com/embed/n2z02J4fJwg?enablejsapi=1'
);
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'Evolution of Music: A Music History Crash Course - TWO MINUTE MUSIC THEORY',
  'Music History',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'https://www.youtube.com/embed/qhILC0TPaTw?enablejsapi=1'
);
INSERT INTO courses (name, subject, description, question, answer, audio, image, video)
VALUES (
  'Ear Training - Guitar',
  'Practice',
  '<h2>Ear Training</h2><p>Listen to this song and see if you can tell what key it\'s in.</p>',
  'What key is this song in?',
  'E Flat',
  'bangbay-guitar.mp3',
  NULL,
  NULL
);

--
-- Sample data for `students`
--
INSERT INTO students (firstname, lastname, birthdate, username, password, email, avatar_id)
VALUES (
  'Jane',
  'Student',
  '1990-03-02',
  'musicislife',
  '52b5d24941a394fad2b89f2edacf878b',
  'jane@jacarandasmusic.com',
  (SELECT id FROM avatars WHERE image = 'mic.png')
);
INSERT INTO students (firstname, lastname, birthdate, username, password, email, avatar_id)
VALUES (
  'Bangbay',
  'Siboliban',
  '1990-03-02',
  'sibolibb',
  '52b5d24941a394fad2b89f2edacf878b',
  'sibolibb@oregonstate.edu',
  (SELECT id FROM avatars WHERE image = 'cassette.png')
);
INSERT INTO students (firstname, lastname, birthdate, username, password, email, avatar_id)
VALUES (
  'Anousha',
  'Farshid',
  '1990-03-02',
  'farshida',
  '52b5d24941a394fad2b89f2edacf878b',
  'farshida@oregonstate.edu',
  (SELECT id FROM avatars WHERE image = 'radio.png')
);

--
-- Sample data for `course_students`
--
INSERT INTO course_students (course_id, student_id)
VALUES (
  (SELECT id FROM courses WHERE name = 'How to Read Sheet Music'),
  (SELECT id FROM students WHERE username = 'musicislife')
);

--
-- Sample data for `optins`
--
INSERT INTO optins (confirm, student_id)
VALUES (
  true,
  (SELECT id FROM students WHERE username = 'musicislife')
);
INSERT INTO optins (confirm, student_id)
VALUES (
  false,
  (SELECT id FROM students WHERE username = 'sibolibb')
);
INSERT INTO optins (confirm, student_id)
VALUES (
  true,
  (SELECT id FROM students WHERE username = 'farshida')
);

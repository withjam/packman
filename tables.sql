CREATE TABLE package_names(
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(250) NOT NULL UNIQUE
) Engine=InnoDB;

CREATE TABLE packages (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name VARCHAR(250) NOT NULL UNIQUE,
  body text,
  FULLTEXT(body)
) Engine=InnoDB;

CREATE TABLE package_items (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  package_id INT,
  name varchar(200),
  body text,
  FULLTEXT (name,body),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
) Engine=InnoDB;

CREATE TABLE package_pics (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  package_id INT,
  name varchar(200),
  tags text,
  ctype varchar(150) NOT NULL,
  img longblob NOT NULL,
  FULLTEXT (name,tags),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
) Engine=InnoDB;

DELIMITER //
CREATE PROCEDURE create_new_package(body text)
BEGIN
  DECLARE nextid INT;
  DECLARE nextname VARCHAR(250);
  SELECT auto_increment INTO nextid from information_schema.tables where table_name='packages' and table_schema = DATABASE();
  SELECT name INTO nextname from package_names WHERE id = nextid;
  INSERT INTO packages VALUES(NULL,nextname,body);
  SELECT * FROM packages WHERE name = nextname;
END//
DELIMITER ;
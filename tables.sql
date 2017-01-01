CREATE TABLE package_names (
  id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
  label VARCHAR(250)
) Engine=InnoDB;

CREATE TABLE package_items (
  id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
  package_id INT,
  name varchar(200),
  body text,
  FULLTEXT (name,body),
  FOREIGN KEY (package_id) REFERENCES package_names(id) ON DELETE CASCADE
) Engine=InnoDB;

CREATE TABLE package_pics (
  id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
  package_id INT,
  name varchar(200),
  tags text,
  img longblob NOT NULL,
  FULLTEXT (name,body),
  FOREIGN KEY (package_id) REFERENCES package_names(id) ON DELETE CASCADE
) Engine=InnoDB;
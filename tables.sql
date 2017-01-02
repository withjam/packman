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
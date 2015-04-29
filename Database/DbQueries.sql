SQL statement
CREATE TABLE `album` (
  `idAlbum` int(11) NOT NULL AUTO_INCREMENT,
  `AlbumName` varchar(64) DEFAULT NULL,
  `owner` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`idAlbum`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8
ERROR: Previously created MySQL Table `test`.`album_sharing` was found. Statement ignored.
SQL statement
CREATE TABLE `album_sharing` (
  `idAlbum` int(11) NOT NULL,
  `idUser` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8
ERROR: Previously created MySQL Table `test`.`friends` was found. Statement ignored.
SQL statement
CREATE TABLE `friends` (
  `idfriends` int(11) NOT NULL AUTO_INCREMENT,
  `friend1` varchar(64) DEFAULT NULL,
  `friend2` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`idfriends`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8
ERROR: Previously created MySQL Table `test`.`image` was found. Statement ignored.
SQL statement
CREATE TABLE `image` (
  `idimage` int(11) NOT NULL AUTO_INCREMENT,
  `imageName` varchar(64) DEFAULT NULL,
  `caption` varchar(64) DEFAULT NULL,
  `path` varchar(256) DEFAULT NULL,
  `fromUser` varchar(64) DEFAULT NULL,
  `toUser` varchar(64) DEFAULT NUL...
ERROR: Previously created MySQL Table `test`.`user` was found. Statement ignored.
SQL statement
CREATE TABLE `user` (
  `idUser` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `emailId` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET...
ERROR: Previously created MySQL Table `test`.`users` was found. Statement ignored.
SQL statement
CREATE TABLE `users` (
  `emailid` varchar(20) NOT NULL,
  `password` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`emailid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

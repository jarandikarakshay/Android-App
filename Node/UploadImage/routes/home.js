var ejs = require("ejs");
var mysql = require('./mysql');
var fs = require('fs');

function upload(req, res) {

	ejs.renderFile('./views/upload.ejs', function(err, result) {
		// render on success
		if (!err) {
			res.end(result);
		}
		// render or error
		else {
			res.end('An error occurred');
			console.log(err);
		}
	});
}

function signIn(req, res) {
	var query = "select * from user where username = '" + req.param("username")
			+ "'";
	var password = req.param("password");
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				if (results[0].password == password) {
					console.log("success...");
					res.end("success", "text");
				}
			} else {
				console.log("failure...");
				res.end(null, "text");
			}

		}
	}, query);

}

function signUp(req, res) {
	var username = req.param("username");
	var password = req.param("password");
	var emailId = req.param("emailId");

	var query = "insert into user(username, password, emailId) values ('"
			+ username + "', '" + password + "', '" + emailId + "')";
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {

			console.log("success...");
			res.end("success", "text");

		}
	}, query);

}

function createAlbum(req, res) {
	var albumname = req.param("albumname");
	var owner = req.param("username");

	var query = "insert into album (albumname,owner) values ('" + albumname
			+ "','" + owner + "');";
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {

			console.log("success...");
			res.end("success", "text");

		}
	}, query);

}

function createGroup(req, res) {
	var groupName = req.param("groupname");
	var groupOwner = req.param("username");

	var query = "insert into groupinfo (group_name,group_owner) values ('"
			+ groupName + "', (select idUser from user where username='"
			+ groupOwner + "'));";
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log("success...");
			res.end("success", "text");
		}
	}, query);

}

function addGroupMember(req, res) {
	var groupName = req.param("groupname");
	var membername = req.param("membername");
	var groupOwner = req.param("username");

	groupName = groupName.substring(1, groupName.length - 1);
	membername = membername.substring(1, membername.length - 1);

	var query = "insert into groupmembers (idgroup,idmember,idowner) values ((select idgroup from groupinfo where group_name='"
			+ groupName
			+ "'), (select idUser from user where username='"
			+ membername
			+ "'),(select idUser from user where username='"
			+ groupOwner + "'));";
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;

		} else {
			console.log("success...");
			res.end("success", "text");
		}
	}, query);

}

function saveToMySql(req, res) {
	// console.log(req);
	console.log("User:" + req.user);
	var file = req.files.image;
	var s = file.mimetype;
	var i = 0;
	var fromUser = "";
	var album = "";
	var caption = "";
	var description = "";
	do {
		fromUser += s.charAt(i);
		i++;
		if (s.charAt(i) === '|') {
			i++;
			break;
		}
	} while (i < s.length);

	do {
		album += s.charAt(i);
		i++;
		if (s.charAt(i) === '|') {
			i++;
			break;
		}
	} while (i < s.length);

	do {
		caption += s.charAt(i);
		i++;
		if (s.charAt(i) === '|') {
			i++;
			break;
		}
	} while (i < s.length);

	for (var j = i; j < s.length - 1; j++) {
		description += s.charAt(j);
	}
	console.log("fromUser: " + fromUser);
	console.log("Album: " + album);
	console.log("caption: " + caption + "---" + description);
	console.log("description: " + description);
	var query = "select * from album where AlbumName = '" + album
			+ "' and owner = '" + fromUser + "'";

	console.log("Query is:" + query);

	mysql
			.fetchData(
					function(err, results) {
						if (err) {
							throw err;
						} else {
							// response logic ...
							console.log("success...");

							var innerQuery = "insert into image(imageName, caption, description, path, fromUser, toUser, dateTime, flagRead, idAlbum) values ('"
									+ file.name
									+ "', '"
									+ caption
									+ "', '"
									+ description
									+ "', 'uploads\\\\"
									+ file.name
									+ "', '"
									+ fromUser
									+ " ', ' ','"
									+ new Date().toISOString().slice(0, 19)
											.replace('T', ' ')
									+ "',  1, "
									+ results[0].idAlbum + " )";

							console.log("Query is:" + innerQuery);
							mysql.fetchData(function(err, results) {
								if (err) {
									throw err;
								} else {
									// response logic ...
									console.log("success...");
								}
							}, innerQuery);
						}
					}, query);
	res.render("success");
}

function getImage(req, res) {

	var query = "select * from image where imageName = '"
			+ req.param("imageName") + "'";

	// where fromUser = '" + req.fromUser + "'";

	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {

				var file = results[0].path;
				fs.stat(file, function(err, stat) {
					var img = fs.readFileSync(file);
					res.contentType = 'image/png';
					res.contentLength = stat.size;
					// var data = JSON.stringify(images);

					res.end(img, 'binary');

					// res.end(JSON.stringify(images));
				});

			}
		}
	}, query);

}

function searchImage(req, res) {
	var caption = req.param("caption");
	caption = caption.toLowerCase();
	var username = req.param("username");
	var query = "select im.imageName from image im, album_sharing ash where "
			+ "(im.fromuser='" + username
			+ "' or ash.iduser=(select iduser from user " + "where username='"
			+ username + "')) and im.idalbum=ash.idAlbum and "
			+ "im.caption LIKE '%" + caption + "%'";

	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				var files = [];
				for (var i = 0; i < results.length; i++) {
					files[i] = results[i].imageName;
					console.log(files[i]);
				}
				var data = JSON.stringify(files);
				res.end(data, 'text');
			}
		}
	}, query);

}

function getListImages(req, res) {

	var albumName = req.param("albumName");
	albumName = albumName.substring(1, albumName.length - 1);
	var query = "select * from image where "; // where fromUser = '" +
	// req.fromUser +
	// "'";

	var query = "select i.imageName from image i, album a where AlbumName = '"
			+ albumName + "' and a.idAlbum = i.idAlbum";

	console.log("Query is:" + query);
	var files = [];
	var i = 0;
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					files[i] = results[i].imageName;
					console.log(files[i]);
				}
				var data = JSON.stringify(files);
				res.end(data, 'text');
			}
		}
	}, query);

}

function getCaption(req, res) {

	var imageName = req.param("imageName");
	// imageName = imageName.substring(1, imageName.length - 1);

	var query = "select caption from image where imageName = '" + imageName
			+ "'";

	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				caption = results[0].caption;

				res.end(caption, 'text');
			}
		}
	}, query);

}

function getListAlbum(req, res) {
	var query = "select * from album where owner = '" + req.param("username")
			+ "'";

	console.log("Query is:" + query);
	var albums = [];
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					albums[i] = results[i].AlbumName;
					console.log(albums[i]);
				}
				var data = JSON.stringify(albums);
				res.end(data, 'text');
			}
		}
	}, query);

}

function getSharedListAlbum(req, res) {

	var finalAlbumList = [];

	var query = "select al.albumName from user u, album_sharing a,album al where username= '"
			+ req.param("username")
			+ "' and u.idUser=a.idUser and a.idAlbum=al.idAlbum union select  al.AlbumName from user u, groupmembers gm,album_sharing_group asg,"
			+ " album al where u.userName='"
			+ req.param("username")
			+ "' and u.iduser=gm.idmember and gm.idgroup=asg.idgroup and asg.idalbum=al.idAlbum;"

	/*
	 * var query = "select al.albumName from user u, album_sharing a,album al
	 * where username= '" + req.param("username") + "' and u.idUser=a.idUser and
	 * a.idAlbum=al.idAlbum ;"
	 */

	// var query = "select * from user where username = '" +
	// req.param("username")
	// + "'";
	console.log("Query is:" + query);

	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			var list = [];
			for (var i = 0; i < results.length; i++) {
				list[i] = results[i].albumName;
			}
			var data = JSON.stringify(list);
			res.end(data, 'text');

		}

	}, query);

}

function getListUser(req, res) {
	var username = req.param("username");
	var query = "select * from user where username != '" + username + "'";

	console.log("Query is:" + query);
	var users = [];
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					users[i] = results[i].username;
					console.log(users[i]);
				}
				var data = JSON.stringify(users);
				res.end(data, 'text');
			}
		}
	}, query);

}

function getMyFriends(req, res) {
	var username = req.param("username");
	var query = "select * from user where username != '" + username + "'";

	console.log("Query is:" + query);
	mysql.fetchData(function(err, result) {
		if (err) {
			throw err;
		} else {
			if (result.length > 0) {
				var idUser = result[0].idUser;

				var inquery = "select * from friends where friend1 = '"
						+ username + "' or friend2 = '" + username + "'";

				console.log("Query is:" + inquery);
				mysql.fetchData(function(err, results) {
					if (err) {
						throw err;
					} else {
						var users = [];
						var size = 0;
						if (results.length > 0) {
							for (var i = 0; i < results.length; i++) {
								if (results[i].friend1 != username) {
									users[size] = results[i].friend1;
									console.log(users[size]);
								}
								if (results[i].friend2 != username) {
									users[i] = results[i].friend2;
									console.log(users[size]);
								}
								size++;
							}
							users.sort();
							var finalUsers = [];
							size = 0;
							var length = users.length;
							for (var i = 0; i < length - 1; i++) {
								if (users[i] != users[i + 1]) {
									finalUsers[size++] = users[i];
								}
							}
							finalUsers[size++] = users[length - 1];
							var data = JSON.stringify(finalUsers);
							res.end(data, 'text');
						}
					}
				}, inquery);

			}
		}
	}, query);

}

function getListGroups(req, res) {

	var query = "select group_name from groupinfo where group_owner=(select iduser from user where username='"
			+ req.param("username") + "');";
	+"'";

	console.log("Query is:" + query);
	var groups = [];
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					groups[i] = results[i].group_name;
					console.log(groups[i]);
				}
				var data = JSON.stringify(groups);
				res.end(data, 'text');
			}
		}
	}, query);

}

function shareAlbumGroup(req, res) {

	var groupname = req.param("groupname");
	var username = req.param("username");
	var albumname = req.param("albumname");
	console.log("Username" + username);
	albumname = albumname.substring(1, albumname.length - 1);
	groupname = groupname.substring(1, groupname.length - 1);

	var query = "insert into album_sharing_group (idalbum,idgroup)  select (select idalbum from album where albumname='"
			+ albumname
			+ "' and owner='"
			+ username
			+ "') idalbum, idgroup from groupinfo where group_name='"
			+ groupname
			+ "'and group_owner=(select idUser from user where username='"
			+ username
			+ "') union select (select idalbum from album where albumname='"
			+ albumname
			+ "' and owner='"
			+ username
			+ "') idalbum,idgroup from groupmembers where idmember=(select idUser from user where username='"
			+ username
			+ "') and idowner in (select group_owner  from groupinfo where group_name='"
			+ groupname + "'  );";

	/*
	 * var query = "insert into album_sharing_group (idalbum,idgroup) values
	 * ((select idalbum from album where albumname='" + albumname + "' and
	 * owner='"+ username +"'),(select idgroup from groupinfo where
	 * group_name='"+ groupname+"' and group_owner=(select idUser from user
	 * where username='" + username + "')))";
	 */
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				console.log("success...");
				res.end("success", "text");
			} else {
				res.end("Unable to create group", "text");
			}

		}
	}, query);

}

function shareAlbum(req, res) {
	var albumName = req.param("albumName");
	albumName = albumName.substring(1, albumName.length - 1);
	var toUser = req.param("toUser");
	toUser = toUser.substring(1, toUser.length - 1);
	var query = "select * from album where AlbumName = '" + albumName + "'";

	console.log("Query is:" + query);
	mysql
			.fetchData(
					function(err, result) {
						if (err) {
							throw err;
						} else {
							if (result.length > 0) {
								var idAlbum = result[0].idAlbum;
								var inquery = "select * from user where username = '"
										+ toUser + "'";

								console.log("Query is:" + inquery);
								mysql
										.fetchData(
												function(err, results) {
													if (err) {
														throw err;
													} else {

														var idUser = results[0].idUser;
														var innerQuery = "insert into album_sharing values ("
																+ idAlbum
																+ ", "
																+ idUser
																+ ")";

														console.log("Query is:"
																+ innerQuery);
														mysql
																.fetchData(
																		function(
																				err,
																				results) {
																			if (err) {
																				throw err;
																			} else {

																				console
																						.log("success..------------------------");
																				res
																						.end(
																								"success",
																								"text");

																			}
																		},
																		innerQuery);

													}
												}, inquery);

							}
						}
					}, query);

}

function addFriend(req, res) {
	var username = req.param("username");
	var friend = req.param("friend");
	friend = friend.substring(1, friend.length - 1);
	if (friend == username) {
		res.end("Duplicate", 'text');
	} else {
		var query = "select * from user where username = '" + username
				+ "' or username = '" + friend + "'";

		console.log("Query is:" + query);
		mysql
				.fetchData(
						function(err, results) {
							if (err) {
								throw err;
							} else {
								// response logic ...
								console.log("success...");
								if (results.length > 0) {
									console.log("in****************"
											+ results.length);
									for (var i = 0; i < results.length; i++) {
										console.log(results[i].username);
									}

									var innerQuery = "insert into friends(friend1, friend2) values('"
											+ results[0].username
											+ "', '"
											+ results[1].username + "')";

									console.log("Query is:" + innerQuery);
									mysql.fetchData(function(err, result) {
										if (err) {
											throw err;
										} else {
											// response logic ...
											console.log("success...");
											console.log("Result:"
													+ result.length);
											res.end("success", 'text');

										}
									}, innerQuery);
								}
							}
						}, query);
	}
}

function addComment(req, res) {
	var imageName = req.param("imageName");
	var username = req.param("username");
	var comment = req.param("comment");

	var query = "insert into comments values (select idImage from image where imageName='"
			+ imageName + "'), '" + comment + "' , '" + username + "');";
	console.log("Query is:" + query);
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			console.log("success...");
			res.end("success", "text");
		}
	}, query);

}

function getGroupMembers(req, res) {
	var groupname = req.param("groupname");
	var username = req.param("username");
	groupname = groupname.substring(1, groupname.length - 1);

	var query = "select (select username from user where iduser=gm.idmember) member_name from groupinfo gi, groupmembers gm where group_name='"
			+ groupname
			+ "' and group_owner=(select iduser from user where username='"
			+ username
			+ "' ) and gm.idowner=gi.group_owner and gm.idgroup=gi.idgroup union select username from user where iduser in (select idmember from groupmembers where (idgroup,idowner) in (select idgroup,idowner from groupmembers where idmember=(select iduser from user where username='"
			+ username
			+ "' ) and  idgroup=(select idgroup from groupinfo where group_name='"
			+ groupname + "')));";

	console.log("Query is:" + query);
	var members = [];
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					members[i] = results[i].member_name;
					console.log(members[i]);
				}
				var data = JSON.stringify(members);
				res.end(data, 'text');
			}
		}
	}, query);

}

function getAllGroups(req, res) {

	var query = "select gi.group_name from groupinfo gi  where group_owner=(select iduser from  user where username='"
			+ req.param("username")
			+ "') union select gi.group_name from groupmembers gm,groupinfo gi  where idmember=(select iduser from  user where username='"
			+ req.param("username") + "') and gm.idgroup=gi.idgroup";

	console.log("Query is:" + query);
	var all_groups = [];
	mysql.fetchData(function(err, results) {
		if (err) {
			throw err;
		} else {
			// response logic ...
			console.log("success...");
			if (results.length > 0) {
				// var file = './uploads/icon_3dgallery_mini1430024637400.png';
				for (var i = 0; i < results.length; i++) {
					all_groups[i] = results[i].group_name;
					console.log(all_groups[i]);
				}
				var data = JSON.stringify(all_groups);
				res.end(data, 'text');
			}
		}
	}, query);

}

/*
 * function getPhotos(req, res) { //var getRecords = "select * from image where
 * toUser = '" + req.param("userId")+ "'"; var getRecords = "select * from image
 * where idAlbum = 1"; console.log("Query is:" + getRecords);
 * 
 * mysql.fetchData(function(err,results){ if(err){ throw err; } else {
 * if(results.length > 0){
 * 
 * var rows = results; var jsonString = JSON.stringify(results); var jsonParse =
 * JSON.parse(jsonString);
 * 
 * console.log("Path:" + results[0].path); var img = new Image();
 * 
 * 
 * 
 * 
 * console.log("Results Type: "+(typeof results)); console.log("Result Element
 * Type:"+(typeof rows[0].emailid)); console.log("Results Stringify
 * Type:"+(typeof jsonString)); console.log("Results Parse Type:"+(typeof
 * jsString));
 * 
 * console.log("Results: "+(results)); console.log("Result
 * Element:"+(rows[0].emailid)); console.log("Results Stringify:"+(jsonString));
 * console.log("Results Parse:"+(jsonParse));
 * 
 * ejs.renderFile('./views/successLogin.ejs',{data:jsonParse},function(err,
 * result) { // render on success if (!err) { res.end(result); } // render or
 * error else { res.end('An error occurred'); console.log(err); } }); } else {
 * 
 * console.log("No users found in database");
 * ejs.renderFile('./views/failLogin.ejs',function(err, result) { // render on
 * success if (!err) { res.end(result); } // render or error else { res.end('An
 * error occurred'); console.log(err); } }); } } },getRecords); }
 */
exports.upload = upload;
exports.saveToMySql = saveToMySql;
exports.getImage = getImage;
exports.getListImages = getListImages;
exports.signIn = signIn;
exports.signUp = signUp;
exports.getListAlbum = getListAlbum;
exports.getListUser = getListUser;
exports.addFriend = addFriend;
exports.getMyFriends = getMyFriends;
exports.shareAlbum = shareAlbum;
exports.getSharedListAlbum = getSharedListAlbum;
exports.createGroup = createGroup;
exports.addGroupMember = addGroupMember;
exports.getListGroups = getListGroups;
exports.createAlbum = createAlbum;
exports.getGroupMembers = getGroupMembers;
exports.searchImage = searchImage;
exports.getAllGroups = getAllGroups;
exports.searchImage = searchImage;
exports.shareAlbumGroup = shareAlbumGroup;
exports.getCaption = getCaption;
exports.addComment = addComment;
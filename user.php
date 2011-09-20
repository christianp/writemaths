<?php

include 'db.php';
define('SALT_LENGTH',9);
function generateHash($password,$salt = null)
{
	if ($salt === null)
	{
		$salt = substr(md5(uniqid(rand(),true)),0,SALT_LENGTH);
	}
	else
	{
		$salt = substr($salt,0,SALT_LENGTH);
	}
	return $salt.sha1($salt.$password);
}

function chooseLogin($name,$password)
{
	global $db;
	$name = sqlite_escape_string($name);
	$result = $db->querySingle("select name from users where name='".$name."';");
	if(!$result)
	{
		createUser($name,$password);
	}
	return login($name,$password);
}

function createUser($name,$password)
{
	global $db;

	$passwordHash = generateHash($password);

	$result = $db->query("insert or replace into users (name,password) values ('".$name."','".$passwordHash."');");
}

function login($name,$password)
{
	global $db;

	$result = $db->query("select password from users where name='".$name."';");
	$row = $result->fetchArray();
	$passwordHash = $row['password'];
	$salt = substr($passwordHash,0,SALT_LENGTH);
	$newHash = generateHash($password,$salt);
	if($newHash==$passwordHash)
	{
		$token = uniqid(rand(),true);
		$db->query("update users set token = '".$token."' where name='".$name."';");
		return $token;
	}
	else
	{
		return false;
	}

}

if($_GET)
{
	$name = base64_decode($_GET['name']);
	$password = base64_decode($_GET['password']);
	echo login($name,$password);
}
else if($_POST)
{
	$name = base64_decode($_POST['name']);
	$password = base64_decode($_POST['password']);
	echo chooseLogin($name,$password);
}
?>

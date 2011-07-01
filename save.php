<?php

include 'db.php';

function saveMaths($name,$content)
{
	global $db;
	$result = $db->query("select * from notes where name='".$name."' and locked=1");
	if(!$row=$result->fetchArray())
	{
		$result = $db->query("insert or replace into notes (name,locked,content) values ('".sqlite_escape_string($name)."',0,'".sqlite_escape_string($content)."')");
		return $result;
	}
}

function getMaths($name)
{
	global $db;

	$result = $db->query("select content from notes where name='".sqlite_escape_string($name)."'");
	$row = $result->fetchArray();
	return $row['content'];
}

if($_GET)
{
	$name = $_GET['name'];
	echo getMaths($name);
}
else if($_POST)
{
	$name = $_POST['name'];
	$content = stripslashes($_POST['content']);
	saveMaths($name,$content);
}
?>

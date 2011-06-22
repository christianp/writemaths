<?php

function saveMaths($name,$content)
{
	global $db;
	$result = sqlite_query($db,"insert or replace into maths (name,content) values ('".sqlite_escape_string($name)."','".sqlite_escape_string($content)."')");
	return $result;
}

function getMaths($name)
{
	global $db;

	$result = sqlite_query($db,"select * from maths where name='".sqlite_escape_string($name)."'");
	$row = sqlite_fetch_array($result);
	return $row['content'];
}

if($db = sqlite_open('maths.sqlite',0666,$sqlite_error))
{
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

}
else
{
	die($sqlite_error);
}
?>

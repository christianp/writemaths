<?
class MyDB extends SQLite3
{
	function __construct()
	{
		$this->open('maths.sqlite');
	}
}
$db = new MyDB();
?>

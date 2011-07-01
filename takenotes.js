var wm;
$(window).ready(function() {
	var saveName = 'help';
	if(window.location && window.location.search)
	{
		saveName = window.location.search.slice(1);
	}

	//switch page
	$('#switch').submit(function(e) {
		e.stopPropagation();
		e.preventDefault();
		var name = $(this).find('input').val();
		changeSaveName(name);
		wm.load();
		$(this).find('input').blur();
	});

	$(window).bind('popstate',function(e) {
		var name = window.location.search.slice(1);
		if(name)
			changeSaveName(name,true);
		wm.load();
	});

	function changeSaveName(name,nopush)
	{
		wm.setState('');
		if(!nopush && name!=saveName)
		{
			if(history && history.pushState)
				history.pushState({name: name},'['+name+'] Write maths, see maths!','?'+name);
			else
				document.location = '?'+name;
		}
		wm.saveName = saveName = name;
		$('#switch input, #saveas input').val(saveName);
		$('#switch input').val(saveName);
		var url = window.location.href;
		$('#url').attr('href',url).html(url);

		//recent pages auto-complete doodah
		var recent;
		try {
			recent = JSON.parse(localStorage['writemathsrecent']) || [];
		}
		catch(e) {
			recent = [];
		}
		if( (i=recent.indexOf(saveName)) >= 0 )
		{
			recent.splice(i,1);
		}
		if(!saveName.match(/tmp\d+/))
			recent.splice(0,0,saveName);
		recent = recent.slice(0,6);

		localStorage['writemathsrecent'] = JSON.stringify(recent);

		$('#switch input')
			.autocomplete({
				source: recent,
				minLength: 0,
				delay: 0,
				select: function(event,ui) { $(this).val(ui.item.value).submit(); }
			})
			.click(function() {

			})
			.focus(function() { this.select(); $(this).autocomplete('search','')})
			.mouseup(function(){ return false; })
		;
	}

	//save current page under different name
	$('#saveas').submit(function(e) {
		e.stopPropagation();
		e.preventDefault();
		changeSaveName($(this).find('input').val());
		wm.saveState();
	});

	$('#newpage').click(function() {
		name = 'tmp'+(new Date()).getTime();
		changeSaveName(name);
	});

	document.title = '['+saveName+'] Write maths, see maths!';

	wm = new WriteMaths('#writemaths',{
		display: '#printout',
		saveName: saveName
	});

	changeSaveName(saveName);

	$('#clear').click(function() {
		wm.setState('');
		wm.saveState();
	});
	$('#togglehtml').click(function() {
		wm.debugMode = wm.debugMode=='html' ? '' : 'html';
		if(wm.debugMode=='html')
		{
			wm.getHTML();
		}
		var t = $('#printout').toggle().is(':visible') ? 'Hide HTML' : 'Show HTML';
		$('#togglehtml').val(t);
	});
	$('#toggletex').click(function() {
		wm.debugMode = wm.debugMode=='tex' ? '' : 'tex';
		if(wm.debugMode=='tex')
		{
			wm.getTeX();
		}
		var t = $('#printout').toggle().is(':visible') ? 'Hide HTML' : 'Show HTML';
		$('#togglehtml').val(t);
	});

});

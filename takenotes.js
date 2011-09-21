var wm;
var takenotes;
$(window).ready(function() {
	var saveName = 'help';
	if(window.location && window.location.search)
	{
		saveName = window.location.search.slice(1);
	}

	if(localStorage['name'])
		loggedin(localStorage['name']);

	function loggedin(name)
	{
		$('#user #login').hide();
		$('#user #info').show();
		$('#user #info #name').html(name);
	}

	function logout()
	{
		delete localStorage['name'];
		delete localStorage['token'];
		$('#user #info').hide();
		$('#user #login').show();
	}

	//login
	$('#login input').keypress(function(e) {
		if(e.which!=13)
			return;

		e.stopPropagation();
		e.preventDefault();
		$('#login').fadeOut(200);

		var name = $('#login #name').val();
		var password = $('#login #password').val();

		$.post('user.php',{name: btoa(name), password: btoa(password)},function(token){
			if(!token)
			{
				$('#login').stop(true,true).show();
				alert('Incorrect password. If you were trying to create an account, there\'s already a user called '+name+'.');
			}
			else
			{
				localStorage['name'] = name;
				localStorage['token'] = token;
				loggedin(name);
			}
		});
	});

	//logout
	$('#logout').click(logout);

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
		var title = document.title = '['+name+'] takenot.es'
		if(!nopush && name!=saveName)
		{
			if(history && history.pushState)
				history.pushState({name: name},title,'?'+name);
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
		wm.output();
	}

	//save current page under different name
	$('#saveas').submit(function(e) {
		e.stopPropagation();
		e.preventDefault();
		var s = wm.getState().join('\n');
		changeSaveName($(this).find('input').val());
		wm.setState(s);
		wm.saveState();
	});

	$('#newpage').click(function() {
		name = 'tmp'+(new Date()).getTime();
		changeSaveName(name);
	});

	function loadfn()
	{
		var wm = this;
		$.get('note.php',{name:btoa(this.saveName)},function(data){wm.setState(data);});
	}

	function savefn(s) {
		if(this.posting)
		{
			this.nextPost = s;
		}
		else
		{
			delete this.nextPost;
			var wm = this;
			this.posting = true;
			$.post('note.php',{name: btoa(this.saveName), content: btoa(s)},function(){
				wm.posting = false;
				if(wm.nextPost)
					wm.savefn.apply(wm,[wm.nextPost]);
			});
		}
	}

	wm = new WriteMaths('#writemaths',{
		display: '#printout',
		saveName: saveName,
		loadfn: loadfn,
		savefn: savefn
	});

	changeSaveName(saveName);

	$('#clear').click(function() {
		if(window.confirm("Are you sure you want to clear the page? There's no way of recovering it.")) {
			wm.setState('');
			wm.saveState();
		}
	});

	function toggleOutputMode(mode) {
		if(mode==undefined)
			wm.outputMode = wm.outputMode=='html' ? 'tex' : 'html';
		else
			wm.outputMode = mode;
		wm.output();

		var t = wm.outputMode=='html' ? 'TeX' : 'HTML';
		$('#toggleoutputmode').val(t+' please');
	}
	$('#toggleoutputmode').click(function(){toggleOutputMode();});

	function toggleOutput() {
		$('#printout').toggle();
		var t;
		if($('#printout').is(':visible'))
		{
			t = 'Hide the source';
			$('#toggleoutputmode').show();
			wm.output();
			$('body').animate({scrollTop:$('#printout').offset().top-100},200);
		}
		else
		{
			t = 'Show the source';
			$('#toggleoutputmode').hide();
		}
		$('#toggleoutput').val(t);
	}
	$('#toggleoutput').click(toggleOutput);
	toggleOutputMode('html');
	toggleOutput();toggleOutput();

});

//Firepad Stuff

    recognizing = false;
    firepad = 'none';
    function init() {
      //// Initialize Firebase.
      // var firepadRef =  new Firebase('https://flickering-inferno-2935.firebaseio.com/class');
      var firepadRef = getExampleRef();

      // TODO: Replace above line with:
      // var firepadRef = new Firebase('<YOUR FIREBASE URL>');
      //// Create CodeMirror (with lineWrapping on).
      var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
      // Create a random ID to use as our user ID (we must give this to firepad and FirepadUserList).
      var userId = Math.floor(Math.random() * 9999999999).toString();
      //// Create Firepad (with rich text features and our desired userId).
      firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true, userId: userId});
      //// Create FirepadUserList (with our desired userId).
      var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
          document.getElementById('userlist'), userId);
      //// Initialize contents.
      firepad.on('ready', function() {
        if (firepad.isHistoryEmpty()) {
          firepad.setText('Notesy Transcribes lectures in real time while allowing all class members to view, edit and comment on the automatic notes in real time! The application also uses Yahoo\'s Context Analysis API to automatically extract entities and important topics and provides a quick way to access wikipedia data. Feel free to invite your classmates to the same URL you are on!');
        }

     
     });

    }
    // Helper to get hash from end of URL or generate a random one.
    function getExampleRef() {
      var ref = new Firebase('https://flickering-inferno-2935.firebaseio.com/class');
      var hash = window.location.hash.replace(/#/g, '');
      if (hash) {
        ref = ref.child(hash);
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.key(); // add it as a hash to the URL.
      }
      if (typeof console !== 'undefined')
        console.log('Firebase data: ', ref.toString());
      return ref;
    }
    init();

lastText = "";

setInterval(function() {
	text = firepad.getText().trim();
	if(text !== lastText && text.length !=0){
      textChunksArr = text.match(/.{1,100}/g);
      for(var idx in textChunksArr) {
        var chunk = textChunksArr[idx];
        
      }
  		getYahooData(text);
  		lastText = text;
  	if(text.length ==0)
  		clearEntities();
}
}, 5000);

    	LeftSign = "[<"
    	RightSign = ">]"
	String.prototype.splice = function(idx, rem, str) {
	    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
	};


  //Speech recognition

function startButton(event) {
  if (recognizing) {
    $("#recordButton").attr("value", "Start Recording");
    $("#recordButton").addClass("btn-success");
    $("#recordButton").removeClass("btn-danger");
    $("#rec-anim").attr("hidden", "");
    recognizing = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    return;
  }
  else {
    $("#recordButton").removeClass("btn-success");
    $("#recordButton").addClass("btn-danger");
    $("#recordButton").attr("value", "Stop Recording");
    $("#rec-anim").removeAttr("hidden");
    recognizing = true;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
  }
  showButtons('none');
}
function showInfo(s) {
	console.log(s);
}
var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
}

//Entity Extraction
function clearEntities(){

	container = $("._items")
	container.html("");

}
function updateEntities(json){
	//console.log(json)

	clearEntities();

	resArr = json.query.results.entities

  if(resArr != null) {
    resArr = resArr.entity;
    if(!(resArr instanceof Array)) {
      resArr = [resArr];
    }

    element = "<div class=\"list-group-item\"><a href=\"http://www.wikipedia.com\"></a></div>"

    element = jQuery.parseHTML(element)[0];

    for (var i=0; i < resArr.length; i++) {

    	newElement = $(element).clone();
    	newElement.find("a").text(resArr[i].text.content)

      var curr_url = resArr[i].wiki_url;
      if(!curr_url) {
        curr_url = "https://www.google.com/webhp?hl=en#hl=en&q=" + resArr[i].text.content.split(" ").join("+");
      }
    	newElement.find("a").attr("href",curr_url);

    	//newElement.find('h5').html(resArr[i].text.content);
    	container.append(newElement)      
    }

}




}
function getYahooData(text){

  if(text.length < 3) {
    return;
  }
	var query = 'select * from contentanalysis.analyze where text="' + text.replace(/[^\w\s]/gi, '') + '";'
	data = $.post( "http://query.yahooapis.com/v1/public/yql", {
	 q: query,
	 format: 'json'
	})
	  .done(function( data ) {
	  	var str = JSON.stringify(data, null, 2); // spacing level = 2
	  	updateEntities(data)
	    //console.log( "Data Loaded: " + str );
	  })
    .fail(function(err) {
      console.log(err);
    });
 } 


//Firepad Stuff


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

    setInterval(function() {
    	 updateFinal()
 	updateInterim()
}, 3000);
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

    function updateFinal(){
    	final_interm = final_span.innerHTML;
      final_transcript = "";
      final_span.innerHTML = "";
    	if(final_interm.length !== 0){    		
    		var fullText = firepad.getText();
    		var leftIndex = fullText.indexOf(LeftSign);
    		if(!final_interm.endsWith(" "))
    			final_interm += " "
    		fullText = fullText.splice(leftIndex,0,final_interm);
    		setTextWithCursor(fullText);
    	}


    }

    function clearInterim(){
    	 var fullText = firepad.getText();

    	var leftIndex = fullText.indexOf(LeftSign)
	 var rightIndex = fullText.indexOf(RightSign)
	     	 if(leftIndex !=-1 && rightIndex !=-1){
		     	 	beforeInterim = fullText.substring(0,leftIndex)
	    	 	afterInterim = fullText.substring(rightIndex+2)
	    		newFullText = beforeInterim + afterInterim
	    		setTextWithCursor(newFullText);
	     	 }

    }


    function setTextWithCursor(newText){

      cursorTop = $("textarea").parent().css("top");
      cursorLeft = $("textarea").parent().css("left");
      firepad.setText(newText);
      $("textarea").parent().css("top",cursorTop);
      $("textarea").parent().css("left",cursorLeft);

    }

    function updateInterim(){


    	if(!recognizing)
    		return



    	console.log("updating")
    	 var newText = $("#interim_span").text();
    	 var fullText = firepad.getText();


    	 var leftIndex = fullText.indexOf(LeftSign)
    	 var rightIndex = fullText.indexOf(RightSign)
    	 
    	 if(leftIndex ==-1 || rightIndex ==-1){

    	 	if(fullText.length != 0){
    	 		if(newText.length !=0)
					newFullText = fullText + " " + LeftSign + newText + RightSign
				else
					newFullText = fullText
			}
			else{
				newFullText = LeftSign + newText + RightSign
				
			}
    	 }


    	 else{
    	 	beforeInterim = fullText.substring(0,leftIndex)
    	 	afterInterim = fullText.substring(rightIndex+2)

    		newFullText = beforeInterim + LeftSign + newText + RightSign + afterInterim
		}

    	setTextWithCursor(newFullText);
    }


  //Speech recognition

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
  };
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };
  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    clearInterim();
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
    if (create_email) {
      create_email = false;
      createEmail();
    }
  };
  recognition.onresult = function(event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_transcript = capitalize(final_transcript);

    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}
function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
  if (recognizing) {
    $("#start_button").attr("value", "Start Recording");
    $("#start_button").addClass("btn-success");
    $("#start_button").removeClass("btn-danger");
    recognition.stop();
    return;
  }
  else {
    $("#start_button").removeClass("btn-success");
    $("#start_button").addClass("btn-danger");
    $("#start_button").attr("value", "Stop Recording");
  }
  final_transcript = '';
  recognition.lang = 'en-US';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  showButtons('none');
  start_timestamp = event.timeStamp;
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


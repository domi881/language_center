google_tranlate_code();
function google_tranlate_code(){
    document.body.className += ' notranslate';

    let google_translate_div = document.createElement('div');
    google_translate_div.id = 'google_translate_element';
    google_translate_div.style.width = '0px';
    google_translate_div.style.height = '0px';
    document.body.appendChild(google_translate_div);

    var link = document.createElement('script');
    link.setAttribute('src', 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
    link.setAttribute('type', 'text/javascript');
    
    //icon script
    var link2 = document.createElement('link');
    link2.setAttribute('href', 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');
    link2.setAttribute('rel', 'stylesheet');
    
    document.body.appendChild(link);
    document.head.appendChild(link2);
}
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: '*'}, 'google_translate_element');
}
add_style();
function add_style(){
    let style = document.createElement('style');
        style.innerHTML = ".bubble {height:85px; position: relative;font-family: Netflix Sans,Helvetica Neue,Segoe UI,Roboto,Ubuntu,sans-serif;font-size: 18px;line-height: 24px;max-width: 250px;min-width: 250px;background: #141414c7;padding: 24px;text-align: center;color: #e5e5e5;border-left: solid  7px #b9090b;}";
        style.innerHTML += ".bubble-bottom-left {position: relative; top: -104px;}";
        style.innerHTML += ".close_button {font-weight: 600;color:#a60000;width: 25px;height: 17px;position: absolute;background: #141414c7;top: -17px;padding: 0px;left: 273px;}";
        style.innerHTML += ".save_flashcard {color:var(--save-color);width: 32px;height: 24px;position: absolute;background: transparent;top: 80px;padding: 0px;left: 2px;font-size:27px;}";
        style.innerHTML += ".save_flashcard:hover {color: #ff0101;}";
        style.innerHTML += ".close_button:hover {color: #5b0202;}";
        style.innerHTML += ".bloc_bubble { display:inline-block; vertical-align:top; overflow:hidden;width: fit-content;height: 101px;background: transparent;left: 104px;position: relative;top: -24px;z-index: 5111; }";
        style.innerHTML += ".bloc_bubble select { padding:10px; margin:-5px -20px -5px -5px; }";
        style.innerHTML += "option:checked {background: red linear-gradient(0deg, red 0%, red 100%);}";
        style.innerHTML += "select#target_language_bubble option:hover {box-shadow: 0 0 10px 100px rgb(93, 0, 0) inset;}";
        style.innerHTML += "#target_language_bubble{top: 5px; right: 11px; font-weight: 700; width: 216px;z-index: 10000;font-size: 14px;background: transparent;border: none;}";
        style.innerHTML += "#speech_bubble{position:absolute; left: 8px; top: 7px; color: #b9090b}";
        style.innerHTML += ".bubble:before { content: '';width: 0px;height: 0px;position: absolute;border-left: 16px solid #a50202b0;border-right: 8px solid transparent;border-top: 8px solid #a50202b0;border-bottom: 14px solid transparent;left: 100px;bottom: -21px;}";
        style.innerHTML += ".selectable_lang{background: #000000d4;border: none;}";
        style.innerHTML += "#speech_bubble_separator{position:relative; top: -104px; border-color: #ff0d0d}";
        //style.innerHTML += "#google_translate_element{width:300px;float:right;text-align:right;display:block}";
    
        style.innerHTML += ".modal {display: none; /* Hidden by default */position: fixed; /* Stay in place */z-index: 1; /* Sit on top */padding-top: 100px; /* Location of the box */left: 0;top: 0;width: 100%; /* Full width */height: 100%; /* Full height */overflow: auto; /* Enable scroll if needed */background-color: rgb(0,0,0); /* Fallback color */background-color: rgba(0,0,0,0.4); /* Black w/ opacity */}";
        style.innerHTML += ".modal-content {position: relative;background-color: #fefefe;margin: auto;padding: 0;border: 3px solid #880000; width: 60%;box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);-webkit-animation-name: animatetop;-webkit-animation-duration: 0.4s;animation-name: animatetop;animation-duration: 0.4s}";
        style.innerHTML += "@-webkit-keyframes animatetop {from {top:-300px; opacity:0} to {top:0; opacity:1}}";
        style.innerHTML += "@keyframes animatetop {from {top:-300px; opacity:0}to {top:0; opacity:1}}";
        style.innerHTML += ".close {color: white;float: right;font-size: 28px;font-weight: bold;}";
        style.innerHTML += ".close:hover,.close:focus {color: #e50914;text-decoration: none;cursor: pointer;} ";
        style.innerHTML += ".modal-header {padding: 2px 16px;background-color: #0c0c0c;color: white;}";
        style.innerHTML += ".modal-body {padding: 2px 16px; background: #171616;}";
        style.innerHTML += ".modal-footer {text-align: center;font-size: 15px;padding: 2px 16px;background-color: #0c0c0c;color: #e50914;}";
        style.innerHTML += "#language_center_netflix_logo {color: #e50914; font-size:25px;}";
        style.innerHTML += ".modal_header_title {color: white; font-size: 400%;padding: 15px;margin: inherit;text-align: left;}";
        //left_next_arrow
        style.innerHTML += ".left_next_arrow {position:relative;font-size: 40px; left:50%;color:white;}";
        style.innerHTML += ".right_next_arrow {position:relative;font-size: 40px;right:50%;color:white;}";
        style.innerHTML += ".right_next_arrow:hover {color:#e50914;}";
        style.innerHTML += ".left_next_arrow:hover {color:#e50914;}";
        style.innerHTML += ".footer_table {width: 100%;}";
    
        style.innerHTML += ".bloc_center { display:inline-block; vertical-align:top; overflow:hidden;width: fit-content;height: 108px;background: transparent;right: 65px;position: absolute;top: 17px;z-index: 5111; }";
        style.innerHTML += ".bloc_center select { padding:10px; margin:-5px -20px -5px -5px; }";
        style.innerHTML += "select#target_language_center option:hover {box-shadow: 0 0 10px 100px rgb(93, 0, 0) inset;}";
        style.innerHTML += "#target_language_center{padding-top: 18px; top: 5px; right: 11px; font-weight: 700; width: fit-content;z-index: 500;font-size: 14px;background: #262626;border: none;}";
        
        style.innerHTML += "#:1.container{display: none;}";
        style.innerHTML += "iframe{display: none;position: absolute;top: -2000px;}";
        style.innerHTML += ".goog-te-banner-frame.skiptranslate { display: none !important;} ";
        style.innerHTML += "body { top: 0px !important; }";
        style.innerHTML += "#goog-gt-tt{display: none !important; top: 0px !important; } ";
        style.innerHTML += ".goog-tooltip skiptranslate{display: none !important; top: 0px !important; } ";
        style.innerHTML += ".activity-root { display: hide !important;} ";
        style.innerHTML += ".status-message { display: hide !important;}";
        style.innerHTML += ".started-activity-container { display: hide !important;}";
        
        style.innerHTML += ".flashcard_table{width: 100%}";
        style.innerHTML += ".flashcard_td{text-align: center;border: 3px solid #880000;;width: 20%;}";
        style.innerHTML += ".front_word{margin:0;padding-top: var(--padd);word-wrap: break-word;}";
        style.innerHTML += ".back_word{margin:0;padding-top: var(--padd);word-wrap: break-word;}";
        style.innerHTML += ".back_word_translation{margin:0;word-wrap: break-word;}";
        style.innerHTML += ".delete_flip {color: #ff0606;float: right;font-size: 28px;font-weight: bold; right: 10px; position: relative;}";
        style.innerHTML += ".delete_flip:hover,.delete_flip:focus {color: #5e0101;text-decoration: none;cursor: pointer;}";
        style.innerHTML += ".flip-card {background-color: transparent;width: 70%;height: 100%;min-height: 200px;perspective: 1000px;left: 15%;position: relative;}";
        style.innerHTML += ".flip-card-inner {position: relative;width: 100%;height: 100%;text-align: center;transition: transform 0.2s;transform-style: preserve-3d;box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);color: black;}";
        style.innerHTML += ".flip-card:hover .flip-card-inner {transform: rotateY(180deg);}";
        style.innerHTML += ".flip-card-front, .flip-card-back {position: absolute;width: 100%;height: 100%;-webkit-backface-visibility: hidden;backface-visibility: hidden;}";
        style.innerHTML += ".flip-card-front {background-color: #bbb;color: white;}";
        style.innerHTML += ".flip-card-back {background-color: #2980b9;color: white;transform: rotateY(180deg);}";
        style.innerHTML += ".bx_front {font-size: 30px;float: left;color: red;top: var(--top-for-dice);position: absolute;left: -17%}";
        style.innerHTML += ".bx_back {font-size: 30px;float: left;color: red;top: var(--top-for-dice);position: absolute;left: -17%}";
        
        style.innerHTML += "._1_card {font-size: var(--text-on-card-1);}";
        style.innerHTML += "._2_card {font-size: var(--text-on-card-2);}";
        style.innerHTML += "._3_card {font-size: var(--text-on-card-3);}";
        style.innerHTML += "._4_card {font-size: var(--text-on-card-4);}";
    
    
        style.innerHTML += ":root {--save-color: #b60101; --padd: 0px; --top-for-dice:0px; --text-on-card-1:0px; --text-on-card-2:0px; --text-on-card-3:0px; --text-on-card-4:0px;}";
    
    
        document.head.appendChild(style);
}

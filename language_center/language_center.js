var language_center = document.createElement('li');
let all_language = [];
let target_language = 'hu';
var r = document.querySelector(':root');
let all_flashcard_text = [];

let prevUrl = undefined;
setInterval(() => {
    const currUrl = window.location.href;
    if (currUrl != prevUrl) {
        // URL changed
        prevUrl = currUrl;
        console.log(`URL changed to : ${currUrl}`);

        if(document.URL == 'https://www.netflix.com/browse'){
            if(!document.getElementById('language_center')){
                document.getElementsByClassName('tabbed-primary-navigation')[0].appendChild(language_center);
            }
        }
    }
}, 1000);

create_language_center();
function create_language_center(){
    //tabbed-primary-navigation
    language_center.className = 'navigation-tab';
    language_center.id = 'language_center';

    var href_to_language_center = document.createElement('a');
    href_to_language_center.innerText = 'Language Center';
    language_center.appendChild(href_to_language_center);
    document.getElementsByClassName('tabbed-primary-navigation')[0].appendChild(language_center);

    create_modal();
}
function create_modal(){
    var modal_div = document.createElement('div');
    modal_div.className = 'modal';
    modal_div.id = 'language_center_modal';
    modal_div.innerHTML = '<div class="modal-content"><div class="modal-header"><div class="bloc"><select name="languages" id="target_language" onfocus="this.size=5;" onblur="this.size=1;" onchange="this.size=1; this.blur();"></select></div><span class="close">&times;</span><h2 class="modal_header_title">Language Center</h2></div><div class="modal-body"></div><div class="modal-footer"><table class="footer_table"><tr class="footer_tr"><td class="footer_td"><i class="bx bx-left-arrow-alt left_next_arrow" onclick="turn_the_page_left()"></i></td><td class="footer_td"><h3><a aria-label="Netflix" id="language_center_netflix_logo" class="logo icon-logoUpdate" href="/browse"></a></h3</td><td class="footer_td"><i class="bx bx-right-arrow-alt right_next_arrow" onclick="turn_the_page_right()"></i></td></tr></table></div></div>';
    document.body.appendChild(modal_div);

    create_style();
    language_center_button_functions();
    extract_data_from_cookie();
    create_flashcards();
}
function language_center_button_functions(){
    var modal = document.getElementById("language_center_modal");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    language_center.addEventListener('click', function(){
        modal.style.display = "block";
        if(all_language.length == 0){
            all_language = get_all_language_option();
            give_option();
            r.style.setProperty('--padd', document.getElementsByClassName('front_word')[1].getBoundingClientRect().height/2+'px');

            const bx_front = document.getElementsByClassName('bx_front')[0];
            const flashcard_td = document.getElementsByClassName('flashcard_td')[1].getBoundingClientRect().height;
            r.style.setProperty('--top-for-dice', flashcard_td-(bx_front.getBoundingClientRect().height*1.5)+'px');
        }
    });

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
  }

  give_option();
}
function give_option(){
    const sel = document.getElementById('target_language');
    for(let i = 0; i < all_language.length; i++){
        var opt = document.createElement('option');
        opt.addEventListener('click', function(){
            target_language = all_language[i].value;
            translate_text();
        });
        opt.value = all_language[i].value;
        opt.className = 'selectable_lang';
        opt.innerHTML = all_language[i].lang.toUpperCase();
        sel.appendChild(opt);
    }
}
function get_all_language_option(){
    const goog = document.getElementsByClassName('goog-te-combo')[0].children;
    let languages = [];
    for(let i = 0; i < goog.length; i++){
        const full_text_lang = goog[i].innerText.split('(')[0];
        languages.push({lang: full_text_lang, value: goog[i].value});
    }
    return languages;
}
function dynamic_font_size(word){
    if(word.length>59){return 14;}
    if(word.length<6){return 40;}
    const max_letters = 60;
    const min_letters = 1;
    const min_px = 1;
    const max_px = 40;

    const x = (max_px-min_px)/(max_letters-min_letters);
    const x_ = max_px - (30 * x);
    
    const max_letters_2 = 60;
    const min_letters_2 = 30;
    const min_px_2 = 18;
    const max_px_2 = x_;
    let y = (max_px_2-min_px_2)/(max_letters_2-min_letters_2);
    
    if(word.length < 30){
        return (max_px-(word.length*x));
    }
    return (max_px_2-(word.length*y));
}
function create_flashcards(){
    var table = document.createElement('table');
    var tr = document.createElement('tr');
    table.className = 'flashcard_table';
    tr.className = 'flashcard_tr';
    table.appendChild(tr);

    const td = '<td class="flashcard_td"><span class="delete_flip" onclick="delete_flashcard(this)">x</span><div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h1 class="front_word"></h1></div><div class="flip-card-back"><h1 class="back_word"></h1><hr><h1 class="back_word_translation translate"></h1> </div></div></div></td>';
    tr.innerHTML = td+td;
    table.appendChild(tr.cloneNode(true));
    document.getElementsByClassName('modal-body')[0].appendChild(table);

    //put in the dices
    const flashcards_front = document.getElementsByClassName('flip-card-front');
    const flashcards_back = document.getElementsByClassName('flip-card-back');
    const front_word = document.getElementsByClassName('front_word');
    const back_word = document.getElementsByClassName('back_word');
    const back_word_translation = document.getElementsByClassName('back_word_translation');
    for(let i = 0; i < flashcards_front.length; i++){
        flashcards_front[i].innerHTML += '<i class="bx bx-dice-'+(i+1)+' bx_front"></i>';
        flashcards_back[i].innerHTML += '<i class="bx bx-dice-'+(i+1)+' bx_back"></i>';
    }
    for(let i = 0; i < front_word.length; i++){
        front_word[i].className += ' _'+(i+1)+'_card';
        back_word[i].className += ' _'+(i+1)+'_card';
        back_word_translation[i].className += ' _'+(i+1)+'_card';
    }

    add_text_to_flash_card();
}
function delete_flashcard(t){
    const text_of_flashcard = t.parentElement.getElementsByClassName('front_word')[0].innerText;
    let index = all_flashcard_text.indexOf(text_of_flashcard);
    all_flashcard_text.splice(index, 1);
    add_text_to_flash_card();
    if(all_flashcard_text.length>0){
        setCookie('flashcards', all_flashcard_text.join('#')+'#', 365);
    }
    else{
        setCookie('flashcards', '', 365);
    }
}
function turn_the_page_left(){
    order_left();
    add_text_to_flash_card();
    translate_text();
}
function turn_the_page_right(){
    order_right();
    add_text_to_flash_card();
    translate_text();
}
function add_text_to_flash_card(){
    const front_word = document.getElementsByClassName('front_word');
    const back_word = document.getElementsByClassName('back_word');
    const back_word_translation = document.getElementsByClassName('back_word_translation');

    for(let i = 0; i < front_word.length; i++){
        let text_of_flashcard = '-';

        if(i < all_flashcard_text.length){
            text_of_flashcard = all_flashcard_text[i];
        }

        front_word[i].innerText = text_of_flashcard;
        back_word[i].innerText = text_of_flashcard;
        back_word_translation[i].innerText = text_of_flashcard;
    }

    for(let i = 0; i < front_word.length; i++){
        r.style.setProperty('--text-on-card-'+(i+1), dynamic_font_size(front_word[i].innerText)+'px');
    }
}
function order_left(){
    for(let j = 0; j < 4; j++){
        for(let i = 0; i < all_flashcard_text.length-1; i++){
            let c = all_flashcard_text[i+1];
            all_flashcard_text[i+1] = all_flashcard_text[i];
            all_flashcard_text[i] = c;
        }
    }
}
function order_right(){
    for(let j = 0; j < 4; j++){
        for(let i = all_flashcard_text.length-1; i > 0; i--){
            let c = all_flashcard_text[i-1];
            all_flashcard_text[i-1] = all_flashcard_text[i];
            all_flashcard_text[i] = c;
        }
    }
}

function create_style(){
    var style = document.createElement('style');
    style.innerHTML = ".modal {display: none; /* Hidden by default */position: fixed; /* Stay in place */z-index: 1; /* Sit on top */padding-top: 100px; /* Location of the box */left: 0;top: 0;width: 100%; /* Full width */height: 100%; /* Full height */overflow: auto; /* Enable scroll if needed */background-color: rgb(0,0,0); /* Fallback color */background-color: rgba(0,0,0,0.4); /* Black w/ opacity */}";
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

    style.innerHTML += ".bloc { display:inline-block; vertical-align:top; overflow:hidden;width: fit-content;height: 108px;background: transparent;right: 90px;position: absolute;top: 17px;z-index: 5111; }";
    style.innerHTML += ".bloc select { padding:10px; margin:-5px -20px -5px -5px; }";
    style.innerHTML += "option:checked {background: red linear-gradient(0deg, red 0%, red 100%);}";
    style.innerHTML += "select#target_language option:hover {box-shadow: 0 0 10px 100px rgb(93, 0, 0) inset;}";
    style.innerHTML += "#target_language{padding-top: 15px; top: 5px; right: 11px; font-weight: 700; width: fit-content;z-index: 500;font-size: 14px;background: #262626;border: none;}";
    
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


    style.innerHTML += ":root {--padd: 0px; --top-for-dice:0px; --text-on-card-1:0px; --text-on-card-2:0px; --text-on-card-3:0px; --text-on-card-4:0px;}";


    document.head.appendChild(style);
}

//repetative functions
function extract_data_from_cookie(){
    let cookie = getCookie('flashcards').split('#');
    cookie.pop();
    all_flashcard_text = cookie;
}
function setCookie(cname, cvalue, exdays){
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname){
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
function translate_text(){
    document.getElementsByClassName('goog-te-combo')[0].value = target_language;

    const e = new Event("change");
    const element = document.getElementsByClassName('goog-te-combo')[0];
    element.dispatchEvent(e);
}
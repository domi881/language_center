let watch_video = null;
let target_language = 'hu';
let your_language = 'en';
let all_language = [];
let original_text_in_bubble = '';
var r = document.querySelector(':root');
//highlight
let temporary_highlighter = document.createElement('div');
temporary_highlighter.id = 'temporary_highlighter';
temporary_highlighter.style.background = 'brown';
temporary_highlighter.style.position = 'absolute';

let font_size = 10;
const spec_characters = '[]{}()./\\+#><?%!';
const spec_characters_obj = {'[':true, ']':true,'}':true,'{':true,'(':true,')':true,'-':true,'_':true,'!':true,'%':true,'#':true,'+':true,'>':true,'<':true };
let subtitle_first_row_length = 0;
//ruler
let my_ruler = document.createElement('span');
my_ruler.id = 'my_ruler';
my_ruler.style.position = 'absolute';
document.body.appendChild(my_ruler);

let speech_bubble = document.createElement('div');
style_of_speech_buble();



// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };
// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);
append_elements_and_start();


let prevUrl = undefined;
setInterval(() => {
    const currUrl = window.location.href;
    if (currUrl != prevUrl) {
        // URL changed
        prevUrl = currUrl;
        console.log(`URL changed to : ${currUrl}`);
        
        if(document.URL.includes('https://www.netflix.com/watch/')){
            when_subtitles_on_start_translation();
        }
    }
}, 1000);


function when_subtitles_on_start_translation(){
    setTimeout(function(){
        if(document.getElementsByClassName("watch-video--player-view")[0]){
            append_elements_and_start();
        }
        else{
            when_subtitles_on_start_translation();
        }
    },500)
}
function append_elements_and_start(){
    watch_video = document.getElementsByClassName('watch-video')[0];
    watch_video.appendChild(speech_bubble);
    watch_video.appendChild(temporary_highlighter);
    
    const targetNode2 = document.getElementsByClassName("watch-video--player-view")[0];
    observer.observe(targetNode2, config);
}
// Callback function to execute when mutations are observed
function callback(mutationList, observer){
    for (const mutation of mutationList) {
        if (mutation.type === "childList") {
            if(document.getElementsByClassName('player-timedtext-text-container')[0] != null){
                //create my own subtitle
                let save_inner_text = document.getElementsByClassName("player-timedtext-text-container")[0].children[0];
                let video_width = document.getElementsByClassName('watch-video')[0].getBoundingClientRect().width;
                const og_subtitle_top = save_inner_text.getBoundingClientRect().top;

                initialize_new_subtitle(save_inner_text, video_width, og_subtitle_top);

                let my_span = document.getElementsByClassName('new_own_subtitle');
                for(let i = 0; i < my_span.length; i++){
                    my_span[i].style.lineHeight = '24px';
                    let rect = my_span[i].getBoundingClientRect();
    
                    //create the word object --> we have to know every word how many pixel wide
                    let words_width_in_pixel = create_word_objects(my_span[i].innerText);
    
                    //on mouse move find the current word and highligh it
                    my_span[i].addEventListener('mousemove',  (event) => on_mouse_move(event, words_width_in_pixel, rect));
                    my_span[i].addEventListener('mousedown',  (event) => on_mouse_click(event, words_width_in_pixel, rect, i));
                    my_span[i].addEventListener('mouseout',  (event) => on_mouse_out());
                    my_span[i].addEventListener('mouseover',  (event) => on_mouse_over(event, words_width_in_pixel, rect, i));
    
                }
                
                //hide the original subtitle
                const myNode = document.getElementsByClassName("player-timedtext")[0];
                myNode.style.zIndex = -1;

                //if the site's size changes then it sticks so it must be relocated
                relocate_highlighted_words(my_span);
            }
            else{
                remove_everything_if_subtitle_changes();

            }
        }
        else if (mutation.type === "attributes") {
            //console.log(`The ${mutation.attributeName} attribute was modified.`);
        }
    }
}
function relocate_highlighted_words(my_span){
    let words = document.getElementsByClassName('highlighted_word');

    if(words.length == 0){ 
        return;
    }

    for(let j = 0; j < my_span.length; j++){
        let test_word_arr = create_word_objects(my_span[j].innerText);
        for(let i = 0; i < words.length; i++){
            if(parseInt(words[i].getAttribute('which_row')) == j){
                const curr_word = test_word_arr[parseInt(words[i].getAttribute('index'))];
                const stx = curr_word.start_x;
                const measured_word = ruler(curr_word.word, '0px', '0px');

                words[i].style.left = stx + my_span[j].getBoundingClientRect().left + 'px';
                words[i].style.width = measured_word.width+ 'px';
                words[i].style.height = temporary_highlighter.style.height;
                words[i].style.top = my_span[j].getBoundingClientRect().top+'px';
            } 
        }
    }

    const bubble_coords = speech_bubble.getBoundingClientRect();
    const the_top_subtitle = document.getElementsByClassName('new_own_subtitle')[0].getBoundingClientRect().top;
    const y_middle = the_top_subtitle - bubble_coords.height - 35;
    const x_middle = words[words.length-1].getBoundingClientRect().left - (bubble_coords.width*0.30);

    speech_bubble.style.top = y_middle+'px';
    speech_bubble.style.left = x_middle+'px';
    /*
    */
}
function rearrange(){
    //sort the words by the x coordinate in order to get the correct word order
    let words = document.getElementsByClassName('highlighted_word');
    let sorted_words = [].slice.call(words).sort((a, b) => {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    //if there are two rows of text then those must be separeted and rearranged again

    if(sorted_words.length > 0){
        let min = sorted_words.reduce(function(prev, curr) {
            return prev.getBoundingClientRect().top < curr.getBoundingClientRect().top ? prev : curr;
        });
        let max = sorted_words.reduce(function(prev, curr) {
            return prev.getBoundingClientRect().top > curr.getBoundingClientRect().top ? prev : curr;
        });
    
        let firstRow = [];
        let secondRow = [];
        min = min.getBoundingClientRect().top;
        max = max.getBoundingClientRect().top;
    
        for(const word of sorted_words){
            if(word.getBoundingClientRect().top == min){
                firstRow.push(word);
            }
            else{
                secondRow.push(word);
            }
        }
    
        const prepared_for_the_final_sort = firstRow.concat(secondRow);
        let final_words = [];
        for(let i = 0; i<prepared_for_the_final_sort.length; i++ ){
            const p_word = prepared_for_the_final_sort[i].getAttribute('word');
            let s = '';
            for(let j = 0; j < p_word.length; j++){
                if(!spec_characters_obj[p_word[j]]){
                    s+=p_word[j];
                }
            }
            prepared_for_the_final_sort[i].setAttribute('word', s);
            final_words.push(prepared_for_the_final_sort[i]);
        }
        return final_words;
    }
    return null;
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
        opt.innerHTML = all_language[i].lang;
        sel.appendChild(opt);
    }
}
let previous_word = '';
function on_mouse_over(event, words_width_in_pixel, rect){
    if(document.getElementsByClassName('highlighted_word').length != 0){
        return;
    }

    previous_word = mouse_on_or_over_word(event, words_width_in_pixel, rect).word;
    position_bubble(temporary_highlighter, previous_word);
}
function on_mouse_click(event, words_width_in_pixel, rect, index){
    if(all_language.length == 0){
        all_language = get_all_language_option();
        give_option();
    }
    let s = get_current_word(event, words_width_in_pixel, rect);
    
    const clone = temporary_highlighter.cloneNode(true);
    clone.id = '';
    clone.className = 'highlighted_word';
    clone.setAttribute('word',s.word);
    clone.setAttribute('which_row', index);
    clone.setAttribute('index', s.index);
    clone.style.zIndex = 5;
    clone.style.height = font_size;
    clone.style.width = s.width+'px';
    clone.style.top = rect.top+'px';
    clone.style.background = '#5d0000';
    clone.style.left = subtitle_first_row_length+s.start_x+'px';
    watch_video.appendChild(clone);

    
    let current_highlighted_words = rearrange();
    const current_node_left_value = clone.getBoundingClientRect().left;
    const current_node_top_value = clone.getBoundingClientRect().top;
    let same_word_counter = 0;
    for(let i = 0; i < current_highlighted_words.length; i++){
        if(current_highlighted_words[i].getBoundingClientRect().left == current_node_left_value && current_node_top_value == current_highlighted_words[i].getBoundingClientRect().top){
            same_word_counter++;
        }
    }
    if(same_word_counter == 2){
        for(let i = 0; i < current_highlighted_words.length; i++){
            if(current_highlighted_words[i].getBoundingClientRect().left == current_node_left_value && current_node_top_value == current_highlighted_words[i].getBoundingClientRect().top){
                watch_video.removeChild(current_highlighted_words[i]);
            }
        }
        current_highlighted_words = rearrange();
    }
    //position the speech bubble above the current node
    const last_highlighted_word = document.getElementsByClassName('highlighted_word');
    position_bubble(last_highlighted_word[last_highlighted_word.length-1], get_highlighted_text(current_highlighted_words));
}
function remove_everything_if_subtitle_changes(){
    //remove the subtitles
    remove_my_subtitles();

    remove_translation_tools();
}
function remove_translation_tools(){
    //make the temporary_highlight_disappear
    on_mouse_out();

    //remove the selected words
    while (document.getElementsByClassName('highlighted_word').length > 0) {
        watch_video.removeChild(document.getElementsByClassName('highlighted_word')[0]);
    }

    //make the speech bubble disappear & delete the text
    speech_bubble.style.zIndex = -1;
    document.getElementsByClassName('bubble-bottom-left')[0].innerText = '';
}
function on_mouse_out(){
    temporary_highlighter.style.zIndex = -1;

    //make the speech bubble disappear & delete the text
    if(document.getElementsByClassName('highlighted_word').length != 0){
        return;
    }
    speech_bubble.style.zIndex = -1;
    document.getElementsByClassName('bubble-bottom-left')[0].innerText = '';
}
function on_mouse_move(event, words_width_in_pixel, rect){
    let s = mouse_on_or_over_word(event, words_width_in_pixel, rect).word;
    if(s!=previous_word){
        on_mouse_over(event, words_width_in_pixel, rect);
    }
}
function mouse_on_or_over_word(event, words_width_in_pixel, rect){
    let s = get_current_word(event, words_width_in_pixel, rect);

    temporary_highlighter.style.height = font_size;
    temporary_highlighter.style.zIndex = 2000;
    temporary_highlighter.style.width = s.width+'px';
    temporary_highlighter.style.top = rect.top+'px';
    temporary_highlighter.style.left = subtitle_first_row_length+s.start_x+'px';

    return s;
}
function get_highlighted_text(nodes){
    let words = [];
    if(nodes != null){
        for(let i = 0; i< nodes.length; i++){
            words.push(nodes[i].getAttribute('word'));
        }
        return words.join(' ');
    }
    return '';
}
function position_bubble(clone, text){
    if(text == ''){
        speech_bubble.style.zIndex = -1;
        return null;
    }
    const bubble_text = document.getElementsByClassName('bubble-bottom-left')[0];
    original_text_in_bubble = text;
    bubble_text.innerText = text;
    bubble_text.style.fontSize = parseInt(font_size.split('px')[0])-7 + 'px';
    
    speech_bubble.style.zIndex = 1;
    const clone_coords = clone.getBoundingClientRect();
    const bubble_coords = speech_bubble.getBoundingClientRect();
    const the_top_subtitle = document.getElementsByClassName('new_own_subtitle')[0].getBoundingClientRect().top;
    const x_middle = clone_coords.left - (bubble_coords.width*0.30);
    const y_middle = the_top_subtitle - bubble_coords.height - 35;

    speech_bubble.style.top = y_middle+'px';
    speech_bubble.style.left = x_middle+'px';

    //translate
    translate_text();
}
function translate_text(){
    document.getElementsByClassName('goog-te-combo')[0].value = target_language;

    const e = new Event("change");
    const element = document.getElementsByClassName('goog-te-combo')[0];
    element.dispatchEvent(e);
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
function get_current_word(event, words_width_in_pixel, rect){
    let x = event.clientX - rect.left;
    let s = null;
    for(let i = 0; i < words_width_in_pixel.length-1; i++){
        if(words_width_in_pixel[i].start_x<x && words_width_in_pixel[i+1].start_x>x){
            s = words_width_in_pixel[i];
        }
    }
    if(x < 1){
        s = words_width_in_pixel[0];
    }
    else if(s == null){
        s = words_width_in_pixel[words_width_in_pixel.length-1];
    }
    return s;
}
function create_word_objects(text){
    let words_width_in_pixel = [];
    let splitted_text = text.split(' ');

    for(let i = 0; i < splitted_text.length; i++){
        words_width_in_pixel.push({width: ruler(splitted_text[i], '0px', '0px').width, start_x: 0, word: splitted_text[i], index: i});
    }
    for(let i = 0; i < splitted_text.length; i++){
        let x = 0;
        for(let j = 0; j < i; j++){
            x += words_width_in_pixel[j].width + ruler('I', '0px', '0px').width - 1; 
        }
        words_width_in_pixel[i].start_x = x;
    }
    return words_width_in_pixel;   
}
function initialize_new_subtitle(save_inner_text, video_width, og_subtitle_top){
    if(typeof save_inner_text !== "undefined"){
        font_size = save_inner_text.lastElementChild.style.fontSize;
        const font_size_without_px = parseInt(font_size.split('px')[0]);
        
        let splitted = save_inner_text.innerText.split('\n');
        save_inner_text = '';
        for(let i = 0; i < splitted.length; i++){
            save_inner_text+=splitted[i]+' ';
        }

        remove_my_subtitles();

        //if the subtitile reaches a certain long then make it into two rows
        const how_many_words = save_inner_text.split(' ');
        const video_height = /*document.getElementsByTagName('video')[0].getBoundingClientRect().height;*/800;
        const subtitle_width = ruler(save_inner_text, '0px', '0px').width;
        let subtitle_left_margin = (video_width/2) - (subtitle_width/2);
        
        const middleIndex = 8;
        if(how_many_words.length > middleIndex){
            const firstHalf = how_many_words.splice(0, middleIndex).join(' ');   
            const secondHalf = how_many_words.splice(-middleIndex).join(' ');
            subtitle_left_margin = (video_width/2) - (ruler(firstHalf, '0px', '0px').width/2);

            create_span(firstHalf, subtitle_left_margin+'px', og_subtitle_top - font_size_without_px - 5 +'px', 'new_own_subtitle');
            create_span(secondHalf, subtitle_left_margin+'px', og_subtitle_top +'px', 'new_own_subtitle');
        }
        else{
            create_span(save_inner_text, subtitle_left_margin+'px', og_subtitle_top +'px', 'new_own_subtitle');
        }
        subtitle_first_row_length = subtitle_left_margin;
        

    }
}
function close_bubble(){
    remove_translation_tools();
}
function save_flashcard(){
    const cookie = getCookie('flashcards');
    let cookie_pieces = getCookie('flashcards').split('#');
    cookie_pieces.pop();

    const text_in_t_lang = document.getElementsByClassName('bubble-bottom-left')[0].children;
    const index_of_selected = document.getElementsByClassName('goog-te-combo')[0].selectedIndex;
    let text = '';
    for(let i = 0; i < text_in_t_lang.length; i++){
        text += text_in_t_lang[i].innerText;
    }

    //check if the selected elem is in the cookie if it is then return with nothing;
    const f_card = {target_language: all_language[index_of_selected].lang, text_in_original: original_text_in_bubble, text_in_target_language:text};
    if(cookie_pieces.indexOf(f_card.text_in_original) != -1){
        console.log('already in')
        return '';
    }
    setCookie('flashcards', cookie+f_card.text_in_original+'#', 365);

    //make animation to save
    save_animation();
}
function save_animation(){
    const save_element = document.getElementsByClassName('save_flashcard')[0];
    r.style.setProperty('--save-color', 'green');
    save_element.style.transition = '0.6s';

    setTimeout(function(){
        r.style.setProperty('--save-color', '#b60101');
        save_element.style.transition = '0.5s';
        setTimeout(function(){
            save_element.style.transition = '0s';
        },500);
    },600);

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
function remove_my_subtitles(){
    while (document.getElementsByClassName('new_own_subtitle').length>0) {
        watch_video.removeChild(document.getElementsByClassName('new_own_subtitle')[0]);
    }
}
function ruler(text, x_pos, y_pos){
    my_ruler.innerText = text;
    my_ruler.style.left = x_pos;
    my_ruler.style.top = y_pos;
    my_ruler.style.fontSize = font_size;
    my_ruler.style.zIndex = -1;

    let rect = my_ruler.getBoundingClientRect();
    return rect;
}
function create_span(text, x_pos, y_pos, c_name){
    let span_ = document.createElement('span');
    span_.className = c_name;
    span_.innerText = text;
    span_.style.left = x_pos;
    span_.style.zIndex = 5000;
    span_.style.top = y_pos;
    span_.style.position = 'absolute';
    span_.style.fontSize = font_size;
    document.getElementsByClassName('watch-video')[0].appendChild(span_);
}
function style_of_speech_buble(){
    speech_bubble.style.zIndex = -1;
    speech_bubble.className = 'bubble';
    speech_bubble.innerHTML = '<a aria-label="Netflix" id="speech_bubble" class="logo icon-logoUpdate" href="/browse"></a>';
    speech_bubble.innerHTML += '<div class="bloc"><select name="languages" id="target_language" onfocus="this.size=5;" onblur="this.size=1;" onchange="this.size=1; this.blur();"></select></div>';
    speech_bubble.innerHTML += '<hr id="speech_bubble_separator">';
    speech_bubble.innerHTML += '<div class="bubble-bottom-left translate"></div>';
    speech_bubble.innerHTML += '<div class="close_button" onclick="close_bubble()">X</div>';
    speech_bubble.innerHTML += '<div class="save_flashcard" onclick="save_flashcard()"><i class="bx bxs-bookmark-plus"></i></div>';
    
    var style = document.createElement('style');
    style.innerHTML = ".bubble {height:85px; position: relative;font-family: Netflix Sans,Helvetica Neue,Segoe UI,Roboto,Ubuntu,sans-serif;font-size: 18px;line-height: 24px;max-width: 250px;min-width: 250px;background: #141414c7;padding: 24px;text-align: center;color: #e5e5e5;border-left: solid  7px #b9090b;}";
    style.innerHTML += ".bubble-bottom-left {position: relative; top: -104px;}";
    style.innerHTML += ".close_button {font-weight: 600;color:#a60000;width: 25px;height: 17px;position: absolute;background: #141414c7;top: -17px;padding: 0px;left: 273px;}";
    style.innerHTML += ".save_flashcard {color:var(--save-color);width: 32px;height: 24px;position: absolute;background: transparent;top: 80px;padding: 0px;left: 2px;font-size:27px;}";
    style.innerHTML += ".save_flashcard:hover {color: #ff0101;}";
    style.innerHTML += ".close_button:hover {color: #5b0202;}";
    style.innerHTML += ".bloc { display:inline-block; vertical-align:top; overflow:hidden;width: 90px;height: 101px;background: transparent;left: 104px;position: relative;top: -24px;z-index: 5111; }";
    style.innerHTML += ".bloc select { padding:10px; margin:-5px -20px -5px -5px; }";
    style.innerHTML += "option:checked {background: red linear-gradient(0deg, red 0%, red 100%);}";
    style.innerHTML += "select#target_language option:hover {box-shadow: 0 0 10px 100px rgb(93, 0, 0) inset;}";
    style.innerHTML += "#target_language{top: 5px; right: 11px; font-weight: 700; width: 216px;z-index: 500;font-size: 14px;background: transparent;border: none;}";
    style.innerHTML += "#speech_bubble{position:absolute; left: 8px; top: 7px; color: #b9090b}";
    style.innerHTML += ".bubble:before { content: '';width: 0px;height: 0px;position: absolute;border-left: 16px solid #a50202b0;border-right: 8px solid transparent;border-top: 8px solid #a50202b0;border-bottom: 14px solid transparent;left: 100px;bottom: -21px;}";
    style.innerHTML += ".selectable_lang{background: #000000d4;border: none;}";
    style.innerHTML += "#speech_bubble_separator{position:relative; top: -104px; border-color: #ff0d0d}";
    //style.innerHTML += "#google_translate_element{width:300px;float:right;text-align:right;display:block}";
    style.innerHTML += "#:1.container{display: none;}";
    style.innerHTML += "iframe{display: none;position: absolute;top: -2000px;}";
    style.innerHTML += ".goog-te-banner-frame.skiptranslate { display: none !important;} ";
    style.innerHTML += "body { top: 0px !important; }";
    style.innerHTML += "#goog-gt-tt{display: none !important; top: 0px !important; } ";
    style.innerHTML += ".goog-tooltip skiptranslate{display: none !important; top: 0px !important; } ";
    style.innerHTML += ".activity-root { display: hide !important;} ";
    style.innerHTML += ".status-message { display: hide !important;}";
    style.innerHTML += ".started-activity-container { display: hide !important;}";

    style.innerHTML += ":root {--save-color: #b60101;}";
    document.head.appendChild(style);
    
    speech_bubble.style.top = '100px';
}
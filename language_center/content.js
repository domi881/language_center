let watch_video = null;
let target_language = 'hu';
let your_language = 'en';
let all_language = [];
let original_text_in_bubble = '';

//highlight
let temporary_highlighter = document.createElement('div');
temporary_highlighter.id = 'temporary_highlighter';
temporary_highlighter.style.background = 'brown';
temporary_highlighter.style.position = 'absolute';

//ruler
let my_ruler = document.createElement('span');
my_ruler.id = 'my_ruler';
my_ruler.style.position = 'absolute';
document.body.appendChild(my_ruler);

//speech bubble
let speech_bubble = document.createElement('div');

//translation tools' variables
let font_size = 10;
const spec_characters = '[]{}()./\\+#><?%!';
const spec_characters_obj = {'[':true, ']':true,'}':true,'{':true,'(':true,')':true,'-':true,'_':true,'!':true,'%':true,'#':true,'+':true,'>':true,'<':true };
let subtitle_first_row_length = 0;

//language center's variables
let language_center = document.createElement('li');
let all_flashcard_text = [];

//checking the state of the extension (on or off)
const is_cookie_on = getCookie('language_center_state');

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    if(request.type == 'deattach'){
        setCookie('language_center_state', 'off', 365);
    }
    if(request.type == 'attach'){
        setCookie('language_center_state', 'on', 365);
    }
    location.reload();
});

//if it is on then start
if(is_cookie_on == 'on' || is_cookie_on == ''){
    start_extension();
}

function start_extension(){
    //initialization functions  --> append the translater
    link_new_script('script.js');
    //get language option from google select tag
    get_options_from_google();

    //if we are on the browser side of Netflix then start the flashcard part otherwise the translation tool
    if(document.URL == 'https://www.netflix.com/browse'){
        when_netflix_navigation_on();
    }
    else if(document.URL.includes('https://www.netflix.com/watch/')){
        when_subtitles_on_start_translation();
    }

    //checking if url changes and trigger the proper part of the program
    let prevUrl = undefined;
    setInterval(() => {
        const currUrl = window.location.href;
        if (currUrl != prevUrl) {
            // URL changed
            prevUrl = currUrl;
            if(document.URL.includes('https://www.netflix.com/watch/')){
                if(!document.getElementById('speech_bubble')){
                    when_subtitles_on_start_translation();
                }
            }
            else if(document.URL == 'https://www.netflix.com/browse'){
                if(!document.getElementById('language_center')){
                    when_netflix_navigation_on();
                }
            }
        }
    }, 1000);
}


//after Netflix navigation bar has appeared append Language Center
function when_netflix_navigation_on(){
    setTimeout(function(){
        if(document.getElementsByClassName('tabbed-primary-navigation')[0]){
            if(language_center.id == ''){
                start_language_center();
            }
            else{
                document.getElementsByClassName('tabbed-primary-navigation')[0].appendChild(language_center);
                extract_data_from_cookie();
                add_text_to_flash_card();
            }
        }
        else{
            when_netflix_navigation_on();
        }
    },500)
}

//Only when subtitle parent element has appeared can the observer do its job
function when_subtitles_on_start_translation(){
    setTimeout(function(){
        if(document.getElementsByClassName("watch-video--player-view")[0]){
            start_translator();
        }
        else{
            when_subtitles_on_start_translation();
        }
    },500)
}
function start_translator(){
    //if it is the first time it starts then append style +  event listeners
    if(speech_bubble.className !== 'bubble'){
        style_of_speech_buble();
        document.getElementsByClassName('close_button')[0].addEventListener('click',function(){close_bubble();})
        document.getElementsByClassName('save_flashcard')[0].addEventListener('click',function(){save_flashcard();})
    }
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    //When we leave one page the site DOES NOT refresh so we do not have to create the elements again, just start the observer and get the 'watch_video'
    append_elements_and_start();

    function append_elements_and_start(){
        watch_video = document.getElementsByClassName('watch-video')[0];
        watch_video.appendChild(speech_bubble);
        watch_video.appendChild(temporary_highlighter);
        
        const targetNode2 = document.getElementsByClassName("watch-video--player-view")[0];
        observer.observe(targetNode2, config);
    }
    // Callback function to execute when mutations are observed
    let previous_english_subtitle = '';
    function callback(mutationList, observer){
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                if(document.getElementsByClassName('player-timedtext-text-container')[0] != null){
                    let save_inner_text = document.getElementsByClassName("player-timedtext-text-container")[0].children[0];

                    //their subtitle refresh ~8x/s so we are trying to optimize it by only changing our own subtitle when the text differs!!
                    if(previous_english_subtitle == save_inner_text.innerText){
                        const myNode = document.getElementsByClassName("player-timedtext")[0];
                        myNode.style.zIndex = -1;
                        return '';
                    }
                    
                    //create my own subtitle because their refresh constantly so I had decided it would be better :)
                    previous_english_subtitle = save_inner_text.innerText;
                    let video_width = document.getElementsByClassName('watch-video')[0].getBoundingClientRect().width;
                    const og_subtitle_top = save_inner_text.getBoundingClientRect().top;
    
                    initialize_new_subtitle(save_inner_text, video_width, og_subtitle_top);
    
                    let my_span = document.getElementsByClassName('new_own_subtitle');
                    for(let i = 0; i < my_span.length; i++){
                        my_span[i].style.lineHeight = '24px';
                        my_span[i].style.fontSize = document.getElementsByClassName('watch-video')[0].lastElementChild.style.fontSize;
                        let rect = my_span[i].getBoundingClientRect();
        
                        //create the word object --> we have to know every word how many pixel wide
                        let words_width_in_pixel = create_word_objects(my_span[i].innerText);
        
                        my_span[i].addEventListener('mousemove',  (event) => on_mouse_move(event, words_width_in_pixel, rect));
                        my_span[i].addEventListener('mousedown',  (event) => on_mouse_click(event, words_width_in_pixel, rect, i));
                        my_span[i].addEventListener('mouseout',  (event) => on_mouse_out());
                        my_span[i].addEventListener('mouseover',  (event) => on_mouse_over(event, words_width_in_pixel, rect, i));
        
                    }
                    
                    //hide the original subtitle
                    const myNode = document.getElementsByClassName("player-timedtext")[0];
                    myNode.style.zIndex = -1;
    
                    //if the site's size changes(full screen/developer mode/mouse move on the video) then it sticks so it must be relocated to the exact coordinate
                    relocate_highlighted_words(my_span);
                }
                else{
                    //if the original Netflix subtitle text differs from ours then delete our old one and create the new one
                    //observer is a loop in this case therefore it happens automaticly (because we did it once)
                    remove_everything_if_subtitle_changes();
    
                }
            }
        }
    }
    //When size of the site changes relocate our elements
    function relocate_highlighted_words(my_span){
        let words = document.getElementsByClassName('highlighted_word');
    
        if(words.length == 0){ 
            return;
        }
    
        for(let j = 0; j < my_span.length; j++){
            let start_translator_word_arr = create_word_objects(my_span[j].innerText);
            for(let i = 0; i < words.length; i++){
                if(parseInt(words[i].getAttribute('which_row')) == j){
                    const curr_word = start_translator_word_arr[parseInt(words[i].getAttribute('index'))];
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
    }
    //User can select words in bad order: rid get of
    //We have to rearrange it: get rid of
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
    //When mouse is over a word then bubble up
    let previous_word = '';
    function on_mouse_over(event, words_width_in_pixel, rect){
        if(document.getElementsByClassName('highlighted_word').length != 0){
            return;
        }
    
        previous_word = mouse_on_or_over_word(event, words_width_in_pixel, rect).word;
        position_bubble(temporary_highlighter, previous_word);
    }
    //Simply highlight the words
    function on_mouse_click(event, words_width_in_pixel, rect, index){
        let s = get_current_word(event, words_width_in_pixel, rect);
        
        const clone = temporary_highlighter.cloneNode(true);
        clone.id = '';
        clone.className = 'highlighted_word';
        clone.setAttribute('word',s.word);
        clone.setAttribute('which_row', index);
        clone.setAttribute('index', s.index);
        clone.style.zIndex = 5;
        clone.style.height = ruler("AA", '0px', '0px').height+"px";
        clone.style.width = s.width+ruler("I", '0px', '0px').width+'px';
        clone.style.top = rect.top-2+'px';
        clone.style.background = '#5d0000';
        clone.style.left = subtitle_first_row_length+s.start_x-2+'px';
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
    //remove the subtitles
    function remove_everything_if_subtitle_changes(){
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
    //checking if mouse is over text or not
    function on_mouse_move(event, words_width_in_pixel, rect){
        let s = mouse_on_or_over_word(event, words_width_in_pixel, rect).word;
        if(s!=previous_word){
            on_mouse_over(event, words_width_in_pixel, rect);
        }
    }
    function mouse_on_or_over_word(event, words_width_in_pixel, rect){
        let s = get_current_word(event, words_width_in_pixel, rect);
    
        temporary_highlighter.style.height = ruler("AA", '0px', '0px').height+"px";
        temporary_highlighter.style.zIndex = 2000;
        temporary_highlighter.style.width = s.width+ruler("I", '0px', '0px').width+'px';
        temporary_highlighter.style.top = rect.top-2+'px';
        temporary_highlighter.style.left = subtitle_first_row_length+s.start_x-2+'px';
    
        return s;
    }
    //Collect the highlighted words
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
    //Positioning the bubble
    function position_bubble(clone, text){
        if(text == ''){
            speech_bubble.style.zIndex = -1;
            return null;
        }
        const bubble_text = document.getElementsByClassName('bubble-bottom-left')[0];
        original_text_in_bubble = text;
        bubble_text.innerText = text;
        bubble_text.style.fontSize = 'medium';
        
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
    //Determine which word the cursor is on
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
    //Returns an array with objects with all of the words separeted: exact width, which pixel it starts from...
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
    //creating our own subtitle: 1 or 2 rows 
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
    //Saving the flashcards if it hasn't been saved yet
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
    //Simply animation for the save: makes a green effect
    function save_animation(){
        let r = document.querySelector(':root');

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
    function remove_my_subtitles(){
        while (document.getElementsByClassName('new_own_subtitle').length>0) {
            watch_video.removeChild(document.getElementsByClassName('new_own_subtitle')[0]);
        }
    }
    //this is the function that returns the exact width of a word/element
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
}


function style_of_speech_buble(){
    watch_video = document.getElementsByClassName('watch-video')[0];
    watch_video.appendChild(speech_bubble);

    speech_bubble.style.zIndex = -1;
    speech_bubble.className = 'bubble';
    speech_bubble.innerHTML = '<a aria-label="Netflix" id="speech_bubble" class="logo icon-logoUpdate" href="/browse"></a>';
    speech_bubble.innerHTML += '<div class="bloc_bubble"><select name="languages" id="target_language_bubble" onfocus="this.size=5;" onblur="this.size=1;" onchange="this.size=1; this.blur();"></select></div>';
    speech_bubble.innerHTML += '<hr id="speech_bubble_separator">';
    speech_bubble.innerHTML += '<div class="bubble-bottom-left translate"></div>';
    speech_bubble.innerHTML += '<div class="close_button">X</div>';
    speech_bubble.innerHTML += '<div class="save_flashcard"><i class="bx bxs-bookmark-plus"></i></div>';
    speech_bubble.style.top = '100px';

    give_option('target_language_bubble');
}











function start_language_center(){
    create_language_center();
    function create_language_center(){
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
        modal_div.innerHTML = '<div class="modal-content"><div class="modal-header"><div class="bloc_center"><select name="languages" id="target_language_center" onfocus="this.size=5;" onblur="this.size=1;" onchange="this.size=1; this.blur();"></select></div><span class="close">&times;</span><h2 class="modal_header_title">Language Center</h2></div><div class="modal-body"></div><div class="modal-footer"><table class="footer_table"><tr class="footer_tr"><td class="footer_td"><i class="bx bx-left-arrow-alt left_next_arrow"></i></td><td class="footer_td"><h3><a aria-label="Netflix" id="language_center_netflix_logo" class="logo icon-logoUpdate" href="/browse"></a></h3</td><td class="footer_td"><i class="bx bx-right-arrow-alt right_next_arrow"></i></td></tr></table></div></div>';
        document.body.appendChild(modal_div);
    
        language_center_button_functions();
        extract_data_from_cookie();
        create_flashcards();
        give_option('target_language_center');
    }
    function language_center_button_functions(){
        let r = document.querySelector(':root');
        var modal = document.getElementById("language_center_modal");
        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];
    
        language_center.addEventListener('click', function(){
            modal.style.display = "block";
            
            const bx_front = document.getElementsByClassName('bx_front')[0];
            const flashcard_td = document.getElementsByClassName('flashcard_td')[1].getBoundingClientRect().height;
            r.style.setProperty('--top-for-dice', flashcard_td-(bx_front.getBoundingClientRect().height*1.5)+'px');
            r.style.setProperty('--padd', document.getElementsByClassName('front_word')[1].getBoundingClientRect().height/2+'px');
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
    }
    function create_flashcards(){
        var table = document.createElement('table');
        var tr = document.createElement('tr');
        table.className = 'flashcard_table';
        tr.className = 'flashcard_tr';
        table.appendChild(tr);
    
        const td = '<td class="flashcard_td"><span class="delete_flip">x</span><div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h1 class="front_word"></h1></div><div class="flip-card-back"><h1 class="back_word"></h1><hr><h1 class="back_word_translation translate"></h1> </div></div></div></td>';
        tr.innerHTML = td+td;
        table.appendChild(tr.cloneNode(true));
        document.getElementsByClassName('modal-body')[0].appendChild(table);
    
        //put in the dices
        const flashcards_front = document.getElementsByClassName('flip-card-front');
        const flashcards_back = document.getElementsByClassName('flip-card-back');
        const front_word = document.getElementsByClassName('front_word');
        const back_word = document.getElementsByClassName('back_word');
        const back_word_translation = document.getElementsByClassName('back_word_translation');
        const delete_fcards = document.getElementsByClassName('delete_flip');

        for(let i = 0; i < flashcards_front.length; i++){
            flashcards_front[i].innerHTML += '<i class="bx bx-dice-'+(i+1)+' bx_front"></i>';
            flashcards_back[i].innerHTML += '<i class="bx bx-dice-'+(i+1)+' bx_back"></i>';

            delete_fcards[i].addEventListener('click', function(){delete_flashcard(delete_fcards[i]);})
        }
        for(let i = 0; i < front_word.length; i++){
            front_word[i].className += ' _'+(i+1)+'_card';
            back_word[i].className += ' _'+(i+1)+'_card';
            back_word_translation[i].className += ' _'+(i+1)+'_card';
        }
        document.getElementsByClassName('left_next_arrow')[0].addEventListener('click', function(){turn_the_page_left();});
        document.getElementsByClassName('right_next_arrow')[0].addEventListener('click', function(){turn_the_page_right();});
    
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
}


function extract_data_from_cookie(){
    let cookie = getCookie('flashcards').split('#');
    cookie.pop();
    all_flashcard_text = cookie;
    
}
function get_options_from_google(){
    setTimeout(function(){
        if(document.getElementsByClassName('goog-te-combo')[0]){
            if(document.getElementsByClassName('goog-te-combo')[0].children.length > 0){
                all_language = get_all_language_option();
                console.log('done')
                console.log(all_language)
            }
            else{
                console.log(':)')
                get_options_from_google();
            }
        }
        else{
            console.log('hereee')
            get_options_from_google();
        }
    }, 100);
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
function link_new_script(s_name){
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(s_name);
    s.onload = function() { this.remove(); };
    // see also "Dynamic values in the injected code" section in this answer
    (document.head || document.documentElement).appendChild(s);
}
function translate_text(){
    document.getElementsByClassName('goog-te-combo')[0].value = target_language;

    const e = new Event("change");
    const element = document.getElementsByClassName('goog-te-combo')[0];
    element.dispatchEvent(e);
}
function give_option(id_name){
    setTimeout(function(){
        if(all_language.length > 0){
            const sel = document.getElementById(id_name);
            for(let i = 0; i < all_language.length; i++){
                let opt = document.createElement('option');
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
        else{
            give_option(id_name);
        }
    }, 100);
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
function add_text_to_flash_card(){
    let r = document.querySelector(':root');
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

jsPsych.plugins.instructions = (function() {

  var plugin = {};

  plugin.info = {
    name: 'instructions',
    description: '',
    parameters: {
      pages: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Pages',
        default: undefined,
        array: true,
        description: 'Each element of the array is the content for a single page.'
      },
      key_forward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key forward',
        default: 'rightarrow',
        description: 'The key the subject can press in order to advance to the next page.'
      },
      key_backward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key backward',
        default: 'leftarrow',
        description: 'The key that the subject can press to return to the previous page.'
      },
      allow_backward: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow backward',
        default: true,
        description: 'If true, the subject can return to the previous page of the instructions.'
      },
      allow_keys: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow keys',
        default: true,
        description: 'If true, the subject can use keyboard keys to navigate the pages.'
      },
      show_clickable_nav: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show clickable nav',
        default: false,
        description: 'If true, then a "Previous" and "Next" button will be displayed beneath the instructions.'
      },
      show_page_number: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show page number',
        default: false,
        description: 'If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons.'
      },
      page_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Page label',
        default: 'Page',
        description: 'The text that appears before x/y (current/total) pages displayed with show_page_number'
      },      
      button_label_previous: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label previous',
        default: 'Previous',
        description: 'The text that appears on the button to go backwards.'
      },
      button_label_next: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label next',
        default: 'Next',
        description: 'The text that appears on the button to go forwards.'
      },
      animate_lines: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Animate lines',
        default: false,
        description: 'If true, the text will be animated as if it is being typed on the screen.'
      },
      animation_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Animation delay',
        default: 60,
        description: 'The delay between each character being typed on the screen.'
      },
      // typing_direction: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   pretty_name: 'Typing direction',
      //   default: 'forward',
      //   description: "Choose between 'forward' and 'backward' directions for animated text."
      // },
    }
  }

  plugin.trial = function(display_element, trial) {

    var current_page = 0;

    var view_history = [];

    var start_time = performance.now();

    var last_page_update_time = start_time;

    function btnListener(evt){
      evt.target.removeEventListener('click', btnListener);
      if(this.id === "jspsych-instructions-back"){
        back();
      }
      else if(this.id === 'jspsych-instructions-next'){
        next();
      }
    }

    function add_navigation() {

      var pagenum_display = "";

      if(trial.show_page_number) {
        pagenum_display = "<span style='margin: 0 1em;' class='"+
        "jspsych-instructions-pagenum'>"+ trial.page_label + ' ' +(current_page+1)+"/"+trial.pages.length+"</span>";
      }

      if (trial.show_clickable_nav) {
        var nav_html = "<div class='jspsych-instructions-nav' style='padding: 10px 0px;'>";
        if (trial.allow_backward) {
          var allowed = (current_page > 0 )? '' : "disabled='disabled'";
          nav_html += "<button id='jspsych-instructions-back' class='jspsych-btn' style='margin-right: 5px;' "+allowed+">&lt; "+trial.button_label_previous+"</button>";
        }
        if (trial.pages.length > 1 && trial.show_page_number) {
          nav_html += pagenum_display;
        }
        nav_html += "<button id='jspsych-instructions-next' class='jspsych-btn'"+
        "style='margin-left: 5px;'>"+trial.button_label_next+
        " &gt;</button></div>";

        display_element.innerHTML += nav_html;
        if (current_page != 0 && trial.allow_backward) {
          display_element.querySelector('#jspsych-instructions-back').addEventListener('click', btnListener);
        }

        display_element.querySelector('#jspsych-instructions-next').addEventListener('click', btnListener);
      } else {
        if (trial.show_page_number && trial.pages.length > 1) {
          display_element.innerHTML += "<div class='jspsych-instructions-pagenum'>"+pagenum_display+"</div>"
        } 
      }
    }

    function typeWriter(text, delay, callback) {
      let i = 0;
      let isTag = false;
      let currentTag = '';
      const containerDiv = document.createElement('div');
      containerDiv.className = 'instruction-box';
      display_element.appendChild(containerDiv);
      let currentElement = containerDiv;
      
      function typing() {
        if (i < text.length) {
          const currentChar = text.charAt(i);

          if (currentChar === '<') {
            isTag = true;
            currentTag += currentChar;
          } else if (currentChar === '>') {
            isTag = false;
            currentTag += currentChar;

            const tempElement = document.createElement('div');
            tempElement.innerHTML = currentTag;

            if (tempElement.firstElementChild) {
              const tagElement = tempElement.firstElementChild;

              if (tagElement.tagName !== '/'+currentElement.tagName) {
                currentElement.appendChild(tagElement);
                currentElement = tagElement;
              } else {
                currentElement = currentElement.parentElement;
              }
            } else {
              if (currentTag.startsWith('</')) {
                currentElement = currentElement.parentElement;
              } else {
                currentElement.insertAdjacentHTML('beforeend', currentTag);
              }
            }

            currentTag = '';
          } else if (isTag) {
            currentTag += currentChar;
          } else {
            currentElement.insertAdjacentHTML('beforeend', currentChar);
          }

          i++;
          setTimeout(typing, delay);
        } else {
          callback();
        }
      }
      typing();
    }

    function show_current_page() {
      if (trial.animate_lines) {
        display_element.innerHTML = '';
        typeWriter(trial.pages[current_page], trial.animation_delay, function() {
          // Add navigation after the animation is complete
          add_navigation();

          // Re-enable keyboard listener after animation is complete
          if (trial.allow_keys) {
            keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: [trial.key_forward, trial.key_backward],
              rt_method: 'performance',
              persist: false,
              allow_held_key: false
            });
          }
        });

        // Disable keyboard listener during animation
        if (trial.allow_keys) {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
        }
      } else {
        display_element.innerHTML = trial.pages[current_page];
        add_navigation();
      }
    }

    function next() {
      add_current_page_to_view_history()

      current_page++;

      if (current_page >= trial.pages.length) {
        endTrial();
      } else {
        show_current_page();
      }
    }

    function back() {
      add_current_page_to_view_history()

      current_page--;

      show_current_page();
    }

    function add_current_page_to_view_history() {
      var current_time = performance.now();

      var page_view_time = current_time - last_page_update_time;

      view_history.push({
        page_index: current_page,
        viewing_time: page_view_time
      });

      last_page_update_time = current_time;
    }

    function endTrial() {
      if (trial.allow_keys) {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
      }

      display_element.innerHTML = '';

      var trial_data = {
        "view_history": JSON.stringify(view_history),
        "rt": performance.now() - start_time
      };

      jsPsych.finishTrial(trial_data);
    }

    var after_response = function(info) {

      keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
      if (info.key === trial.key_backward || info.key === trial.key_forward) {
        add_current_page_to_view_history();
      }

      if (info.key === trial.key_backward) {
        if (current_page !== 0 && trial.allow_backward) {
          current_page--;
          show_current_page();
        }
      }

      if (info.key === trial.key_forward) {
        current_page++;
        if (current_page === trial.pages.length) {
          endTrial();
        } else {
          show_current_page();
        }
      }
    };

    var keyboard_listener;

    if (trial.allow_keys) {
      keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: 'performance',
        persist: false,
        allow_held_key: false
      });
    }

    show_current_page();

  };

  return plugin;
})();
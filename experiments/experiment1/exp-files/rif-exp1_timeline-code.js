// ** Initialize globals **
var timeline = [];
var condition = null;
var familiarity = null;
var modality = null;
var all_trials = null;
var retrieval_list = null;
var retrieval_trials = null;
var distractor_start_time = null;

// ** Task and trial parameters **
var learning_item_duration = 6000;
var inter_trial_interval = 2000;
var delay_after_instructions = 2000;
var retrieval_response_timeout = 32000;
var retrieval_delay_after_submit = 2000;
var distractor_timeout_duration = 2000;
var distractor_ITIs = [400, 800, 1200, 1600, 2000, 2400, 2800];
var filler_categories = ['gems', 'trees'];

// ** Manual setting for testing mode **
const testing = false;

if (testing) {
  var distractor_task_duration = 5000;
  var wait_time = 2 * 10 * 1000; // in milliseconds (needed for trial timer)
  var animation_time = 5;
} else {
  var distractor_task_duration = 120000;
  var wait_time = 2 * 60 * 1000;
  var animation_time = 40;
}

// ** Set up stimuli lists **
condition = CONDITION;

if (condition % 2 == 0) {
  familiarity = "familiar";
  all_trials = items_familiar;
  if (condition == 2 || condition == 10) {
    retrieval_trials = retrieval_FA1;
    retrieval_list = "A1";
  } else if (condition == 4 || condition == 12) {
    retrieval_trials = retrieval_FA2;
    retrieval_list = "A2";
  } else if (condition == 6 || condition == 14) {
    retrieval_trials = retrieval_FB1;
    retrieval_list = "B1";
  } else {
    retrieval_trials = retrieval_FB2;
    retrieval_list = "B2";
  }
} else {
  familiarity = "unfamiliar";
  all_trials = items_unfamiliar;
  if (condition == 1 || condition == 9) {
    retrieval_trials = retrieval_UA2;
    retrieval_list = "A2";
  } else
    if (condition == 3 || condition == 11) {
    retrieval_trials = retrieval_UA2;
    retrieval_list = "A2";
  } else if (condition == 5 || condition == 13) {
    retrieval_trials = retrieval_UB1;
    retrieval_list = "B1";
  } else {
    retrieval_trials = retrieval_UB2;
    retrieval_list = "B2";
  }
}

console.log('condition: ', condition);
console.log('familiarity: ', familiarity);
console.log('retrieval list: ', retrieval_list);
console.log('all trials: ', all_trials);

// enter fullscreen
if (!testing) {
  var fullscreen_enter = {
    type: 'fullscreen',
    fullscreen_mode: true
  };
  timeline.push(fullscreen_enter);
}

// https://github.com/jspsych/jsPsych/discussions/1407
var cursor_on = {
    type: 'call-function',
    func: function() {
        document.body.style.cursor= "auto";
    }
}

var cursor_off = {
    type: 'call-function',
    func: function() {
        document.body.style.cursor= "none";
    }
}
timeline.push(cursor_off);

// ** Set up learning phase **
var instructionsTextArray = [
      [
        'Thank you for agreeing to participate in this experiment!',
        'This experiment is an online task which means you need to participate in an appropriate testing environment to ensure we can use your data.',
        'The task you are about to do requires focus and memory skills so if you get distracted, it will negatively impact your performance.',
        '<br>',
        '<em>Press the <strong>spacebar</strong> to continue to the next page...</em>'
        ],
      [
        'Please make sure you are seated comfortably, alone, and in a <strong>quiet distraction-free</strong> environment.',
        'Please do <strong>not</strong> listen to music while you complete the task (though noise-cancelling headphones are encouraged).',
        "If you have a smart device (for e.g., mobile phone; Apple watch), please set these to <strong>'Do Not Disturb'</strong> or switch them off now.",
        "The duration of this experiment varies but will take a maximum of 60 minutes. As such, please make sure you have sufficient time to complete the experiment before you begin as your data can't be used if you stop participating part-way through.",
        '<br>',
        '<em>Press the <strong>spacebar</strong> to continue to the next page...</em>'
        ]
      ];

var modifiedTextArray = function(textArray) {
  return textArray.map(function(page) {
    return page.map(function(line) {
      return '<div style="display: block; font-size: 20px;">' + line + '</div>';
    }).join('');
  });
};

// Create the instructions plugin trial
var initial_instructions = {
      type: 'instructions',
      pages: modifiedTextArray(instructionsTextArray),
      key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
      allow_backward: false,
      post_trial_gap: delay_after_instructions,
      data: {task_part: 'initial_instructions'},
      animate_lines: true,
      animation_delay: animation_time,
      on_finish: function () {
        const instructionsContainer = document.querySelector('.instruction-box');
        if (instructionsContainer) {
            instructionsContainer.remove();
        }
      }
};
timeline.push(initial_instructions);
timeline.push(cursor_on);

var preconditions = [
      'I believe I will be able to attend to the experiment without distraction for, at most, the next hour',
      "I am setup to participate on a laptop or desktop computer and not a mobile device (for e.g., phone, tablet)",
      'My smart devices have been muted/switched-off and cannot disturb me for the duration of the experiment',
      'No media are playing in my immediate environment (for e.g., music, television, radio programs)'
    ];
var preconditions_random = jsPsych.randomization.shuffle(preconditions)

var online_checklist = {
    type: 'survey-multi-select',
    questions: [
      {
        prompt: "<p style='text-align:center; font-size: 22px;'>Please review the setup instructions and indicate which are true:</p>",
        options: preconditions_random,
      }
    ],
    required: true,
    post_trial_gap: delay_after_instructions,
    data: {trial: "checklist"}
};
timeline.push(online_checklist);

var rejection_message = {
      type: 'html-keyboard-response',
      stimulus: 'Please re-attempt the experiment when you can meet all the preconditions.',
      choices: jsPsych.NO_KEYS,
      data: {task_part: 'rejection_msg'}
}

var online_checklist_loop = {
    timeline: [rejection_message],
    conditional_function: function() {
        var online_checklist_data = jsPsych.data.getLastTrialData().values()[0];
        var online_checklist_answers = JSON.parse(online_checklist_data.responses).Q0;
            if (preconditions.every(i => online_checklist_answers.includes(i)) == false) { //add prior check in the conditional for `previous_participation`
                return true;
            } else {
                return false;
            }
        }
};
timeline.push(online_checklist_loop);
timeline.push(cursor_off);

var learningTextArray = [
      [
        'In the first phase of the experiment you will be shown a series of statements on screen.',
        'Each statement will only appear for a short time so it is important that you pay close attention.',
        'You need to <strong>remember each statement</strong> as it is presented to you for later in the experiment.',
        '<br>',
        '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
        ]
      ];

var learning_instructions = {
      type: 'instructions',
      pages: modifiedTextArray(learningTextArray),
      key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
      allow_backward: false,
      post_trial_gap: delay_after_instructions,
      data: {task_part: 'learning_instructions'},
      animate_lines: true,
      animation_delay: animation_time,
      on_start: function() {
        document.body.style.cursor = "none"
      },
      on_finish: function () {
        const instructionsContainer = document.querySelector('.instruction-box');
        if (instructionsContainer) {
            instructionsContainer.remove();
        }
      }
};
timeline.push(learning_instructions);

var learning_trial = {
    type: 'html-keyboard-response',
    stimulus: function() {
        return '<span class="learning-stim">'+jsPsych.timelineVariable('sentence',true)+'</span>';
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: learning_item_duration,
    post_trial_gap: inter_trial_interval,
    data: {
        task_part: 'learning',
        condition: condition,
        familiarity: familiarity,
        retrieval_list: retrieval_list,
        exemplar: jsPsych.timelineVariable('exemplar'),
        category: jsPsych.timelineVariable('category'),
        sentence: jsPsych.timelineVariable('sentence')
    }
};

// loop over all items (all_trials, which is either items_familiar or items_unfamiliar), present in random order
if (testing) {
  var learning_procedure = {
    timeline: [learning_trial],
    timeline_variables: all_trials,
    randomize_order: true,
    sample: {
      type: 'without-replacement',
      size: 3,
    }
  };
} else {
  var learning_procedure = {
    timeline: [learning_trial],
    timeline_variables: all_trials,
    randomize_order: false
  };
}
timeline.push(learning_procedure);

// ** Set up retrieval phase **
var retrievalTextArray = [
  [
    'In the next phase of the experiment, you will be shown some of the belief statements you have just seen but with parts blanked-out.',
    'Your task is to remember each belief <em>in full</em> and type it into the response box.',
    'For instance, if you were previously shown the belief <strong>"all crocodiles are reptiles"</strong>, you would now see it as <strong>"all cr____ are reptiles"</strong>.',
    'You would then have to remember that the missing word is <strong>"crocodiles"</strong> and type the full sentence to submit your response i.e. <strong>"all crocodiles are reptiles"</strong>',
    '<br>',
    '<em>Press the <strong>spacebar</strong> to continue to the next page...</em>'
  ],
  [
    "If you make a spelling mistake or cannot remember properly, you will get a small hint to help you remember after you've submitted your response. However, please do not rely on these hints to proceed through the task and instead try hard to remember each belief on your own.",
    "Remember, you must type the <strong>whole sentence</strong> into the response box, not just the part that's been blanked-out.",
    'When you are ready to submit your recollection, press the <strong>Enter</strong> key on the keyboard and you will automatically proceed to the next trial.',
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
  ]
];

var retrieval_instructions = {
  type: 'instructions',
  pages: modifiedTextArray(retrievalTextArray),
  key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
  allow_backward: false,
  post_trial_gap: delay_after_instructions,
  data: {
    task_part: 'retrieval_instructions'
  },
  animate_lines: true,
  animation_delay: animation_time,
  on_start: function() {
    document.body.style.cursor = "none"
  },
  on_finish: function () {
    document.body.style.cursor = "auto"
    const instructionsContainer = document.querySelector('.instruction-box');
    if (instructionsContainer) {
      instructionsContainer.remove();
    }
  }
};
timeline.push(retrieval_instructions);

var retrieval_trial = {
  type: 'cued-recall',
  text_box_location: 'below',
  stimulus: function() {
    // Initialise num_underscores and stem_length if not already set
    if (typeof this.num_underscores === 'undefined') {
      this.num_underscores = 5;
    }
    if (typeof this.stem_length === 'undefined') {
      this.stem_length = 2;
    }

    var num_underscores = this.num_underscores;
    var stem_length = this.stem_length;
    var exemplar = jsPsych.timelineVariable('exemplar', true);
    var exemplar_length = exemplar.length;
    var masked_exemplar;

    // Ensure stem_length doesn't exceed the exemplar length
    stem_length = Math.min(stem_length, exemplar_length);

    if (stem_length === exemplar_length) {
      // If the full exemplar is revealed, no underscores should remain
      num_underscores = 0;
    }

    if (num_underscores > 0) {
      // Generate the masked exemplar with the independent stem length
      var exemplar_cue = exemplar.substring(0, stem_length);
      masked_exemplar = exemplar_cue + '_'.repeat(num_underscores);
    } else {
      masked_exemplar = exemplar; // Full exemplar when num_underscores is 0
    }

    var category = jsPsych.timelineVariable('category', true);
    var modality = jsPsych.timelineVariable('modality', true);
    var answer = jsPsych.timelineVariable('sentence', true);

    // Construct the sentence with the masked exemplar
    var sentence = modality.replace("x's", masked_exemplar).replace("y's", category);

    // Build the stimulus HTML with the retrieval-stim class
    var stimulus_html = '<span class="retrieval-stim">' + sentence + '</span>';

    // Include the correct answer in a hidden div
    stimulus_html += '<div id="hidden-answer" style="color: transparent; height: 0; overflow: hidden;">%' + answer + '%</div>';

    return stimulus_html;
  },
  text_box_font_size: 25,
  text_box_disabled_color: 'DimGrey',
  show_submit_button: false,
  allow_submit_key: true,
  prompt: '<p style="color: grey;">Press Enter to submit your response.</p>',
  prompt_location: 'above',
  check_answers: true,
  response_required_for_check: true,
  response_required_message: 'Please enter a response.',
  mistake_fn: function(resp, corr) {
    var exemplar = jsPsych.timelineVariable('exemplar', true);
    var category = jsPsych.timelineVariable('category', true);
    var modality = jsPsych.timelineVariable('modality', true);
    var answer = jsPsych.timelineVariable('sentence', true);
    var exemplar_length = exemplar.length;

    if (typeof this.num_underscores === 'undefined') {
      this.num_underscores = 4;
    }
    if (typeof this.stem_length === 'undefined') {
      this.stem_length = 2;
    }

    if (this.num_underscores > 0) {
      this.stem_length += 1; // Increment stem length by 1
      this.num_underscores -= 1; // Decrement num_underscores by 1
    }

    var num_underscores = this.num_underscores;
    var stem_length = this.stem_length;
    var masked_exemplar;

    stem_length = Math.min(stem_length, exemplar_length);

    if (stem_length === exemplar_length) {
      // If the full exemplar is revealed, no underscores should remain
      num_underscores = 0;
    }

    if (num_underscores > 0) {
      var exemplar_cue = exemplar.substring(0, stem_length);
      masked_exemplar = exemplar_cue + '_'.repeat(num_underscores);
    } else {
      masked_exemplar = exemplar; // Full exemplar when num_underscores is 0
    }

    // Reconstruct the sentence with the updated masked exemplar
    var sentence = modality.replace("x's", masked_exemplar).replace("y's", category);

    // Update the stimulus text only
    var retrievalStimElem = document.querySelector('.retrieval-stim');
    if (retrievalStimElem) {
      retrievalStimElem.innerHTML = sentence;
    }

    // Ensure the hidden correct answer is present
    var hiddenAnswerElem = document.getElementById('hidden-answer');
    if (hiddenAnswerElem) {
      hiddenAnswerElem.innerHTML = '%' + answer + '%';
    } else {
      hiddenAnswerElem = document.createElement('div');
      hiddenAnswerElem.id = 'hidden-answer';
      hiddenAnswerElem.style.color = 'transparent';
      hiddenAnswerElem.style.height = '0';
      hiddenAnswerElem.style.overflow = 'hidden';
      hiddenAnswerElem.innerHTML = '%' + answer + '%';
      retrievalStimElem.parentNode.appendChild(hiddenAnswerElem);
    }

    // Reset the input box and focus
    var input_box = document.querySelector('.jspsych-cued-recall-response');
    if (input_box) {
      input_box.value = '';
      input_box.focus();
      input_box.style.color = 'black'; // Reset text color to black
    }

    // Display the mistake message
    var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
    mistakeElem.innerHTML = 'That response is not correct.<br>Please try again.';
    mistakeElem.style.opacity = 1;

    // Start fading out after 4 seconds
    setTimeout(function() {
      var fadeEffect = setInterval(function () {
        if (!mistakeElem.style.opacity) {
          mistakeElem.style.opacity = 1;
        }
        if (mistakeElem.style.opacity > 0) {
          mistakeElem.style.opacity -= 0.05;
        } else {
          clearInterval(fadeEffect);
          mistakeElem.innerHTML = '';
          mistakeElem.style.opacity = 1; // Reset opacity for future messages
        }
      },
        50);
    }, 4000);
  },
  post_trial_gap: inter_trial_interval,
  delay_after_submit: retrieval_delay_after_submit,
  trial_duration: retrieval_response_timeout,
  data: {
      task_part: 'retrieval',
      condition: condition,
      familiarity: familiarity,
      retrieval_list: retrieval_list,
      exemplar: jsPsych.timelineVariable('exemplar'),
      category: jsPsych.timelineVariable('category'),
      sentence: jsPsych.timelineVariable('sentence')
    },
  on_finish: function(data) {
    // Parse the JSON-formatted response and save to data
    var responses = JSON.parse(data.responses);
    for (var i = 0; i < responses.length; i++) {
      data["response_" + i.toString()] = responses[i].response;
      data["response_rt_" + i.toString()] = responses[i].rt;
    }
  }
};

// present the item list stored in retrieval_trials (one of the subsets: A1, A2, B1, B2) in a fixed order
if (testing) {
  var retrieval_procedure = {
    timeline: [retrieval_trial],
    timeline_variables: retrieval_trials,
    sample: {
      type: 'without-replacement',
      size: 3,
    }
  };
} else {
  var retrieval_procedure = {
    timeline: [retrieval_trial],
    timeline_variables: retrieval_trials
  };
}
timeline.push(retrieval_procedure);

// ** Set up distractor task **
var distractorTextArray = [
  [
    'Well done! In the next phase of the experiment, you will be asked to make speeded judgments.',
    'In each trial, you will see two numbers on the screen.',
    "Press the '<strong>f</strong>' key if the numbers are the same. Press the '<strong>j</strong>' key if the numbers are different.",
    'You will need to respond as quickly and as accurately as you can.',
    '<br>',
    '<em>Press the <strong>spacebar</strong> to continue to the next page...</em>'
  ],
  [
    'Remember...',
    "Press the '<strong>f</strong>' key if the numbers are the <em>same</em>.",
    "Press the '<strong>j</strong>' key if the numbers are <em>different</em>.",
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
  ]
];

var distractor_instructions = {
  type: 'instructions',
  pages: modifiedTextArray(distractorTextArray),
  key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
  allow_backward: false,
  post_trial_gap: delay_after_instructions,
  data: {
    task_part: 'distractor_instructions'
  },
  animate_lines: true,
  animation_delay: animation_time,
  on_start: function() {
    document.body.style.cursor = "none"
  },
  on_finish: function () {
    document.body.style.cursor = "auto"
    const instructionsContainer = document.querySelector('.instruction-box');
    if (instructionsContainer) {
      instructionsContainer.remove();
    }
  }
};
timeline.push(distractor_instructions);

var distractor_trial = {
  type: 'html-keyboard-response',
  stimulus: function() {
    var digits = jsPsych.randomization.sampleWithReplacement([1, 2, 3, 4, 5, 6], 2);
    return '<span class="distractor-stim left">'+digits[0]+'</span><span class="distractor-stim right">'+digits[1]+'</span>'
  },
  prompt: '<span class="left top" style="color: grey;">f = same</span><span class="right top"style=" color: grey;">j = different</span>',
  choices: ['f',
    'j'],
  trial_duration: distractor_timeout_duration,
  data: {
    task_part: 'distractor_task'
  },
  on_start: function() {
    if (distractor_start_time == null) {
      distractor_start_time = performance.now();
    }
  }
};

var response_timeout_message = {
  type: 'html-keyboard-response',
  stimulus: '<span class="distractor-timeout-msg">Please respond faster.</span>',
  trial_duration: 3000,
  choices: jsPsych.NO_KEYS,
  data: {
    task_part: 'distractor_timeout_msg'
  }
};

var response_timeout_conditional = {
  timeline: [response_timeout_message],
  conditional_function: function() {
    var last_trial = jsPsych.data.getLastTrialData().values()[0];
    if (last_trial.key_press == null) {
      return true;
    } else {
      return false;
    }
  }
};

var distractor_iti = {
  type: 'html-keyboard-response',
  stimulus: '<span class="distractor-stim left" style="visibility:hidden;">X</span><span class="distractor-stim right" style="visibility:hidden;">X</span>',
  prompt: '<span class="left top"> </span><span class="right top"> </span>',
  choices: ['f',
    'j'],
  data: {
    task_part: 'distractor_ITI'
  },
  response_ends_trial: true,
  trial_duration: function() {
    return jsPsych.randomization.sampleWithoutReplacement(distractor_ITIs, 1)[0];
  }
};

var multiple_response_message = {
  type: 'html-keyboard-response',
  stimulus: '<span class="distractor-timeout-msg">Please submit only one response per stimulus.</span>',
  trial_duration: 3000,
  choices: jsPsych.NO_KEYS,
  data: {
    task_part: 'distractor_mult_resp_msg'
  }
};

var distractor_multiple_response_conditional = {
  timeline: [multiple_response_message,
    distractor_iti],
  conditional_function: function() {
    var last_trial = jsPsych.data.getLastTrialData().values()[0];
    if (last_trial.task_part == "distractor_ITI" && last_trial.key_press !== null) {
      return true;
    } else {
      return false;
    }
  }
};

var distractor_procedure = {
  timeline: [distractor_trial,
    response_timeout_conditional,
    distractor_iti,
    distractor_multiple_response_conditional],
  loop_function: function() {
    var curr_time = performance.now();
    if (curr_time - distractor_start_time >= distractor_task_duration) {
      return false;
    } else {
      return true;
    }
  }
};
timeline.push(distractor_procedure);

// filler categories (gems and trees) are always randomly selected as first and last categories
var rand_filler_category_order = jsPsych.randomization.shuffle(filler_categories);
var unique_categories = all_trials.map(function(obj) {
  return obj.category;
}).filter(function(itm, ind, arr) {
  return ind == arr.indexOf(itm);
});
var target_categories = unique_categories.filter(function(itm, ind, arr) {
  return !(filler_categories.includes(itm));
});
var category_lists = {};
for (var i = 0; i < unique_categories.length; i++) {
  category_lists[unique_categories[i]] = jsPsych.randomization.shuffle(all_trials.filter(function(obj) {
    return obj.category == unique_categories[i];
  }));
}

var category_trials = unique_categories.map(function(x) {
  return {
    category: x
  };
});
console.log('category trials: ', category_trials);

var recallTextArray = [
  [
    'Well done! In the second last part of the task, you will be asked to recall information from all of the previous phases.',
    'To help you remember, you will be presented with prompts that include category information.',
    'For example, if you learned the statement <strong>"all crocodiles are reptiles"</strong>, then you will be presented with <strong>"all ______ are reptiles"</strong>.',
    '<br>',
    'For each cue, you need to remember as many of the relevant statements that you learned from all of the previous phases.',
    "When you recall an answer, use the <strong>'Enter'</strong> or <strong>'Return'</strong> key to submit each statement separately. Make sure you type out the <strong>full sentence</strong> each time and not just the blanked-out part, as per the previous phases.",
    'Whenever you submit a response, you will see that your answer is recorded on-screen which will help you not to submit duplicate responses.',
    "It's important that you don't submit junk responses as this might interfere with the way your existing responses are retained on-screen.",
    '<br>',
    '<em>Please press the <strong>spacebar</strong> to continue to the next page...</em>'
    ],
  [
    "You'll only have a short time to remember as many statements as you can, so try to be quick and accurate!",
    "Remember, try to only submit answers that you feel you have  previously been shown or practised during the experiment.",
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
    ]
  ];

var free_recall_instructions = {
    type: 'instructions',
    pages: modifiedTextArray(recallTextArray),
    key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
    allow_backward: false,
    post_trial_gap: delay_after_instructions,
    data: {task_part: 'free_recall_instructions'},
    animate_lines: true,
    animation_delay: animation_time,
      on_finish: function () {
        const instructionsContainer = document.querySelector('.instruction-box');
        if (instructionsContainer) {
            instructionsContainer.remove();
        }
      }
};
timeline.push(free_recall_instructions);

var free_recall_trial = {
  type: 'cued-recall',
  on_load: function () {
    // Use setTimeout to defer execution until after the DOM is updated
    setTimeout(function() {
      var start_time = performance.now();
      var interval = setInterval(function () {
        var time_left = wait_time - (performance.now() - start_time);
        var minutes = Math.floor(time_left / 1000 / 60);
        var seconds = Math.floor((time_left - minutes * 1000 * 60) / 1000);
        var seconds_str = seconds.toString().padStart(2, '0');

        // Ensure the clock element exists before accessing it
        var clock_element = document.querySelector('#clock');
        if (clock_element) {
          clock_element.innerHTML = minutes + ":" + seconds_str;
        }

        if (time_left <= 0) {
          if (clock_element) {
            clock_element.innerHTML = "0:00";
          }
          clearInterval(interval);
          interval = null;
        }
      }, 250); // ms
    }, 0); // Delay of 0 milliseconds
  },
  
  stimulus: function() {
    return '<span class="cued-recall-stim">all %% are ' + jsPsych.timelineVariable('category', true) + '</span>';
  },
  
  text_box_columns: 40,
  blank_text_length: 12,
  text_box_font_size: 25,
  show_submit_button: false,
  trial_duration: wait_time,
  print_responses: true,
  print_response_key: 'enter',
  prompt: '<p style="color: grey; margin-bottom: 20px;">Please continue responding until the trial times out (<span id="clock">1:00</span>).</p>',
  prompt_location: 'above',
  content_location: '10vh',
  check_answers: false,
  check_duplicates: true,
  case_sensitive_duplicates: false,
  clear_input_after_error: true,
  error_clear_delay: 500,
  
  validation_fn: function(response, category) {
    // Trim whitespace and normalise
    var trimmedResponse = response.trim().toLowerCase();
    var trimmedCategory = category.toLowerCase();
    
    // Check structure - starts with "all" or "most"
    var starts_with_all_most = trimmedResponse.startsWith('all ') || trimmedResponse.startsWith('most ');
    if (!starts_with_all_most) {
      return 'format'; // Return format error code
    }
    
    // Check if ends with the correct category
    var ends_with_category = trimmedResponse.endsWith(trimmedCategory);
    if (!ends_with_category) {
      return 'category';
    }
    
    // Check internal whitespaces
    var internal_whitespaces = (trimmedResponse.match(/\s+/g) || []).length;
    if (internal_whitespaces < 3) {
      return 'format';
    }
    
    // Check has at least one word between the starting word and the category
    var words = trimmedResponse.split(/\s+/);
    var has_middle_words = words.length >= 3; // 'all', at least one word, and category
    if (!has_middle_words) {
      return 'format';
    }

    return true;
  },
  
  mistake_fn: function(response, errorType) {
    var category = jsPsych.timelineVariable('category', true);
    var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
    
    if (!mistakeElem) {
      console.error("Could not find mistake element");
      return;
    }
    
    var errorMessage = '';
    if (errorType === 'duplicate') {
      errorMessage = 'You have already entered that response.';
    } else if (errorType === 'category') {
      errorMessage = 'Your response must end with the category "' + category + '".';
    } else if (errorType === 'format') {
      errorMessage = 'Please type the full sentence in the correct format (e.g., "all [exemplar] are ' + 
                    category + '").';
    } else {
      errorMessage = 'There was an error with your response. Please try again.';
    }
    
    mistakeElem.innerHTML = errorMessage;
    mistakeElem.style.opacity = 1;
    
    // Start fading out after 4 seconds
    setTimeout(function() {
      var fadeEffect = setInterval(function () {
        if (!mistakeElem.style.opacity) {
          mistakeElem.style.opacity = 1;
        }
        if (mistakeElem.style.opacity > 0) {
          mistakeElem.style.opacity -= 0.05;
        } else {
          clearInterval(fadeEffect);
          mistakeElem.innerHTML = '';
          mistakeElem.style.opacity = 1; // Reset opacity for future messages
        }
      }, 50); // Fade effect interval
    }, 4000); // Wait 4 seconds before starting the fade
  },

  data: {
    task_part: 'free_recall',
    condition: condition,
    familiarity: familiarity,
    retrieval_list: retrieval_list,
    category: jsPsych.timelineVariable('category')
  },
  
  on_finish: function(data) {
    // Parse the JSON-formatted response
    var responses = JSON.parse(data.responses);
    
    // Process each response and add to the data object
    for (var i = 0; i < responses.length; i++) {
      data['response_' + i.toString()] = responses[i].response;
      data['response_rt_' + i.toString()] = responses[i].rt;
      
      // Handle validation status if available
      if (responses[i].hasOwnProperty('valid')) {
        data['response_valid_' + i.toString()] = responses[i].valid;
        if (!responses[i].valid && responses[i].hasOwnProperty('error')) {
          data['response_error_' + i.toString()] = responses[i].error;
        }
      }
    }
  },

  post_trial_gap: inter_trial_interval
};

var free_recall_procedure = {
  timeline: [free_recall_trial],
  timeline_variables: category_trials
};
timeline.push(free_recall_procedure);

// ** Set up post-experimental inquiry **
var peiTextArray = [
    [
      "Well done! You've almost completed your participation for today.",
      "In the final part of the experiment, you'll answer a few questions about your experiences during the task so far; the more detailed your responses, the better we can make use of the data you've shared with us!",
      '<br>',
      '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
    ]
  ];

var pei_instructions = {
    type: 'instructions',
    pages: modifiedTextArray(peiTextArray),
    key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
    allow_backward: false,
    post_trial_gap: delay_after_instructions,
    data: {task_part: 'distractor_instructions'},
    animate_lines: true,
    animation_delay: animation_time,
    on_finish: function () {
        const instructionsContainer = document.querySelector('.instruction-box');
        if (instructionsContainer) {
            instructionsContainer.remove();
        }
      }
  };

timeline.push(pei_instructions);

timeline.push(cursor_on);

var strategy_options = [
    "'I tried to memorise each new item in relation to its category'",
    "'I visualised each new item or created a mental tableau involving the item'",
    "'I focussed on the shape or the sound of each new item'",
    "'I kept mentally repeating items to myself'",
    "'I located new items in my memory palace'",
    "'I just focussed on the new word in each sentence and tried to ignore the rest of the words'",
    "'I tried to relate each new item to other things I'm familiar with'",
    "'I mostly just guessed or went with my gut'",
    "'I wasn't familiar with all the words so I only tried to memorise those that I knew'"
  ];
var strategy_options_random = jsPsych.randomization.shuffle(strategy_options)
strategy_options_random.push("None of the above");

var options = '';
  for (var i = 18; i <= 65; i++) {
      options += '<option value="' + i + '">' + i + '</option>';
  }

var age_question = {
    type: 'survey-html-form',
    html: '<p><label for="age">What is your current age in years?</label></p>'+
          '<p><select name="age" id="age" required><optgroup>'+
          '<option value="choose" selected disabled>Please choose an option</option>'+
          options +
          '<optgroup></select></p>',
    on_load: function() {
        document.getElementsByTagName("optgroup")[0].style.fontSize = "18px";
        var select_el = document.getElementsByTagName("select")[0];
        select_el.style.fontSize = "18px";
        select_el.style.padding = "5px";
        select_el.style.fontFamily = "'Open Sans', 'Arial', sans-serif";
    },
    required: true
};

timeline.push(age_question);

var language_question = {
  type: 'survey-html-form',
  html: '<p><label for="language">In which region of the world did you learn English?</label></p>'+
  '<p><select name="language" id="language" required><optgroup>'+
  '<option value="choose" selected disabled>Please choose an option</option>'+
  '<option value="Australia">Australia</option>'+
  '<option value="Canada">Canada</option>'+
  '<option value="New Zealand">New Zealand</option>'+
  '<option value="Republic of Ireland">Republic of Ireland</option>'+
  '<option value="South Africa">South Africa</option>'+
  '<option value="United Kingdom">United Kingdom</option>'+
  '<option value="United States of America">United States of America</option>'+
  '<option value="Other region (Native English)">Other region (Native English)</option>'+
  '<option value="Other region (Non-native English)">Other region (Non-native English)</option>'+
  '<optgroup></select></p>',
  on_load: function() {
    document.getElementsByTagName("optgroup")[0].style.fontSize = "18px";
    var select_el = document.getElementsByTagName("select")[0];
    select_el.style.fontSize = "18px";
    select_el.style.padding = "5px";
    select_el.style.fontFamily = "'Open Sans', 'Arial', sans-serif";
    },
  required: true
};

timeline.push(language_question);

var education_question = {
  type: 'survey-html-form',
  html: '<p><label for="education">What is the highest level of education that you have achieved?</label></p>'+
  '<p><select name="education" id="education" required><optgroup>'+
  '<option value="choose" selected disabled>Please choose an option</option>'+
  '<option value="hs">High School (for e.g., HSC, IB)</option>'+
  '<option value="dip">Diploma (for e.g., Dip, Adv Dip)</option>'+
  '<option value="ug">Undergraduate degree (for e.g., BS, BA)</option>'+
  '<option value="pg">Postgraduate degree (for e.g., MA, PhD, MD)</option>'+
  '<optgroup></select></p>',
  on_load: function() {
    document.getElementsByTagName("optgroup")[0].style.fontSize = "18px";
    var select_el = document.getElementsByTagName("select")[0];
    select_el.style.fontSize = "18px";
    select_el.style.padding = "5px";
    select_el.style.fontFamily = "'Open Sans', 'Arial', sans-serif";
    },
  required: true
};

timeline.push(education_question);

var multi_choice_block = {
  type: 'survey-multi-choice',
  questions: [
  {
      prompt: "Which gender category do you most identify with?",
      name: 'gender',
      options: ["Female","Male","Other"],
      horizontal: true,
      required: true
  },
  {
      prompt: "Which is your dominant hand?",
      name: 'chirality',
      options: ["Left","Right","Ambidextrous"],
      horizontal: true,
      required: true
  },
  {
      prompt: "Have you previously participated in this experiment?",
      name: 'participation',
      options: ["Yes","No"],
      horizontal: true,
      required: true
  },
  {
      prompt: "Was your participation in a quiet environment by yourself?",
      name: 'environment',
      options: ["Yes","No"],
      horizontal: true,
      required: true
  },
  {
      prompt: "Were you disturbed during the task?",
      name: 'disruption',
      options: ["Yes","No"],
      horizontal: true,
      required: true
  }
  ],
};

timeline.push(multi_choice_block);

var clinical_free = {
  type: 'survey-text',
  questions: [
  {
      prompt: ['<p>Please list any mental illness diagnoses that you have previously been given (for e.g., ADHD, PTSD)...</p>'+
        '<p><i>Note, your responses are completely anonymous and will be stored securely.</i></p>'],
      rows: 5,
      columns: 40
  }
  ],
};

timeline.push(clinical_free);

var general_free = {
  type: 'survey-text',
  questions: [
  {
      prompt: '<p>Overall, what were your impressions of this task?</p>',
      rows: 5,
      columns: 40
  }
  ],
};

timeline.push(general_free);

// set up Likert question info
var likert_scale = ["1","2","3","4","5","6","7","8","9"];
var likert_scale_labels = [
  ['Very poor','Native fluency'],
  ['Not large at all','Very large'],
  ['Not good at all','Very good'],
  ['Not distracted at all','Highly distracted'],
  ['Not familiar at all','Highly familiar'],
  ['Not well at all','Very well'],
  ['Not believable at all','Highly believable'],
  ['Not guessing at all','Mostly guessing'],
  ["Not much effort","A lot of effort"],
  ["Not difficult to remember","Very difficult to remember"]
  ];

var likert_prompts = [
  "please rate your general English language fluency.",
  "please rate how large you believe your English language vocabulary is compared with your peers.",
  "please rate how good you believe your memory is compared with your peers",
  "please rate the degree to which you felt distracted during the task.",
  "please rate, on average, how familiar you found the vocabulary you were presented with during the task.",
  "please rate how easily you feel you were able to recall the statements when directed during the task.",
  "please rate how believable you found the statements presented to you during the task.",
  "please rate the extent to which you felt you were guessing rather than remembering.",
  "please rate much effort you felt you had to put into focussing during the task.",
  "please rate how difficult it was to remember the statements during the task."
  ];

// dynamically create the likert questions array
var questions_array = [];
for (var i=0; i<likert_prompts.length; i++) {
      // copy the likert scale (so that we don't modify the original)
  var this_scale = likert_scale.map((x) => x);
      // for the first and last label (1 and 9), add some line breaks followed by the appropriate min/max label
  this_scale[0] = this_scale[0]+'<br><br>'+likert_scale_labels[i][0];
  this_scale[8] = this_scale[8]+'<br><br>'+likert_scale_labels[i][1];
  questions_array.push({
    prompt: "On the following scale, "+likert_prompts[i],
    labels: this_scale,
    required: true
  });
}

var likert_page = {
  type: 'survey-likert',
  questions: questions_array,
  randomize_question_order: true
};

timeline.push(likert_page);

var strategies_free = {
  type: 'survey-text',
  questions: [
  {
      prompt: ['<p>In the beginning of the task, you were presented with a number of statements that you were asked to learn.</p>'+
        '<p>Did you use any particular strategies to memorise these statements?</p>'+
        '<p>If so, please describe <em>in detail</em> what these strategies were...</p>'],
      rows: 5,
      columns: 40
  }
  ],
};

timeline.push(strategies_free);

var strategies_multi = {
    type: 'survey-multi-select',
    questions: [
    {
        prompt: ['<p>In the middle of the task, you were asked to remember a number of items that you had learned from earlier and to type them into a textbox.</p>'+
          '<p>Please read through the options below and select as many of the statements that you feel resonate with your experience during this part of the task.</p>'],
        options: strategy_options_random,
        horizontal: false,
        required: true,
        name: 'strategies_multi'
    }
    ],
    randomize_question_order: true
};

timeline.push(strategies_multi);

var experiment_end = {
    type: 'html-keyboard-response',
    stimulus: ['<p>You&#39;ve finished the experiment!</p><p>Thank you for participating!</p>'+
    'Please wait briefly while you are redirected to your SONA page so your participation credit can be awarded...'],
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    data: {task_part: 'end_msg'}
};

timeline.push(experiment_end);

let sona_id = jsPsych.data.urlVariables()['sona_id'];

jsPsych.init({
  timeline: timeline,
  show_progress_bar: true,
  auto_update_progress_bar: true,
  on_finish: function(data) {
    window.location.assign("https://mq-psy.sona-systems.com/webstudy_credit.aspx?experiment_id=3630&credit_token=ff4db00e7b724a3f981cfa3ed6394c7f&survey_code="+sona_id)
  }
})
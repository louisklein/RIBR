// ** Initialise globals **
var timeline = [];
var condition = null;
var polarity = null;
var trials = null;
var learning_list = null;
var retrieval_list = null;
var retrieval_trials = null;
var distractor_start_time = null;
var stimuli = null;

// ** Task and trial parameters **
var learning_item_duration = 6000;
var inter_trial_interval = 2000;
var delay_after_instructions = 2000;
var retrieval_response_timeout = 32000;
var retrieval_delay_after_submit = 2000;
var distractor_ITIs = [400, 800, 1200, 1600, 2000, 2400, 2800];
var distractor_timeout_duration = 2000;
var filler_categories = ['shoes', 'weapons'];
var belief_judgement_timeout = 8000;
var distractor_trial_data = {
  digit1: null,
  digit2: null,
  isCorrect: null,
  responded: false
};

// ** Manual setting for testing mode **
const testing = false;

if (testing) {
  var distractor_task_duration = 35000;
  var belief_judgement_timeout = 1000;
  var animation_time = 5;
} else {
  var distractor_task_duration = 120000;
  var belief_judgement_timeout = 8000;
  var animation_time = 40;
}

// ** Set up stimuli lists **
// 8 conditions: 2 polarity (between-subject) x 4 retrieval list conditions
// get random condition via jsPsych:
// condition = jsPsych.randomization.sampleWithoutReplacement([1,2,3,4,5,6,7,8],1)[0];
// get counterbalanced condition number via cognition.run:
condition = CONDITION;

// var category_blocked = null;
// if (condition <= 8) {
//     category_blocked = true;
//   } else {
//     category_blocked = false;
//   }

if (condition % 2 == 0) {
  polarity = "non-negated";
  if (condition == 2 || condition == 10) {
    retrieval_trials = retrieval_A1;
    trials = learning;
    retrieval_list = "A1";
  } else if (condition == 4 || condition == 12) {
    retrieval_trials = retrieval_A2;
    trials = learning;
    retrieval_list = "A2";
  } else if (condition == 6 || condition == 14) {
    retrieval_trials = retrieval_B1;
    trials = learning;
    retrieval_list = "B1";
  } else {
    retrieval_trials = retrieval_B2;
    trials = learning;
    retrieval_list = "B2";
  }
} else {
  polarity = "negated";
  if (condition == 1 || condition == 9) {
    retrieval_trials = retrieval_NA1;
    trials = learning2;
    retrieval_list = "A1";
  } else if (condition == 3 || condition == 11) {
    retrieval_trials = retrieval_NA2;
    trials = learning2;
    retrieval_list = "A2";
  } else if (condition == 5 || condition == 13) {
    retrieval_trials = retrieval_NB1;
    trials = learning2;
    retrieval_list = "B1";
  } else {
    retrieval_trials = retrieval_NB2;
    trials = learning2;
    retrieval_list = "B2";
  }
}
console.log('condition: ', condition);
console.log('polarity: ', polarity);
console.log('retrieval list: ', retrieval_list);

// generate stimuli for both learning and belief judgement phases
function generateStimuli(trials, filler_categories, category_blocking) {
  var stimuli = [];
  var rand_filler_category_order = jsPsych.randomization.shuffle(filler_categories);

  var unique_categories = trials.map(function(obj) {
    return obj.category;
  }).filter(function(itm, ind, arr) {
    return ind === arr.indexOf(itm);
  });

  var target_categories = unique_categories.filter(function(itm) {
    return !filler_categories.includes(itm);
  });

  var category_lists = {};
  unique_categories.forEach(function(category) {
    category_lists[category] = jsPsych.randomization.shuffle(trials.filter(function(obj) {
      return obj.category === category;
    }));
  });

  // apply category-blocking if needed
  if (category_blocking) {
    var rand_target_category_order = jsPsych.randomization.shuffle(target_categories);
    stimuli.push(...category_lists[rand_filler_category_order[0]]);
    rand_target_category_order.forEach(function(category) {
      stimuli.push(...category_lists[category]);
    });
    stimuli.push(...category_lists[rand_filler_category_order[1]]);
  } else {
    stimuli.push(...category_lists[rand_filler_category_order[0]]);
    var all_target_trials = trials.filter(function(trial) {
      return !filler_categories.includes(trial.category);
    });
    var all_target_trials_rand = jsPsych.randomization.shuffle(all_target_trials);
    stimuli.push(...all_target_trials_rand);
    stimuli.push(...category_lists[rand_filler_category_order[1]]);
  }
  return stimuli;
}

var belief_judgement_stimuli = generateStimuli(trials, filler_categories, true);
var learning_stimuli = generateStimuli(trials, filler_categories, false);

console.log('learning_stimuli: ', learning_stimuli);

if (!testing) {
  var fullscreen_enter = {
    type: 'fullscreen',
    fullscreen_mode: true
  };
  timeline.push(fullscreen_enter);
}

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
    "If you have a smart device (for e.g., mobile phone or Apple watch), please set these to <strong>'Do Not Disturb'</strong> or switch them off now.",
    "The duration of this experiment varies but should take a maximum of 45 minutes. As such, please make sure you have sufficient time to complete the experiment before you begin as your data can't be used if you stop participating part-way through.",
    '<br>',
    '<em>Press the <strong>spacebar</strong> to continue to the next page...</em>'
  ]
];

var modifiedTextArray = function(textArray) {
  return textArray.map(function(page) {
    return page.map(function(line) {
      return '<div style="display: block; font-size: 25px;">' + line + '</div>';
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
  data: {
    task_part: 'initial_instructions'
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
timeline.push(initial_instructions);

var preconditions = [
  'I believe I will be able to attend to the experiment without distraction for, at most, the next hour',
  "I am setup to participate on a laptop or desktop computer and not a mobile device (for e.g., phone, tablet)",
  'My smart devices have been muted/switched-off and cannot disturb me for the duration of the experiment',
  'No media are playing in my immediate environment (for e.g., music, television, radio programs)'
];
var preconditions_random = jsPsych.randomization.shuffle(preconditions)

var online_checklist = {
  type: 'survey-multi-select',
  questions: [{
    prompt: "<p style='text-align:center; font-size: 27.5px;'>Please review the setup instructions and indicate which are true:</p>",
    options: preconditions_random,
  }],
  required: true,
  post_trial_gap: delay_after_instructions,
  data: {
    trial: "checklist"
  }
};
timeline.push(online_checklist);

var rejection_message = {
  type: 'html-keyboard-response',
  stimulus: ['Since you are not able to meet the preconditions for participation today, please try again later.'+'<br>'+'Remember to read the SONA instructions carefully regarding what is required before you can participate.'+'<br>'+'You will need to e-mail the study co-ordinator, Louis Klein <strong>louis.klein@hdr.mq.edu.au</strong>, in order to have your SONA demerits manually adjusted.'+'<br>'+'Sorry for the inconvenience, your effort is much appreciated.'],
  choices: jsPsych.NO_KEYS,
  data: {
    task_part: 'rejection_msg'
  }
}

var online_checklist_loop = {
  timeline: [rejection_message],
  conditional_function: function() {
    var online_checklist_data = jsPsych.data.getLastTrialData().values()[0];
    var online_checklist_answers = JSON.parse(online_checklist_data.responses).Q0;
    if (preconditions.every(i => online_checklist_answers.includes(i)) == false) {
      //add prior check in the conditional for `previous_participation`
      return true;
    } else {
      return false;
    }
  }
};
timeline.push(online_checklist_loop);

var learningTextArray = [
  [
    'In the first phase of the experiment you will be shown a series of belief statements on-screen.',
    'Each belief will only appear for a short time so it is important that you pay close attention.',
    'You need to <strong>remember each belief</strong> as it is presented to you for later in the experiment.',
    'After each belief statement is presented, you will be asked to rate how much you <em>do</em> believe versus <em>don\'t</em> believe it on a scale from 1 to 6.',
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to continue...</em>'
  ],
  [
    'For each belief you will need to make your rating according to the following scale ranging from 1 to 6.',
    "1 = don't believe it at all",
    "2 = don't believe it quite a bit",
    "3 = somewhat don't believe it",
    '4 = somewhat believe it',
    "5 = believe it quite a bit",
    "6 = completely believe it",
    '<br>',
    'Please try to use the <em>full range</em> of the scale (i.e. all possible values from 1 to 6) rather than just the values in the middle of the scale.',
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to begin...</em>'
  ]
];

var learning_instructions = {
  type: 'instructions',
  pages: modifiedTextArray(learningTextArray),
  key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
  allow_backward: false,
  post_trial_gap: delay_after_instructions,
  data: {
    task_part: 'learning_instructions'
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
timeline.push(learning_instructions);

var learning_trial = {
  type: 'html-keyboard-response',
  stimulus: function() {
    return '<span class="learning-stim">'+jsPsych.timelineVariable('sentence', true)+'</span>';
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: learning_item_duration,
  post_trial_gap: 0, // Changed to 0 since we'll add the belief judgment right after
  data: {
    task_part: 'learning',
    condition: condition,
    polarity: polarity,
    exemplar: jsPsych.timelineVariable('exemplar'),
    category: jsPsych.timelineVariable('category'),
    sentence: jsPsych.timelineVariable('sentence')
  }
};

// Add belief judgment after each learning trial
var learning_belief_judgment = {
  type: 'survey-text-validation',
  questions: function() {
    return [{
      prompt: '<span class="belief-judgement-stim" style="color: black;">'+jsPsych.timelineVariable('sentence', true)+'</span>',
      rows: 1,
      columns: 1,
      required: true,
      name: "learning_belief_judgement",
      validation: function(resp) {
        var pattern = new RegExp('^[1-6]$');
        return pattern.test(resp);
      },
      validation_message: 'Please enter a single number between 1 and 6.'
    }];
  },
  preamble: "<span style='display: inline-block;transform:translate(-50%,0px);color: grey;'>1 = don't believe it at all</span>"+
  '<span style="display: inline-block;transform:translate(50%,0px);color: grey;">6 = completely believe it</span>',
  trial_duration: belief_judgement_timeout,
  show_submit_button: false,
  data: {
    task_part: 'learning_belief_judgement',
    condition: condition,
    polarity: polarity,
    exemplar: jsPsych.timelineVariable('exemplar'),
    category: jsPsych.timelineVariable('category'),
    sentence: jsPsych.timelineVariable('sentence')
  },
  on_finish: function(data) {
    var responses = JSON.parse(data.responses);
    data.learning_belief_judgement = responses.learning_belief_judgement;
  },
  post_trial_gap: inter_trial_interval // Add the ITI here from globals
};

if (testing) {
  var learning_procedure = {
    timeline: [learning_trial, learning_belief_judgment],
    timeline_variables: learning_stimuli,
    randomize_order: true,
    sample: {
      type: 'without-replacement',
      size: 3,
    }
  };
} else {
  var learning_procedure = {
    timeline: [learning_trial, learning_belief_judgment],
    timeline_variables: learning_stimuli,
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
    // Get variables from timeline
    var exemplar = jsPsych.timelineVariable('exemplar', true);
    var category = jsPsych.timelineVariable('category', true);
    var modality = jsPsych.timelineVariable('modality', true);
    var answer = jsPsych.timelineVariable('sentence', true);
    
    // Initialise masking parameters if not already set
    if (typeof this.num_underscores === 'undefined') {
      this.num_underscores = 5;
    }
    if (typeof this.stem_length === 'undefined') {
      this.stem_length = 2;
    }
    
    // Apply masking to the exemplar
    var exemplar_length = exemplar.length;
    var stem_length = Math.min(this.stem_length, exemplar_length);
    var num_underscores = (stem_length === exemplar_length) ? 0 : this.num_underscores;
    
    // Generate the masked exemplar
    var masked_exemplar;
    if (num_underscores > 0) {
      var exemplar_cue = exemplar.substring(0, stem_length);
      masked_exemplar = exemplar_cue + '_'.repeat(num_underscores);
    } else {
      masked_exemplar = exemplar;
    }
    
    // Construct the stimulus with the masked exemplar
    var sentence = modality.replace("x's", masked_exemplar).replace("y's", category);
    
    // Must include the solution between %% percetnage symbols for the plugin to extract
    // But make the visible part show only the masked version
    var stimulus_html = '<span class="retrieval-stim">' + sentence + '</span>' +
                        '<div style="display:none;">%' + answer + '%</div>';
    
    // Include hidden data for our mistake function to use
    stimulus_html += '<div id="hidden-data" style="display:none;" ' +
      'data-exemplar="' + exemplar + '" ' +
      'data-category="' + category + '" ' +
      'data-modality="' + modality + '">' +
      answer + '</div>';
    
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
  
  // Override the default checking behavior
  check_fn: function(response, solution) {
    // Get hidden data from the DOM
    var hiddenData = document.getElementById('hidden-data');
    if (!hiddenData) return false;
    
    var exemplar = hiddenData.getAttribute('data-exemplar');
    var category = hiddenData.getAttribute('data-category');
    var modality = hiddenData.getAttribute('data-modality');
    var normalizedResponse = response.trim().toLowerCase();
    var normalizedSolution = solution.trim().toLowerCase();
    
    // If exact match to full solution, accept immediately 
    if (normalizedResponse === normalizedSolution) {
      return true;
    }
    
    // First, we check basic sentence structure
    // Extract the expected beginning part from the modality
    var modalityStart = modality.split("x's")[0].toLowerCase().trim();
    
    // Check if response starts with the expected beginning (e.g., "all", "most", "not all")
    if (!normalizedResponse.startsWith(modalityStart + ' ')) {
      // Set error message for missing sentence structure
      var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
      if (mistakeElem) {
        // Check if they've only entered the beginning word
        if (normalizedResponse === modalityStart || normalizedResponse.trim() === modalityStart) {
          mistakeElem.innerHTML = 'Please type a complete sentence, not just "' + modalityStart + '".';
        } else {
          mistakeElem.innerHTML = 'Your answer should start with "' + modalityStart + '".';
        }
        mistakeElem.setAttribute('data-error-type', 'structure');
      }
      return false;
    }
    
    // Check if response contains the category
    if (!normalizedResponse.includes(category.toLowerCase())) {
      // Set error message for missing category
      var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
      if (mistakeElem) {
        mistakeElem.innerHTML = 'Please include the category "' + category + '" in your answer.';
        mistakeElem.setAttribute('data-error-type', 'structure');
      }
      return false;
    }
    
    // Check for minimum word count (basic structure check)
    var words = normalizedResponse.split(/\s+/);
    if (words.length < 3) { // At minimum: quantifier + exemplar + category with connector
      // Set error message for insufficient structure
      var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
      if (mistakeElem) {
        mistakeElem.innerHTML = 'Please type the full sentence.';
        mistakeElem.setAttribute('data-error-type', 'structure');
      }
      return false;
    }
    
    var participantExemplar = ''; // Extract the participant's exemplar attempt
    
    // Identify the connecting word(s) between exemplar and category, if any
    var connector = '';
    var modalityParts = modality.split("x's");
    if (modalityParts.length > 1) {
      connector = modalityParts[1].split("y's")[0].trim();
    }
    
    if (connector) {
      // If there's a connector like "are", extract what's between the start and connector
      var beforeConnector = normalizedResponse.split(connector)[0];
      if (beforeConnector) {
        participantExemplar = beforeConnector.substring(modalityStart.length).trim();
      }
    } else {
      // Fallback extraction method - get what's between start and category
      var beforeCategory = normalizedResponse.split(category.toLowerCase())[0];
      if (beforeCategory && beforeCategory.startsWith(modalityStart)) {
        participantExemplar = beforeCategory.substring(modalityStart.length).trim();
      }
    }
    
    // If we couldn't extract a clear exemplar, that's a structure problem
    if (!participantExemplar) {
      var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
      if (mistakeElem) {
        mistakeElem.innerHTML = 'Please type the complete sentence with the correct structure.';
        mistakeElem.setAttribute('data-error-type', 'structure');
      }
      return false;
    }
    
    // Now we check the similarity between the extracted exemplar and the correct one
    // basic levenstein distance calculation for string similarity
    function levenshteinDistance(str1, str2) {
      const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));
      for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;
      
      for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
          const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      return matrix[str1.length][str2.length];
    }
    
    function calculateSimilarity(str1, str2) {
      if (!str1 && !str2) return 1.0;
      if (!str1 || !str2) return 0.0;
      
      const distance = levenshteinDistance(str1, str2);
      const maxLength = Math.max(str1.length, str2.length);
      return (maxLength - distance) / maxLength;
    }
    
    // Calculate similarity between extracted exemplar and correct exemplar
    const similarity = calculateSimilarity(participantExemplar, exemplar.toLowerCase());
    
    // If similarity is above threshold, accept the answer
    const similarityThreshold = 0.8; // 80% similarity threshold
    
    // If the exemplar is similar enough, return true (correct answer)
    if (similarity >= similarityThreshold) {
      return true;
    }
    
    // If we get here, the structure was correct but the exemplar was wrong
    // Warning flag that this is an exemplar error (not structure)
    var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
    if (mistakeElem) {
      mistakeElem.setAttribute('data-error-type', 'exemplar');
      mistakeElem.innerHTML = 'That response is not correct.<br>Please try again.';
    }
    
    return false;
  },
  
  mistake_fn: function(response, solution) {
    // Get hidden data
    var hiddenData = document.getElementById('hidden-data');
    if (!hiddenData) return;
    
    var exemplar = hiddenData.getAttribute('data-exemplar');
    var category = hiddenData.getAttribute('data-category');
    var modality = hiddenData.getAttribute('data-modality');
    
    // Check if this is an exemplar error (structure was correct but exemplar was wrong)
    var mistakeElem = document.getElementById('jspsych-cued-recall-mistake');
    var errorType = mistakeElem ? mistakeElem.getAttribute('data-error-type') : '';
    
    var updateStimulus = false;
    
    // Only update the hint (reveal more letters) if this was an exemplar error
    if (errorType === 'exemplar') {
      // Update the hint by revealing more of the word
      if (typeof this.num_underscores === 'undefined') {
        this.num_underscores = 5;
      }
      if (typeof this.stem_length === 'undefined') {
        this.stem_length = 2;
      }
      
      if (this.num_underscores > 0) {
        this.stem_length += 1;
        this.num_underscores -= 1;
        updateStimulus = true;
      }
    }
    
    // Update the stimulus if needed
    if (updateStimulus) {
      var exemplar_length = exemplar.length;
      var stem_length = Math.min(this.stem_length, exemplar_length);
      var num_underscores = (stem_length === exemplar_length) ? 0 : this.num_underscores;
      
      var masked_exemplar;
      if (num_underscores > 0) {
        var exemplar_cue = exemplar.substring(0, stem_length);
        masked_exemplar = exemplar_cue + '_'.repeat(num_underscores);
      } else {
        masked_exemplar = exemplar;
      }
      
      var sentence = modality.replace("x's", masked_exemplar).replace("y's", category);
      
      var retrievalStimElem = document.querySelector('.retrieval-stim');
      if (retrievalStimElem) {
        retrievalStimElem.innerHTML = sentence;
      }
    }
    
    // Handle the error message with proper timer management
    if (mistakeElem) {
      // Clear any existing timer IDs stored on the element
      if (mistakeElem.fadeOutTimer) {
        clearTimeout(mistakeElem.fadeOutTimer);
      }
      if (mistakeElem.fadeEffectInterval) {
        clearInterval(mistakeElem.fadeEffectInterval);
      }
      
      // Reset opacity to ensure full visibility
      mistakeElem.style.opacity = 1;
      
      // Set up a new fade out timer
      mistakeElem.fadeOutTimer = setTimeout(function() {
        mistakeElem.fadeEffectInterval = setInterval(function() {
          if (!mistakeElem.style.opacity) {
            mistakeElem.style.opacity = 1;
          }
          if (mistakeElem.style.opacity > 0) {
            mistakeElem.style.opacity -= 0.05;
          } else {
            clearInterval(mistakeElem.fadeEffectInterval);
            mistakeElem.fadeEffectInterval = null;
            mistakeElem.innerHTML = '';
            mistakeElem.style.opacity = 1;
            // Clear the error type
            mistakeElem.removeAttribute('data-error-type');
          }
        }, 50);
      }, 4000);
    }
    
    // Reset input field and set focus
    var input_box = document.querySelector('.jspsych-cued-recall-response');
    if (input_box) {
      input_box.value = '';
      input_box.focus();
    }
  },
  
  post_trial_gap: inter_trial_interval,
  delay_after_submit: retrieval_delay_after_submit,
  trial_duration: retrieval_response_timeout,
  data: {
    task_part: 'retrieval',
    condition: condition,
    polarity: polarity,
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
};
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
    
    // Store digits in global variable for later use in feedback
    distractor_trial_data.digit1 = digits[0];
    distractor_trial_data.digit2 = digits[1];
    distractor_trial_data.responded = false;
    
    return '<span class="distractor-stim left">'+digits[0]+'</span><span class="distractor-stim right">'+digits[1]+'</span>'
  },
  prompt: '<span class="left top" style="color: grey;">f = same</span><span class="right top"style=" color: grey;">j = different</span>',
  choices: ['f', 'j'],
  trial_duration: distractor_timeout_duration,
  data: {
    task_part: 'distractor_task'
  },
  on_start: function() {
    document.body.style.cursor = "none";
    if (distractor_start_time == null) {
      distractor_start_time = performance.now();
    };
  },
  on_finish: function(data) {
    // Determine if response was correct
    const areSame = distractor_trial_data.digit1 === distractor_trial_data.digit2;
    const response = data.key_press;
    
    // f key is 70, j key is 74
    if (response === 70) { // 'f' key (same)
      distractor_trial_data.isCorrect = areSame;
    } else if (response === 74) { // 'j' key (different)
      distractor_trial_data.isCorrect = !areSame;
    } else {
      distractor_trial_data.isCorrect = null; // no response
    }
    
    distractor_trial_data.responded = (response === 70 || response === 74);
  }
};

// Feedback trial to show coloured digits
var distractor_feedback = {
  type: 'html-keyboard-response',
  stimulus: function() {
    const digit1 = distractor_trial_data.digit1;
    const digit2 = distractor_trial_data.digit2;
    const isCorrect = distractor_trial_data.isCorrect;
    
    // Set colour based on correctness
    const color = isCorrect ? '#18cd26' : '#f8330d';
    
    return '<span class="distractor-stim left" style="color:' + color + ';">' + digit1 + 
           '</span><span class="distractor-stim right" style="color:' + color + ';">' + digit2 + '</span>';
  },
  prompt: '<span class="left top" style="color: grey;">f = same</span><span class="right top"style=" color: grey;">j = different</span>',
  choices: jsPsych.NO_KEYS,
  trial_duration: 500,
  data: {
    task_part: 'distractor_feedback'
  }
};

// Only show feedback if the participant responded
var conditional_feedback = {
  timeline: [distractor_feedback],
  conditional_function: function() {
    return distractor_trial_data.responded;
  }
};

var response_timeout_message = {
  type: 'html-keyboard-response',
  stimulus: '<span class="distractor-timeout-msg" style="font-size: 125%;">Please respond faster.</span>',
  trial_duration: 3000,
  choices: jsPsych.NO_KEYS,
  data: {
    task_part: 'distractor_timeout_msg'
  }
};

var response_timeout_conditional = {
  timeline: [response_timeout_message],
  conditional_function: function() {
    // Only show timeout message if we're coming directly from the distractor_trial
    // and there was no response (not from the feedback trial)
    var last_trial = jsPsych.data.getLastTrialData().values()[0];
    if (last_trial.task_part == "distractor_task" && last_trial.key_press == null) {
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
  choices: ['f', 'j'],
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
  stimulus: '<span class="distractor-timeout-msg" style="font-size: 125%;">Please submit only one response per stimulus.</span>',
  trial_duration: 3000,
  choices: jsPsych.NO_KEYS,
  data: {
    task_part: 'distractor_mult_resp_msg'
  }
};

var distractor_multiple_response_conditional = {
  timeline: [multiple_response_message, distractor_iti],
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
  timeline: [
    distractor_trial,
    conditional_feedback,
    response_timeout_conditional,
    distractor_iti,
    distractor_multiple_response_conditional
  ],
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

// console.log('belief_judgement_stimuli: ', belief_judgement_stimuli);

var beliefJudgementArray = [
  [
    'Great job! In the final phase of the experiment, you will again be shown a series of belief statements that you have seen earlier.',
    'Unlike the task you have just completed, in the next task you do not have to make speeded judgements. However, please do not think for too long before submitting your response.',
    "For each belief, you will need to rate how much you <em>do</em> believe versus <em>don't</em> believe it.",
    "To make a rating, you only need to type a number from 1 to 6 into the textbox and it will be accepted automatically before showing you the next belief for you to rate.",
    '<br>',
    '<em>Please press the <strong>spacebar</strong> to continue to the next page...</em>'
  ],
  [
    'For each belief you will need to make your rating according to the following scale ranging from 1 to 6.',
    "1 = don't believe it at all",
    "2 = don't believe it quite a bit",
    "3 = somewhat don't believe it",
    '4 = somewhat believe it',
    "5 = believe it quite a bit",
    "6 = completely believe it",
    '<br>',
    '<em>Please press the <strong>spacebar</strong> to continue to the next page...</em>'
  ],
  [
    "As you make each rating, try not to think about why you do or don't believe each belief statement, rather, just go with your 'gut feelings'.",
    "Even if you're not confident in your response, don't worry and submit the first rating that came to mind.",
    "Take as much time as you need to form your judgement, but if you're not sure then 'go with your gut'.",
    'Please also try to use the <em>full range</em> of the scale (i.e. all possible values from 1 to 6) rather than just the values in the middle of the scale.',
    '<br>',
    '<em>When you feel ready, please press the <strong>spacebar</strong> to begin.</em>'
  ]
];

// ** Set up like judgment task **
var belief_judgement_instructions = {
  type: 'instructions',
  pages: modifiedTextArray(beliefJudgementArray),
  key_forward: jsPsych.pluginAPI.convertKeyCharacterToKeyCode('space'),
  allow_backward: false,
  post_trial_gap: delay_after_instructions,
  data: {
    task_part: 'belief_judgement_instructions'
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
timeline.push(belief_judgement_instructions);

var belief_judgement_trial = {
  type: 'survey-text-validation',
  questions: function() {
    return [{
      prompt: '<span class="belief-judgement-stim" style="color: black;">'+jsPsych.timelineVariable('sentence', true)+'</span>',
      rows: 1,
      columns: 1,
      required: true,
      name: "belief_judgement",
      validation: function(resp) {
        var pattern = new RegExp('^[1-6]$');
        return pattern.test(resp);
      },
      validation_message: 'Please enter a single number between 1 and 6.'
    }];
  },
  preamble: "<span style='display: inline-block;transform:translate(-50%,0px);color: grey;'>1 = don't believe it at all</span>"+
  '<span style="display: inline-block;transform:translate(50%,0px);color: grey;">6 = completely believe it</span>',
  trial_duration: belief_judgement_timeout,
  show_submit_button: false,
  data: {
    task_part: 'belief_judgement',
    condition: condition,
    polarity: polarity,
    retrieval_list: retrieval_list,
    exemplar: jsPsych.timelineVariable('exemplar'),
    category: jsPsych.timelineVariable('category'),
    sentence: jsPsych.timelineVariable('sentence')
  },
  on_finish: function(data) {
    var responses = JSON.parse(data.responses);
    data.belief_judgement = responses.belief_judgement;
  }
};

var belief_judgement_iti = {
  type: 'html-keyboard-response',
  stimulus: '<div style="visibility:hidden;margin:2em 0em;"><p><span class="belief-judgement-stim">X</span></p><input type="text" id="input-0" size="1"></div>'+
  '<input type="submit" class="jspsych-btn" style="visibility:hidden;" disabled>',
  choices: jsPsych.ALL_KEYS,
  data: {
    task_part: 'belief_judgement_ITI'
  },
  response_ends_trial: true,
  trial_duration: inter_trial_interval
};

var belief_judgement_multiple_response_conditional = {
  timeline: [multiple_response_message,
    belief_judgement_iti],
  conditional_function: function() {
    var last_trial = jsPsych.data.getLastTrialData().values()[0];
    if (last_trial.task_part == "belief_judgement_ITI" && last_trial.key_press !== null) {
      return true;
    } else {
      return false;
    }
  }
};

// loop over the belief_judgement_stimuli array
if (testing) {
  var belief_judgement_procedure = {
    timeline: [belief_judgement_trial,
      belief_judgement_iti,
      belief_judgement_multiple_response_conditional],
    timeline_variables: belief_judgement_stimuli,
    sample: {
      type: 'without-replacement',
      size: 10,
    }
  };
} else {
  var belief_judgement_procedure = {
    timeline: [belief_judgement_trial,
      belief_judgement_iti,
      belief_judgement_multiple_response_conditional],
    timeline_variables: belief_judgement_stimuli
  };
}
timeline.push(belief_judgement_procedure);

// ** setup post-experimental inquiry **
// -- please review RIBR source code for original verbose implementation
var peiTextArray = [
  [
    'Well done!',
    '<br>',
    "You've almost completed your participation for today.",
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
timeline.push(pei_instructions);

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
  html: '<p><label for="education">What is the highest level of education (or equivalent) that you have achieved?</label></p>'+
  '<p><select name="education" id="education" required><optgroup>'+
  '<option value="choose" selected disabled>Please choose an option</option>'+
  '<option value="hs">High School (for e.g., HSC, IB)</option>'+
  '<option value="dip">Diploma (for e.g., Dip, Adv Dip)</option>'+
  '<option value="ug">Undergraduate degree (for e.g., BSc, BA)</option>'+
  '<option value="pg">Postgraduate degree (for e.g., MA, PhD, MD, DPhil)</option>'+
  '<option value="pg">Postdoctoral qualification</option>'+
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
  questions: [{
    prompt: "Which gender category do you most identify with?",
    name: 'gender',
    options: ["Female",
      "Male",
      "Non-binary",
      "Fluid"],
    horizontal: false,
    required: true
  },
    {
      prompt: "Which is your dominant hand?",
      name: 'chirality',
      options: ["Left",
        "Right",
        "Ambidextrous"],
      horizontal: true,
      required: true
    },
    {
      prompt: "Have you previously participated in this experiment?",
      name: 'participation',
      options: ["Yes",
        "No"],
      horizontal: true,
      required: true
    },
    {
      prompt: "Was your participation in a quiet environment by yourself?",
      name: 'environment',
      options: ["Yes",
        "No"],
      horizontal: true,
      required: true
    },
    {
      prompt: "Were you disturbed during the task?",
      name: 'disruption',
      options: ["Yes",
        "No"],
      horizontal: true,
      required: true
    }],
};
timeline.push(multi_choice_block);

var general_free = {
  type: 'survey-text',
  questions: [{
    prompt: '<p>Overall, what were your impressions of this task?</p>',
    rows: 5,
    columns: 40
  }],
};
timeline.push(general_free);

var strategies_free = {
  type: 'survey-text',
  questions: [{
    prompt: ['<p>In the beginning of the task, you were presented with a number of belief statements that you were asked to learn.</p>'+
      '<p>Did you use any particular strategies to memorise these statements?</p>'+
      '<p>If so, please describe <em>in detail</em> what these strategies were...</p>'],
    rows: 5,
    columns: 40
  }],
};
timeline.push(strategies_free);

var belief_free = {
  type: 'survey-text',
  questions: [{
    prompt: '<p>Were there any belief statements you were presented with today that were particularly unbelievable or controversial?</p>',
    rows: 5,
    columns: 40
  }],
};
timeline.push(belief_free);

var pei_scale1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
var pei_scale_labels = [
  ['Very poor', 'Native fluency'],
  ['Not large at all', 'Very large'],
  ['Not good at all', 'Very good'],
  ['Not distracted at all', 'Highly distracted'],
  ['Not familiar at all', 'Highly familiar'],
  ['Not well at all', 'Very well'],
  ['Not believable at all', 'Highly believable'],
  ['Not guessing at all', 'Mostly guessing'],
  ["Not much effort", "A lot of effort"],
  ["Not difficult to remember", "Very difficult to remember"]
];

var pei_prompts = [
  "please rate your general English language fluency.",
  "please rate how large you believe your English language vocabulary is compared with your peers.",
  "please rate how good you believe your memory is compared with your peers",
  "please rate the degree to which you felt distracted during the task.",
  "please rate, on average, how familiar you found the vocabulary you were presented with during the task.",
  "please rate how easily you feel you were able to recall the belief statements when directed during the task.",
  "please rate how believable you found the belief statements presented to you during the task.",
  "please rate the extent to which you felt you were guessing rather than remembering.",
  "please rate much effort you felt you had to put into focussing during the task.",
  "please rate how difficult it was to remember the belief statements during the task."
];

var pei_array = [];
for (var i = 0; i < pei_prompts.length; i++) {
  var pei_scale2 = pei_scale1.map((x) => x);
  pei_scale2[0] = pei_scale2[0]+'<br><br>'+pei_scale_labels[i][0];
  pei_scale2[8] = pei_scale2[8]+'<br><br>'+pei_scale_labels[i][1];
  pei_array.push({
    prompt: "<span style='font-size: 20px;'>On the following scale, "+pei_prompts[i]+"</span>",
    labels: pei_scale2,
    required: true
  });
}

var pei_likerts = {
  type: 'survey-likert',
  questions: pei_array,
  randomize_question_order: true
};
timeline.push(pei_likerts);

var experiment_end = {
  type: 'html-keyboard-response',
  stimulus: ['<p>You&#39;ve finished the experiment!</p><p>Thank you so much for participating!</p>'+
    'Please wait briefly while you are redirected to your SONA page so your participation credit can be awarded...'],
  choices: jsPsych.NO_KEYS,
  trial_duration: 5000,
  data: {
    task_part: 'end_msg'
  }
};
timeline.push(experiment_end);

let sona_id = jsPsych.data.urlVariables()['sona_id'];
jsPsych.init({
  timeline: timeline,
  show_progress_bar: true,
  auto_update_progress_bar: true,
  on_finish: function(data) {
    window.location.assign("https://mq-psy.sona-systems.com/webstudy_credit.aspx?experiment_id=3630&credit_token=f12cdf9fd89749efacb7bab416690989&survey_code="+sona_id)
  }
})
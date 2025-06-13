// ** Initialize globals **
    var timeline = [];
    var condition = null;
    var familiarity = null;
    var all_trials = null;
    var retrieval_list = null;
    var retrieval_trials = null;
    var distractor_start_time = null;
    var category_blocked = null;

  // ** Task and trial parameters **
    var learning_item_duration = 6000;
    var inter_trial_interval = 2000; 
    var delay_after_instructions = 2000;
    var retrieval_response_timeout = 32000;
    var retrieval_delay_after_submit = 2000;
    var distractor_task_duration =  120000; //120000 for testing
    var distractor_timeout_duration = 2000;
    var distractor_ITIs = [400,800,1200,1600,2000,2400,2800];
    var like_judgment_timeout = 8000;
    var filler_categories = ['gems','trees'];

  // ** Set up stimuli lists **
    // 8 conditions: 2 familiarity (between-subject) x 4 retrieval list conditions
    // get random condition via jsPsych:
    // condition = jsPsych.randomization.sampleWithoutReplacement([1,2,3,4,5,6,7,8],1)[0];
    // get counterbalanced condition number via cognition.run:
    condition = CONDITION;
    
    if (condition <= 8) {
      category_blocked = true;
    } else {
      category_blocked = false;
    }

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
            retrieval_trials = retrieval_UA1;
            retrieval_list = "A1";
        } else if (condition == 3 || condition == 11) {
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
    console.log('condition: ',condition);
    console.log('familiarity: ',familiarity);
    console.log('retrieval list: ',retrieval_list);
    console.log('all trials: ',all_trials);
    
    // enter fullscreen
    var fullscreen_enter = {
        type: 'fullscreen',
        fullscreen_mode: true
    };
    timeline.push(fullscreen_enter);

  // ** Set up learning phase **
    var online_instructions = {
        type: 'instructions',
        pages: ['<p>Thank you for agreeing to participate in this experiment!</p>'+
                '<p>As you will be aware, this experiment is online-only.</p>'+
                '<p>Therefore, we ask that you satisfy some additional requirements to ensure the data we collect from you is high quality.</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>',
                '<p>Please make sure you are seated comfortably, alone, and in a quiet distraction-free environment.</p>'+
                '<p>Please do not listen to music while you complete the task (though noise-cancelling headphones are encouraged).</p>'+
                "<p>And, if you have a smart device (for e.g., mobile phone; Apple watch), please set these to 'Do Not Disturb' or switch them off.</p>"+
                '<p>This experiment will take between 30 and 60 minutes so please ensure you have sufficient time to complete the experiment before you begin.</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>'],
        key_forward: 'space',
        allow_backwards: false,
        post_trial_gap: delay_after_instructions,
        data: {task_part: 'online_instructions'}
    };
    timeline.push(online_instructions);

    var preconditions = [
      'I believe I will be able to attend to the experiment without distraction for, at most, the next hour',
      "I am setup to participate on a laptop or desktop computer and not a mobile device (for e.g., phone, tablet)",
      'My smart devices have been muted/switched-off and cannot disturb me for the duration of the experiment',
      'No media are playing in my immediate environment (for e.g., music, television, radio programs)'
      ];

    var online_checklist = {
        type: 'survey-multi-select',
        questions: [
          {
            prompt: "<p style='text-align:center;'>Please confirm that you have met the preconditions for this experiment by checking all that apply...</p>",
            options: preconditions,
          }
        ],
        required: true,
        randomize_order: true, // not functional
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

    var learning_instructions = {
        type: 'instructions',
        pages: ['<p>In the first phase of the experiment you will be shown a series of statements on screen.</p>'+
                '<p>Each statement will only appear for a short time so it is important that you pay close attention.</p>'+
                '<p>You need to remember each statement as it is presented to you for later in the experiment.</p>'+
                '<p><i>When you feel ready, please press the spacebar to begin.</i></p>'],
        key_forward: 'space',
        allow_backwards: false,
        post_trial_gap: delay_after_instructions,
        data: {task_part: 'learning_instructions'}
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
    var learning_procedure = {
        timeline: [learning_trial],
        timeline_variables: all_trials,
        randomize_order: true,
        sample: {
            type: 'without-replacement',
            size: 3,
        }
    };
    timeline.push(learning_procedure);

  // ** Set up retrieval phase **
    var retrieval_instructions = {
        type: 'instructions',
        pages: ['<p>In the next phase of the experiment, you will be shown statements that you have already seen but with some parts blanked-out.</p>'+
                '<p>You need to remember what the statement should be and then type the complete statement into the textbox.</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>',
                '<p>For example, if you previously saw the statement "all crocodiles are reptiles", you would now see it as "all cr____ are reptiles".</p>'+
                '<p>In this case, you have to recall that the missing word is "crocodiles" and then type the completed statement into the textbox...</p>'+
                '<p>i.e. "all crocodiles are reptiles".</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>',
                "<p>You will only have a short time to type what you remember into the textbox, so don't dawdle!</p>"+
                '<p><i>When you feel ready, please press the spacebar to begin.</i></p>'],
        key_forward: 'space',
        allow_backwards: false,
        post_trial_gap: delay_after_instructions,
        data: {task_part: 'retrieval_instructions'}
    };
    timeline.push(retrieval_instructions);

    var retrieval_trial = {
        type: 'cued-recall',
        stimulus: function() {
            var exemplar = jsPsych.timelineVariable('exemplar',true);
            var exemplar_cue = exemplar.substring(0,2);
            var text_string = 'all '+jsPsych.timelineVariable('exemplar',true)+' are '+jsPsych.timelineVariable('category',true);
            return '<span class="retrieval-stim">all '+exemplar_cue+'%'+text_string+'% are '+jsPsych.timelineVariable('category',true)+'</span>';
        },
        text_box_font_size: 25,
        text_box_disabled_color: 'DimGrey',
        blank_text_length: 10,
        show_submit_button: false,
        allow_submit_key: true,
        prompt: '<p>Press Enter to submit your response.</p>',
        prompt_location: 'above',
        check_answers: true,
        mistake_fn: function(resp, corr) {
            document.getElementById('jspsych-cued-recall-mistake').innerHTML = 'That response is not correct.<br>Please type the correct response: "'+corr+'".';
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
            // parse the JSON-formatted response and save to data
            var responses = JSON.parse(data.responses);
            for (var i=0; i<responses.length; i++) {
                data["response_"+i.toString()] = responses[i].response;
                data["response_rt_"+i.toString()] = responses[i].rt;
            }
        }
    };
    // present the item list stored in retrieval_trials (one of the subsets: A1, A2, B1, B2) in a fixed order
    var retrieval_procedure = {
        timeline: [retrieval_trial],
        timeline_variables: retrieval_trials,
        sample: {
            type: 'without-replacement',
            size: 3,
        }
    };
    timeline.push(retrieval_procedure);

  // ** Set up distractor task **
    var distractor_instructions = {
        type: 'instructions',
        pages: ['<p>Well done! In the next phase of the experiment, you will be asked to make speeded judgments.</p>'+
                '<p>In each trial, you will see two numbers on the screen.</p>'+
                "<p>Press the 'f' key if the numbers are the same. Press the 'j' key if the numbers are different.</p>"+
                '<p>You will need to respond as quickly and as accurately as you can.</p>'+
                '<p><i>Please press the spacebar to continue to the next page...</i></p>',
                "<p>Remember:</p><p>Press the 'f' key if the numbers are the same.</p><p>Press the 'j' key if the numbers are different.</p>"+
                '<p><i>When you feel ready, please press the spacebar to begin.</i></p>'],
        key_forward: 'space',
        allow_backwards: false,
        post_trial_gap: delay_after_instructions,
        data: {task_part: 'distractor_instructions'}
    };
    timeline.push(distractor_instructions);

    var distractor_trial = {
        type: 'html-keyboard-response',
        stimulus: function() {
            var digits = jsPsych.randomization.sampleWithReplacement([1,2,3,4,5,6],2);
            return '<span class="distractor-stim left">'+digits[0]+'</span><span class="distractor-stim right">'+digits[1]+'</span>'
        },
        prompt: '<span class="left top">f = same</span><span class="right top">j = different</span>',
        choices: ['f','j'],
        trial_duration: distractor_timeout_duration,
        data: {task_part: 'distractor_task'},
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
        data: {task_part: 'distractor_timeout_msg'}
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
        prompt: '<span class="left top">f = same</span><span class="right top">j = different</span>',
        choices: ['f','j'],
        data: {task_part: 'distractor_ITI'},
        response_ends_trial: true,
        trial_duration: function() {return jsPsych.randomization.sampleWithoutReplacement(distractor_ITIs,1)[0];}
    };
    
    var multiple_response_message = {
        type: 'html-keyboard-response',
        stimulus: '<span class="distractor-timeout-msg">Please submit only one response per stimulus.</span>',
        trial_duration: 3000,
        choices: jsPsych.NO_KEYS,
        data: {task_part: 'distractor_mult_resp_msg'}
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
        timeline: [distractor_trial, response_timeout_conditional, distractor_iti, distractor_multiple_response_conditional],
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

  // ** Set up like judgment task **
    var like_judgment_instructions = {
        type: 'instructions',
        pages: ['<p>Great job! In the final phase of the experiment, you will be shown words that you may have already seen today.</p>'+
                '<p>For each word, you will need to rate how much you like or dislike it.</p>'+
                "<p>To make a rating, you will type a number from 1 to 6 into the textbox and then press the 'Return' or 'Enter' key to submit your response.</p>"+
                '<p>If you accidentally type a number you did not intend, you can edit your response by using the delete key and then typing a new response.</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>',
                '<p>For each statement you will need to make your rating according to the following scale ranging from 1 to 6.</p>'+
                '<p>1 = dislike this very much<br>2 = dislike this quite a bit<br>3 = dislike this somewhat<br>4 = like this somewhat<br>5 = like this quite a bit<br>6 = like this very much</p>'+
                '<p><i>Press the spacebar to continue to the next page...</i></p>',
                "<p>For each rating, try not to think about why you like or dislike each word; just go with your intuitions or 'gut feelings'.</p>"+
                "<p>If you're not confident in your response, don't worry but submit the first rating that came to mind.</p>"+
                '<p>Please also try to use the full range of the scale (i.e. all possible values from 1 to 6).</p>'+
                "<p>Remember, you must press the 'Return' or 'Enter' key after typing your response to submit each answer.</p>"+
                '<p><i>When you feel ready, please press the spacebar to begin.</i></p>'],
        key_forward: 'space',
        post_trial_gap: delay_after_instructions,
        data: {task_part: 'like_judgment_instructions'}
    };
    timeline.push(like_judgment_instructions);

    var like_judgment_trial = { 
        type: 'survey-text-validation',
        questions: function() {
            return [{
                prompt: '<span class="like-judgment-stim">'+jsPsych.timelineVariable('exemplar',true)+'</span>', 
                rows: 1, columns: 1, required: true, name: "like_judgment",
                validation: function(resp) {
                    var pattern = new RegExp('^[1-6]$');
                    return pattern.test(resp);
                },
                validation_message: 'Please enter a single number between 1 and 6.'
            }];
        },
        preamble: '<span style="display: inline-block;transform:translate(-50%,0px);">1 = dislike it very much</span>'+
                  '<span style="display: inline-block;transform:translate(50%,0px);">6 = like it very much</span>',
        trial_duration: like_judgment_timeout,
        show_submit_button: false,
        data: {
            task_part: 'like_judgment',
            condition: condition, 
            familiarity: familiarity, 
            retrieval_list: retrieval_list, 
            exemplar: jsPsych.timelineVariable('exemplar'), 
            category: jsPsych.timelineVariable('category'),
            sentence: jsPsych.timelineVariable('sentence')
        },
        on_finish: function(data) {
            var responses = JSON.parse(data.responses);
            data.like_judgment = responses.like_judgment;
        }
    };
    
    var like_judgment_iti = {
        type: 'html-keyboard-response',
        stimulus: '<div><span style="display: inline-block;transform:translate(-50%,0px);">1 = dislike it very much</span>'+
                  '<span style="display: inline-block;transform:translate(50%,0px);">6 = like it very much</span></div>'+
                  '<div style="visibility:hidden;margin:2em 0em;"><p><span class="like-judgment-stim">X</span></p><input type="text" id="input-0" size="1"></div>'+
                  '<input type="submit" class="jspsych-btn" style="visibility:hidden;" disabled>',
        choices: jsPsych.ALL_KEYS,
        data: {task_part: 'like_judgment_ITI'},
        response_ends_trial: true,
        trial_duration: inter_trial_interval
    };
    
    var like_judgment_multiple_response_conditional = {
        timeline: [multiple_response_message, like_judgment_iti],
        conditional_function: function() {
            var last_trial = jsPsych.data.getLastTrialData().values()[0];
            if (last_trial.task_part == "like_judgment_ITI" && last_trial.key_press !== null) {
                return true;
            } else {
                return false;
            }
        }
    };

    // filler categories (gems and trees) are always randomly selected as first and last categories
    var rand_filler_category_order = jsPsych.randomization.shuffle(filler_categories);
    var unique_categories = all_trials.map(function(obj) { return obj.category; }).filter(function(itm, ind, arr) { return ind == arr.indexOf(itm); });
    var target_categories = unique_categories.filter(function(itm, ind, arr) { return !(filler_categories.includes(itm)); });
    var category_lists = {};
    for (var i=0; i<unique_categories.length; i++) {
        category_lists[unique_categories[i]] = jsPsych.randomization.shuffle(all_trials.filter(function(obj) { return obj.category == unique_categories[i]; }));
    }
    var like_judgment_stimuli = [];
    if (category_blocked) {
      // create like judgment stimuli array with all items in category-specific blocks: randomized category order and randomized exemplar order within categories
      var rand_target_category_order = jsPsych.randomization.shuffle(target_categories);
      like_judgment_stimuli.push(...category_lists[rand_filler_category_order[0]]); // first category block = random filler 1
      rand_target_category_order.forEach(function(itm,ind) {
          like_judgment_stimuli.push(...category_lists[itm]);
      });
      like_judgment_stimuli.push(...category_lists[rand_filler_category_order[1]]); // last category block = random filler 2
    } else {
      // create like judgment stimuli array with all non-filler items randomized between the first and last filler category trials
      like_judgment_stimuli.push(...category_lists[rand_filler_category_order[0]]); // first category block = random filler 1
      var all_target_trials = all_trials.filter(function(itm, ind, arr) { return !(filler_categories.includes(itm.category)); });
      var all_target_trials_rand = jsPsych.randomization.shuffle(all_target_trials);
      like_judgment_stimuli.push(...all_target_trials_rand);
      like_judgment_stimuli.push(...category_lists[rand_filler_category_order[1]]); // last category block = random filler 2
    }
    console.log('like judgment stimuli: ',like_judgment_stimuli);

    // loop over the like_judgment_stimuli array
    var like_judgment_procedure = {
        timeline: [like_judgment_trial, like_judgment_iti, like_judgment_multiple_response_conditional],
        timeline_variables: like_judgment_stimuli,
        sample: {
            type: 'without-replacement',
            size: 3,
        }
    };
    timeline.push(like_judgment_procedure);
    
    var category_trials = unique_categories.map(function(x) {
      return {category: x};
    });
    console.log('category trials: ', category_trials);

  // ** Set up post-experimental inquiry **
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

    var age_question = {
      type: 'survey-html-form',
      html: '<p><label for="age">What is your current age in years?</label></p>'+
            '<p><select name="age" id="age" required><optgroup>'+
            '<option value="choose" selected disabled>Please choose an option</option>'+
            '<option value="18">18</option>'+'<option value="19">19</option>'+'<option value="20">20</option>'+
            '<option value="21">21</option>'+'<option value="22">22</option>'+'<option value="23">23</option>'+
            '<option value="24">24</option>'+'<option value="25">25</option>'+'<option value="26">26</option>'+
            '<option value="27">27</option>'+'<option value="28">28</option>'+'<option value="29">29</option>'+
            '<option value="30">30</option>'+'<option value="31">31</option>'+'<option value="32">32</option>'+
            '<option value="33">33</option>'+'<option value="34">34</option>'+'<option value="35">35</option>'+
            '<option value="36">36</option>'+'<option value="37">37</option>'+'<option value="38">38</option>'+
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

    // set up likert question info
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
      on_finish: function(data)
        {
          window.location.assign("https://mq-psy.sona-systems.com/webstudy_credit.aspx?experiment_id=3630&credit_token=f12cdf9fd89749efacb7bab416690989&survey_code="+sona_id)
          }
  })

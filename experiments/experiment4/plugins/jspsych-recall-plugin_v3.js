/**
 * jspsych-cued-recall
 * 
 * Original authors: Becky Gilbert, Louis Klein
 * Modified by: [Your Name/Team]
 *
 * Plugin for cued text recall with enhanced validation and response handling.
 * 
 * This plugin allows for:
 * - Presenting stimuli with blanks to be filled
 * - Multiple response collection with validation
 * - Dynamic multi-column layout for responses
 * - Duplicate response detection
 * - Custom error handling and feedback
 * - Category-specific validation
 * - Configurable feedback messaging
 * - String similarity checking for misspellings (new feature)
 * 
 * The plugin supports both standard cued recall (checking against correct answers)
 * and free recall paradigms where multiple valid responses are collected.
 **/

jsPsych.plugins['cued-recall'] = (function () {

    var plugin = {};

    plugin.info = {
        name: 'cued-recall',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The stimulus to be displayed for cueing the text response. Blanks are indicated by %% signs and '+
                'automatically replaced by input fields. If there is a correct answer you want the system to check against, '+
                'it must be typed between the two percentage signs (i.e. %solution%).'
            },
            text_box_location: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Text box location',
                default: 'below',
                choices: ['below','stimulus'],
                description: 'Location for the text response box: either "below" or "stimulus". If "below" (the default), '+
                'the text box is positioned below the stimulus text, '+
                'and the %% in the stimulus text will be replaced with underscores (_) indicating the to-be-filled-in text. '+
                'If "stimulus", the text response box is embedded in the stimulus text in place of the %%.'
            },
            text_box_rows: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box rows',
                default: 1,
                description: 'Number of columns for the text response box(es).'
            },
            text_box_columns: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box columns',
                default: 40,
                description: 'Number of columns for the text response box(es).'
            },
            text_box_justify: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Text box justify',
                default: 'center',
                choices: ['center','centre','left','right'],
                description: 'Text justification for the text response box: either "center"/"centre" (default), "left", or "right".'
            },
            text_box_font_size: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box font size',
                default: 18,
                description: 'Font size (in px) to use for the text response box(es).'
            },
            text_box_padding_top: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding top',
                default: 8,
                description: 'Padding (in px) between text and top of response box(es).'
            },
            text_box_padding_bottom: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding bottom',
                default: 8,
                description: 'Padding (in px) between text and bottom of response box(es).'
            },
            text_box_padding_left: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding left',
                default: 4,
                description: 'Padding (in px) between text and left side of response box(es).'
            },
            text_box_padding_right: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Text box padding right',
                default: 4,
                description: 'Padding (in px) between text and right side of response box(es).'
            },
            background_color: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Background color',
                default: null,
                description: 'Page background color. Can be specified as a CSS color name, RGB or hex value.'
            },
            element_color: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Element color',
                default: null,
                description: 'Color of the non-background elements, i.e. text and textbox(es). Can be specified as a CSS color name, RGB or hex value.'
            },
            text_box_disabled_color: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Text box disabled color',
                default: null,
                description: 'Color of the text box border and text when the text box is disabled (i.e. when there is a delay_after_submit). '+
                'Can be specified as a CSS color name, RGB or hex value.'
            },
            blank_text_length: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Blank text length',
                default: 10,
                description: 'If text_box_location is "below", then blank_text_length is the number of underscores (_) '+
                'that will be entered into the stimulus text in place of the %%. Default is 10.'
            },
            show_submit_button: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Show submit button',
                default: true,
                description: 'Whether or not to show a submit button on the screen that the participant can click to end the trial. '+
                'If false, then the trial should end either with a key press (allow_submit_key is true) or by timing out (trial_duration is not null).'
            },
            submit_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default: 'Submit',
                description: 'Button label for submitting a response, only used when show_submit_button is true.'
            },
            allow_submit_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Allow submit key',
                default: false,
                description: 'Whether or not to allow a specific key press (e.g. enter) to end the trial. '+
                'Note that this key should be *different* from the one used to print a response (print_response_key) '+
                'if responses are printed to the screen (print_responses is true).'
            },
            submit_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Submit key',
                default: 'enter',
                description: 'Which key can be used to end the trial, if allowed (i.e. allow_submit_key is true).'
            },
            print_responses: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Print responses',
                default: false,
                description: 'Whether or not to allow multiple responses, and print each one to the screen using '+
                'a specific key press (e.g. enter). If true, multiple responses will be recorded until the trial ends via '+
                'a sumbit_key keypress or trial_duration is reached.'
            },
            print_response_key: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Submit key',
                default: 'enter',
                description: 'Which key can be used to print the response to the screen, if allowed (i.e. print_responses is true). '+
                'Note that this key should be *different* from the one used to end the trial (submit_key) if a key is allowed to end the '+
                'trial (allow_submit_key is true).'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: '',
                description: 'HTML-formatted string to be displayed above the stimulus. This can be used to provide a reminder about instructions, '+
                'and can include any HTML markup, such as images, audio, etc.'
            },
            prompt_location: {
                type: jsPsych.plugins.parameterType.SELECT,
                pretty_name: 'Prompt location',
                default: 'below',
                choices: ['below','above'],
                description: 'Location for the prompt: either "below" or "above". If "below" (the default), '+
                'the prompt is positioned below the stimulus text and response box. '+
                'If "above", the prompt is positioned above the stimulus text and response box.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to wait (in ms) before ending the trial. If no response is submitted before this timer is reached and check_answers is false, '+
                'the response will be the current value of the input box and the trial will end. If no response is submitted before this timer is reached and check_answers is true, '+
                'then the current value of the input box will be checked, and either the trial will end or the mistake_fn will be called.  '+
                'If the value of this parameter is null, the trial will wait for a response indefinitely, '+
                'so the participant must be allowed to end the trial with a submit button (show_submit_button: true) and/or key press: (allow_submit_key: true).'
            },
            delay_after_submit: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Delay after submit',
                default: null,
                description: 'How long to wait (in ms) after a response is submitted before ending the trial. This can be used to keep the stimulus and '+
                'response on the screen for a fixed/longer duration. '+
                'If null, the trial will end immediately after a response is submitted (when check_answers is false) or immediately after '+
                'a correct response is made (when check_answers is true).'
            },
            check_answers: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check answers',
                default: false,
                description: 'Boolean value indicating if the answers given by participants should be compared against a '+
                'correct solution given in the stimulus text (between %% signs) after the button was clicked.'
            },
            response_required_for_check: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response required to check',
                default: false,
                description: 'If true, and if check_answers is true, then the response textbox must not be empty (i.e. it must contain at least 1 character) '+
                'to trigger the mistake_fn. If an empty response is submitted, it will trigger the response_required_message.'
            },
            response_required_message: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Response required message',
                default: null,
                description: 'Message that should be shown if a participant attempts to submit an empty response. If null, no message is shown.'
            },
            validation_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Validation function',
                default: null,
                description: 'Function to validate individual responses when print_responses is true. This function should return either true (valid), '+
                'or an error code string (e.g., "format", "category", "duplicate") for different types of validation errors.'
            },
            check_duplicates: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check for duplicate responses',
                default: true,
                description: 'If true, check whether a response has already been submitted during this trial.'
            },
            case_sensitive_duplicates: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Case sensitive duplicate checking',
                default: false,
                description: 'If true, duplicate detection will be case sensitive.'
            },
            clear_input_after_error: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Clear input after error',
                default: false,
                description: 'If true, the input field will be cleared after an error message is displayed.'
            },
            error_clear_delay: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Error clear delay',
                default: 2000,
                description: 'How long to wait (in ms) before clearing the input field after an error, if clear_input_after_error is true.'
            },
            mistake_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Mistake function',
                default: null,
                description: 'Function called if check_answers is true and there is a difference between the '+
                'participants answer and the correct solution in the stimulus text (between %% signs). The participants response '+
                'string and the correct response are automatically passed to this function. If this function is specified, then '+
                'a div with the ID jspsych-cued-recall-mistake will be added below the textbox/stimulus, which can be used to display '+
                'a message via the mistake function. The contents of this div will be cleared when a correct response is made.'
            },
            check_answers_case_sensitive: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check answers - case sensitive',
                default: false,
                description: 'If check_answers is true, this boolean value indicates whether the participant and correct response '+
                'comparison should be case-sensitive. If true, then the two responses will be compared exactly as given, and will '+
                'not match if the case differs. If false (the default), both responses will be converted to lowercase before '+
                'the comparison is made.'
            },
            content_location: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Content location',
                default: null,
                description: 'Margin-top CSS value to be used for the jsPsych trial content. This should be a string and the units can be pixels, e.g. "10px" '+
                'or a percentage of the viewport height, e.g. "10vh". If null, then the trial will use auto margins for vertical centering.'
            },
            // NEW PARAMETERS
            check_fn: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                pretty_name: 'Check function',
                default: null,
                description: 'Function to use for custom answer checking. Should return true if the answer is considered correct, false otherwise. ' +
                'Takes the participant response as input.'
            },
            check_sentence_structure: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Check sentence structure',
                default: false,
                description: 'If true, checks that the response includes the basic sentence structure before evaluating the answer.'
            },
            structure_error_message: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Structure error message',
                default: 'Please type the complete sentence, not just the missing word.',
                description: 'Message to display when the sentence structure check fails.'
            },
            similarity_threshold: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Similarity threshold',
                default: 0.7,
                description: 'Threshold for string similarity (0.0 to 1.0). Higher values require more similar strings.'
            }
        }
    };

    // Levenshtein distance calculation function
    function levenshteinDistance(str1, str2) {
        const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));

        for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,        // deletion
                    matrix[i][j - 1] + 1,        // insertion
                    matrix[i - 1][j - 1] + cost  // substitution
                );
            }
        }

        return matrix[str1.length][str2.length];
    }

    // String similarity function
    function calculateStringSimilarity(str1, str2) {
        if (!str1 && !str2) return 1.0; // Both empty strings are identical
        if (!str1 || !str2) return 0.0; // One empty, one not - no similarity
        
        const normalized1 = str1.toLowerCase().trim();
        const normalized2 = str2.toLowerCase().trim();
        
        if (normalized1 === normalized2) return 1.0; // Exact match after normalization
        
        const distance = levenshteinDistance(normalized1, normalized2);
        const maxLength = Math.max(normalized1.length, normalized2.length);
        
        // Return similarity ratio (1.0 = identical, 0.0 = completely different)
        return (maxLength - distance) / maxLength;
    }

    // Function to extract exemplar from a sentence based on template
    function extractExemplar(sentence, template, category) {
        // Handle null or undefined inputs
        if (!sentence || !template || !category) return '';
        
        // Normalize all inputs to lowercase
        const normalizedSentence = sentence.toLowerCase().trim();
        const normalizedTemplate = template.toLowerCase().trim();
        const normalizedCategory = category.toLowerCase().trim();
        
        // Replace placeholders with regex patterns
        const placeholderRegex = normalizedTemplate
            .replace(/x's/g, '([\\w\\s-]+)')  // Capture exemplar
            .replace(/y's/g, normalizedCategory)  // Use the category
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
        
        // Create regex with the pattern
        const regex = new RegExp(placeholderRegex);
        
        // Try to match the sentence
        const match = normalizedSentence.match(regex);
        
        // Return the captured exemplar if found
        return match && match[1] ? match[1].trim() : '';
    }
    
    plugin.trial = function (display_element, trial) {

        // check parameter values
        if (!['center','centre','left','right'].includes(trial.text_box_justify)) {
            console.error('Error in jspsych-cued-recall plugin: please enter a valid option for text_box_justify, either "center/centre", "right", or "left".');
        }
        if (trial.text_box_justify == "centre") {
            trial.text_box_justify = "center";
        }
        if (trial.show_submit_button == false && trial.allow_submit_key == false && trial.trial_duration == null) {
            console.warn("Warning in jspsych-cued-recall plugin: the trial may be deadlocked. Please provide a way for the trial to end "+
            "via 'show_submit_button: true', 'allow_submit_key: true', and/or providing a time limit with 'trial_duration'.")
        }
        
        // Set defaults if not specified
        if (trial.check_duplicates === undefined) {
            trial.check_duplicates = true; // Default is to check for duplicates
        }
        if (trial.case_sensitive_duplicates === undefined) {
            trial.case_sensitive_duplicates = false; // Default is case-insensitive
        }
        if (trial.clear_input_after_error === undefined) {
            trial.clear_input_after_error = false; // Default is to not clear input
        }
        if (trial.error_clear_delay === undefined) {
            trial.error_clear_delay = 2000; // Default 2 seconds delay
        }
        if (trial.similarity_threshold === undefined) {
            trial.similarity_threshold = 0.7; // Default similarity threshold
        }

        // change background/element colors, if necessary
        var el_color;
        var bg_color;
        if (trial.background_color !== null) {
            bg_color = trial.background_color;
            document.getElementsByTagName('body')[0].style.backgroundColor = bg_color;
        }
        if (trial.element_color !== null) {
            el_color = trial.element_color;
            document.getElementsByTagName('body')[0].style.color = el_color;
        }

        // change content position, if necessary
        if (trial.content_location !== null) {
            document.getElementById('jspsych-content').style.marginTop = trial.content_location;
        }

        var elements = trial.stimulus.split('%');
        var solutions = [];
        var answers = [];
        var answers_correct = true;

        // create HTML string
        var html = '<div class="jspsych-cued-recall-container">';
        if (trial.prompt !== "" && trial.prompt_location == "above") {
            html += trial.prompt;
        }
        html += '<div class="jspsych-cued-recall-stimulus-container">';
        for (var i=0; i<elements.length; i++) {
            if (i%2 === 0) {
                html += elements[i];
            } else {
                solutions.push(elements[i].trim()); // removes leading/trailing whitespace
                if (trial.text_box_location == "below") {
                    var blank = Array(trial.blank_text_length).join("&nbsp;");
                    html += '<u>'+blank+'</u>';
                } else if (trial.text_box_location == "stimulus") {
                    html += '<input type="text" autocomplete="off" spellcheck="false" class="jspsych-cued-recall-response" id="jspsych-cued-recall-response-'+(solutions.length-1)+'" '+
                    'value="" size="'+trial.text_box_columns+'" '+
                    'style="font-size:'+trial.text_box_font_size+'px; '+
                    'color: inherit; background-color: inherit; '+
                    'padding-top:'+trial.text_box_padding_top+'px; padding-bottom:'+trial.text_box_padding_bottom+'px; '+
                    'padding-right:'+trial.text_box_padding_right+'px; padding-left:'+trial.text_box_padding_left+'px; '+
                    'text-align:'+trial.text_box_justify+'">';
                } else {
                    console.error('Error in jspsych-cued-recall plugin: please enter a valid option for text_box_location, either "below" or "stimulus".')
                }
            }
        }

        if (trial.text_box_location == "below") {
            html += '<p><input type="text" autocomplete="off" spellcheck="false" class="jspsych-cued-recall-response" id="jspsych-cued-recall-response-0" '+
            'value="" size="'+trial.text_box_columns+'" '+
            'style="font-size:'+trial.text_box_font_size+'px; '+
            'color: inherit; background-color: inherit; border-style: solid; '+
            'padding-top:'+trial.text_box_padding_top+'px; padding-bottom:'+trial.text_box_padding_bottom+'px; '+
            'padding-right:'+trial.text_box_padding_right+'px; padding-left:'+trial.text_box_padding_left+'px; '+
            'text-align:'+trial.text_box_justify+'"></p>';
        }
        html += '</div>';

        if (trial.mistake_fn !== null) {
            html += '<div id="jspsych-cued-recall-mistake" style="margin-top:5px;margin-bottom:5px;color:red;height:2.5em;line-height:1.1;overflow:auto;"></div>';
        }

        if (trial.prompt !== "" && trial.prompt_location == "below") {
            html += trial.prompt;
        }

        // add submit button HTML
        if (trial.show_submit_button) {
            html += '<div id="jspsych-cued-recall-btn-container" style="margin-top:20px";><button class="jspsych-btn" type="button" '+
            ' id="jspsych-cued-recall-submit" style="color: inherit; background-color: inherit;">'+
            trial.submit_button_label+'</button></div>';
        }

        // add div for responses, if they're being printed
        if (trial.print_responses) {
            html += '<div id="jspsych-cued-recall-print-responses"></div>'
        }
        html += '</div>';

        display_element.innerHTML = html;

        if (trial.allow_submit_key) {
            jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: check_responses,
                valid_responses: [trial.submit_key],
                rt_method: 'performance',
                allow_held_key: true,
                persist: true
            });
        }

        if (trial.print_responses) {
            jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: print_response,
                valid_responses: [trial.print_response_key],
                rt_method: 'performance',
                allow_held_key: false,
                persist: true
            });
        }

        // Function to check if a response is a duplicate
        function isDuplicateResponse(response) {
            if (!trial.check_duplicates) return false;
            
            var checkResponse = trial.case_sensitive_duplicates ? response : response.toLowerCase();
            
            for (var i = 0; i < answers.length; i++) {
                var existingResponse = trial.case_sensitive_duplicates ? 
                    answers[i].response : answers[i].response.toLowerCase();
                
                if (checkResponse === existingResponse) {
                    return true;
                }
            }
            return false;
        }

        // Modified print_response function with validation and duplicate detection for v2.0
        function print_response() {
            var resp_box = document.getElementById('jspsych-cued-recall-response-0');
            var current_response = resp_box.value.trim();
            
            if (current_response !== '') {
                var resp_time = performance.now() - response_start_time;
                var isValid = true;
                var errorType = null;
                
                // Check for duplicates first
                if (isDuplicateResponse(current_response)) {
                    isValid = false;
                    errorType = 'duplicate';
                }
                // Then check custom validation if provided and if not a duplicate
                else if (trial.validation_fn !== null) {
                    // Get the category or other needed parameters for validation
                    var validationParams = trial.hasOwnProperty('category') ? trial.category : 
                                          (jsPsych.timelineVariable('category', true) || null);
                    var validationResult = trial.validation_fn(current_response, validationParams);
                    
                    // New version: validation_fn can return true or an error code string
                    if (validationResult !== true) {
                        isValid = false;
                        errorType = validationResult; // This will be the error code like 'format', 'category', etc.
                    }
                }
                
                // If the response passes validation or no validation function is provided
                if (isValid) {
                    var resp = {response: current_response, rt: resp_time, valid: true};
                    answers.push(resp);
                    
                    // Get or create the response list container
                    var resp_div = document.getElementById('jspsych-cued-recall-print-responses');
                    
                    // On first valid response, set up the container structure
                    if (resp_div.children.length === 0) {
                        resp_div.innerHTML = '<div class="response-list"></div>';
                    }
                    
                    var responseList = resp_div.querySelector('.response-list');
                    
                    // Get all columns
                    var columns = responseList.querySelectorAll('.response-column');
                    
                    // If no columns yet, create the first one
                    if (columns.length === 0) {
                        var newColumn = document.createElement('div');
                        newColumn.className = 'response-column';
                        responseList.appendChild(newColumn);
                        columns = responseList.querySelectorAll('.response-column');
                    }
                    
                    // Get the last column
                    var lastColumn = columns[columns.length - 1];
                    
                    // Check how many items are in the last column
                    var itemsInLastColumn = lastColumn.querySelectorAll('.response-item').length;
                    
                    // Maximum items per column (adjust as needed)
                    var maxItemsPerColumn = 8;
                    
                    // If the last column is full and we haven't reached the max number of columns, create a new column
                    if (itemsInLastColumn >= maxItemsPerColumn && columns.length < 3) {
                        var newColumn = document.createElement('div');
                        newColumn.className = 'response-column';
                        responseList.appendChild(newColumn);
                        lastColumn = newColumn;
                    }
                    
                    // Create a new response item
                    var responseItem = document.createElement('div');
                    responseItem.className = 'response-item';
                    responseItem.textContent = current_response;
                    
                    // Add the response item to the appropriate column
                    lastColumn.appendChild(responseItem);
                    
                    // reset response box and focus
                    resp_box.value = "";
                    resp_box.focus();
                } else if (trial.mistake_fn !== null) {
                    // For invalid responses, call the mistake_fn with the appropriate error type
                    trial.mistake_fn(current_response, errorType);
                    
                    // Store the invalid response too, but mark it as invalid
                    var resp = {response: current_response, rt: resp_time, valid: false, error: errorType};
                    // We DON'T add duplicates to answers array - they should be corrected
                    if (errorType !== 'duplicate') {
                        answers.push(resp);
                    }
                    
                    // Clear the input after a delay if configured to do so
                    if (trial.clear_input_after_error && errorType === 'duplicate') {
                        setTimeout(function() {
                            resp_box.value = '';
                            resp_box.focus();
                        }, trial.error_clear_delay);
                    } else {
                        // Don't clear the textbox for other errors, to allow user to fix it
                        resp_box.focus();
                    }
                }
            }
            
            response_start_time = performance.now();
        }
        
        // Custom function to check response with similarity
        function check_answer_with_similarity(response, solution, extra_data) {
            // Get additional data if provided
            var category = extra_data && extra_data.category ? extra_data.category.toLowerCase() : '';
            var modality = extra_data && extra_data.modality ? extra_data.modality.toLowerCase() : '';
            var exemplar = extra_data && extra_data.exemplar ? extra_data.exemplar.toLowerCase() : '';
            
            // Normalize responses
            var normalizedResponse = response.trim().toLowerCase();
            var normalizedSolution = solution.toLowerCase().trim();
            
            // Check for exact match first
            if (normalizedResponse === normalizedSolution) {
                return {
                    isCorrect: true,
                    errorType: null
                };
            }
            
            // Extract the expected structure from the solution/modality
            var expectedStart = '';
            var expectedConnector = '';
            
            if (modality) {
                var modalityParts = modality.split("x's");
                expectedStart = modalityParts[0].trim();
                if (modalityParts.length > 1) {
                    expectedConnector = modalityParts[1].split("y's")[0].trim();
                }
            } else {
                // If modality not provided, try to infer from solution
                var solutionWords = normalizedSolution.split(/\s+/);
                expectedStart = solutionWords[0];
            }
            
            // Validate sentence structure 
            
            // 1. Check if it starts with the expected beginning phrase
            var validStart = normalizedResponse.startsWith(expectedStart + ' ');
            if (!validStart) {
                return {
                    isCorrect: false,
                    errorType: 'structure',
                    message: 'Please type the complete sentence, not just the missing word.'
                };
            }
            
            // 2. Check if it contains the category
            var containsCategory = normalizedResponse.includes(category);
            if (!containsCategory) {
                return {
                    isCorrect: false,
                    errorType: 'structure',
                    message: 'Please include the complete category in your answer.'
                };
            }
            
            // 3. Check for sufficient words/structure
            var words = normalizedResponse.split(/\s+/);
            var minWords = 3; // At minimum: quantifier + exemplar + category
            
            if (words.length < minWords) {
                return {
                    isCorrect: false,
                    errorType: 'structure',
                    message: 'Please type the full sentence.'
                };
            }
            
            // 4. Now that structure checks passed, extract the exemplar attempt
            var exemplarAttempt = '';
            
            // This extraction is more complex and depends on the sentence pattern
            // For sentences like "all X's are Y's", extract what's between "all" and "are"
            if (expectedConnector) {
                var parts = normalizedResponse.split(expectedConnector);
                if (parts.length > 1) {
                    exemplarAttempt = parts[0].substring(expectedStart.length).trim();
                }
            } else {
                // Simplified extraction - assume exemplar is between start and category
                var beforeCategory = normalizedResponse.split(category)[0];
                exemplarAttempt = beforeCategory.substring(expectedStart.length).trim();
            }
            
            if (!exemplarAttempt) {
                return {
                    isCorrect: false,
                    errorType: 'structure',
                    message: 'Unable to identify the exemplar in your response.'
                };
            }
            
            // 5. Calculate similarity with the correct exemplar
            var similarity = calculateStringSimilarity(exemplarAttempt, exemplar);
            
            if (similarity >= 0.7) { // This threshold can be adjusted
                return {
                    isCorrect: true,
                    errorType: null
                };
            } else {
                return {
                    isCorrect: false,
                    errorType: 'exemplar',
                    message: 'That response is not correct. Please try again.',
                    similarity: similarity
                };
            }
        }
                
        function check_responses() {
            for (var i=0; i<solutions.length; i++) {
                var resp_time = performance.now() - response_start_time;
                if (trial.mistake_fn !== null) {
                    document.getElementById('jspsych-cued-recall-mistake').innerHTML = "";
                }
                var field = document.getElementById('jspsych-cued-recall-response-'+i)
                var current_response = field.value.trim(); // removes leading/trailing whitespace
                var current_solution = solutions[i];
                var resp = {response: current_response, rt: resp_time};
                answers.push(resp);
                
                if (trial.check_answers) {
                    // First check if the response is empty and if response is required
                    if (trial.response_required_for_check && current_response === '') {
                        if (trial.response_required_message !== null && trial.mistake_fn !== null) {
                            document.getElementById('jspsych-cued-recall-mistake').innerHTML = trial.response_required_message;
                        }
                        field.style.color = 'red';
                        answers_correct = false;
                        continue;
                    }
                    
                    // Check for sentence structure first if enabled
                    if (trial.check_sentence_structure) {
                        // Basic structure check - should be customized for your specific needs
                        var solutionParts = current_solution.toLowerCase().split(' ');
                        var firstWord = solutionParts[0];
                        var lastWord = solutionParts[solutionParts.length - 1];
                        
                        if (!current_response.toLowerCase().startsWith(firstWord) || 
                            !current_response.toLowerCase().includes(lastWord)) {
                            field.style.color = 'red';
                            answers_correct = false;
                            
                            if (trial.mistake_fn !== null) {
                                document.getElementById('jspsych-cued-recall-mistake').innerHTML = 
                                    trial.structure_error_message || "Please type the complete sentence, not just the missing word.";
                                
                                // Call mistake_fn with structure error type
                                trial.mistake_fn(current_response, current_solution, 'structure');
                            }
                            continue;
                        }
                    }
                    
                    // Now check the answer with similarity
                    var is_correct = false;
                    
                    // Use exact match first
                    if (!trial.check_answers_case_sensitive) {
                        current_response = current_response.toLowerCase();
                        current_solution = current_solution.toLowerCase();
                    }
                    
                    if (current_response === current_solution) {
                        is_correct = true;
                    } 
                    // If not exact match, use similarity check
                    else {
                        var similarity = calculateStringSimilarity(current_response, current_solution);
                        is_correct = similarity >= trial.similarity_threshold;
                    }
                    
                    // If we have a custom check function, use it
                    if (trial.check_fn !== null) {
                        is_correct = trial.check_fn(current_response, current_solution);
                    }
                    
                    if (!is_correct) {
                        field.style.color = 'red';
                        answers_correct = false;
                        
                        if (trial.mistake_fn !== null) {
                            // Extract the key part to compare with correct answer
                            // For the retrieval task, we need to identify the exemplar within the sentence
                            var errorType = 'incorrect';
                            
                            // First check if basic structure is correct but the exemplar is wrong
                            if (trial.check_sentence_structure) {
                                var solutionParts = current_solution.toLowerCase().split(' ');
                                var firstWord = solutionParts[0];
                                var lastWord = solutionParts[solutionParts.length - 1];
                                
                                // If structure is correct but word is wrong, specify a different error type
                                if (current_response.toLowerCase().startsWith(firstWord) && 
                                    current_response.toLowerCase().includes(lastWord)) {
                                    errorType = 'exemplar';
                                } else {
                                    errorType = 'structure';
                                }
                            }
                            
                            trial.mistake_fn(current_response, current_solution, errorType);
                        }
                    } else {
                        field.style.color = 'black';
                    }
                }
            }
            
            if (!trial.check_answers || (trial.check_answers && answers_correct)) {
                if (trial.delay_after_submit !== null) {
                    display_element.querySelectorAll('input').forEach(function(val) {
                        if (trial.text_box_disabled_color !== null) {
                            val.style.color = trial.text_box_disabled_color;
                            val.style.borderColor = trial.text_box_disabled_color;
                        }
                        val.disabled = true; // prevent changing response during delay_after_submit
                    }) 
                    jsPsych.pluginAPI.setTimeout(function() {
                        end_trial();
                    },trial.delay_after_submit);
                } else {
                    end_trial();
                }
            } else {
                response_start_time = performance.now(); // get a new start time, in case we want to record an RT starting from when the mistake fn is called
                answers_correct = true;
            }  
        }

        function end_trial() {
            // gather responses and RTs
            var trial_duration = performance.now() - start_time;
            var trial_data = {
                'trial_duration': trial_duration,
                'responses': JSON.stringify(answers),
                'background_color': bg_color,
                'element_color': el_color,
                'solutions': JSON.stringify(solutions)
            };
            // clear any timers
            jsPsych.pluginAPI.clearAllTimeouts();
            // clear any keyboard listeners
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            // clear display
            display_element.innerHTML = '';
            document.getElementById('jspsych-content').style.marginTop = 'auto';
            // reset any changes to the body element's style
            document.getElementsByTagName('body')[0].style.backgroundColor = "unset";
            document.getElementsByTagName('body')[0].style.color = "unset";
            // end
            jsPsych.finishTrial(trial_data);
        }
        
        // add submit button click event listener
        if (trial.show_submit_button) {
            display_element.querySelector('#jspsych-cued-recall-submit').addEventListener('click', check_responses);
        }

        // put cursor in first response box
        document.querySelector('#jspsych-cued-recall-response-0').focus();

        var start_time = performance.now();
        var response_start_time = performance.now();

        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(check_responses, trial.trial_duration);
        }
    };

    return plugin;
})();
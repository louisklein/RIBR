%% Louis' GUI to run his first experiment
%
% date: 07-June-2017
%
% authors:
% - Louis Klein
% - Nic Badcock
%
% Aims:
% - create figure window for experimental presentation
% - give it 'hot key' functions
% - make it save stuff
% - demonstrate:
%   * presenting text
%   * deleting/removing text
%   * edit box
%   * button
%   * read in data/csv stimulus file to display


%% setup as a function

function  experiment1

% clears the command window
clc;
close all

% making a figure
fig.set.position = [.0 .0 1.0 1.0]; % [.5 .5 .5 .5]; 
fig.set.run_n = []; % add number here to test the phases with X number of trials - leave empty for real experiment (ie full lists)
fig.col = myColours;
fig.set.background_colour = fig.col.grey;
fig.set.item_duration_sec = 6;
fig.set.instruct_buffer = 2;
fig.set.inter_stimulus_interval = 2;
fig.set.phase_buffer = 6;
fig.set.distractor_task = 240;
fig.set.fr_timeout = 120;
fig.set.rp_timeout = 16;
fig.set.item_xy = [.5 .7]; % fig.set.item_xy = [.5 .7];
% fig.set.quit_key = '9';
% logical to toggle running of difference sections - mostly for debugging
fig.set.run_sections = [1 1 1 1]; % [one two distractor three]
fig.set.feedback_reading_time = 5; % seconds

% toggle test mode
fig.set.test_time = 1;
fig.set.get_inputs = 0;
if fig.set.test_time
    fig.set.fr_timeout = 5;
    fig.set.rp_timeout = 20;
    fig.set.run_n = 3;
    fig.set.item_duration_sec = 1;
    fig.set.inter_stimulus_interval = 1;
    fig.set.phase_buffer = 1;
    fig.set.distractor_task = 20;
end

%% read in stim file

fig.stim.rp.translation = 'retrieval phase';
fig.stim.rp.file = 'Retrieval_Practise.csv';
fig.stim.dir = fullfile(fileparts(which(mfilename)),'Stimulus Lists');
fig.stim.rp.fullfile = fullfile(fig.stim.dir,fig.stim.rp.file);
fig = readStimFile(fig,'rp');

fig.stim.lp.translation = 'learning phase';
fig.stim.lp.file = 'Learning_Phase.csv';
fig.stim.lp.fullfile = fullfile(fig.stim.dir,fig.stim.lp.file);
fig = readStimFile(fig,'lp');

fig.stim.fr.translation = 'final recall phase';
fig.stim.fr.file = 'Final_Recall.csv';
fig.stim.fr.fullfile = fullfile(fig.stim.dir,fig.stim.fr.file);
fig = readStimFile(fig,'fr');

%% save settings

fig = saveSetup(fig);

% choose the list based on the participant id
fig.stim.rp.fields = fields(fig.stim.rp.list);
fig.stim.rp.n_list = mod(str2double(fig.save.code),numel(fig.stim.rp.fields))+1;
fig.stim.rp.list.use = fig.stim.rp.list.(fig.stim.rp.fields{fig.stim.rp.n_list});

fig.stim.lp.fields = fields(fig.stim.lp.list);
fig.stim.lp.n_list = ceil(fig.stim.rp.n_list/4);
fig.stim.lp.list.use = fig.stim.lp.list.(fig.stim.lp.fields{fig.stim.lp.n_list});

fig.stim.fr.fields = fields(fig.stim.fr.list);
fig.stim.fr.n_list = 1;
fig.stim.fr.list.use = fig.stim.fr.list.(fig.stim.fr.fields{fig.stim.fr.n_list});

fig.h = figure(...
    'Units','Normalized',...
    'Position',fig.set.position,...
    'KeyPressFcn',@getKeyPress,...
    'DeleteFcn',@closeGui,...
    'MenuBar','none',...
    'ToolBar','none',...
    'Color',fig.set.background_colour ... % no comma after this
    );

% playing around with the alignment, the text (stimulus) and the box seem
% to be just off... might be something to do with the underscores - maybe
fig.tmp.edit_pos = [.5 .5];
fig.tmp.edit_size = [.2 .05];
fig.tmp.edit_box = uicontrol('Parent',fig.h,'Style','Edit',...
    'units','normalized',...
    'FontName', 'Calibri',...
    'FontSize', 16,...
    'Position',[fig.tmp.edit_pos(1)-fig.tmp.edit_size(1)*.5 fig.tmp.edit_pos(2) fig.tmp.edit_size],...[.4 .45 .2 .05],... % sets the position as a division of the figure size
    'CallBack',@getResponse,...
    'Tag','box',....
    'UserData',1,'Visible','off');

set(fig.h, 'Pointer', 'custom', 'PointerShapeCData', NaN(16,16))
set(fig.h,'UserData',fig);

% runs initial instructions
if fig.set.run_sections(1)
    fig = runInstructions(fig);
    pause(fig.set.phase_buffer);
    % runs first phase stimulus list
    fig.stim.list.use = fig.stim.lp.list.use;
    fig.set.item_xy = [.5 .6];
    fig = runStimList(fig);
    pause(fig.set.phase_buffer)
    fig.set.item_xy = [.5 .7];
end

if fig.set.run_sections(2)
    % runs second phase instructions
    runInstructions(fig,'phase_two');
    pause(fig.set.phase_buffer);
    % runs second phase stimulus list
    fig.stim.list.use = fig.stim.rp.list.use;
    fig = runPhase2(fig,'phase_two');
end
if fig.set.run_sections(3)
    runInstructions(fig,'distractor');
    fig = runDistractor(fig,'distractor');
    pause(fig.set.phase_buffer);
end
% runs final phase instructions
if fig.set.run_sections(4)
    runInstructions(fig,'phase_three');
    pause(fig.set.phase_buffer);
    % runs final phase stimulus list
    fig.set.item_xy = [.5 .7];
    fig.stim.list.use = fig.stim.fr.list.use;
    
    fig = runPhase3(fig,'phase_three');
    % else pause()
end

% thanks participants and close program
runInstructions(fig,'finish');
delete(fig.h);

end

%% myColours
% - list of colours I might want to use

function col = myColours
col.black = [.1 .1 .1];
col.blue = [.3 .3 .8];
col.grey = [.99 .99 .99];
col.greytext = [.95 .95 .95];
end

%% getKeyPress

function getKeyPress(h,event_data)
fig = get(h,'UserData');

switch event_data.Key
    case []
%     case fig.set.quit_key
%         delete(fig.h);
    otherwise
        fprintf('''%s'' key pressed\n', event_data.Key)
end
set(h,'UserData',fig);
end

%%  runInstructions

function  fig = runInstructions(fig,in_phase)

fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;

fig.instruct.continue = 'Press ''Space Bar'' to continue.';
fig.instruct.continue_format = '\n%s';
fig.instruct.texts = {...
    {'In the first phase of the experiment you will be presented with a series of statements on the screen.',... % instruction 1: line 1
    'Each statement will appear for several seconds before disappearing, so it is important that you pay close attention.',... % instruction 1: line 2
    'You need to read each statement carefully while it is on the screen.'}...
    
    {'You are now ready to start the experiment!'}... % instruction 2: line 1
    };

if exist('in_phase','var') && ~isempty(in_phase)
    switch in_phase
        case 'phase_two'
            fig.instruct.texts = {...
                {'In the next phase of the experiment, you will be presented with some of the statements that you have already read.',...
                'However, some parts will be blanked out.',...
                'You need to remember what the statement should be and then type the entire statement into the textbox.'}...
                
                {'For example, if you saw the statement "all gungans are aliens" then it will appear to you as "all gu_____ are aliens".',...
                'You will need to remember that the missing word is "gungans" and then type the entire statement with the missing word filled-in.',...
                'That is to say, you should type the full sentence into the textbox, i.e., "all gungans are aliens".'}...
                
                {'You will only have a short time to type what you remember into the textbox, so be as quick as you can.',...
                'Don''t worry if you accidentally make spelling errors, but do try to spell each statement correctly.',...
                '',...
                'When you feel ready, press the ''spacebar'' to begin the task...'}...
                };
            
            
        case 'phase_three'
            fig.instruct.texts = {...
                {'In the final phase of the experiment, you will be presented with some different cues.',...
                'These cues will all be about the words you have already seen in the experiment today.',...
                'If you have already practised remembering "gungans", then could be presented with the cue "all _______ are aliens".'}...
                
                {'For each cue, you need to remember as many of the related words as you can.',...
                'So, if you were presented with the cue "all _______ are aliens", you might remember things like "gungans" and "klingons".',...
                'Just like in the previous phase, make sure you type the full statement into the textbox, i.e., "all klingons are aliens".',...
                'Each time you type a statement and hit ''return'', it will appear below the textbox so you can keep track of your answers.'}...
                
                {'You will only have a short time to remember as many correct statements as you can, so be quick and accurate!',...
                'Remember, only submit an answer if you''re sure that you''ve already seen it during an earlier phase.',...
                '',...
                'When you feel ready, press the ''spacebar'' to begin the task...'}...
                };
            
        case 'distractor'
            fig.instruct.texts = {...
                {'Well done! In the next phase of the experiment, you will be complete a perceptual motor task.',...
                'When the task begins, you will see a ''snake'' that slithers around the screen.',...
                'By using the keyboard arrows, you can control the direction of the snake and make it eat the boxes of ''food''.',...
                'If you hit the walls or your snake''s own body, then it will be gameover, and you will need to try again.',...
                'Your task is to feed the snake as many times as you can, in the fewest number of movements.'}...
                
                {'This task will take a few minutes, so make sure that you try as many times as you can before the task ends.',...
                '',...
                'When you feel ready, press the ''spacebar'' to begin the task...'}...
                };
            
        case 'finish'
            fig.instruct.texts = {...
                {'You''ve completed the experiment!',...
                'Thank you for participating!'}...
                % 'Please click on this link to activate the post-experimental survey.'},...
                };
            
    end
end
fig.instruct.text = [];
fig.phase.running = 0;
for i = 1 : numel(fig.instruct.texts)
    
    if i == numel(fig.instruct.texts)
        fig.instruct.continue = '';
    end
    
    fig.instruct.text{i} =  sprintf(...
        [repmat('\n %s \n',1,numel(fig.instruct.texts{1})),fig.instruct.continue_format],... % create formatting string
        fig.instruct.texts{i}{:},fig.instruct.continue);
    
end

set(fig.h,'UserData',fig);
figure(gcf);
for i = 1 : numel(fig.instruct.text)
    
    fig.tmp.text_handle = text(...
        .5,.5,strrep(fig.instruct.text{i},'_','\_'),...
        'HorizontalAlignment','center',...
        'Color',fig.col.black,...
        'FontSize',18,...
        'FontName','Calibri');
    
    set(gca,'Visible','off');
    
    waitforbuttonpress;
    delete(fig.tmp.text_handle);
    
end
fig.phase.current = '';
set(fig.h,'UserData',fig);
end

%% runStimList

function fig = runStimList(fig)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

fprintf('Attempting to run list:\n');

makeaxes = gca(fig.h);
set(makeaxes,'Parent', fig.h,...
    'Position',[.1 .1 .8 .8],...
    'Visible','off');

% checks that the correct directory is being read
if isfield(fig,'stim') && isfield(fig.stim,'list') && isfield(fig.stim.list,'use')
    fig.tmp.n = numel(fig.stim.list.use);
    if ~isempty(fig.set.run_n)
        fig.tmp.n = fig.set.run_n;
    end
    for i = 1 : fig.tmp.n
        fprintf('\t%i: %s\n',i,fig.stim.list.use{i});
        try
            text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
                strrep(fig.stim.list.use{i},'_','\_'),...
                'Parent',makeaxes,'Units','Normalized',...
                'HorizontalAlignment','center',...
                'VerticalAlignment','top',...
                'BackgroundColor',fig.set.background_colour,...
                'Color',fig.col.black,...
                'Visible','on',...
                'FontSize',50,...
                'FontName','Calibri');
        catch err
            delete(fig.h);
            error('Axes gone!!');
            
        end
        pause(fig.set.item_duration_sec);
        delete(text_handle);
        pause(fig.set.inter_stimulus_interval)
    end
else
    warndlg('Can''t find stimulus list!!');
end
fprintf('Finished\n');
fig.phase.current = '';
set(fig.h,'UserData',fig); % update user data
end

%% runPhase2

function fig = runPhase2(fig,phase_name)

fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

set(fig.tmp.edit_box,'Visible','on');
fig.data.code = fig.save.code;
fig.data.phase = phase_name;
fig.data.phase_two_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end

for i = 1 : fig.tmp.n
    
    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    
    fig.data.trial = i;
    phase_name = 'phase_two';
    fig.data.answer = fig.stim.list.use{i};
    fig.tmp.spaces = strfind(fig.data.answer,' ');
    fig.data.stimulus = sprintf('%s%s%s',...
        fig.data.answer(1:fig.tmp.spaces(1)+2),...
        repmat('_',1,8),... % 8 underscores on 1 row
        fig.data.answer(fig.tmp.spaces(2):end));
    
    fig.data.reactiontime = -9999;
    fig.data.response = 'empty';
    fig.data.correct = 0;
    
    set(fig.h,'UserData',fig);
    
    try
        tic;
        text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
            strrep(fig.data.stimulus,'_','\_'),...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Calibri');
    catch err
        delete(fig.h);
        error('Axes gone!!');
    end
    
    set(fig.tmp.edit_box,'Visible','On','Enable','on');
    uicontrol(fig.tmp.edit_box);
    fig.tmp.mentions_in_list = find(ismember(fig.stim.list.use,fig.data.answer));
    
    response_complete = 0; % previously (21-Aug-2017) 'incorrect_response'
    feedback_given = 0;
    response_given = 0;
    response_timedout = 0;
    if i > fig.tmp.mentions_in_list(1)
        feedback_given = 1; % doesn't need to be given.
    end
    set(fig.h,'UserData',fig);
    while ~response_complete % enter endless loop
        pause(.001); % give MATLAB some time to check for a response
        
        % get the updated response if there is one:
        fig = get(fig.h,'UserData');
        if ~response_timedout || ~response_complete
            % check the updated response
            if isfield(fig,'data')
                switch fig.data.response
                    case 'empty'
                        % keep waiting for a response
                    case 'quit'
                        delete(fig.h);
                    otherwise
                        % validate response
                        % fprintf('Checking response...\n');
                        if numel(fig.data.response)
                            textbox_instruction = 0;
                            if and(~response_complete,... % or hasn't timed out
                                    and(~isempty(strfind(fig.data.response,'all ')),... % there's an all in there
                                    ~isempty(strfind(fig.data.response,' are ')))) ... % there's an are in there
                                    || and(response_complete,strcmpi(fig.data.response,fig.data.answer)) % incorrect response made & then crorrect answer
                                % and score response
                                response_given = 1;
                                if strcmpi(fig.data.response,fig.data.answer)
                                    fig.data.correct = 1;
                                elseif feedback_given
                                    if i == fig.tmp.mentions_in_list(1)
                                        textbox_instruction = 1;
                                    end
                                end
                                % need to give feedback for the first
                                % appearance of an item
                                if feedback_given
                                    set(fig.tmp.edit_box,'Enable','off');
                                    pause(fig.set.feedback_reading_time) % adjust this for reading time
                                    break
                                end
                            else
                                % only the first time do they get to type
                                % it correctly - otherwise response is
                                % overwritten and we don't want this
                                if i == fig.tmp.mentions_in_list(1)
                                    textbox_instruction = 1;
                                end
                            end
                            if textbox_instruction

                                fprintf('Incorrect response format - retype\n');
                                fig.data.response = 'empty';
                                set(fig.h,'UserData',fig);
                                fig.data.full_text = 'please type the full sentence';

                                fig.data.full_sentence = text(...
                                    .5,.3-.05,fig.data.full_text,...
                                    'HorizontalAlignment','center',...
                                    'Color',fig.col.black,...
                                    'FontSize',20,'FontName','Calibri');
                                sprintf('%s',fig.data.full_sentence)
                                set(fig.tmp.edit_box,'String','');
                                % set(fig.tmp.edit_box,'String','please type the full sentence');

                                pause(fig.set.feedback_reading_time)
                                set(fig.data.full_sentence,'String','');
                                uicontrol(fig.tmp.edit_box); % set focus to?
                                tic; % restart for wrong response

                            end
                        end
                end
                
                if response_timedout || response_given % timed out or response given
                    %                     fprintf('\tTimed out or response given\n');
                    % feedback_given = 1; % assume response has been given even if timed-out... probably
                    % If it's the first mention of the item:
                    if i == fig.tmp.mentions_in_list(1)
                        
                        if ~feedback_given
                            feedback_given = 1;
                            % present the correct answer
                            text_handle2 = text(fig.set.item_xy(1),fig.set.item_xy(2)-.05,...
                                fig.data.answer,...
                                'Parent',gca,'Units','Normalized',...
                                'HorizontalAlignment','center',...
                                'BackgroundColor',fig.set.background_colour,...
                                'Color',fig.col.black,...
                                'FontSize',18,'FontName','Calibri');
                            if fig.data.correct
                                set(fig.tmp.edit_box,'Enable','Off'); % don't want them to type during this
                                pause(fig.set.feedback_reading_time) % adjust this for reading time
                                set(fig.tmp.edit_box,'Enable','On');
                            else
                                % reset response_complete - need to complete the loop
                                fig.data.response = 'empty';
                                set(fig.h,'UserData',fig);
                                % response_complete = 0;
                                % people need to type the correct response

                                fig.data.fix_text = 'please type the correct response';
                                fig.data.fix_sentence = text(...
                                    .5,.3-.05,fig.data.fix_text,...
                                    'HorizontalAlignment','center',...
                                    'Color',fig.col.black,...
                                    'FontSize',20,'FontName','Calibri');
                                sprintf('%s',fig.data.fix_sentence)
                                set(fig.tmp.edit_box,'String','');

                                pause(fig.set.feedback_reading_time)
                                set(fig.data.fix_sentence,'String','');
                                uicontrol(fig.tmp.edit_box); % set focus to?
                                tic; % restart for wrong response
                                
                            end
                        end
                        if fig.data.correct
                            response_complete = 1;
                        end
                    else
                        response_complete = 1; % maybe
                    end
                    % if response_complete
                    % break % break the while loop
                    % end
                end
            end
        end
        % check for the timeout
        if ~response_timedout && toc > fig.set.rp_timeout
            fprintf('\tTIMED OUT!\n');
            response_timedout = 1;
        end
    end % end of while loop
    switch phase_name
        case 'phase_two'
            % this isn't perfectly accurate...
            fig.data.reactiontime = toc;
    end
    
    tic;
    % stop focusing on text box
    set(fig.tmp.edit_box,'Enable','off');
    set(fig.tmp.edit_box,'Visible','Off');
    figure(fig.h);
    delete(text_handle);
    % updating fig before clearing string
    fig = get(fig.h,'UserData');
    if exist('text_handle2','var')
        set(text_handle2,'String','');
        %         delete(text_handle2);
    end
    
    set(fig.tmp.edit_box,'String','');
    % save the data
    fig = saveData(fig);
    
    switch phase_name
        case 'phase_two'
            fig.data.phase_two_responses{end+1} = fig.data.response;
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.inter_stimulus_interval
        pause(.01);
    end
end

fig.phase.current = '';
end

%% runPhase3
% clear uicontrol string between stimuli
function fig = runPhase3(fig,phase_name)

fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

set(fig.tmp.edit_box,'Visible','on');
fig.data.code = fig.save.code;
fig.data.phase = phase_name;
fig.data.phase_three_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end
for i = 1 : fig.tmp.n

    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    fig.data.trial = i;
    phase_name = 'phase_three';
    fig.data.stimulus = fig.stim.list.use{i};
    fig.data.reactiontime = -9999;
    fig.data.response = 'empty';
    fig.data.correct = 0;
    set(fig.h,'UserData',fig);
    try
        tic;
        text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
            strrep(fig.data.stimulus,'_','\_'),...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Calibri');
    catch err
        delete(fig.h);
        error('Axes gone!!');
    end

    set(fig.tmp.edit_box,'Visible','On','Enable','on');
    uicontrol(fig.tmp.edit_box);
    if isfield(fig.data,'responses')
        fig.data = rmfield(fig.data,'responses');
    end
    set(fig.h,'UserData',fig);
    while toc < fig.set.fr_timeout
        pause(.0001);
    end
    fig = get(fig.h,'UserData');
    if isfield(fig.data,'text_handle')
        for j = 1 : numel(fig.data.text_handle)
            set(fig.data.text_handle(j),'String','');
            %fig = rmfield(fig.data,'text_handle');
            %delete(fig.data.text_handle(j));
        end
    end
    tic;
    set(fig.tmp.edit_box,'Enable','off','Visible','Off');
    delete(text_handle);
    
    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.inter_stimulus_interval
        
        pause(.0001);
    end
end

fig.phase.current = '';
end

%% distractor

function fig = runDistractor(fig,~)

tic

fig.tmp.limits.x = get(gca,'XLim');
fig.tmp.limits.y = get(gca,'YLim');

playSnakeFix(fig,fig.set.distractor_task);

set(gca,'Xlim',fig.tmp.limits.x,'YLim',fig.tmp.limits.y,'Visible','off');
figure(fig.h);

end

%% readStimFile

function fig = readStimFile(fig,phase)

fprintf('Running ''readStimFile'' on (%s): %s (%s)\n',phase,fig.stim.(phase).file,fig.stim.dir);

fig.stim.(phase).data = importdata(fig.stim.(phase).fullfile,',');
fig.stim.(phase).headers = [];

remaining_text = fig.stim.(phase).data{1};
while ~isempty(remaining_text)
    [fig.stim.(phase).headers{end+1},remaining_text] = strtok(remaining_text,',');
end

% strips miscellaneous characters from strings
switch phase
    case 'rp'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
    case 'lp'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
    case 'fr'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
end

for i = 1 : numel(fig.stim.(phase).headers)
    fig.stim.(phase).list.(fig.stim.(phase).headers{i}) = [];
end

for i = 2 : size(fig.stim.(phase).data,1)
    rem = fig.stim.(phase).data{i};
    for j = 1 : numel(fig.stim.(phase).headers)
        [fig.stim.(phase).list.(fig.stim.(phase).headers{j}){end+1},rem] = strtok(rem,',');
    end
end

fprintf('\tdone.\n');
end

%% getResponse
function getResponse(h,~)

fig = get(gcf,'UserData');

switch fig.phase.current
    
    case 'runPhase2'
        
        fprintf('Response:');
        response = get(h,'String');
        response_text = sprintf('''%s'' typed into box %i',response);
        fprintf('\t%s\n',response_text);
        fig.data.response = response;
        set(gcf,'UserData',fig);
        
    case 'runPhase3'
        
        fprintf('Response:');
        response = get(h,'String');
        set(h,'String',''); % clear the string
        drawnow;
        response_text = sprintf('''%s'' typed into box %i',response);
        fprintf('\t%s\n',response_text);
        fig.data.response = response;
        
        if ~isfield(fig.data,'responses')
            fig.data.responses = [];
            fig.data.text_handle = [];
            fig.data.reactiontimes = [];
        end
        fig.data.responses{end+1} = fig.data.response;
        fig.data.reactiontimes{end+1} = toc;
        
        i = numel(fig.data.responses);
        fig.data.text_handle(i) = text(...
            .5,.3-.05*(i-1),fig.data.responses{i},...
            'HorizontalAlignment','center',...
            'Color',fig.col.black,...
            'FontSize',20,'FontName','Calibri');
        set(gca,'Visible','off');
        sprintf('\t%s\n',response_text);
        drawnow;
        set(gcf,'UserData',fig);
end
end
%% saveSetup
function fig = saveSetup(fig)
fig.tmp.stack = dbstack;

if fig.set.get_inputs
    while 1
        fig.save.code = inputdlg('Participant number:','ID:');
        if ~isnan(str2double(fig.save.code))
            break
        end
    end
end

if ~isfield(fig,'save') || ~isfield(fig.save,'code') %|| isempty(fig.save.code)
    fig.save.code = {'9999'};
end

fig.save.code = fig.save.code{1};
fig.save.headers = {'code','trial','phase','stimulus','response','correct','reactiontime'};
fig.save.task_name = fig.tmp.stack(2).name;
fig.save.dir = fullfile([fileparts(which(fig.save.task_name)),'data']);

if ~exist(fig.save.dir,'dir')
    mkdir(fig.save.dir);
end

fig.save.number = 0;

while 1
    fig.save.number = fig.save.number + 1;
    fig.save.file_name = sprintf('%s_%s%i.dat',fig.save.code,fig.save.task_name,fig.save.number);
    fig.save.fullfile = fullfile(fig.save.dir,fig.save.file_name);
    
    if ~exist(fig.save.fullfile,'file')
        break
    end
end

fig.save.diary_file = sprintf('diary_%s_%i.txt',fig.save.code,fig.save.number);
fig.save.diary_fullfile = fullfile(fig.save.dir,fig.save.diary_file);
diary(fig.save.diary_fullfile);
fid = fopen(fig.save.fullfile,'w');

for i = 1 : numel(fig.save.headers)
    if i < numel(fig.save.headers)
        fprintf(fid,'%s\t',fig.save.headers{i});
    else
        fprintf(fid,'%s\n',fig.save.headers{i});
    end
end

% since the for loop has written in headers to the file
% fclose terminates 'w' access for fid
fclose(fid);

end


%% saveData
function fig = saveData(fig)

fid = fopen(fig.save.fullfile,'a');
fig.tmp.delim = '\t';

if ~iscell(fig.data.response)
    fig.tmp.responses{1} = fig.data.response;
    fig.tmp.reactiontimes{1} = fig.data.reactiontime;
end
if isfield(fig.data,'responses') && ~isempty(fig.data.responses)
    fig.tmp.responses = fig.data.responses;
    fig.tmp.reactiontimes = fig.data.reactiontimes;
end

for j = 1 : numel(fig.tmp.responses)
    fig.tmp.delim = '\t';
    for i = 1 : numel(fig.save.headers)
        switch fig.save.headers{i}
            case {'response','reactiontime'}
                %                 if iscell(fig.tmp.responses)
                fig.data.(fig.save.headers{i}) = fig.tmp.([fig.save.headers{i},'s']){j};
                %                 else
                %                     fig.data.response = fig.tmp.responses;
                %                 end
        end
        fig.tmp.data = fig.data.(fig.save.headers{i});
        fig.tmp.format = '%s';
        if isnumeric(fig.tmp.data)
            fig.tmp.format = '%i';
            if floor(fig.tmp.data) < fig.tmp.data
                fig.tmp.format = '%3.2f';
            end
        end
        if i == numel(fig.save.headers)
            fig.tmp.delim = '\n';
        end
        fprintf(fid,[fig.tmp.format,fig.tmp.delim],fig.tmp.data);
    end
end
fclose(fid);

end
%% closeGui
function closeGui(~,~)

fprintf('Closing Gui: saving diary file\n');
diary off

return
end

